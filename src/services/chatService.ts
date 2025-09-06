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

  /**
   * Build the user message with optional context snippet
   */
  private buildUserMessage(
    message: string,
    referenceContextSnippet?: string
  ): string {
    if (referenceContextSnippet) {
      return `The current user request is related to this context: ${referenceContextSnippet} - user request: ${message}`;
    }
    return message;
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
          content: this.buildUserMessage(
            request.message,
            request.referenceContextSnippet
          ),
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
          content: this.buildUserMessage(
            request.message,
            request.referenceContextSnippet
          ),
        },
      ];

      // Make streaming API call to OpenAI
      const stream = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        stream: true,
      });

      let chunkIndex = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          // Send chunk to callback
          try {
            onChunk({
              content,
              isComplete: false,
              chunkIndex,
              timestamp: new Date(),
            });
            chunkIndex++;
          } catch (error) {
            // If callback fails (e.g., controller closed), stop processing
            console.log("Streaming callback failed, stopping:", error);
            break;
          }
        }
      }

      // Send final completion chunk
      try {
        onChunk({
          content: "",
          isComplete: true,
          chunkIndex,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to send final chunk:", error);
      }
    } catch (error) {
      console.error("Streaming error in chatService:", error);

      // Send error as a chunk instead of throwing
      const errorMessage =
        error instanceof Error ? error.message : "Unknown streaming error";
      try {
        onChunk({
          content: `Error: ${errorMessage}`,
          isComplete: true,
          chunkIndex: 0,
          timestamp: new Date(),
        });
      } catch (callbackError) {
        console.log("Failed to send error chunk:", callbackError);
      }
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
