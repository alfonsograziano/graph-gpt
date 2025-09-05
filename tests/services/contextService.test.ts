import {
  contextService,
  ContextMessage,
  ConversationPath,
} from "@/services/contextService";
import { Conversation, Node } from "@/types";

// Mock conversation data for testing
const createMockConversation = (): Conversation => ({
  id: "test-conversation",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [
    {
      id: "node-1",
      conversationId: "test-conversation",
      type: "completed",
      userMessage: "Hello, how are you?",
      assistantResponse: "I'm doing well, thank you!",
      position: { x: 100, y: 100 },
      createdAt: new Date("2024-01-01T10:00:00"),
      updatedAt: new Date("2024-01-01T10:01:00"),
    },
    {
      id: "node-2",
      conversationId: "test-conversation",
      type: "completed",
      userMessage: "What's the weather like?",
      assistantResponse: "I don't have access to real-time weather data.",
      position: { x: 200, y: 200 },
      createdAt: new Date("2024-01-01T10:02:00"),
      updatedAt: new Date("2024-01-01T10:03:00"),
      parentNodeId: "node-1",
    },
    {
      id: "node-3",
      conversationId: "test-conversation",
      type: "input",
      userMessage: "Tell me a joke",
      assistantResponse: "",
      position: { x: 300, y: 300 },
      createdAt: new Date("2024-01-01T10:04:00"),
      updatedAt: new Date("2024-01-01T10:04:00"),
      parentNodeId: "node-2",
    },
  ],
  edges: [],
  metadata: {
    nodeCount: 3,
    lastActiveNodeId: "node-3",
  },
});

