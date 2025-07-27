import Anthropic from "@anthropic-ai/sdk";
import {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "@/types";
import { LLMProvider } from "../index";
import { generateId } from "@/lib/utils";
import { AI_MODELS } from "@/constants";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic | null = null;
  private supportedModels = [
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ];

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.client;
  }

  async generateResponse(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const { systemMessage, userMessages } = this.convertMessages(
        request.messages
      );

      const message = await this.getClient().messages.create({
        model: request.model,
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7,
        system: systemMessage,
        messages: userMessages,
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      const responseMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: content.text,
        timestamp: new Date(),
        metadata: {
          model: request.model,
          tokens: message.usage.output_tokens + message.usage.input_tokens,
        },
      };

      return {
        message: responseMessage,
        usage: {
          promptTokens: message.usage.input_tokens,
          completionTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
        model: request.model,
      };
    } catch (error) {
      console.error("Anthropic API Error:", error);
      throw new Error(
        `Anthropic API Error: ${
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
      (m) => m.id === modelId && m.provider === "anthropic"
    );
    if (!model) return null;

    return {
      name: model.name,
      provider: "Anthropic",
      maxTokens: model.maxTokens,
    };
  }

  private convertMessages(messages: ChatMessage[]) {
    const systemMessages = messages.filter((msg) => msg.role === "system");
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    const systemMessage =
      systemMessages.length > 0
        ? systemMessages.map((msg) => msg.content).join("\n\n")
        : undefined;

    const userMessages: Anthropic.Messages.MessageParam[] =
      conversationMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

    return { systemMessage, userMessages };
  }
}
