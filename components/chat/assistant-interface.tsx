import React, { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAssistant } from "@/lib/hooks/use-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2, Sparkles, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolExecutionSteps } from "./tool-execution-steps";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AssistantInterface() {
  const { data: session } = useSession();
  const {
    messages,
    isLoading,
    activeTools,
    sendMessage,
    clearConversation,
    cancelRequest,
    hasThread,
    error,
  } = useAssistant();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-muted-foreground">
            Authentication Required
          </h3>
          <p className="text-sm text-muted-foreground">
            Please sign in to start chatting with Aria
          </p>
        </div>
      </div>
    );
  }

  if (error && !hasThread) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-destructive">
            Connection Error
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!hasThread) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Starting conversation...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-gray-800/30 dark:to-gray-700/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Aria Assistant</span>
              <span className="text-xs text-muted-foreground">
                Your goofy but helpful AI assistant ✨
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                onClick={clearConversation}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">
              OpenAI Assistant
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Hey there! 👋</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm Aria, your AI assistant! I can help you schedule events,
                check the weather, and organize your life. What would you like
                to do today?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage("Schedule gym at 6 PM today")}
                className="text-xs"
              >
                Schedule gym session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage("What's the weather like?")}
                className="text-xs"
              >
                Check weather
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage("What do I have coming up?")}
                className="text-xs"
              >
                View my schedule
              </Button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 shadow-sm",
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-foreground border"
              )}
            >
              {message.role === "user" ? (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-p:leading-relaxed prose-headings:mt-2 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customize paragraph styling
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 text-sm leading-relaxed">
                          {children}
                        </p>
                      ),
                      // Customize list styling
                      ul: ({ children }) => (
                        <ul className="mb-2 last:mb-0 ml-4 text-sm list-disc">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 last:mb-0 ml-4 text-sm list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-0.5">{children}</li>
                      ),
                      // Customize heading styles
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">
                          {children}
                        </h3>
                      ),
                      // Customize code styling
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                            {children}
                          </code>
                        ) : (
                          <code className={className}>{children}</code>
                        );
                      },
                      // Customize pre/code block styling
                      pre: ({ children }) => (
                        <pre className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto text-xs my-2 text-gray-800 dark:text-gray-200">
                          {children}
                        </pre>
                      ),
                      // Customize blockquote styling
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-700 dark:text-gray-300 italic">
                          {children}
                        </blockquote>
                      ),
                      // Customize table styling
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                          {children}
                        </td>
                      ),
                      // Customize link styling
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {children}
                        </a>
                      ),
                      // Customize emphasis
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900 dark:text-gray-100">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-800 dark:text-gray-200">
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <div
                className={cn(
                  "text-xs mt-1 opacity-70",
                  message.role === "user"
                    ? "text-indigo-100"
                    : "text-muted-foreground"
                )}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator with tool execution steps */}
        {(isLoading || activeTools.length > 0) && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white/90 dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm">
              {activeTools.length > 0 ? (
                <ToolExecutionSteps activeTools={activeTools} />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Aria is thinking...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-gray-800/30 dark:to-gray-700/30 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isLoading
                ? "Aria is responding..."
                : "Tell Aria what you need! Try 'Schedule gym at 6 PM' or ask about the weather! 🎯"
            }
            disabled={isLoading}
            className="flex-1"
          />
          {isLoading ? (
            <Button
              type="button"
              onClick={cancelRequest}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
