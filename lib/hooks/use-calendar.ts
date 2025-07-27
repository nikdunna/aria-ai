"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CalendarEvent, CalendarCreateRequest } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function useCalendar() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (timeMin?: Date, timeMax?: Date) => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (timeMin) params.set("timeMin", timeMin.toISOString());
      if (timeMax) params.set("timeMax", timeMax.toISOString());

      const response = await fetch(`/api/calendar?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch events");
      }

      setEvents(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load calendar";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Calendar Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: CalendarCreateRequest) => {
    if (!session) return null;

    setIsLoading(true);

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create event");
      }

      // Refresh events
      await fetchEvents();

      toast({
        title: "Event Created",
        description: "Your event has been successfully added to your calendar.",
      });

      return data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create event";
      toast({
        variant: "destructive",
        title: "Failed to Create Event",
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on session change
  useEffect(() => {
    if (session) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      fetchEvents(today, nextWeek);
    }
  }, [session]);

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    refetch: fetchEvents,
  };
}
