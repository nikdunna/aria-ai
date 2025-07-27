"use client";

import { ChatMessage } from "@/types";
import { MessageBubble } from "./message-bubble";
import { LoadingSpinner } from "../ui/loading-spinner";
import { formatDate } from "@/lib/utils";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-muted-foreground mb-4">
            I can help you schedule events, manage your calendar, and plan your
            day. Try asking me something like:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-2 rounded-lg bg-muted text-left">
              "Schedule gym 5-6 PM if I'm free"
            </div>
            <div className="p-2 rounded-lg bg-muted text-left">
              "Block off 3 hours for deep work tomorrow"
            </div>
            <div className="p-2 rounded-lg bg-muted text-left">
              "What's on my calendar today?"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto chat-container p-4 space-y-4">
      {messages.map((message, index) => {
        const showDate =
          index === 0 ||
          formatDate(new Date(message.timestamp)) !==
            formatDate(new Date(messages[index - 1].timestamp));

        return (
          <div key={message.id}>
            {showDate && (
              <div className="flex justify-center mb-4">
                <div className="text-xs text-muted-foreground bg-background border rounded-full px-3 py-1">
                  {formatDate(new Date(message.timestamp))}
                </div>
              </div>
            )}
            <MessageBubble message={message} />
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start">
          <div className="message-assistant inline-flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
