"use client";

import { ChatMessage } from "@/types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { User, Bot, Clock } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="text-xs text-muted-foreground bg-muted border rounded px-3 py-1 max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 relative",
            isUser ? "message-user" : "message-assistant"
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <div className="flex items-center gap-2 text-xs opacity-70">
                {message.metadata.model && (
                  <span>{message.metadata.model}</span>
                )}
                {message.metadata.tokens && (
                  <span>• {message.metadata.tokens} tokens</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <Clock className="w-3 h-3" />
          <span>{formatTime(new Date(message.timestamp))}</span>
        </div>
      </div>
    </div>
  );
}
