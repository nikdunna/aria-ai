"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function useChat() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, model: string) => {
      if (!content.trim() || isLoading || !session) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get response");
        }

        const assistantMessage = data.data.message;
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        const errorMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);

        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "Failed to send message. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, session, toast]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
