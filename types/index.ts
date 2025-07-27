import { DefaultSession } from "next-auth";

// Extend NextAuth session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

// Chat message types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    calendarEvents?: CalendarEvent[];
  };
}

// AI Model types
export interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic";
  description: string;
  tooltip: string;
  maxTokens: number;
  costPer1kTokens: number;
  speed: "fast" | "medium" | "slow";
  capabilities: string[];
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  recurrence?: string;
  status: "confirmed" | "tentative" | "cancelled";
  creator?: {
    email: string;
    displayName?: string;
  };
}

export interface CalendarCreateRequest {
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  description?: string;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
}

// Weather types (for future integration)
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

// User preferences
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultModel: string;
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  timezone: string;
  calendarId?: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  calendarContext?: CalendarEvent[];
  userPreferences?: UserPreferences;
}

export interface ChatCompletionResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// Sidebar view types
export type SidebarView = "calendar" | "weather" | "settings" | "models";

export interface SidebarState {
  isOpen: boolean;
  activeView: SidebarView | null;
  width: number;
}

// Command palette types
export interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  shortcut?: string[];
  action: () => void | Promise<void>;
  category: "navigation" | "calendar" | "ai" | "settings";
}

// App state types
export interface AppState {
  user: DefaultSession["user"] | null;
  isAuthenticated: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  currentModel: string;
  sidebar: SidebarState;
  preferences: UserPreferences;
  calendarEvents: CalendarEvent[];
  weather?: WeatherData;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}
