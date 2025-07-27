"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Command } from "@/types";
import {
  Calendar,
  Cloud,
  Settings,
  Cpu,
  Sun,
  Moon,
  Monitor,
  LogOut,
  MessageSquare,
  User,
  Zap,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const router = useRouter();

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const commands: Command[] = [
    // Navigation
    {
      id: "chat",
      title: "Go to Chat",
      description: "Return to the main chat interface",
      icon: "MessageSquare",
      shortcut: ["g", "c"],
      action: () => router.push("/chat"),
      category: "navigation",
    },

    // Sidebar Views
    {
      id: "calendar",
      title: "Open Calendar View",
      description: "View your calendar events",
      icon: "Calendar",
      shortcut: ["g", "v", "c"],
      action: () => {
        // This would need to be connected to the sidebar state
        // For now, we'll just navigate
        router.push("/chat");
      },
      category: "navigation",
    },
    {
      id: "weather",
      title: "Open Weather View",
      description: "Check weather conditions",
      icon: "Cloud",
      shortcut: ["g", "v", "w"],
      action: () => router.push("/chat"),
      category: "navigation",
    },
    {
      id: "models",
      title: "Open Models View",
      description: "Browse available AI models",
      icon: "Cpu",
      shortcut: ["g", "v", "m"],
      action: () => router.push("/chat"),
      category: "navigation",
    },
    {
      id: "settings",
      title: "Open Settings",
      description: "Configure your preferences",
      icon: "Settings",
      shortcut: ["g", "s"],
      action: () => router.push("/chat"),
      category: "settings",
    },

    // Theme
    {
      id: "theme-light",
      title: "Switch to Light Theme",
      description: "Change to light mode",
      icon: "Sun",
      action: () => setTheme("light"),
      category: "settings",
    },
    {
      id: "theme-dark",
      title: "Switch to Dark Theme",
      description: "Change to dark mode",
      icon: "Moon",
      action: () => setTheme("dark"),
      category: "settings",
    },
    {
      id: "theme-system",
      title: "Use System Theme",
      description: "Follow system preference",
      icon: "Monitor",
      action: () => setTheme("system"),
      category: "settings",
    },

    // Calendar Quick Actions
    {
      id: "new-event",
      title: "Schedule New Event",
      description: "Create a calendar event via chat",
      icon: "Calendar",
      action: () => {
        router.push("/chat");
        // Could pre-fill chat input here
      },
      category: "calendar",
    },

    // AI Actions
    {
      id: "quick-schedule",
      title: "Quick Schedule",
      description: "Ask AI to schedule something now",
      icon: "Zap",
      action: () => {
        router.push("/chat");
        // Could pre-fill with "Schedule "
      },
      category: "ai",
    },
  ];

  // Add sign out command if user is signed in
  if (session) {
    commands.push({
      id: "sign-out",
      title: "Sign Out",
      description: "Sign out of your account",
      icon: "LogOut",
      action: () => signOut({ callbackUrl: "/" }),
      category: "settings",
    });
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      MessageSquare: <MessageSquare className="mr-2 h-4 w-4" />,
      Calendar: <Calendar className="mr-2 h-4 w-4" />,
      Cloud: <Cloud className="mr-2 h-4 w-4" />,
      Settings: <Settings className="mr-2 h-4 w-4" />,
      Cpu: <Cpu className="mr-2 h-4 w-4" />,
      Sun: <Sun className="mr-2 h-4 w-4" />,
      Moon: <Moon className="mr-2 h-4 w-4" />,
      Monitor: <Monitor className="mr-2 h-4 w-4" />,
      LogOut: <LogOut className="mr-2 h-4 w-4" />,
      User: <User className="mr-2 h-4 w-4" />,
      Zap: <Zap className="mr-2 h-4 w-4" />,
    };
    return icons[iconName] || <div className="mr-2 h-4 w-4" />;
  };

  const formatShortcut = (shortcut: string[]) => {
    return shortcut
      .map((key) => {
        if (key === "cmd" || key === "ctrl") {
          return navigator.platform.indexOf("Mac") > -1 ? "⌘" : "Ctrl";
        }
        return key.toUpperCase();
      })
      .join(" + ");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {commands
            .filter((cmd) => cmd.category === "navigation")
            .map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command.action)}
              >
                {getIcon(command.icon || "")}
                <div className="flex-1">
                  <div>{command.title}</div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
                {command.shortcut && (
                  <div className="text-xs text-muted-foreground">
                    {formatShortcut(command.shortcut)}
                  </div>
                )}
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Calendar">
          {commands
            .filter((cmd) => cmd.category === "calendar")
            .map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command.action)}
              >
                {getIcon(command.icon || "")}
                <div className="flex-1">
                  <div>{command.title}</div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="AI">
          {commands
            .filter((cmd) => cmd.category === "ai")
            .map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command.action)}
              >
                {getIcon(command.icon || "")}
                <div className="flex-1">
                  <div>{command.title}</div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          {commands
            .filter((cmd) => cmd.category === "settings")
            .map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command.action)}
              >
                {getIcon(command.icon || "")}
                <div className="flex-1">
                  <div>{command.title}</div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
