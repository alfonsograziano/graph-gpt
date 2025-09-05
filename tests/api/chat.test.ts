// Mock dependencies first
jest.mock("../../src/services/chatService", () => ({
  chatService: {
    sendMessage: jest.fn(),
    validateApiKey: jest.fn(),
  },
}));

jest.mock("../../src/services/configService", () => ({
  configService: {
    validateEnvironment: jest.fn(),
  },
}));

// Mock NextRequest
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || "GET",
    json: jest.fn().mockResolvedValue(JSON.parse(init?.body || "{}")),
    headers: new Map(Object.entries(init?.headers || {})),
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

import { POST, GET } from "../../src/app/api/chat/route";
import { NextRequest } from "next/server";

describe("/api/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should handle valid chat request", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { chatService } = require("../../src/services/chatService");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");

      const mockResponse = {
        content: "Test response",
        nodeId: "node-1",
        conversationId: "conv-1",
        timestamp: new Date(),
      };

      chatService.sendMessage.mockResolvedValue(mockResponse);
      configService.validateEnvironment.mockImplementation(() => {});

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { NextRequest } = require("next/server");
      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          context: [{ role: "user", content: "Previous message" }],
          nodeId: "node-1",
          conversationId: "conv-1",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);
      expect(chatService.sendMessage).toHaveBeenCalledWith({
        message: "Test message",
        context: [{ role: "user", content: "Previous message" }],
        nodeId: "node-1",
        conversationId: "conv-1",
      });
    });

    it("should handle validation errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");
      configService.validateEnvironment.mockImplementation(() => {});

      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "", // Invalid: empty message
          context: [],
          nodeId: "node-1",
          conversationId: "conv-1",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
      expect(data.code).toBe("VALIDATION_ERROR");
    });

    it("should handle chat service errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { chatService } = require("../../src/services/chatService");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");

      chatService.sendMessage.mockRejectedValue(
        new Error("Chat service error")
      );
      configService.validateEnvironment.mockImplementation(() => {});

      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          context: [],
          nodeId: "node-1",
          conversationId: "conv-1",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Chat service error");
      expect(data.code).toBe("CHAT_SERVICE_ERROR");
    });

    it("should handle environment validation errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");
      configService.validateEnvironment.mockImplementation(() => {
        throw new Error("Environment validation failed");
      });

      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          context: [],
          nodeId: "node-1",
          conversationId: "conv-1",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Environment validation failed");
      expect(data.code).toBe("CHAT_SERVICE_ERROR");
    });
  });

  describe("GET", () => {
    it("should return healthy status when everything is working", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { chatService } = require("../../src/services/chatService");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");

      chatService.validateApiKey.mockResolvedValue(true);
      configService.validateEnvironment.mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("healthy");
      expect(data.openai).toBe("connected");
    });

    it("should return unhealthy status when OpenAI is disconnected", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { chatService } = require("../../src/services/chatService");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");

      chatService.validateApiKey.mockResolvedValue(false);
      configService.validateEnvironment.mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("healthy");
      expect(data.openai).toBe("disconnected");
    });

    it("should return unhealthy status when environment validation fails", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { configService } = require("../../src/services/configService");
      configService.validateEnvironment.mockImplementation(() => {
        throw new Error("Environment validation failed");
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe("unhealthy");
      expect(data.error).toBe("Environment validation failed");
    });
  });
});
