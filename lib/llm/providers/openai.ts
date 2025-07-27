import OpenAI from "openai";
import {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "@/types";
import { LLMProvider } from "../index";
import { generateId } from "@/lib/utils";
import { AI_MODELS } from "@/constants";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI | null = null;
  private supportedModels = ["gpt-4-turbo-preview", "gpt-3.5-turbo"];

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  async generateResponse(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const openaiMessages = this.convertMessages(request.messages);

      const completion = await this.getClient().chat.completions.create({
        model: request.model,
        messages: openaiMessages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      });

      const assistantMessage = completion.choices[0]?.message;
      if (!assistantMessage?.content) {
        throw new Error("No response from OpenAI");
      }

      const responseMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: assistantMessage.content,
        timestamp: new Date(),
        metadata: {
          model: request.model,
          tokens: completion.usage?.total_tokens,
        },
      };

      return {
        message: responseMessage,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
        model: request.model,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(
        `OpenAI API Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  validateModel(modelId: string): boolean {
    return this.supportedModels.includes(modelId);
  }

  getModelInfo(modelId: string) {
    const model = AI_MODELS.find(
      (m) => m.id === modelId && m.provider === "openai"
    );
    if (!model) return null;

    return {
      name: model.name,
      provider: "OpenAI",
      maxTokens: model.maxTokens,
    };
  }

  private convertMessages(
    messages: ChatMessage[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
}
