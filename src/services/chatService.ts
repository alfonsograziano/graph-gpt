import OpenAI from "openai";
import { ChatRequest, ChatResponse, ChatMessage, OpenAIConfig } from "../types";
import { configService } from "./configService";

class ChatService {
  private openai: OpenAI;
  private config: OpenAIConfig;

  constructor() {
    this.config = configService.getOpenAIConfig();
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Prepare messages for OpenAI API
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        ...request.context.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: request.message,
        },
      ];

      // Make API call to OpenAI
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response received from OpenAI API");
      }

      // Transform response to our format
      const chatResponse: ChatResponse = {
        content: response,
        nodeId: request.nodeId,
        conversationId: request.conversationId,
        timestamp: new Date(),
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };

      return chatResponse;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        throw new Error(
          `OpenAI API Error: ${
            (error as { message?: string }).message || "Unknown API error"
          } (${(error as { status?: unknown }).status})`
        );
      }
      throw new Error(
        `Chat service error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

export const chatService = new ChatService();
