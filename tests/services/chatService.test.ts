import { chatService } from "../../src/services/chatService";
import { ChatRequest } from "../../src/types";

// Mock OpenAI
jest.mock("openai", () => {
  const mockCreate = jest.fn();
  const mockList = jest.fn();

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
      models: {
        list: mockList,
      },
    })),
    mockCreate,
    mockList,
  };
});

// Mock configService
jest.mock("../../src/services/configService", () => ({
  configService: {
    getOpenAIConfig: jest.fn(() => ({
      apiKey: "test-api-key",
      model: "gpt-4",
      maxTokens: 4000,
      temperature: 0.7,
      baseUrl: "https://api.openai.com/v1",
    })),
  },
}));

describe("ChatService", () => {
  let mockCreate: jest.Mock;
  let mockList: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const openaiModule = require("openai");
    mockCreate = openaiModule.mockCreate;
    mockList = openaiModule.mockList;
  });

  describe("sendMessage", () => {
    it("should send message and return response", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Test response from OpenAI",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        message: "Test message",
        context: [
          { role: "user", content: "Previous message" },
          { role: "assistant", content: "Previous response" },
        ],
        nodeId: "node-1",
        conversationId: "conv-1",
      };

      const response = await chatService.sendMessage(request);

      expect(response).toEqual({
        content: "Test response from OpenAI",
        nodeId: "node-1",
        conversationId: "conv-1",
        timestamp: expect.any(Date),
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [
          { role: "user", content: "Previous message" },
          { role: "assistant", content: "Previous response" },
          { role: "user", content: "Test message" },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });
    });

    it("should handle response without usage data", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Test response",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        message: "Test message",
        context: [],
        nodeId: "node-1",
        conversationId: "conv-1",
      };

      const response = await chatService.sendMessage(request);

      expect(response.usage).toBeUndefined();
    });

    it("should throw error when no response content", async () => {
      const mockResponse = {
        choices: [{}],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        message: "Test message",
        context: [],
        nodeId: "node-1",
        conversationId: "conv-1",
      };

      await expect(chatService.sendMessage(request)).rejects.toThrow(
        "No response received from OpenAI API"
      );
    });

    it("should handle OpenAI API errors", async () => {
      const apiError = new Error("API Error");
      apiError.name = "APIError";
      (apiError as { status: number }).status = 429;

      mockCreate.mockRejectedValue(apiError);

      const request: ChatRequest = {
        message: "Test message",
        context: [],
        nodeId: "node-1",
        conversationId: "conv-1",
      };

      await expect(chatService.sendMessage(request)).rejects.toThrow(
        "OpenAI API Error: API Error (429)"
      );
    });

    it("should handle generic errors", async () => {
      mockCreate.mockRejectedValue(new Error("Generic error"));

      const request: ChatRequest = {
        message: "Test message",
        context: [],
        nodeId: "node-1",
        conversationId: "conv-1",
      };

      await expect(chatService.sendMessage(request)).rejects.toThrow(
        "Chat service error: Generic error"
      );
    });
  });

  describe("validateApiKey", () => {
    it("should return true for valid API key", async () => {
      mockList.mockResolvedValue({ data: [] });

      const isValid = await chatService.validateApiKey();

      expect(isValid).toBe(true);
    });

    it("should return false for invalid API key", async () => {
      mockList.mockRejectedValue(new Error("Invalid API key"));

      const isValid = await chatService.validateApiKey();

      expect(isValid).toBe(false);
    });
  });
});
