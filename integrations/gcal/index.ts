import { google } from "googleapis";
import { Session } from "next-auth";
import { CalendarEvent, CalendarCreateRequest } from "@/types";

export class GoogleCalendarIntegration {
  private async getCalendarClient(session: Session) {
    if (!session.user.accessToken) {
      throw new Error("No access token available. Please sign in again.");
    }

    if (session.error === "RefreshAccessTokenError") {
      throw new Error(
        "Authentication session expired. Please sign out and sign in again."
      );
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

      // Fetch events from primary calendar
      const primaryResponse = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      let allEvents = [...(primaryResponse.data.items || [])];

      // Also fetch events from Aria Assistant calendar if it exists
      try {
        const ariaCalendarId = await this.getAriaCalendarId(session);
        if (ariaCalendarId && ariaCalendarId !== "primary") {
          const ariaResponse = await calendar.events.list({
            calendarId: ariaCalendarId,
            timeMin: timeMin?.toISOString() || new Date().toISOString(),
            timeMax: timeMax?.toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: "startTime",
          });

          allEvents = [...allEvents, ...(ariaResponse.data.items || [])];
        }
      } catch (ariaError) {
        // If we can't fetch from Aria calendar, continue with primary events only
        console.warn(
          "Could not fetch events from Aria Assistant calendar:",
          ariaError
        );
      }

      // Convert and sort all events by start time
      const convertedEvents = allEvents
        .map((event) => this.convertGoogleEventToCalendarEvent(event))
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

      return convertedEvents;
    } catch (error: any) {
      console.error("Error fetching calendar events:", error);

      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again to refresh your permissions."
        );
      }

      if (error.code === 403 || error.status === 403) {
        throw new Error(
          "Calendar access denied. Please check your Google Calendar permissions."
        );
      }

      if (
        error.message?.includes("invalid_token") ||
        error.message?.includes("Invalid Credentials")
      ) {
        throw new Error(
          "Google authentication token is invalid. Please sign out and sign in again."
        );
      }

