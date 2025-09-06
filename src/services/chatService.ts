import OpenAI from "openai";
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  OpenAIConfig,
  StreamingChatRequest,
  StreamingChunk,
} from "../types";
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
        {
          role: "system",
          content: `
You are a helpful assistant.
Always respond using valid Markdown formatting.

Depending on the context of the conversation, you must use:
- Titles and subtitles (#, ##, ###) for clear structure.
- Bullet points or numbered lists for steps, processes, or summaries.
- Links in Markdown format [text](url) when referencing resources.
- Code blocks (triple backticks) for technical snippets or examples.
- Tables when comparing or organizing structured data.
Inline emphasis (*italic*, **bold**) for clarity and readability.

Your goal is to make answers structured, clear, and easy to read, leveraging Markdown to enhance understanding.`,
        },
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
        //max_tokens: this.config.maxTokens,
        //temperature: this.config.temperature,
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

  async sendStreamingMessage(
    request: StreamingChatRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<void> {
    try {
      // Prepare messages for OpenAI API
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `
You are a helpful assistant.
Always respond using valid Markdown formatting.

Depending on the context of the conversation, you must use:
- Titles and subtitles (#, ##, ###) for clear structure.
- Bullet points or numbered lists for steps, processes, or summaries.
- Links in Markdown format [text](url) when referencing resources.
- Code blocks (triple backticks) for technical snippets or examples.
- Tables when comparing or organizing structured data.
Inline emphasis (*italic*, **bold**) for clarity and readability.

Your goal is to make answers structured, clear, and easy to read, leveraging Markdown to enhance understanding.`,
        },
        ...request.context.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: request.message,
        },
      ];

      // Make streaming API call to OpenAI
      const stream = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        stream: true,
      });

      let chunkIndex = 0;
      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          fullContent += content;

          // Send chunk to callback
          onChunk({
            content,
            isComplete: false,
            chunkIndex,
            timestamp: new Date(),
          });

          chunkIndex++;
        }
      }

      // Send final completion chunk
      onChunk({
        content: "",
        isComplete: true,
        chunkIndex,
        timestamp: new Date(),
      });
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
        `Chat service streaming error: ${
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
