import { apiClient } from "@/services/apiClient";
import { ChatRequest, ChatResponse } from "@/types";

// Mock fetch
global.fetch = jest.fn();

describe("ApiClient", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe("sendChatRequest", () => {
    it("should send chat request successfully", async () => {
      const mockResponse: ChatResponse = {
        content: "Hello! How can I help you?",
        nodeId: "test-node",
        conversationId: "test-conversation",
        timestamp: new Date("2024-01-01T10:00:00"),
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: ChatRequest = {
        message: "Hello",
        context: [{ role: "user", content: "Previous message" }],
        nodeId: "test-node",
        conversationId: "test-conversation",
      };

      const result = await apiClient.sendChatRequest(request);

      expect(fetch).toHaveBeenCalledWith("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle API error responses", async () => {
      const errorResponse = {
        error: "Invalid request",
        code: "VALIDATION_ERROR",
        timestamp: "2024-01-01T10:00:00Z",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      const request: ChatRequest = {
        message: "",
        context: [],
        nodeId: "test-node",
        conversationId: "test-conversation",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Invalid request"
      );
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const request: ChatRequest = {
        message: "Hello",
        context: [],
        nodeId: "test-node",
        conversationId: "test-conversation",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle non-JSON error responses", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request: ChatRequest = {
        message: "Hello",
        context: [],
        nodeId: "test-node",
        conversationId: "test-conversation",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Chat API Error: 500"
      );
    });

    it("should handle unknown errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce("Unknown error");

      const request: ChatRequest = {
        message: "Hello",
        context: [],
        nodeId: "test-node",
        conversationId: "test-conversation",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Failed to send chat request"
      );
    });
  });

  describe("handleApiError", () => {
    it("should handle Error instances", () => {
      const error = new Error("Test error");
      const result = apiClient.handleApiError(error);
      expect(result).toBe("Test error");
    });

    it("should handle unknown error types", () => {
      const result = apiClient.handleApiError("Unknown error");
      expect(result).toBe("An unexpected error occurred");
    });

    it("should handle null/undefined errors", () => {
      const result = apiClient.handleApiError(null);
      expect(result).toBe("An unexpected error occurred");
    });
  });

  describe("request method", () => {
    it("should make successful API requests", async () => {
      const mockData = { success: true, data: { id: "test" } };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.request("/test");

      expect(fetch).toHaveBeenCalledWith("/api/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual({ id: "test" });
    });

    it("should handle API response errors", async () => {
      const errorResponse = {
        success: false,
        error: "API Error",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      });

      await expect(apiClient.request("/test")).rejects.toThrow("API Error");
    });

    it("should handle HTTP errors", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      });

      await expect(apiClient.request("/test")).rejects.toThrow("Not Found");
    });
  });
});
