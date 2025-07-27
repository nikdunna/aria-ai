import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { googleCalendar } from "@/integrations/gcal";
import { CalendarCreateRequest } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    const events = await googleCalendar.getEvents(
      session,
      timeMin ? new Date(timeMin) : undefined,
      timeMax ? new Date(timeMax) : undefined
    );

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Calendar GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch calendar events",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const eventData: CalendarCreateRequest = await request.json();

    if (!eventData.title || !eventData.start || !eventData.end) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, start, end" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const isAvailable = await googleCalendar.checkAvailability(
      session,
      new Date(eventData.start),
      new Date(eventData.end)
    );

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Time slot conflicts with existing event",
          code: "CONFLICT",
        },
        { status: 409 }
      );
    }

    const createdEvent = await googleCalendar.createEvent(session, eventData);

    return NextResponse.json({
      success: true,
      data: createdEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Calendar POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create calendar event",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const eventData: Partial<CalendarCreateRequest> = await request.json();

    const updatedEvent = await googleCalendar.updateEvent(
      session,
      eventId,
      eventData
    );

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Calendar PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update calendar event",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    await googleCalendar.deleteEvent(session, eventId);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Calendar DELETE Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete calendar event",
      },
      { status: 500 }
    );
  }
}
