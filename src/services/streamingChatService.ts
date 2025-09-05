import OpenAI from "openai";
import {
  ChatRequest,
  StreamingResponse,
  StreamingConfig,
  ChatMessage,
  OpenAIConfig,
} from "../types";
import { configService } from "./configService";

class StreamingChatService {
  private openai: OpenAI;
  private config: OpenAIConfig;
  private streamingConfig: StreamingConfig;

  constructor() {
    this.config = configService.getOpenAIConfig();

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
    this.streamingConfig = {
      chunkSize: 1024,
      flushInterval: 100,
      maxRetries: 3,
      timeout: 30000,
      enableCompression: true,
    };
  }

  async *streamResponse(
    request: ChatRequest
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    try {
      // Prepare messages for OpenAI API
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "You are a helpful assistant. Always use markdown to format your responses.",
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

      // Create streaming completion
      const stream = await this.openai.chat.completions.create({
        model: configService.getOpenAIConfig().model,
        messages,
        stream: true,
      });

      let chunkIndex = 0;
      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;

        if (content) {
          fullContent += content;
          chunkIndex++;

          const streamingResponse: StreamingResponse = {
            type: "chunk",
            content: fullContent,
            nodeId: request.nodeId,
            conversationId: request.conversationId,
            timestamp: new Date(),
            isComplete: false,
            metadata: {
              chunkIndex,
              tokensUsed: chunk.usage?.total_tokens,
            },
          };

          yield streamingResponse;
        }
      }

      // Send completion response
      const completionResponse: StreamingResponse = {
        type: "complete",
        content: fullContent,
        nodeId: request.nodeId,
        conversationId: request.conversationId,
        timestamp: new Date(),
        isComplete: true,
        metadata: {
          chunkIndex,
          totalChunks: chunkIndex,
        },
      };

      yield completionResponse;
    } catch (error) {
      console.error("Streaming chat service error:", error);

      const errorResponse: StreamingResponse = {
        type: "error",
        content: "",
        nodeId: request.nodeId,
        conversationId: request.conversationId,
        timestamp: new Date(),
        isComplete: true,
        metadata: {
          chunkIndex: 0,
        },
      };

      yield errorResponse;
    }
  }

  processChunk(chunk: string): string {
    // Process and clean chunk content
    return chunk.trim();
  }

  handleStreamingError(error: Error): StreamingResponse {
    return {
      type: "error",
      content: error.message,
      nodeId: "",
      conversationId: "",
      timestamp: new Date(),
      isComplete: true,
    };
  }

  getStreamingConfig(): StreamingConfig {
    return this.streamingConfig;
  }

  updateStreamingConfig(config: Partial<StreamingConfig>): void {
    this.streamingConfig = { ...this.streamingConfig, ...config };
  }
}

export const streamingChatService = new StreamingChatService();