      throw new Error(
        "Failed to fetch calendar events. Please try again or check your internet connection."
      );
    }
  }

  async createEvent(
    session: Session,
    eventData: CalendarCreateRequest
  ): Promise<CalendarEvent> {
    try {
      const calendar = await this.getCalendarClient(session);

      // Get or create the Aria calendar
      const ariaCalendarId = await this.getOrCreateAriaCalendar(session);

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
        calendarId: ariaCalendarId,
        requestBody: event,
      });

      if (!response.data) {
        throw new Error("Failed to create event");
      }

      return this.convertGoogleEventToCalendarEvent(response.data);
    } catch (error: any) {
      console.error("Error creating calendar event:", error);

      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again to refresh your permissions."
        );
      }

      if (error.code === 403 || error.status === 403) {
        throw new Error(
          "Calendar access denied. Please check your Google Calendar permissions."
        );
      }

      throw new Error(
        "Failed to create calendar event. Please try again or check your internet connection."
      );
    }
  }

  async createEventInAriaCalendar(
    session: Session,
    eventData: CalendarCreateRequest
  ): Promise<CalendarEvent> {
    try {
      // First, ensure the Aria Assistant calendar exists
      const ariaCalendarId = await this.ensureAriaCalendarExists(session);

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
        calendarId: ariaCalendarId,
        requestBody: event,
      });

      if (!response.data) {
        throw new Error("Failed to create event in Aria calendar");
      }

      return this.convertGoogleEventToCalendarEvent(response.data);
    } catch (error: any) {
      console.error("Error creating event in Aria calendar:", error);

      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again to refresh your permissions."
        );
      }

      throw new Error(
        "Failed to create event in Aria calendar. Please try again."
      );
    }
  }

  private async ensureAriaCalendarExists(session: Session): Promise<string> {
    try {
      const calendar = await this.getCalendarClient(session);

      // First, check if the Aria Assistant calendar already exists
      const calendarsResponse = await calendar.calendarList.list();
      const existingAriaCalendar = calendarsResponse.data.items?.find(
        (cal) => cal.summary === "Aria Assistant"
      );

      if (existingAriaCalendar) {
        return existingAriaCalendar.id!;
      }

      // Create the Aria Assistant calendar if it doesn't exist
      const newCalendarResponse = await calendar.calendars.insert({
        requestBody: {
          summary: "Aria Assistant",
          description:
            "Calendar for events created by Aria, your AI personal assistant",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      const newCalendarId = newCalendarResponse.data.id!;

      // Set the calendar color to green
      await calendar.calendarList.patch({
        calendarId: newCalendarId,
        requestBody: {
          colorId: "10", // Green color in Google Calendar
          selected: true,
        },
      });

      console.log("Created Aria Assistant calendar with ID:", newCalendarId);
      return newCalendarId;
    } catch (error: any) {
      console.error("Error ensuring Aria calendar exists:", error);

      // Handle authentication errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again."
        );
      }

      // Fallback to primary calendar if we can't create/find Aria calendar
      console.warn(
        "Falling back to primary calendar due to error creating Aria calendar"
      );
      return "primary";
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
    } catch (error: any) {
      console.error("Error updating calendar event:", error);

      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again to refresh your permissions."
        );
      }

      throw new Error("Failed to update calendar event. Please try again.");
    }
  }

  async deleteEvent(session: Session, eventId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(session);

      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
    } catch (error: any) {
      console.error("Error deleting calendar event:", error);

      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error(
          "Google Calendar access expired. Please sign out and sign in again to refresh your permissions."
        );
      }

      throw new Error("Failed to delete calendar event. Please try again.");
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
    } catch (error: any) {
      console.error("Error checking availability:", error);

      // If we can't check availability due to auth issues, assume unavailable for safety
      if (error.code === 401 || error.status === 401) {
        throw error; // Re-throw auth errors
      }

      return false; // Assume unavailable for other errors
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

  // Helper method to get Aria calendar ID without creating it
  private async getAriaCalendarId(session: Session): Promise<string | null> {
    try {
      const calendar = await this.getCalendarClient(session);

      // Check if the Aria Assistant calendar exists
      const calendarsResponse = await calendar.calendarList.list();
      const existingAriaCalendar = calendarsResponse.data.items?.find(
        (cal) => cal.summary === "Aria Assistant"
      );

      return existingAriaCalendar?.id || null;
    } catch (error) {
      console.warn("Error checking for Aria calendar:", error);
      return null;
    }
  }

  // Helper method to get or create Aria calendar
  private async getOrCreateAriaCalendar(session: Session): Promise<string> {
    try {
      const calendar = await this.getCalendarClient(session);

      // First check if it already exists
      const existingCalendarId = await this.getAriaCalendarId(session);
      if (existingCalendarId) {
        console.log(
          "✅ Using existing Aria Assistant calendar:",
          existingCalendarId
        );
        return existingCalendarId;
      }

      // Create new Aria Assistant calendar
      console.log("🔨 Creating new Aria Assistant calendar...");
      const newCalendar = await calendar.calendars.insert({
        requestBody: {
          summary: "Aria Assistant",
          description: "Events created by Aria, your AI personal assistant",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (!newCalendar.data.id) {
        throw new Error("Failed to create Aria Assistant calendar");
      }

      // Set calendar color to a distinctive color (blue)
      try {
        await calendar.calendars.update({
          calendarId: newCalendar.data.id,
          requestBody: {
            summary: "Aria Assistant",
            description: "Events created by Aria, your AI personal assistant",
            backgroundColor: "#4285f4", // Google blue
            foregroundColor: "#ffffff",
          },
        });
      } catch (colorError) {
        console.warn("Could not set calendar color:", colorError);
      }

      console.log(
        "✅ Created new Aria Assistant calendar:",
        newCalendar.data.id
      );
      return newCalendar.data.id;
    } catch (error) {
      console.error("Error creating/getting Aria calendar:", error);
      console.log("⚠️ Falling back to primary calendar");
      return "primary";
    }
  }
}

// Export singleton instance
export const googleCalendar = new GoogleCalendarIntegration();
