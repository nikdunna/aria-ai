"use client";

import { SidebarView } from "@/types";
import { CalendarView } from "../views/calendar-view";
import { WeatherView } from "../views/weather-view";
import { SettingsView } from "../views/settings-view";
import { ModelsView } from "../views/models-view";
import { Button } from "@/components/ui/button";
import { X, Calendar, Cloud, Settings, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_CONFIG } from "@/constants";

interface SidebarProps {
  isOpen: boolean;
  activeView: SidebarView | null;
  onViewChange: (view: SidebarView | null) => void;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({
  isOpen,
  activeView,
  onViewChange,
  onOpenChange,
}: SidebarProps) {
  const handleClose = () => {
    onViewChange(null);
    onOpenChange(false);
  };

  const handleViewSelect = (view: SidebarView) => {
    onViewChange(view);
    onOpenChange(true);
  };

  if (!isOpen || !activeView) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background border-r shadow-lg",
          "lg:relative lg:shadow-none",
          "w-[320px] min-w-[320px]",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ViewIcon view={activeView} />
            <h2 className="font-semibold capitalize">{activeView}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeView === "calendar" && <CalendarView />}
          {activeView === "weather" && <WeatherView />}
          {activeView === "settings" && <SettingsView />}
          {activeView === "models" && <ModelsView />}
        </div>

        {/* Quick view switcher */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <ViewButton
              view="calendar"
              icon={<Calendar className="h-4 w-4" />}
              active={activeView === "calendar"}
              onClick={() => handleViewSelect("calendar")}
            />
            <ViewButton
              view="weather"
              icon={<Cloud className="h-4 w-4" />}
              active={activeView === "weather"}
              onClick={() => handleViewSelect("weather")}
            />
            <ViewButton
              view="models"
              icon={<Cpu className="h-4 w-4" />}
              active={activeView === "models"}
              onClick={() => handleViewSelect("models")}
            />
            <ViewButton
              view="settings"
              icon={<Settings className="h-4 w-4" />}
              active={activeView === "settings"}
              onClick={() => handleViewSelect("settings")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ViewIcon({ view }: { view: SidebarView }) {
  switch (view) {
    case "calendar":
      return <Calendar className="h-4 w-4" />;
    case "weather":
      return <Cloud className="h-4 w-4" />;
    case "settings":
      return <Settings className="h-4 w-4" />;
    case "models":
      return <Cpu className="h-4 w-4" />;
    default:
      return null;
  }
}

function ViewButton({
  view,
  icon,
  active,
  onClick,
}: {
  view: SidebarView;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className="flex-1 gap-2"
      title={`${view.charAt(0).toUpperCase() + view.slice(1)} view`}
    >
      {icon}
      <span className="capitalize text-xs">{view}</span>
    </Button>
  );
}
