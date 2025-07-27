import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateChatCompletion } from "@/lib/llm";
import { googleCalendar } from "@/integrations/gcal";
import { ChatCompletionRequest, ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: ChatCompletionRequest = await request.json();

    if (!body.messages || !body.model) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: messages, model" },
        { status: 400 }
      );
    }

    // Get calendar context for the AI
    let calendarContext = body.calendarContext || [];

    if (calendarContext.length === 0) {
      try {
        // Get today's events for context
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        calendarContext = await googleCalendar.getEvents(
          session,
          today,
          tomorrow
        );
      } catch (error) {
        console.warn("Could not fetch calendar context:", error);
        // Continue without calendar context
      }
    }

    // Add system message with calendar context
    const systemMessage: ChatMessage = {
      id: generateId(),
      role: "system",
      content: `You are an AI productivity assistant that helps users schedule and manage their day. You have access to their Google Calendar and can create, modify, and view events.

Current calendar context for today:
${
  calendarContext.length > 0
    ? calendarContext
        .map(
          (event) =>
            `- ${event.title} (${new Date(
              event.start
            ).toLocaleTimeString()} - ${new Date(
              event.end
            ).toLocaleTimeString()})`
        )
        .join("\n")
    : "No events scheduled for today"
}

When users ask to schedule something:
1. Check for conflicts with existing events
2. Suggest optimal times based on their calendar
3. Be specific about timing and duration
4. Ask for confirmation before creating events

For scheduling requests, respond with natural language and include specific time suggestions. You cannot directly create calendar events - the user interface will handle that based on your recommendations.

Be helpful, concise, and focus on productivity. Always consider the user's existing commitments when making suggestions.`,
      timestamp: new Date(),
    };

    const messagesWithContext = [systemMessage, ...body.messages];

    const completionRequest: ChatCompletionRequest = {
      ...body,
      messages: messagesWithContext,
      calendarContext,
    };

    const response = await generateChatCompletion(completionRequest);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
