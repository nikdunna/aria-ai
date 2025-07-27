import { AIModel } from "@/types";

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    provider: "openai",
    description:
      "Most capable model for complex reasoning and long-form responses",
    tooltip:
      "Long-form Genius - Best for detailed planning and complex scheduling logic",
    maxTokens: 4096,
    costPer1kTokens: 0.03,
    speed: "slow",
    capabilities: [
      "reasoning",
      "planning",
      "calendar-integration",
      "long-form",
    ],
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "Fast and cost-effective for daily scheduling tasks",
    tooltip:
      "Fast & Cheap - Perfect for quick scheduling and simple calendar tasks",
    maxTokens: 4096,
    costPer1kTokens: 0.002,
    speed: "fast",
    capabilities: ["scheduling", "calendar-integration", "quick-responses"],
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    description:
      "Excellent balance of intelligence and speed for productivity tasks",
    tooltip:
      "Best for Daily Tasks - Ideal balance of speed and intelligence for productivity",
    maxTokens: 4096,
    costPer1kTokens: 0.015,
    speed: "medium",
    capabilities: [
      "reasoning",
      "planning",
      "productivity",
      "calendar-integration",
    ],
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description: "Fastest model for simple scheduling and quick responses",
    tooltip:
      "Lightning Fast - Instant responses for simple scheduling requests",
    maxTokens: 4096,
    costPer1kTokens: 0.00025,
    speed: "fast",
    capabilities: [
      "quick-responses",
      "simple-scheduling",
      "calendar-integration",
    ],
  },
];

export const DEFAULT_MODEL = "claude-3-sonnet-20240229";

export const MODEL_CATEGORIES = {
  CREATIVE: ["gpt-4-turbo-preview", "claude-3-sonnet-20240229"],
  FAST: ["gpt-3.5-turbo", "claude-3-haiku-20240307"],
  ECONOMICAL: ["gpt-3.5-turbo", "claude-3-haiku-20240307"],
  PREMIUM: ["gpt-4-turbo-preview", "claude-3-sonnet-20240229"],
};

export const SPEED_LABELS = {
  fast: "⚡ Fast",
  medium: "⚖️ Balanced",
  slow: "🧠 Thoughtful",
};

export const PROVIDER_LABELS = {
  openai: "OpenAI",
  anthropic: "Anthropic",
};

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === id);
}

export function getModelsByProvider(
  provider: "openai" | "anthropic"
): AIModel[] {
  return AI_MODELS.filter((model) => model.provider === provider);
}

export function getModelsBySpeed(speed: "fast" | "medium" | "slow"): AIModel[] {
  return AI_MODELS.filter((model) => model.speed === speed);
}
