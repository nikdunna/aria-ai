import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OpenAIAssistantProvider } from "@/lib/llm/providers/openai-assistant";
import { executeTool, ToolExecutionContext } from "@/lib/tools";

const assistant = new OpenAIAssistantProvider();

// Create a new thread
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (body.action === "create_thread") {
      const thread = await assistant.createThread(session?.user?.id);
      return NextResponse.json({
        success: true,
        thread: {
          id: thread.id,
          createdAt: thread.createdAt.toISOString(),
        },
      });
    }

    if (body.action === "send_message") {
      const { threadId, message, userContext } = body;

      if (!threadId || !message) {
        return NextResponse.json(
          {
            success: false,
            error: "Thread ID and message are required",
          },
          { status: 400 }
        );
      }

      console.log(
        `📨 Processing message for thread ${threadId}: ${message.substring(
          0,
          100
        )}...`
      );

      try {
        // Add user message to thread (with concurrency handling)
        await assistant.addMessage(threadId, message, "user");
        console.log("✅ User message added to thread");
      } catch (addMessageError) {
        console.error("❌ Failed to add user message:", addMessageError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to add message to conversation",
          },
          { status: 500 }
        );
      }

      // Create a streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          let streamEnded = false;
          const currentToolCalls = new Set<string>();

          const safeEnqueue = (data: string) => {
            if (!streamEnded) {
              try {
                controller.enqueue(encoder.encode(data));
              } catch (error) {
                console.error("❌ Failed to enqueue data:", error);
                streamEnded = true;
              }
            }
          };

          const cleanup = () => {
            if (!streamEnded) {
              streamEnded = true;
              currentToolCalls.clear();
              try {
                controller.close();
              } catch (error) {
                console.error("❌ Failed to close stream:", error);
              }
            }
          };

          assistant.runAssistant(
            threadId,
            // On message chunk
            (content: string) => {
              const data = JSON.stringify({ type: "content", data: content });
              safeEnqueue(`data: ${data}\n\n`);
            },
            // On tool call
            async (toolCall: any) => {
              try {
                const toolName = toolCall.function.name;
                console.log(`🔧 Processing tool call: ${toolName}`);

                // Send tool call start event
                const toolData = JSON.stringify({
                  type: "tool_call",
                  data: {
                    id: toolCall.id,
                    name: toolName,
                    args: toolCall.function.arguments,
                  },
                });
                safeEnqueue(`data: ${toolData}\n\n`);

                currentToolCalls.add(toolCall.id);

                // Parse arguments
                const args = JSON.parse(toolCall.function.arguments);

                // Create execution context
                const context: ToolExecutionContext = {
                  session,
                  userContext,
                };

                // Execute the tool using the new system
                const result = await executeTool(toolName, args, context);

                // Send tool result event
                const toolResultData = JSON.stringify({
                  type: "tool_result",
                  data: {
                    id: toolCall.id,
                    name: toolName,
                    result: result.data,
                    success: result.success,
                    error: result.error,
                  },
                });
                safeEnqueue(`data: ${toolResultData}\n\n`);

                currentToolCalls.delete(toolCall.id);
                return result.data || result;
              } catch (toolError) {
                console.error(`❌ Tool call failed:`, toolError);

                const toolErrorData = JSON.stringify({
                  type: "tool_error",
                  data: {
                    id: toolCall.id,
                    name: toolCall.function.name,
                    error:
                      toolError instanceof Error
                        ? toolError.message
                        : "Tool execution failed",
                  },
                });
                safeEnqueue(`data: ${toolErrorData}\n\n`);

                currentToolCalls.delete(toolCall.id);
                return {
                  error:
                    toolError instanceof Error
                      ? toolError.message
                      : "Tool execution failed",
                  success: false,
                  tool: toolCall.function.name,
                };
              }
            },
            // On complete
            (messages) => {
              console.log("🎉 Assistant conversation completed");

              const completeData = JSON.stringify({
                type: "complete",
                data: {
                  messages: messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp.toISOString(),
                  })),
                },
              });
              safeEnqueue(`data: ${completeData}\n\n`);
              cleanup();
            },
            // On error
            (error: string) => {
              console.error("❌ Assistant error:", error);

              const errorData = JSON.stringify({
                type: "error",
                data: { error },
              });
              safeEnqueue(`data: ${errorData}\n\n`);
              cleanup();
            }
          );
        },
        cancel() {
          console.log("🛑 Stream cancelled by client");
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (body.action === "get_messages") {
      const { threadId } = body;
      const messages = await assistant.getThreadMessages(threadId);

      return NextResponse.json({
        success: true,
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Assistant API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Get thread messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        {
          success: false,
          error: "Thread ID is required",
        },
        { status: 400 }
      );
    }

    const messages = await assistant.getThreadMessages(threadId);

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error("❌ Failed to get messages:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get messages",
      },
      { status: 500 }
    );
  }
}
