export * from "./models";

// App configuration
export const APP_CONFIG = {
  name: "AI Productivity Scheduler",
  description: "Chat-based productivity app powered by AI",
  version: "1.0.0",
  author: "Your Name",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

// API endpoints
export const API_ENDPOINTS = {
  CHAT: "/api/chat",
  CALENDAR: "/api/calendar",
  WEATHER: "/api/weather",
  USER_PREFERENCES: "/api/user/preferences",
  AUTH: "/api/auth",
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "ai-scheduler-theme",
  SIDEBAR_STATE: "ai-scheduler-sidebar",
  USER_PREFERENCES: "ai-scheduler-preferences",
  CHAT_HISTORY: "ai-scheduler-chat-history",
  SELECTED_MODEL: "ai-scheduler-model",
};

// Default user preferences
export const DEFAULT_PREFERENCES = {
  theme: "system" as const,
  defaultModel: "claude-3-sonnet-20240229",
  workingHours: {
    start: "09:00",
    end: "17:00",
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: false,
    desktop: true,
  },
};

// Chat configuration
export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_DELAY: 50,
  AUTO_SCROLL_THRESHOLD: 100,
  DEBOUNCE_DELAY: 300,
};

// Calendar configuration
export const CALENDAR_CONFIG = {
  DEFAULT_EVENT_DURATION: 60, // minutes
  MIN_EVENT_DURATION: 15,
  MAX_EVENT_DURATION: 480, // 8 hours
  BUSINESS_HOURS_START: 9,
  BUSINESS_HOURS_END: 17,
  WEEK_STARTS_ON: 0, // Sunday
};

// Command palette shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_COMMAND_PALETTE: ["cmd+k", "ctrl+k"],
  TOGGLE_SIDEBAR: ["cmd+b", "ctrl+b"],
  NEW_CHAT: ["cmd+n", "ctrl+n"],
  TOGGLE_THEME: ["cmd+shift+t", "ctrl+shift+t"],
  FOCUS_CHAT_INPUT: ["/", "cmd+i", "ctrl+i"],
};

// Sidebar configuration
export const SIDEBAR_CONFIG = {
  DEFAULT_WIDTH: 320,
  MIN_WIDTH: 280,
  MAX_WIDTH: 480,
  COLLAPSED_WIDTH: 0,
  ANIMATION_DURATION: 300,
};

// Google Calendar scopes
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  AUTH_REQUIRED: "Please sign in to continue.",
  CALENDAR_ACCESS: "Unable to access your calendar. Please check permissions.",
  AI_SERVICE: "AI service is temporarily unavailable.",
  RATE_LIMIT: "Too many requests. Please wait a moment.",
  INVALID_INPUT: "Please provide valid input.",
  EVENT_CONFLICT: "This time slot conflicts with an existing event.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: "Event created successfully!",
  EVENT_UPDATED: "Event updated successfully!",
  EVENT_DELETED: "Event deleted successfully!",
  PREFERENCES_SAVED: "Preferences saved!",
  CALENDAR_SYNCED: "Calendar synced successfully!",
};

// Loading states
export const LOADING_STATES = {
  THINKING: "Thinking...",
  CREATING_EVENT: "Creating event...",
  UPDATING_EVENT: "Updating event...",
  LOADING_CALENDAR: "Loading calendar...",
  SYNCING: "Syncing...",
  SAVING: "Saving...",
};
