"use client";

import { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "../model-select/model-selector";
import { DEFAULT_MODEL } from "@/constants";
import { useChat } from "@/lib/hooks/use-chat";

export function ChatInterface() {
  const { data: session } = useSession();
  const { messages, isLoading, sendMessage } = useChat();
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, selectedModel);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">
            Please sign in to continue
          </h2>
          <p className="text-muted-foreground">
            You need to be authenticated to use the chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Model Selector */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">AI Productivity Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Schedule and manage your day through conversation
            </p>
          </div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask me to schedule something, or type 'help' for examples..."
        />
      </div>
    </div>
  );
}
