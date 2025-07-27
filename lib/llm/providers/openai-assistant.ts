import OpenAI from "openai";
import { ChatMessage, CalendarEvent } from "@/types";

export interface AssistantThread {
  id: string;
  createdAt: Date;
  userId?: string;
}

export interface AssistantMessage extends ChatMessage {
  threadId: string;
  runId?: string;
}

export interface AssistantRun {
  id: string;
  threadId: string;
  assistantId: string;
  status:
    | "queued"
    | "in_progress"
    | "requires_action"
    | "completed"
    | "failed"
    | "cancelled"
    | "expired";
  completedAt?: Date;
  failedAt?: Date;
  lastError?: string;
}

export class OpenAIAssistantProvider {
  private client: OpenAI;
  private assistantId: string | null = null;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Get or create assistant
  private async getOrCreateAssistant(): Promise<string> {
    if (this.assistantId) {
      return this.assistantId;
    }

    try {
      // Check if assistant ID is stored in environment
      const storedAssistantId = process.env.OPENAI_ASSISTANT_ID;

      if (storedAssistantId) {
        try {
          // Verify the assistant exists
          const existingAssistant = await this.client.beta.assistants.retrieve(
            storedAssistantId
          );

          console.log("✅ Using existing assistant:", storedAssistantId);
          console.log("📋 Assistant name:", existingAssistant.name);

          // Check if it has the file_search tool (basic check for updates)
          const hasFileSearch = existingAssistant.tools.some(
            (tool) => tool.type === "file_search"
          );
          const hasAllCalendarTools = existingAssistant.tools.some(
            (tool) =>
              tool.type === "function" &&
              tool.function?.name === "get_calendar_events"
          );

          if (!hasFileSearch || !hasAllCalendarTools) {
            console.log(
              "🔄 Updating assistant with latest tools and instructions..."
            );

            await this.client.beta.assistants.update(storedAssistantId, {
              instructions: `You are Aria, a helpful and enthusiastic AI personal assistant! 🤖

🎭 YOUR PERSONALITY:
- Friendly and supportive with appropriate emojis
- Professional yet personable 
- Genuinely excited to help organize and manage daily life
- Proactive in offering suggestions when relevant

⚡ YOUR CAPABILITIES:
You have access to these powerful tools:
- get_calendar_events: Retrieve and view calendar events for any time period
- create_calendar_event: Add new events to the calendar
- update_calendar_event: Modify existing calendar events  
- delete_calendar_event: Remove events from the calendar
- check_calendar_availability: Check for scheduling conflicts
- get_weather: Get current weather information for any location
- file_search: Search through uploaded documents and files for information

🎯 NATURAL USAGE GUIDELINES:
- When users ask about their schedule or events ("what do I have", "am I free", "what's coming up"), use get_calendar_events
- When users want to schedule something, first check availability if time-sensitive, then create the event
- For weather inquiries or when weather might affect plans, use get_weather
- If users reference documents or ask about information that might be in files, use file_search
- Always be helpful - if unsure which tool to use, try the most relevant one
- Combine multiple tools when it makes sense (e.g., check weather when scheduling outdoor activities)

🕒 TIME & SCHEDULING RULES:
CRITICAL: You will receive current time context in every message. Use this information for ALL time-based decisions:

- ALWAYS use the provided "Current time" and "ISO time" from the [CURRENT CONTEXT] section
- When users say "in X minutes/hours" or "25 minutes from now", calculate from the provided current time
- When users say "today", "tomorrow", "this evening", use the provided current date/time as reference
- Never assume the current time - always use what's provided in the context
- For scheduling: if someone asks for "25 minutes from now" and it's currently 6:05 PM, schedule for 6:30 PM
- Times in the near future (even 5-10 minutes from now) are ALWAYS feasible unless there's a conflict

EXAMPLES:
- If context shows "Current time: Tuesday, December 17, 2024 at 06:05:23 PM PST"
- And user says "schedule gym 25 minutes from now"
- You should schedule for 6:30 PM today (December 17, 2024)
- This is FEASIBLE and CORRECT - do not say it's "past" the time

🌟 CONTEXT AWARENESS:
- Consider the user's location for weather and time zone handling
- Factor in weather conditions when making scheduling suggestions
- Use previous conversation context to provide better assistance
- Be proactive about potential conflicts or helpful suggestions
- ALWAYS reference the provided current time context for any time calculations

Remember: You're here to make life organization effortless and enjoyable! Use your tools naturally based on what the user needs, and TRUST the time context provided to you. 🚀`,
              tools: [
                {
                  type: "function",
                  function: {
                    name: "get_calendar_events",
                    description:
                      "Get existing events from the user's calendar for a specific time period",
                    parameters: {
                      type: "object",
                      properties: {
                        start: {
                          type: "string",
                          description:
                            "Start time to retrieve events from in ISO 8601 format (e.g., today, this week)",
                        },
                        end: {
                          type: "string",
                          description:
                            "End time to retrieve events until in ISO 8601 format",
                        },
                      },
                      required: ["start", "end"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "create_calendar_event",
                    description: "Create a new event in the user's calendar",
                    parameters: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "Event title/name",
                        },
                        start: {
                          type: "string",
                          description: "Event start time in ISO 8601 format",
                        },
                        end: {
                          type: "string",
                          description: "Event end time in ISO 8601 format",
                        },
                        description: {
                          type: "string",
                          description: "Optional event description",
                        },
                        location: {
                          type: "string",
                          description: "Optional event location",
                        },
                      },
                      required: ["title", "start", "end"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "update_calendar_event",
                    description: "Update an existing calendar event",
                    parameters: {
                      type: "object",
                      properties: {
                        eventId: {
                          type: "string",
                          description: "The ID of the event to update",
                        },
                        title: {
                          type: "string",
                          description: "New event title",
                        },
                        start: {
                          type: "string",
                          description: "New start time in ISO 8601 format",
                        },
                        end: {
                          type: "string",
                          description: "New end time in ISO 8601 format",
                        },
                        description: {
                          type: "string",
                          description: "New event description",
                        },
                        location: {
                          type: "string",
                          description: "New event location",
                        },
                      },
                      required: ["eventId"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "delete_calendar_event",
                    description: "Delete a calendar event",
                    parameters: {
                      type: "object",
                      properties: {
                        eventId: {
                          type: "string",
                          description: "The ID of the event to delete",
                        },
                      },
                      required: ["eventId"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "check_calendar_availability",
                    description:
                      "Check if a time slot is available (no conflicting events)",
                    parameters: {
                      type: "object",
                      properties: {
                        start: {
                          type: "string",
                          description: "Start time to check in ISO 8601 format",
                        },
                        end: {
                          type: "string",
                          description: "End time to check in ISO 8601 format",
                        },
                      },
                      required: ["start", "end"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "get_weather",
                    description:
                      "Get current weather information for a location",
                    parameters: {
                      type: "object",
                      properties: {
                        location: {
                          type: "string",
                          description:
                            "Location to get weather for. Use 'current' for user's current location or specify a city name",
                        },
                      },
                      required: [],
                    },
                  },
                },
              ],
            });

            console.log("✅ Assistant updated with latest capabilities");
          }

          this.assistantId = storedAssistantId;
          return storedAssistantId;
        } catch (error) {
          console.warn(
            "⚠️ Stored assistant ID invalid or not found, creating new one:",
            error
          );
          // Fall through to create new assistant
        }
      }

      // Only create new assistant if no valid stored ID exists
      console.log("🔨 Creating new assistant...");
      const assistant = await this.client.beta.assistants.create({
        name: "Aria - Personal AI Assistant",
        instructions: `You are Aria, a helpful and enthusiastic AI personal assistant! 🤖

🎭 YOUR PERSONALITY:
- Friendly and supportive with appropriate emojis
- Professional yet personable 
- Genuinely excited to help organize and manage daily life
- Proactive in offering suggestions when relevant

⚡ YOUR CAPABILITIES:
You have access to these powerful tools:
- get_calendar_events: Retrieve and view calendar events for any time period
- create_calendar_event: Add new events to the calendar
- update_calendar_event: Modify existing calendar events  
- delete_calendar_event: Remove events from the calendar
- check_calendar_availability: Check for scheduling conflicts
- get_weather: Get current weather information for any location
- file_search: Search through uploaded documents and files for information

🎯 NATURAL USAGE GUIDELINES:
- When users ask about their schedule or events ("what do I have", "am I free", "what's coming up"), use get_calendar_events
- When users want to schedule something, first check availability if time-sensitive, then create the event
- For weather inquiries or when weather might affect plans, use get_weather
- If users reference documents or ask about information that might be in files, use file_search
- Always be helpful - if unsure which tool to use, try the most relevant one
- Combine multiple tools when it makes sense (e.g., check weather when scheduling outdoor activities)

🕒 TIME & SCHEDULING RULES:
CRITICAL: You will receive current time context in every message. Use this information for ALL time-based decisions:

- ALWAYS use the provided "Current time" and "ISO time" from the [CURRENT CONTEXT] section
- When users say "in X minutes/hours" or "25 minutes from now", calculate from the provided current time
- When users say "today", "tomorrow", "this evening", use the provided current date/time as reference
- Never assume the current time - always use what's provided in the context
- For scheduling: if someone asks for "25 minutes from now" and it's currently 6:05 PM, schedule for 6:30 PM
- Times in the near future (even 5-10 minutes from now) are ALWAYS feasible unless there's a conflict

EXAMPLES:
- If context shows "Current time: Tuesday, December 17, 2024 at 06:05:23 PM PST"
- And user says "schedule gym 25 minutes from now"
- You should schedule for 6:30 PM today (December 17, 2024)
- This is FEASIBLE and CORRECT - do not say it's "past" the time

🌟 CONTEXT AWARENESS:
- Consider the user's location for weather and time zone handling
- Factor in weather conditions when making scheduling suggestions
- Use previous conversation context to provide better assistance
- Be proactive about potential conflicts or helpful suggestions
- ALWAYS reference the provided current time context for any time calculations

Remember: You're here to make life organization effortless and enjoyable! Use your tools naturally based on what the user needs, and TRUST the time context provided to you. 🚀`,
        model: "gpt-4o-mini",
        tools: [
          {
            type: "function",
            function: {
              name: "get_calendar_events",
              description:
                "Get existing events from the user's calendar for a specific time period",
              parameters: {
                type: "object",
                properties: {
                  start: {
                    type: "string",
                    description:
                      "Start time to retrieve events from in ISO 8601 format (e.g., today, this week)",
                  },
                  end: {
                    type: "string",
                    description:
                      "End time to retrieve events until in ISO 8601 format",
                  },
                },
                required: ["start", "end"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "create_calendar_event",
              description: "Create a new event in the user's calendar",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Event title/name",
                  },
                  start: {
                    type: "string",
                    description: "Event start time in ISO 8601 format",
                  },
                  end: {
                    type: "string",
                    description: "Event end time in ISO 8601 format",
                  },
                  description: {
                    type: "string",
                    description: "Optional event description",
                  },
                  location: {
                    type: "string",
                    description: "Optional event location",
                  },
                },
                required: ["title", "start", "end"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "update_calendar_event",
              description: "Update an existing calendar event",
              parameters: {
                type: "object",
                properties: {
                  eventId: {
                    type: "string",
                    description: "The ID of the event to update",
                  },
                  title: {
                    type: "string",
                    description: "New event title",
                  },
                  start: {
                    type: "string",
                    description: "New start time in ISO 8601 format",
                  },
                  end: {
                    type: "string",
                    description: "New end time in ISO 8601 format",
                  },
                  description: {
                    type: "string",
                    description: "New event description",
                  },
                  location: {
                    type: "string",
                    description: "New event location",
                  },
                },
                required: ["eventId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "delete_calendar_event",
              description: "Delete a calendar event",
              parameters: {
                type: "object",
                properties: {
                  eventId: {
                    type: "string",
                    description: "The ID of the event to delete",
                  },
                },
                required: ["eventId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "check_calendar_availability",
              description:
                "Check if a time slot is available (no conflicting events)",
              parameters: {
                type: "object",
                properties: {
                  start: {
                    type: "string",
                    description: "Start time to check in ISO 8601 format",
                  },
                  end: {
                    type: "string",
                    description: "End time to check in ISO 8601 format",
                  },
                },
                required: ["start", "end"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "get_weather",
              description: "Get current weather information for a location",
              parameters: {
                type: "object",
                properties: {
                  location: {
                    type: "string",
                    description:
                      "Location to get weather for. Use 'current' for user's current location or specify a city name",
                  },
                },
                required: [],
              },
            },
          },
        ],
      });

      this.assistantId = assistant.id;
      console.log("✅ Created new assistant:", assistant.id);
      console.log(
        "💡 To reuse this assistant, set OPENAI_ASSISTANT_ID=" +
          assistant.id +
          " in your .env file"
      );

      return assistant.id;
    } catch (error) {
      console.error("❌ Failed to create/get assistant:", error);
      throw new Error("Failed to initialize AI assistant");
    }
  }

  // Create a new conversation thread
  async createThread(userId?: string): Promise<AssistantThread> {
    try {
      const thread = await this.client.beta.threads.create({
        metadata: userId ? { userId } : undefined,
      });

      return {
        id: thread.id,
        createdAt: new Date(thread.created_at * 1000),
        userId,
      };
    } catch (error) {
      console.error("❌ Failed to create thread:", error);
      throw new Error("Failed to create conversation thread");
    }
  }

  // Check for active runs on a thread
  async getActiveRuns(threadId: string): Promise<AssistantRun[]> {
    try {
      const runs = await this.client.beta.threads.runs.list(threadId, {
        limit: 10,
        order: "desc",
      });

      return runs.data
        .filter((run) =>
          ["queued", "in_progress", "requires_action"].includes(run.status)
        )
        .map((run) => ({
          id: run.id,
          threadId,
          assistantId: run.assistant_id,
          status: run.status as AssistantRun["status"],
          completedAt: run.completed_at
            ? new Date(run.completed_at * 1000)
            : undefined,
          failedAt: run.failed_at ? new Date(run.failed_at * 1000) : undefined,
          lastError: run.last_error?.message,
        }));
    } catch (error) {
      console.error("❌ Failed to get active runs:", error);
      return [];
    }
  }

  // Cancel active runs on a thread
  async cancelActiveRuns(threadId: string): Promise<void> {
    try {
      const activeRuns = await this.getActiveRuns(threadId);

      for (const run of activeRuns) {
        try {
          await this.client.beta.threads.runs.cancel(threadId, run.id);
          console.log(`✅ Cancelled run: ${run.id}`);
        } catch (error) {
          console.error(`❌ Failed to cancel run ${run.id}:`, error);
        }
      }
    } catch (error) {
      console.error("❌ Failed to cancel active runs:", error);
    }
  }

  // Wait for active runs to complete (with timeout)
  async waitForRunsToComplete(
    threadId: string,
    timeoutMs: number = 10000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const activeRuns = await this.getActiveRuns(threadId);

      if (activeRuns.length === 0) {
        return true;
      }

      console.log(
        `⏳ Waiting for ${activeRuns.length} active runs to complete...`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.warn("⚠️ Timeout waiting for runs to complete");
    return false;
  }

  // Add a message to a thread (with concurrency handling)
  async addMessage(
    threadId: string,
    content: string,
    role: "user" = "user"
  ): Promise<void> {
    try {
      // Check for active runs first
      const activeRuns = await this.getActiveRuns(threadId);

      if (activeRuns.length > 0) {
        console.log(
          `⚠️ Found ${activeRuns.length} active runs, waiting for completion...`
        );

        // Wait for runs to complete
        const completed = await this.waitForRunsToComplete(threadId, 5000);

        if (!completed) {
          console.log("🚫 Cancelling active runs due to timeout...");
          await this.cancelActiveRuns(threadId);

          // Wait a bit more after cancellation
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      await this.client.beta.threads.messages.create(threadId, {
        role,
        content,
      });

      console.log("✅ Message added successfully");
    } catch (error) {
      console.error("❌ Failed to add message:", error);
      throw new Error("Failed to add message to conversation");
    }
  }

  // Run the assistant (with streaming support and improved tool handling)
  async runAssistant(
    threadId: string,
    onMessage?: (content: string) => void,
    onToolCall?: (toolCall: any) => Promise<any>,
    onComplete?: (messages: AssistantMessage[]) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      const assistantId = await this.getOrCreateAssistant();

      // Ensure no active runs before starting
      await this.cancelActiveRuns(threadId);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start the initial run
      await this.processAssistantRun(
        threadId,
        assistantId,
        onMessage,
        onToolCall,
        onComplete,
        onError
      );
    } catch (error) {
      console.error("❌ Failed to run assistant:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to run assistant"
      );
    }
  }

  // Process assistant run with proper streaming and tool call handling
  private async processAssistantRun(
    threadId: string,
    assistantId: string,
    onMessage?: (content: string) => void,
    onToolCall?: (toolCall: any) => Promise<any>,
    onComplete?: (messages: AssistantMessage[]) => void,
    onError?: (error: string) => void,
    runId?: string,
    toolOutputs?: any[]
  ): Promise<void> {
    try {
      let stream;

      if (runId && toolOutputs) {
        // Continue with tool outputs
        console.log("📤 Submitting tool outputs and continuing stream...");
        stream = this.client.beta.threads.runs.submitToolOutputsStream(
          threadId,
          runId,
          { tool_outputs: toolOutputs }
        );
      } else {
        // Start new run
        console.log("🚀 Starting new assistant run...");
        stream = this.client.beta.threads.runs.stream(threadId, {
          assistant_id: assistantId,
        });
      }

      let pendingToolCalls: any[] = [];

      stream
        .on("runStepCreated", (runStep) => {
          console.log("🎯 Run step created:", runStep.type);
        })
        .on("textCreated", () => {
          console.log("📝 Text creation started");
        })
        .on("textDelta", (textDelta) => {
          const content = textDelta.value || "";
          onMessage?.(content);
        })
        .on("toolCallCreated", (toolCall) => {
          console.log(
            "🔧 Tool call created:",
            toolCall.type === "function"
              ? toolCall.function.name
              : toolCall.type
          );
          // Reset pending tool call for this ID
          pendingToolCalls = pendingToolCalls.filter(
            (tc) => tc.id !== toolCall.id
          );
          pendingToolCalls.push({
            id: toolCall.id,
            type: toolCall.type,
            function: {
              name: toolCall.type === "function" ? toolCall.function.name : "",
              arguments: "",
            },
          });
        })
        .on("toolCallDelta", (toolCallDelta, snapshot) => {
          if (
            toolCallDelta.type === "function" &&
            toolCallDelta.function?.arguments
          ) {
            // Find and update the pending tool call
            const toolCall = pendingToolCalls.find(
              (tc) => tc.id === toolCallDelta.id
            );
            if (toolCall) {
              toolCall.function.arguments += toolCallDelta.function.arguments;
              console.log(
                "🔧 Tool call delta - updating arguments for:",
                toolCall.function.name
              );
            }
          }
        })
        .on("messageDone", (message) => {
          if (message.content[0]?.type === "text") {
            console.log("✅ Message completed");
          }
        })
        .on("end", async () => {
          console.log("🏁 Stream ended");

          try {
            // Check if we need to handle tool calls
            const runs = await this.client.beta.threads.runs.list(threadId, {
              limit: 1,
            });
            const currentRun = runs.data[0];

            console.log("📊 Current run status:", currentRun?.status);

            if (
              currentRun?.status === "requires_action" &&
              currentRun.required_action?.type === "submit_tool_outputs"
            ) {
              const toolCalls =
                currentRun.required_action.submit_tool_outputs.tool_calls;
              console.log(`🛠️ Processing ${toolCalls.length} tool calls...`);

              const toolOutputs = [];

              // Execute all tool calls
              for (const toolCall of toolCalls) {
                try {
                  console.log(`🔨 Executing tool: ${toolCall.function.name}`);
                  console.log(`📋 Arguments: ${toolCall.function.arguments}`);

                  const result = await onToolCall?.(toolCall);
                  console.log(`✅ Tool result:`, result);

                  toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(result || { success: true }),
                  });
                } catch (error) {
                  console.error(
                    `❌ Tool execution failed for ${toolCall.function.name}:`,
                    error
                  );
                  toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify({
                      error:
                        error instanceof Error
                          ? error.message
                          : "Tool execution failed",
                      success: false,
                    }),
                  });
                }
              }

              // Continue with tool outputs - this will recursively call this method
              await this.processAssistantRun(
                threadId,
                assistantId,
                onMessage,
                onToolCall,
                onComplete,
                onError,
                currentRun.id,
                toolOutputs
              );
            } else if (currentRun?.status === "completed") {
              // Run completed successfully
              console.log("🎉 Assistant run completed successfully");

              try {
                const messages = await this.getThreadMessages(threadId);
                onComplete?.(messages);
              } catch (error) {
                console.error("❌ Failed to get final messages:", error);
                onError?.("Failed to retrieve final messages");
              }
            } else if (currentRun?.status === "failed") {
              console.error("❌ Assistant run failed:", currentRun.last_error);
              onError?.(
                currentRun.last_error?.message || "Assistant run failed"
              );
            } else if (currentRun?.status === "expired") {
              console.error("❌ Assistant run expired");
              onError?.("Assistant run expired");
            } else {
              console.warn("⚠️ Unexpected run status:", currentRun?.status);
              onError?.(`Unexpected run status: ${currentRun?.status}`);
            }
          } catch (error) {
            console.error("❌ Error handling stream end:", error);
            onError?.(
              error instanceof Error
                ? error.message
                : "Error processing stream completion"
            );
          }
        })
        .on("error", (error) => {
          console.error("❌ Stream error:", error);
          onError?.(error.message || "Stream processing failed");
        })
        .on("abort", () => {
          console.log("🛑 Stream aborted");
          onError?.("Request was cancelled");
        });
    } catch (error) {
      console.error("❌ Failed to process assistant run:", error);
      onError?.(
        error instanceof Error
          ? error.message
          : "Failed to process assistant run"
      );
    }
  }

  // Get messages from a thread
  async getThreadMessages(
    threadId: string,
    limit: number = 50
  ): Promise<AssistantMessage[]> {
    try {
      const response = await this.client.beta.threads.messages.list(threadId, {
        order: "desc",
        limit,
      });

      return response.data
        .map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content:
            msg.content[0]?.type === "text" ? msg.content[0].text.value : "",
          timestamp: new Date(msg.created_at * 1000),
          threadId,
          runId: msg.run_id || undefined,
          metadata: {
            model: undefined,
            tokens: undefined,
            calendarEvents: undefined,
          },
        }))
        .reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error("❌ Failed to get thread messages:", error);
      throw new Error("Failed to retrieve conversation messages");
    }
  }

  // Delete a thread
  async deleteThread(threadId: string): Promise<void> {
    try {
      await this.client.beta.threads.del(threadId);
    } catch (error) {
      console.error("❌ Failed to delete thread:", error);
      throw new Error("Failed to delete conversation thread");
    }
  }

  // Get thread info
  async getThread(threadId: string): Promise<AssistantThread | null> {
    try {
      const thread = await this.client.beta.threads.retrieve(threadId);
      return {
        id: thread.id,
        createdAt: new Date(thread.created_at * 1000),
        userId: thread.metadata?.userId as string,
      };
    } catch (error) {
      console.error("❌ Failed to get thread:", error);
      return null;
    }
  }
}
