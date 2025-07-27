import { GoogleCalendarIntegration } from "@/integrations/gcal";
import { WeatherIntegration } from "@/integrations/weather";

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  tool?: string;
}

export interface ToolExecutionContext {
  session: any; // NextAuth session
  userContext?: {
    location?: {
      city: string;
      country: string;
      coordinates?: { lat: number; lon: number };
    };
    timezone?: string;
    preferences?: {
      weatherUnit?: "celsius" | "fahrenheit";
      timeFormat?: "12h" | "24h";
    };
  };
}

export interface Tool {
  name: string;
  execute: (args: any, context: ToolExecutionContext) => Promise<ToolResult>;
}

// Initialize integrations
const calendarIntegration = new GoogleCalendarIntegration();
const weatherIntegration = new WeatherIntegration();

// Calendar Tools
export const calendarTools: Tool[] = [
  {
    name: "get_calendar_events",
    execute: async (
      args: { start: string; end: string },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        if (!context.session?.user?.accessToken) {
          throw new Error("Calendar access requires authentication");
        }

        const events = await calendarIntegration.getEvents(
          context.session,
          new Date(args.start),
          new Date(args.end)
        );

        const eventsData = {
          events: events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
            description: e.description || "",
            location: e.location || "",
          })),
          totalEvents: events.length,
          dateRange: {
            start: args.start,
            end: args.end,
          },
        };

        console.log(`✅ Retrieved ${events.length} calendar events`);
        return { success: true, data: eventsData };
      } catch (error) {
        console.error("❌ get_calendar_events failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to retrieve calendar events",
          tool: "get_calendar_events",
        };
      }
    },
  },
  {
    name: "create_calendar_event",
    execute: async (
      args: {
        title: string;
        start: string;
        end: string;
        description?: string;
        location?: string;
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        if (!context.session?.user?.accessToken) {
          throw new Error("Calendar access requires authentication");
        }

        const createdEvent = await calendarIntegration.createEvent(
          context.session,
          {
            title: args.title,
            start: args.start,
            end: args.end,
            description: args.description,
            location: args.location,
          }
        );

        console.log(
          `✅ Created calendar event:`,
          createdEvent?.id || "success"
        );
        return { success: true, data: createdEvent };
      } catch (error) {
        console.error("❌ create_calendar_event failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create calendar event",
          tool: "create_calendar_event",
        };
      }
    },
  },
  {
    name: "update_calendar_event",
    execute: async (
      args: {
        eventId: string;
        title?: string;
        start?: string;
        end?: string;
        description?: string;
        location?: string;
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        if (!context.session?.user?.accessToken) {
          throw new Error("Calendar access requires authentication");
        }

        const updatedEvent = await calendarIntegration.updateEvent(
          context.session,
          args.eventId,
          {
            title: args.title,
            start: args.start,
            end: args.end,
            description: args.description,
            location: args.location,
          }
        );

        console.log(`✅ Updated calendar event:`, args.eventId);
        return { success: true, data: updatedEvent };
      } catch (error) {
        console.error("❌ update_calendar_event failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update calendar event",
          tool: "update_calendar_event",
        };
      }
    },
  },
  {
    name: "delete_calendar_event",
    execute: async (
      args: { eventId: string },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        if (!context.session?.user?.accessToken) {
          throw new Error("Calendar access requires authentication");
        }

        const deleteResult = await calendarIntegration.deleteEvent(
          context.session,
          args.eventId
        );
        console.log(`✅ Deleted calendar event:`, args.eventId);
        return { success: true, data: deleteResult };
      } catch (error) {
        console.error("❌ delete_calendar_event failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete calendar event",
          tool: "delete_calendar_event",
        };
      }
    },
  },
  {
    name: "check_calendar_availability",
    execute: async (
      args: { start: string; end: string },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        if (!context.session?.user?.accessToken) {
          throw new Error("Calendar access requires authentication");
        }

        const events = await calendarIntegration.getEvents(
          context.session,
          new Date(args.start),
          new Date(args.end)
        );

        const availability = {
          available: events.length === 0,
          conflictingEvents: events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
          })),
          timeSlot: {
            start: args.start,
            end: args.end,
          },
        };

        console.log(
          `✅ Calendar availability check - Available: ${availability.available}, Conflicts: ${availability.conflictingEvents.length}`
        );
        return { success: true, data: availability };
      } catch (error) {
        console.error("❌ check_calendar_availability failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check calendar availability",
          tool: "check_calendar_availability",
        };
      }
    },
  },
];

// Weather Tools
export const weatherTools: Tool[] = [
  {
    name: "get_weather",
    execute: async (
      args: { location?: string },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        let weatherResult;

        if (args.location === "current" || !args.location) {
          // Use user's location from context if available
          if (context.userContext?.location?.city) {
            weatherResult = await weatherIntegration.getCurrentWeather(
              context.userContext.location.city
            );
          } else {
            weatherResult = await weatherIntegration.getCurrentWeather();
          }
        } else {
          weatherResult = await weatherIntegration.getCurrentWeather(
            args.location
          );
        }

        console.log(
          `✅ Weather data retrieved for: ${
            args.location || "current location"
          }`
        );
        return { success: true, data: weatherResult };
      } catch (error) {
        console.error("❌ get_weather failed:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get weather information",
          tool: "get_weather",
        };
      }
    },
  },
];

// All available tools
export const allTools: Tool[] = [...calendarTools, ...weatherTools];

// Tool registry for easy lookup
export const toolRegistry = new Map<string, Tool>(
  allTools.map((tool) => [tool.name, tool])
);

// Execute a tool by name
export async function executeTool(
  toolName: string,
  args: any,
  context: ToolExecutionContext
): Promise<ToolResult> {
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    console.error(`❌ Unknown tool: ${toolName}`);
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      tool: toolName,
    };
  }

  try {
    console.log(`🔧 Executing ${toolName} with args:`, args);
    const result = await tool.execute(args, context);
    return result;
  } catch (error) {
    console.error(`❌ Tool execution failed for ${toolName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
      tool: toolName,
    };
  }
}
