"use client";

import { CalendarEvent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  isNewEvent?: boolean;
  actionType?: "created" | "updated" | "deleted" | "none";
  compact?: boolean;
  showDate?: boolean;
}

export function EventCard({
  event,
  isNewEvent = false,
  actionType = "created",
  compact = false,
  showDate = false,
}: EventCardProps) {
  const startTime = new Date(event.start);
  const endTime = new Date(event.end);
  const isToday = new Date().toDateString() === startTime.toDateString();

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

  const getActionIcon = () => {
    switch (actionType) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "updated":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "deleted":
        return <Calendar className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-primary" />;
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case "created":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      case "updated":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
      case "deleted":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      default:
        return "border-primary/20 bg-primary/5";
    }
  };

  // Compact version for sidebar widgets
  if (compact) {
    return (
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-2">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight truncate">
                {event.title}
              </h4>
              {event.status === "confirmed" && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>
                {showDate && !isToday && (
                  <span className="font-medium">
                    {formatDate(startTime)} •{" "}
                  </span>
                )}
                {isToday && (
                  <span className="text-primary font-medium">Today • </span>
                )}
                {formatTime(startTime)}
                {!event.isAllDay && ` - ${formatTime(endTime)}`}
                {event.isAllDay && <span className="ml-1">(All day)</span>}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version for chat messages and main views
  return (
    <Card
      className={`max-w-md mx-auto my-4 shadow-lg hover:shadow-xl transition-shadow ${
        actionType === "none" ? "" : getActionColor()
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with action indicator */}
          {isNewEvent && actionType !== "none" && (
            <div className="flex items-center gap-2 text-sm">
              {getActionIcon()}
              <span className="font-medium text-muted-foreground">
                Event {actionType}!
              </span>
            </div>
          )}

          {/* Event title and status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight text-foreground">
              {event.title}
            </h3>
            <Badge
              variant={event.status === "confirmed" ? "default" : "secondary"}
              className="text-xs flex-shrink-0"
            >
              {event.status}
            </Badge>
          </div>

          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium">
                {formatDate(startTime)}
                {isToday && (
                  <span className="text-primary font-semibold"> (Today)</span>
                )}
              </div>
              <div>
                {formatTime(startTime)} - {formatTime(endTime)}
                {event.isAllDay && <span className="ml-1">(All day)</span>}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {event.attendees.length === 1
                  ? `1 attendee: ${event.attendees[0]}`
                  : `${event.attendees.length} attendees`}
              </span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="text-sm text-muted-foreground">
              <p className="line-clamp-2">{event.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => window.open(getGoogleCalendarLink(), "_blank")}
              className="flex-1 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Calendar
            </Button>
          </div>

          {/* Creator info */}
          {event.creator && event.creator.displayName && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Created by {event.creator.displayName}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
