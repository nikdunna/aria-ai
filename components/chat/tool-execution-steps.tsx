"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Cloud,
  Search,
  Loader2,
  FileText,
  Users,
  MapPin,
  Activity,
} from "lucide-react";
import { ActiveTool } from "@/lib/hooks/use-assistant";

interface ToolExecutionStepsProps {
  activeTools: ActiveTool[];
  className?: string;
}

interface ToolStep {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "running" | "completed" | "failed";
  startTime: number;
  duration?: number;
}

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case "get_calendar_events":
    case "create_calendar_event":
    case "update_calendar_event":
    case "delete_calendar_event":
    case "check_calendar_availability":
      return Calendar;
    case "get_weather":
      return Cloud;
    case "file_search":
      return Search;
    default:
      return Activity;
  }
};

const getToolDescription = (toolName: string, status: string) => {
  const descriptions = {
    get_calendar_events: {
      running: "Checking your calendar events...",
      completed: "Found your calendar events",
      failed: "Could not retrieve calendar events",
    },
    create_calendar_event: {
      running: "Creating event in your Aria Calendar...",
      completed: "Event created in Aria Calendar ✨",
      failed: "Failed to create calendar event",
    },
    update_calendar_event: {
      running: "Updating event in Aria Calendar...",
      completed: "Event updated in Aria Calendar ✨",
      failed: "Failed to update calendar event",
    },
    delete_calendar_event: {
      running: "Removing event from Aria Calendar...",
      completed: "Event removed from Aria Calendar",
      failed: "Failed to delete calendar event",
    },
    check_calendar_availability: {
      running: "Checking for scheduling conflicts...",
      completed: "Availability check complete",
      failed: "Could not check availability",
    },
    get_weather: {
      running: "Getting current weather information...",
      completed: "Weather information retrieved",
      failed: "Could not get weather data",
    },
    file_search: {
      running: "Searching through your documents...",
      completed: "Document search complete",
      failed: "Could not search documents",
    },
  };

  return (
    descriptions[toolName as keyof typeof descriptions]?.[
      status as keyof (typeof descriptions)[keyof typeof descriptions]
    ] ||
    `${
      status === "running"
        ? "Running"
        : status === "completed"
        ? "Completed"
        : "Failed"
    } ${toolName}`
  );
};

export function ToolExecutionSteps({
  activeTools,
  className,
}: ToolExecutionStepsProps) {
  if (activeTools.length === 0) {
    return null;
  }

  const toolSteps: ToolStep[] = activeTools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: getToolDescription(tool.name, tool.status),
    icon: getToolIcon(tool.name),
    status: tool.status,
    startTime: tool.startTime,
    duration:
      tool.status !== "running" ? Date.now() - tool.startTime : undefined,
  }));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Processing your request
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {toolSteps.filter((s) => s.status === "completed").length} of{" "}
          {toolSteps.length} complete
        </div>
      </div>

      <div className="space-y-2">
        {toolSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === toolSteps.length - 1;

          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div className="absolute left-5 top-8 w-px h-6 bg-gray-200 dark:bg-gray-700" />
              )}

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                {/* Status Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    step.status === "running" &&
                      "bg-blue-100 dark:bg-blue-900/30",
                    step.status === "completed" &&
                      "bg-green-100 dark:bg-green-900/30",
                    step.status === "failed" && "bg-red-100 dark:bg-red-900/30"
                  )}
                >
                  {step.status === "running" && (
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                  {step.status === "completed" && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                  {step.status === "failed" && (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        step.status === "running" &&
                          "text-blue-600 dark:text-blue-400",
                        step.status === "completed" &&
                          "text-green-600 dark:text-green-400",
                        step.status === "failed" &&
                          "text-red-600 dark:text-red-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        step.status === "running" &&
                          "text-blue-900 dark:text-blue-100",
                        step.status === "completed" &&
                          "text-green-900 dark:text-green-100",
                        step.status === "failed" &&
                          "text-red-900 dark:text-red-100"
                      )}
                    >
                      {step.description}
                    </span>
                  </div>

                  {/* Duration/Time info */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {step.status === "running" ? (
                      <span>Running...</span>
                    ) : step.duration ? (
                      <span>{Math.round(step.duration / 1000)}s</span>
                    ) : (
                      <span>Just now</span>
                    )}
                  </div>
                </div>

                {/* Subtle animation for active step */}
                {step.status === "running" && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
