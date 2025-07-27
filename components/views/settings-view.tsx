"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AI_MODELS, DEFAULT_PREFERENCES } from "@/constants";
import { UserPreferences } from "@/types";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Clock,
  Calendar,
  Brain,
  Save,
} from "lucide-react";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem("ai-scheduler-preferences");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNestedPreference = <K extends keyof UserPreferences>(
    key: K,
    subKey: keyof UserPreferences[K],
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as any), [subKey]: value },
    }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem(
      "ai-scheduler-preferences",
      JSON.stringify(preferences)
    );
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </h3>
        {hasChanges && (
          <Button size="sm" onClick={savePreferences} className="gap-2">
            <Save className="h-3 w-3" />
            Save
          </Button>
        )}
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultModel">Default Model</Label>
            <Select
              value={preferences.defaultModel}
              onValueChange={(value) => updatePreference("defaultModel", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        ${model.costPer1kTokens}/1k
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This model will be selected by default when you start new
              conversations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStart">Start Time</Label>
              <Select
                value={preferences.workingHours.start}
                onValueChange={(value) =>
                  updateNestedPreference("workingHours", "start", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEnd">End Time</Label>
              <Select
                value={preferences.workingHours.end}
                onValueChange={(value) =>
                  updateNestedPreference("workingHours", "end", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            AI will prefer scheduling work events during these hours.
          </p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive calendar event reminders via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={preferences.notifications.email}
                onCheckedChange={(checked) =>
                  updateNestedPreference("notifications", "email", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Browser notifications for scheduled events
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={preferences.notifications.push}
                onCheckedChange={(checked) =>
                  updateNestedPreference("notifications", "push", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktopNotifications">
                  Desktop Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  System notifications for important updates
                </p>
              </div>
              <Switch
                id="desktopNotifications"
                checked={preferences.notifications.desktop}
                onCheckedChange={(checked) =>
                  updateNestedPreference("notifications", "desktop", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {preferences.timezone}
              </span>
              <Badge variant="outline" className="text-xs">
                Auto-detected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Timezone is automatically detected from your system settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Notice */}
      {hasChanges && (
        <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Unsaved Changes
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                Don't forget to save your preferences!
              </p>
              <Button onClick={savePreferences} size="sm" className="gap-2">
                <Save className="h-3 w-3" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
