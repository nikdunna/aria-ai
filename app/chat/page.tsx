"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { AssistantInterface } from "@/components/chat/assistant-interface";
import { CalendarView } from "@/components/views/calendar-view";
import { WeatherView } from "@/components/views/weather-view";
import { ModelsView } from "@/components/views/models-view";
import { SettingsView } from "@/components/views/settings-view";
import { SidebarView } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivePane {
  id: string;
  type: SidebarView;
  title: string;
}

export default function ChatPage() {
  const [activePanes, setActivePanes] = useState<ActivePane[]>([]);

  const handlePaneToggle = (view: SidebarView) => {
    const existingPane = activePanes.find((pane) => pane.type === view);

    if (existingPane) {
      // Close existing pane
      setActivePanes((panes) => panes.filter((pane) => pane.type !== view));
    } else {
      // Open new pane
      const newPane: ActivePane = {
        id: `${view}-${Date.now()}`,
        type: view,
        title: view.charAt(0).toUpperCase() + view.slice(1),
      };
      setActivePanes((panes) => [...panes, newPane]);
    }
  };

  const handlePaneClose = (paneId: string) => {
    setActivePanes((panes) => panes.filter((pane) => pane.id !== paneId));
  };

  const handleSidebarToggle = () => {
    // Placeholder for mobile sidebar toggle functionality
    // Can be implemented later when mobile sidebar is needed
    console.log("Sidebar toggle clicked");
  };

  const renderPaneContent = (pane: ActivePane) => {
    switch (pane.type) {
      case "calendar":
        return <CalendarView />;
      case "weather":
        return <WeatherView />;
      case "models":
        return <ModelsView />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <div className="p-4 text-muted-foreground">Unknown pane type</div>
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="flex flex-col h-full">
        <Header onViewChange={handlePaneToggle} onToggleSidebar={handleSidebarToggle} />
        <main className="flex-1 min-h-0 p-2 md:p-4">
          <div className="h-full max-w-full mx-auto">
            <div className="flex gap-2 md:gap-4 h-full">
              {/* Chat Pane - Main Area */}
              <div
                className={cn(
                  "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300",
                  activePanes.length === 0 ? "flex-1" : "flex-1 lg:flex-[2]"
                )}
              >
                <AssistantInterface />
              </div>

              {/* Widget Sidebar - Right Side */}
              {activePanes.length > 0 && (
                <div
                  className={cn(
                    "flex flex-col gap-2 md:gap-4 transition-all duration-300",
                    "w-full lg:w-80 xl:w-96"
                  )}
                >
                  {activePanes.map((pane) => (
                    <div
                      key={pane.id}
                      className={cn(
                        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden flex flex-col",
                        activePanes.length === 1
                          ? "flex-1"
                          : activePanes.length === 2
                          ? "flex-1"
                          : "min-h-[300px]"
                      )}
                    >
                      {/* Pane Header */}
                      <div className="flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-gray-800/30 dark:to-gray-700/30 flex-shrink-0">
                        <h3 className="font-medium text-sm">{pane.title}</h3>
                        <Button
                          onClick={() => handlePaneClose(pane.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Pane Content */}
                      <div className="flex-1 overflow-hidden min-h-0">
                        <div className="h-full overflow-y-auto p-3">
                          {renderPaneContent(pane)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
