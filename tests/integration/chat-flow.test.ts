import { contextService } from "@/services/contextService";
import { apiClient } from "@/services/apiClient";
import { Conversation, Node } from "@/types";

// Mock fetch for integration tests
global.fetch = jest.fn();

describe("Chat Flow Integration", () => {
  const mockConversation: Conversation = {
    id: "integration-test",
    title: "Integration Test",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    nodes: [
      {
        id: "root-node",
        conversationId: "integration-test",
        type: "completed",
        userMessage: "Hello, how are you?",
        assistantResponse: "I'm doing well, thank you!",
        position: { x: 100, y: 100 },
        createdAt: new Date("2024-01-01T10:00:00"),
        updatedAt: new Date("2024-01-01T10:01:00"),
      },
      {
        id: "child-node",
        conversationId: "integration-test",
        type: "completed",
        userMessage: "What's the weather like?",
        assistantResponse: "I don't have access to real-time weather data.",
        position: { x: 200, y: 200 },
        createdAt: new Date("2024-01-01T10:02:00"),
        updatedAt: new Date("2024-01-01T10:03:00"),
        parentNodeId: "root-node",
      },
      {
        id: "current-node",
        conversationId: "integration-test",
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position: { x: 300, y: 300 },
        createdAt: new Date("2024-01-01T10:04:00"),
        updatedAt: new Date("2024-01-01T10:04:00"),
        parentNodeId: "child-node",
      },
    ],
    edges: [],
    metadata: {
      nodeCount: 3,
      lastActiveNodeId: "current-node",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Context Flattening Integration", () => {
    it("should correctly flatten conversation path for API call", () => {
      const context = contextService.getConversationContext(
        mockConversation,
        "current-node"
      );

      expect(context).toHaveLength(4); // 2 completed nodes * 2 messages each
      expect(context[0]).toEqual({
        role: "user",
        content: "Hello, how are you?",
      });
      expect(context[1]).toEqual({
        role: "assistant",
        content: "I'm doing well, thank you!",
      });
      expect(context[2]).toEqual({
        role: "user",
        content: "What's the weather like?",
      });
      expect(context[3]).toEqual({
        role: "assistant",
        content: "I don't have access to real-time weather data.",
      });
    });

    it("should handle context truncation when exceeding limits", () => {
      // Create a conversation with many nodes
      const manyNodes: Node[] = Array.from({ length: 15 }, (_, i) => ({
        id: `node-${i}`,
        conversationId: "integration-test",
        type: "completed" as const,
        userMessage: `User message ${i}`,
        assistantResponse: `Assistant response ${i}`,
        position: { x: i * 100, y: i * 100 },
        createdAt: new Date(
          `2024-01-01T10:${i.toString().padStart(2, "0")}:00`
        ),
        updatedAt: new Date(
          `2024-01-01T10:${i.toString().padStart(2, "0")}:30`
        ),
        parentNodeId: i > 0 ? `node-${i - 1}` : undefined,
      }));

      const largeConversation = {
        ...mockConversation,
        nodes: manyNodes,
      };

      const context = contextService.getConversationContext(
        largeConversation,
        "node-14"
      );

      // Should be truncated to maxMessages (20) or less
      expect(context.length).toBeLessThanOrEqual(20);
    });
  });

  describe("API Client Integration", () => {
    it("should send properly formatted chat request", async () => {
      const mockResponse = {
        content: "This is a test response",
        nodeId: "current-node",
        conversationId: "integration-test",
        timestamp: new Date(),
        usage: {
          promptTokens: 20,
          completionTokens: 10,
          totalTokens: 30,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const context = contextService.getConversationContext(
        mockConversation,
        "current-node"
      );

      const request = {
        message: "Tell me a joke",
        context,
        nodeId: "current-node",
        conversationId: "integration-test",
      };

      const response = await apiClient.sendChatRequest(request);

      expect(fetch).toHaveBeenCalledWith("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      expect(response).toEqual(mockResponse);
    });

    it("should handle API errors with proper error messages", async () => {
      const errorResponse = {
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_ERROR",
        timestamp: "2024-01-01T10:00:00Z",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => errorResponse,
      });

      const request = {
        message: "Tell me a joke",
        context: [],
        nodeId: "current-node",
        conversationId: "integration-test",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Rate limit exceeded"
      );
    });
  });

  describe("End-to-End Chat Flow", () => {
    it("should complete full chat flow from message submission to response", async () => {
      const mockResponse = {
        content:
          "Here's a joke: Why don't scientists trust atoms? Because they make up everything!",
        nodeId: "current-node",
        conversationId: "integration-test",
        timestamp: new Date(),
        usage: {
          promptTokens: 25,
          completionTokens: 15,
          totalTokens: 40,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Step 1: Get conversation context
      const context = contextService.getConversationContext(
        mockConversation,
        "current-node"
      );
      expect(context.length).toBeGreaterThan(0);

      // Step 2: Create chat request
      const request = {
        message: "Tell me a joke",
        context,
        nodeId: "current-node",
        conversationId: "integration-test",
      };

      // Step 3: Send request to API
      const response = await apiClient.sendChatRequest(request);

      // Step 4: Verify response
      expect(response.content).toBe(mockResponse.content);
      expect(response.nodeId).toBe("current-node");
      expect(response.conversationId).toBe("integration-test");
      expect(response.usage).toBeDefined();
    });

    it("should handle network failures gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const request = {
        message: "Tell me a joke",
        context: [],
        nodeId: "current-node",
        conversationId: "integration-test",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed API responses", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request = {
        message: "Tell me a joke",
        context: [],
        nodeId: "current-node",
        conversationId: "integration-test",
      };

      await expect(apiClient.sendChatRequest(request)).rejects.toThrow(
        "Invalid JSON"
      );
    });
  });

  describe("Context Management Edge Cases", () => {
    it("should handle orphaned nodes", () => {
      const orphanedNode: Node = {
        id: "orphaned-node",
        conversationId: "integration-test",
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position: { x: 400, y: 400 },
        createdAt: new Date(),
        updatedAt: new Date(),
        // No parentNodeId - orphaned
      };

      const conversationWithOrphan = {
        ...mockConversation,
        nodes: [...mockConversation.nodes, orphanedNode],
      };

      const context = contextService.getConversationContext(
        conversationWithOrphan,
        "orphaned-node"
      );
      expect(context).toEqual([]);
    });

    it("should handle circular references", () => {
      const circularNode: Node = {
        id: "circular-node",
        conversationId: "integration-test",
        type: "completed",
        userMessage: "Circular test",
        assistantResponse: "Response",
        position: { x: 500, y: 500 },
        createdAt: new Date(),
        updatedAt: new Date(),
        parentNodeId: "current-node",
      };

      const conversationWithCircular = {
        ...mockConversation,
        nodes: [...mockConversation.nodes, circularNode],
      };

      // Update current-node to reference circular-node
      conversationWithCircular.nodes[2].parentNodeId = "circular-node";

      const context = contextService.getConversationContext(
        conversationWithCircular,
        "circular-node"
      );

      // Should not be infinite
      expect(context.length).toBeLessThan(10);
    });

    it("should handle empty conversation", () => {
      const emptyConversation: Conversation = {
        id: "empty-conversation",
        title: "Empty",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0 },
      };

      const context = contextService.getConversationContext(
        emptyConversation,
        "non-existent"
      );
      expect(context).toEqual([]);
    });
  });
});
