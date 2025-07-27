import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AssistantThread {
  id: string;
  createdAt: string;
}

export interface ActiveTool {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  startTime: number;
}

export interface UserContext {
  location?: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  timezone?: string;
  preferences?: {
    weatherUnit?: "celsius" | "fahrenheit";
    timeFormat?: "12h" | "24h";
  };
}

export function useAssistant() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState<AssistantThread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<Map<string, ActiveTool>>(
    new Map()
  );
  const [userContext, setUserContext] = useState<UserContext>({});
  const abortController = useRef<AbortController | null>(null);

  // Get user's location and context on mount
  useEffect(() => {
    const getUserContext = async () => {
      try {
        // Get user's timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // Get location name from coordinates (using a reverse geocoding service)
              try {
                const locationResponse = await fetch(
                  `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${
                    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo"
                  }`
                );

                if (locationResponse.ok) {
                  const locationData = await locationResponse.json();
                  if (locationData.length > 0) {
                    const location = locationData[0];
                    setUserContext({
                      location: {
                        city: location.name,
                        country: location.country,
                        coordinates: { lat: latitude, lon: longitude },
                      },
                      timezone,
                      preferences: {
                        weatherUnit: "celsius",
                        timeFormat: "24h",
                      },
                    });
                  }
                } else {
                  // Fallback without city name
                  setUserContext({
                    location: {
                      city: "Current Location",
                      country: "",
                      coordinates: { lat: latitude, lon: longitude },
                    },
                    timezone,
                    preferences: {
                      weatherUnit: "celsius",
                      timeFormat: "24h",
                    },
                  });
                }
              } catch (error) {
                console.warn("Could not get location name:", error);
                setUserContext({
                  timezone,
                  preferences: {
                    weatherUnit: "celsius",
                    timeFormat: "24h",
                  },
                });
              }
            },
            (error) => {
              console.warn("Geolocation not available:", error);
              setUserContext({
                timezone,
                preferences: {
                  weatherUnit: "celsius",
                  timeFormat: "24h",
                },
              });
            }
          );
        } else {
          setUserContext({
            timezone,
            preferences: {
              weatherUnit: "celsius",
              timeFormat: "24h",
            },
          });
        }
      } catch (error) {
        console.warn("Could not get user context:", error);
      }
    };

    getUserContext();
  }, []);

  // Load or create thread on mount
  useEffect(() => {
    const initializeThread = async () => {
      try {
        // Check for existing thread in localStorage
        const savedThreadId = localStorage.getItem("aria-thread-id");

        if (savedThreadId) {
          // Try to load existing thread messages
          const response = await fetch(
            `/api/chat/assistant?threadId=${savedThreadId}`
          );
          const data = await response.json();

          if (data.success) {
            setThread({
              id: savedThreadId,
              createdAt: new Date().toISOString(),
            });
            setMessages(data.messages || []);
            console.log("✅ Loaded existing thread:", savedThreadId);
            return;
          }
        }

        // Create new thread
        const response = await fetch("/api/chat/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_thread" }),
        });

        const data = await response.json();
        if (data.success) {
          setThread(data.thread);
          localStorage.setItem("aria-thread-id", data.thread.id);
          console.log("✅ Created new thread:", data.thread.id);
        } else {
          throw new Error(data.error || "Failed to create thread");
        }
      } catch (error) {
        console.error("❌ Failed to initialize thread:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize conversation"
        );
      }
    };

    if (session) {
      initializeThread();
    }
  }, [session]);

  // Enhanced sendMessage with context
  const sendMessage = useCallback(
    async (content: string) => {
      if (!thread) {
        setError("No conversation thread available");
        return;
      }

      if (!content.trim()) {
        toast({
          title: "Empty message",
          description: "Please type a message before sending.",
          variant: "destructive",
        });
        return;
      }

      // Cancel any ongoing request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setActiveTools(new Map());

      // Add context information to the message
      let enhancedMessage = content;
      if (userContext.location || userContext.timezone) {
        const now = new Date();
        const contextInfo = [];

        if (userContext.location) {
          contextInfo.push(
            `User location: ${userContext.location.city}${
              userContext.location.country
                ? `, ${userContext.location.country}`
                : ""
            }`
          );
        }

        if (userContext.timezone) {
          contextInfo.push(`User timezone: ${userContext.timezone}`);

          // Provide multiple time formats for clarity
          const currentDateTime = {
            iso: now.toISOString(),
            local: now.toLocaleString("en-US", {
              timeZone: userContext.timezone,
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
            }),
            time24h: now.toLocaleTimeString("en-US", {
              timeZone: userContext.timezone,
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            time12h: now.toLocaleTimeString("en-US", {
              timeZone: userContext.timezone,
              hour12: true,
              hour: "numeric",
              minute: "2-digit",
            }),
            date: now.toLocaleDateString("en-US", {
              timeZone: userContext.timezone,
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          };

          contextInfo.push(`Current time: ${currentDateTime.local}`);
          contextInfo.push(`ISO time: ${currentDateTime.iso}`);
          contextInfo.push(`24h time: ${currentDateTime.time24h}`);
        }

        enhancedMessage = `${content}\n\n[CURRENT CONTEXT: ${contextInfo.join(
          "; "
        )}]`;
      }

      // Add user message immediately
      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        console.log(
          `📤 Sending message to thread ${thread.id}:`,
          content.substring(0, 100) + "..."
        );

        const response = await fetch("/api/chat/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_message",
            threadId: thread.id,
            message: enhancedMessage,
            userContext,
          }),
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available");
        }

        const decoder = new TextDecoder();
        const assistantMessage: AssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        // Add empty assistant message for streaming
        setMessages((prev) => [...prev, assistantMessage]);

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("📥 Stream reading complete");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                console.log(
                  "📨 Received stream event:",
                  data.type,
                  data.data?.name || ""
                );

                switch (data.type) {
                  case "content":
                    // Update assistant message content
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: msg.content + data.data }
                          : msg
                      )
                    );
                    break;

                  case "tool_call":
                    const toolData = data.data;
                    console.log("🔧 Tool call started:", toolData.name);

                    // Add to active tools
                    setActiveTools(
                      (prev) =>
                        new Map(
                          prev.set(toolData.id, {
                            id: toolData.id,
                            name: toolData.name,
                            status: "running",
                            startTime: Date.now(),
                          })
                        )
                    );

                    toast({
                      title: `🔧 Using ${toolData.name}`,
                      description: "Processing your request...",
                      duration: 0, // Don't auto-dismiss while running
                    });
                    break;

                  case "tool_result":
                    const resultData = data.data;
                    console.log(
                      "✅ Tool result received:",
                      resultData.name,
                      resultData.success
                    );

                    // Update active tools
                    setActiveTools((prev) => {
                      const updated = new Map(prev);
                      const tool = updated.get(resultData.id);
                      if (tool) {
                        tool.status = resultData.success
                          ? "completed"
                          : "failed";
                        updated.set(resultData.id, tool);
                      }
                      return updated;
                    });

                    if (resultData.success) {
                      toast({
                        title: `✅ ${resultData.name} completed`,
                        description: "Successfully processed your request!",
                        duration: 3000,
                      });
                    } else {
                      toast({
                        title: `⚠️ ${resultData.name} completed with issues`,
                        description:
                          "The tool ran but encountered some issues.",
                        variant: "destructive",
                        duration: 4000,
                      });
                    }
                    break;

                  case "tool_error":
                    const errorData = data.data;
                    console.error(
                      "❌ Tool error:",
                      errorData.name,
                      errorData.error
                    );

                    // Update active tools
                    setActiveTools((prev) => {
                      const updated = new Map(prev);
                      const tool = updated.get(errorData.id);
                      if (tool) {
                        tool.status = "failed";
                        updated.set(errorData.id, tool);
                      }
                      return updated;
                    });

                    toast({
                      title: `❌ ${errorData.name} failed`,
                      description: errorData.error,
                      variant: "destructive",
                      duration: 5000,
                    });
                    break;

                  case "complete":
                    console.log("🎉 Assistant response complete");

                    // Clear active tools
                    setActiveTools(new Map());

                    // Trigger calendar update if calendar events were modified
                    const completedTools = Array.from(activeTools.values());
                    const hasCalendarTools = completedTools.some(
                      (tool) =>
                        tool.name.includes("calendar") &&
                        tool.status === "completed"
                    );

                    if (hasCalendarTools) {
                      console.log("📅 Triggering calendar update");
                      window.dispatchEvent(new CustomEvent("calendarUpdate"));
                    }

                    toast({
                      title: "✨ Response complete",
                      description: "I'm ready for your next request!",
                      duration: 2000,
                    });
                    break;

                  case "error":
                    throw new Error(data.data.error);

                  default:
                    console.warn("🤷 Unknown stream event type:", data.type);
                }
              } catch (parseError) {
                console.error("❌ Failed to parse SSE data:", parseError);
                console.error("Raw data:", line);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("🛑 Request was cancelled");
          toast({
            title: "Request cancelled",
            description: "The request was stopped.",
          });
          return;
        }

        console.error("❌ Failed to send message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        setError(errorMessage);

        toast({
          title: "Failed to send message",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });

        // Remove the user message if there was an error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
        setActiveTools(new Map());
        abortController.current = null;
      }
    },
    [thread, activeTools, toast, userContext]
  );

  // Clear conversation (create new thread)
  const clearConversation = useCallback(async () => {
    try {
      // Cancel any ongoing request first
      if (abortController.current) {
        abortController.current.abort();
        setIsLoading(false);
      }

      localStorage.removeItem("aria-thread-id");
      setActiveTools(new Map());

      const response = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_thread" }),
      });

      const data = await response.json();
      if (data.success) {
        setThread(data.thread);
        setMessages([]);
        setError(null);
        localStorage.setItem("aria-thread-id", data.thread.id);
        console.log("✅ Created new thread:", data.thread.id);

        toast({
          title: "New conversation started",
          description: "Previous conversation cleared.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("❌ Failed to clear conversation:", error);
      toast({
        title: "Failed to clear conversation",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      setIsLoading(false);
      setActiveTools(new Map());

      toast({
        title: "Request cancelled",
        description: "The current request has been stopped.",
        duration: 3000,
      });
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    thread,
    error,
    activeTools: Array.from(activeTools.values()),
    userContext,
    sendMessage,
    clearConversation,
    cancelRequest,
    hasThread: !!thread,
  };
}
