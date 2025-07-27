import {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "@/types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";

export interface LLMProvider {
  generateResponse(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse>;
  validateModel(modelId: string): boolean;
  getModelInfo(
    modelId: string
  ): { name: string; provider: string; maxTokens: number } | null;
}

class LLMFactory {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("anthropic", new AnthropicProvider());
  }

  async generateResponse(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const provider = this.getProviderForModel(request.model);
    if (!provider) {
      throw new Error(`No provider found for model: ${request.model}`);
    }

    if (!provider.validateModel(request.model)) {
      throw new Error(`Invalid model: ${request.model}`);
    }

    return await provider.generateResponse(request);
  }

  private getProviderForModel(modelId: string): LLMProvider | undefined {
    if (modelId.startsWith("gpt-")) {
      return this.providers.get("openai");
    }
    if (modelId.startsWith("claude-")) {
      return this.providers.get("anthropic");
    }
    return undefined;
  }

  getModelInfo(modelId: string) {
    const provider = this.getProviderForModel(modelId);
    return provider?.getModelInfo(modelId) || null;
  }

  validateModel(modelId: string): boolean {
    const provider = this.getProviderForModel(modelId);
    return provider?.validateModel(modelId) || false;
  }
}

// Export singleton instance
export const llmFactory = new LLMFactory();

// Convenience function for direct use
export async function generateChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  return await llmFactory.generateResponse(request);
}
