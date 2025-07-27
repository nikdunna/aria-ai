import { google } from "googleapis";
import { Session } from "next-auth";
import { CalendarEvent, CalendarCreateRequest } from "@/types";

export class GoogleCalendarIntegration {
  private async getCalendarClient(session: Session) {
    if (!session.user.accessToken) {
      throw new Error("No access token available");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.user.accessToken,
    });

    return google.calendar({ version: "v3", auth: oauth2Client });
  }

  async getEvents(
    session: Session,
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getCalendarClient(session);

      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];

      return events.map((event) =>
        this.convertGoogleEventToCalendarEvent(event)
      );
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw new Error("Failed to fetch calendar events");
    }
  }

  async createEvent(
    session: Session,
    eventData: CalendarCreateRequest
  ): Promise<CalendarEvent> {
    try {
      const calendar = await this.getCalendarClient(session);

      const event = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventData.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: eventData.attendees?.map((email) => ({ email })),
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      if (!response.data) {
        throw new Error("Failed to create event");
      }

      return this.convertGoogleEventToCalendarEvent(response.data);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  async updateEvent(
    session: Session,
    eventId: string,
    eventData: Partial<CalendarCreateRequest>
  ): Promise<CalendarEvent> {
    try {
      const calendar = await this.getCalendarClient(session);

      const updateData: any = {};
      if (eventData.title) updateData.summary = eventData.title;
      if (eventData.description) updateData.description = eventData.description;
      if (eventData.location) updateData.location = eventData.location;
      if (eventData.start) {
        updateData.start = {
          dateTime: eventData.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      if (eventData.end) {
        updateData.end = {
          dateTime: eventData.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      if (eventData.attendees) {
        updateData.attendees = eventData.attendees.map((email) => ({ email }));
      }

      const response = await calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        requestBody: updateData,
      });

      if (!response.data) {
        throw new Error("Failed to update event");
      }

      return this.convertGoogleEventToCalendarEvent(response.data);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  async deleteEvent(session: Session, eventId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(session);

      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw new Error("Failed to delete calendar event");
    }
  }

  async checkAvailability(
    session: Session,
    start: Date,
    end: Date
  ): Promise<boolean> {
    try {
      const events = await this.getEvents(session, start, end);

      // Check if there are any overlapping events
      const overlapping = events.some((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        return start < eventEnd && end > eventStart;
      });

      return !overlapping;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
  }

  private convertGoogleEventToCalendarEvent(googleEvent: any): CalendarEvent {
    return {
      id: googleEvent.id || "",
      title: googleEvent.summary || "Untitled Event",
      description: googleEvent.description,
      start: new Date(googleEvent.start?.dateTime || googleEvent.start?.date),
      end: new Date(googleEvent.end?.dateTime || googleEvent.end?.date),
      location: googleEvent.location,
      attendees:
        googleEvent.attendees?.map((attendee: any) => attendee.email) || [],
      isAllDay: !!googleEvent.start?.date,
      recurrence: googleEvent.recurrence?.[0],
      status: googleEvent.status || "confirmed",
      creator: {
        email: googleEvent.creator?.email || "",
        displayName: googleEvent.creator?.displayName,
      },
    };
  }
}

// Export singleton instance
export const googleCalendar = new GoogleCalendarIntegration();
