"use client";

import { useSession } from "next-auth/react";
import { useCalendar } from "@/lib/hooks/use-calendar";
import { CalendarEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, formatDate, isToday } from "@/lib/utils";
import { Calendar, Clock, MapPin, RefreshCw, Plus } from "lucide-react";

export function CalendarView() {
  const { data: session } = useSession();
  const { events, isLoading, error, refetch } = useCalendar();

  const todayEvents = events.filter((event) => isToday(new Date(event.start)));
  const upcomingEvents = events.filter(
    (event) => !isToday(new Date(event.start))
  );

  if (!session) {
    return (
      <div className="text-center text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sign in to view your calendar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Calendar Events</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="w-full mt-3"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Today's Events */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
              <Badge variant="secondary" className="text-xs">
                {todayEvents.length}
              </Badge>
            </h4>

            {todayEvents.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No events today
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perfect time for productivity!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming
                <Badge variant="outline" className="text-xs">
                  {upcomingEvents.length}
                </Badge>
              </h4>

              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <EventCard key={event.id} event={event} showDate />
                ))}

                {upcomingEvents.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{upcomingEvents.length - 5} more events
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Action */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Plus className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium mb-1">Quick Schedule</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Ask me to schedule something in the chat
                </p>
                <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                  "Schedule gym at 6 PM today"
                </div>
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

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-medium text-sm leading-tight">{event.title}</h5>
            <Badge
              variant={event.status === "confirmed" ? "default" : "secondary"}
              className="text-xs flex-shrink-0"
            >
              {event.status}
            </Badge>
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
        </div>
      </CardContent>
    </Card>
  );
}