describe("ContextService", () => {
  let mockConversation: Conversation;

  beforeEach(() => {
    mockConversation = createMockConversation();
  });

  describe("calculatePathToRoot", () => {
    it("should calculate path from leaf node to root", () => {
      const path = contextService.calculatePathToRoot(
        mockConversation,
        "node-3"
      );
      expect(path).toEqual(["node-1", "node-2", "node-3"]);
    });

    it("should return single node for root node", () => {
      const path = contextService.calculatePathToRoot(
        mockConversation,
        "node-1"
      );
      expect(path).toEqual(["node-1"]);
    });

    it("should handle non-existent node", () => {
      const path = contextService.calculatePathToRoot(
        mockConversation,
        "non-existent"
      );
      expect(path).toEqual(["non-existent"]); // Returns the node ID even if not found
    });

    it("should handle circular references", () => {
      // Create a conversation with circular reference
      const circularConversation = {
        ...mockConversation,
        nodes: [
          ...mockConversation.nodes,
          {
            id: "circular-node",
            conversationId: "test-conversation",
            type: "completed" as const,
            userMessage: "Circular test",
            assistantResponse: "Response",
            position: { x: 400, y: 400 },
            createdAt: new Date(),
            updatedAt: new Date(),
            parentNodeId: "node-3", // This creates a circular reference
          },
        ],
      };

      // Update node-3 to reference circular-node
      circularConversation.nodes[2].parentNodeId = "circular-node";

      const path = contextService.calculatePathToRoot(
        circularConversation,
        "circular-node"
      );
      // Should stop at circular reference
      expect(path).toContain("circular-node");
      expect(path.length).toBeLessThanOrEqual(4); // Should not be infinite
    });
  });

  describe("flattenConversationPath", () => {
    it("should flatten path into user/assistant message pairs", () => {
      const nodeIds = ["node-1", "node-2", "node-3"];
      const messages = contextService.flattenConversationPath(
        mockConversation,
        nodeIds
      );

      expect(messages).toHaveLength(5); // 2 completed nodes * 2 messages + 1 input node * 1 message
      expect(messages[0]).toEqual({
        role: "user",
        content: "Hello, how are you?",
        nodeId: "node-1",
        timestamp: expect.any(Date),
      });
      expect(messages[1]).toEqual({
        role: "assistant",
        content: "I'm doing well, thank you!",
        nodeId: "node-1",
        timestamp: expect.any(Date),
      });
    });

    it("should handle empty path", () => {
      const messages = contextService.flattenConversationPath(
        mockConversation,
        []
      );
      expect(messages).toEqual([]);
    });

    it("should skip nodes without messages", () => {
      const emptyNode: Node = {
        id: "empty-node",
        conversationId: "test-conversation",
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position: { x: 0, y: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conversationWithEmptyNode = {
        ...mockConversation,
        nodes: [...mockConversation.nodes, emptyNode],
      };

      const messages = contextService.flattenConversationPath(
        conversationWithEmptyNode,
        ["empty-node"]
      );
      expect(messages).toEqual([]);
    });
  });

  describe("calculateTokens", () => {
    it("should calculate approximate token count", () => {
      const text = "Hello world!";
      const tokens = contextService.calculateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThanOrEqual(text.length);
    });

    it("should handle empty string", () => {
      const tokens = contextService.calculateTokens("");
      expect(tokens).toBe(0);
    });

    it("should handle long text", () => {
      const longText = "a".repeat(1000);
      const tokens = contextService.calculateTokens(longText);
      expect(tokens).toBeGreaterThan(100);
    });
  });

  describe("calculateContextTokens", () => {
    it("should calculate total tokens for context messages", () => {
      const messages: ContextMessage[] = [
        {
          role: "user",
          content: "Hello",
          nodeId: "node-1",
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content: "Hi there!",
          nodeId: "node-1",
          timestamp: new Date(),
        },
      ];

      const totalTokens = contextService.calculateContextTokens(messages);
      expect(totalTokens).toBeGreaterThan(0);
    });
  });

  describe("truncateContext", () => {
    it("should not truncate when within limits", () => {
      const messages: ContextMessage[] = [
        {
          role: "user",
          content: "Short message",
          nodeId: "node-1",
          timestamp: new Date(),
        },
      ];

      const truncated = contextService.truncateContext(messages);
      expect(truncated).toEqual(messages);
    });

    it("should truncate when exceeding message limit", () => {
      // Create many messages
      const messages: ContextMessage[] = Array.from({ length: 25 }, (_, i) => ({
        role: "user" as const,
        content: `Message ${i}`,
        nodeId: `node-${i}`,
        timestamp: new Date(),
      }));

      const truncated = contextService.truncateContext(messages);
      expect(truncated.length).toBeLessThanOrEqual(20); // maxMessages is 20
    });

    it("should truncate when exceeding token limit", () => {
      // Create messages with very long content to exceed token limit
      const messages: ContextMessage[] = Array.from({ length: 10 }, (_, i) => ({
        role: "user" as const,
        content: "a".repeat(2000), // Very long content to exceed 4000 token limit
        nodeId: `node-${i}`,
        timestamp: new Date(),
      }));

      const truncated = contextService.truncateContext(messages);
      expect(truncated.length).toBeLessThan(messages.length);
    });
  });

  describe("getConversationContext", () => {
    it("should return complete conversation context", () => {
      const context = contextService.getConversationContext(
        mockConversation,
        "node-3"
      );

      expect(context).toHaveLength(5); // 2 completed nodes * 2 messages + 1 input node * 1 message
      expect(context[0]).toEqual({
        role: "user",
        content: "Hello, how are you?",
      });
      expect(context[1]).toEqual({
        role: "assistant",
        content: "I'm doing well, thank you!",
      });
    });

    it("should handle non-existent node", () => {
      const context = contextService.getConversationContext(
        mockConversation,
        "non-existent"
      );
      expect(context).toEqual([]);
    });

    it("should return context in chronological order", () => {
      const context = contextService.getConversationContext(
        mockConversation,
        "node-3"
      );

      // Should be in chronological order (oldest first)
      expect(context[0].content).toBe("Hello, how are you?");
      expect(context[2].content).toBe("What's the weather like?");
    });
  });

  describe("updateConfig", () => {
    it("should update configuration", () => {
      const newConfig = { maxTokens: 2000, maxMessages: 10 };
      contextService.updateConfig(newConfig);

      // We can't directly test the private config, but we can test behavior
      const longMessages: ContextMessage[] = Array.from(
        { length: 15 },
        (_, i) => ({
          role: "user" as const,
          content: "Test message",
          nodeId: `node-${i}`,
          timestamp: new Date(),
        })
      );

      const truncated = contextService.truncateContext(longMessages);
      expect(truncated.length).toBeLessThanOrEqual(10); // Should respect new maxMessages
    });
  });
});
