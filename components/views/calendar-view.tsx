"use client";

import { useSession, signOut } from "next-auth/react";
import { useCalendar } from "@/lib/hooks/use-calendar";
import { CalendarEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, formatDate, isToday } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
  List,
  Grid,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import BigCalendar to avoid SSR issues
const BigCalendar = dynamic(
  () => import("react-big-calendar").then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    ),
  }
);

// Import other components that don't cause SSR issues
import { Views, Event, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

interface CalendarEventWithResource extends Event {
  resource: CalendarEvent;
}

export function CalendarView() {
  const { data: session } = useSession();
  const { events, isLoading, error, refetch } = useCalendar();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarStyles, setCalendarStyles] = useState(false);

  // Load calendar styles on client side
  useEffect(() => {
    if (typeof window !== "undefined" && !calendarStyles) {
      // Instead of importing the CSS file, we'll use our custom styles
      setCalendarStyles(true);
    }
  }, [calendarStyles]);

  const todayEvents = events.filter((event) => isToday(new Date(event.start)));
  const upcomingEvents = events.filter(
    (event) => !isToday(new Date(event.start))
  );
  const todayCount = todayEvents.length;

  // Convert our events to react-big-calendar format
  const calendarEvents: CalendarEventWithResource[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    resource: event, // Store the full event data
  }));

  // Check if the error is an authentication error
  const isAuthError =
    error &&
    (error.includes("access expired") ||
      error.includes("sign out and sign in") ||
      error.includes("authentication") ||
      error.includes("Invalid Credentials") ||
      error.includes("invalid_token"));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return (
      <div className="text-center text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sign in to view your calendar</p>
      </div>
    );
  }

  // Authentication Error State
  if (isAuthError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="font-medium">Calendar</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Calendar Authentication Required
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Your Google Calendar access has expired. Please sign out and
                  sign back in to refresh your permissions.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border text-xs text-muted-foreground">
                <p className="mb-1">Error details:</p>
                <code className="text-red-600 dark:text-red-400 text-xs break-words">
                  {error}
                </code>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out & Sign Back In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://myaccount.google.com/permissions",
                      "_blank"
                    )
                  }
                  className="w-full gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Check Google Permissions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-medium text-sm">Calendar</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-7 w-7 p-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <LoadingSpinner />
                <p className="text-xs text-muted-foreground mt-2">
                  Loading calendar events...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1 text-sm">
                  Calendar Error
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                  {error.includes("expired") || error.includes("invalid_token")
                    ? "Your Google Calendar access has expired. Please sign out and sign back in."
                    : "Unable to load calendar events."}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border text-xs">
                <p className="text-muted-foreground mb-1">Error details:</p>
                <code className="text-red-600 dark:text-red-400 text-xs break-words">
                  {error}
                </code>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="text-xs flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
                {(error.includes("expired") ||
                  error.includes("invalid_token")) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {events && !isLoading && !error && (
        <>
          {/* Today's Events */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Today ({todayCount})
            </h4>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <EventCard key={event.id} event={event} showDate={false} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-3">
                  <div className="text-center py-3">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      No events scheduled for today
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Upcoming ({upcomingEvents.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upcomingEvents.slice(0, 10).map((event) => (
                  <EventCard key={event.id} event={event} showDate={false} />
                ))}
                {upcomingEvents.length > 10 && (
                  <Card>
                    <CardContent className="p-2">
                      <p className="text-xs text-center text-muted-foreground">
                        +{upcomingEvents.length - 10} more events
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Quick Schedule
                </span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">
                Ask me to schedule something in the chat
              </p>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono bg-white/50 dark:bg-black/20 rounded px-2 py-1">
                "Schedule gym at 6 PM today"
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function EventCard({
  event,
  showDate = false,
}: {
  event: CalendarEvent;
  showDate?: boolean;
}) {
  const startTime = new Date(event.start);
  const endTime = new Date(event.end);

  // Generate Google Calendar link
  const getGoogleCalendarLink = () => {
    const startISO =
      startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endISO =
      endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${description}&location=${location}`;
  };

  // Generate direct link to existing event in Google Calendar
  const getDirectGoogleCalendarLink = () => {
    if (event.id) {
      return `https://calendar.google.com/calendar/u/0/r/eventedit/${event.id}`;
    }
    return getGoogleCalendarLink();
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h5
              className="font-medium text-sm leading-tight group-hover:text-primary transition-colors cursor-pointer"
              onClick={() =>
                window.open(getDirectGoogleCalendarLink(), "_blank")
              }
              title="Click to open in Google Calendar"
            >
              {event.title}
            </h5>
            <div className="flex items-center gap-1">
              <Badge
                variant={event.status === "confirmed" ? "default" : "secondary"}
                className="text-xs flex-shrink-0"
              >
                {event.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(getDirectGoogleCalendarLink(), "_blank");
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Open in Google Calendar"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>
              {showDate && `${formatDate(startTime)} • `}
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Creator info for Aria-created events */}
          {event.creator && event.creator.displayName && (
            <div className="text-xs text-muted-foreground pt-1 border-t flex items-center gap-1">
              <span>Created by {event.creator.displayName}</span>
              {event.creator.displayName === "Aria Assistant" && (
                <Badge variant="outline" className="text-xs">
                  AI Created
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
