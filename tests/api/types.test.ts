import {
  Position,
  NodeType,
  EdgeType,
  Node,
  Edge,
  Conversation,
  ConversationMetadata,
  EdgeMetadata,
  ApiResponse,
  ConversationDocument,
  NodeDocument,
  EdgeDocument,
  DatabaseError,
  ValidationError,
} from "@/types";

describe("Type Definitions", () => {
  describe("Position", () => {
    it("should have correct structure", () => {
      const position: Position = { x: 100, y: 200 };

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });
  });

  describe("NodeType", () => {
    it("should accept valid node types", () => {
      const inputType: NodeType = "input";
      const loadingType: NodeType = "loading";
      const completedType: NodeType = "completed";

      expect(inputType).toBe("input");
      expect(loadingType).toBe("loading");
      expect(completedType).toBe("completed");
    });
  });

  describe("EdgeType", () => {
    it("should accept valid edge types", () => {
      const autoType: EdgeType = "auto";
      const manualType: EdgeType = "manual";
      const markdownType: EdgeType = "markdown";

      expect(autoType).toBe("auto");
      expect(manualType).toBe("manual");
      expect(markdownType).toBe("markdown");
    });
  });

  describe("Node", () => {
    it("should have correct structure", () => {
      const node: Node = {
        id: "node-1",
        conversationId: "conv-1",
        type: "input",
        userMessage: "Hello",
        assistantResponse: "Hi there!",
        position: { x: 100, y: 200 },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        parentNodeId: "parent-1",
      };

      expect(node.id).toBe("node-1");
      expect(node.conversationId).toBe("conv-1");
      expect(node.type).toBe("input");
      expect(node.userMessage).toBe("Hello");
      expect(node.assistantResponse).toBe("Hi there!");
      expect(node.position).toEqual({ x: 100, y: 200 });
      expect(node.parentNodeId).toBe("parent-1");
    });

    it("should work without optional parentNodeId", () => {
      const node: Node = {
        id: "node-1",
        conversationId: "conv-1",
        type: "completed",
        userMessage: "Hello",
        assistantResponse: "Hi there!",
        position: { x: 100, y: 200 },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      expect(node.parentNodeId).toBeUndefined();
    });
  });

  describe("EdgeMetadata", () => {
    it("should have correct structure with all fields", () => {
      const metadata: EdgeMetadata = {
        markdownElementId: "element-1",
        contextSnippet: "Some context",
      };

      expect(metadata.markdownElementId).toBe("element-1");
      expect(metadata.contextSnippet).toBe("Some context");
    });

    it("should work with partial fields", () => {
      const metadata: EdgeMetadata = {
        markdownElementId: "element-1",
      };

      expect(metadata.markdownElementId).toBe("element-1");
      expect(metadata.contextSnippet).toBeUndefined();
    });
  });

  describe("Edge", () => {
    it("should have correct structure", () => {
      const edge: Edge = {
        id: "edge-1",
        conversationId: "conv-1",
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        type: "auto",
        createdAt: new Date("2024-01-01"),
        metadata: {
          markdownElementId: "element-1",
          contextSnippet: "Context",
        },
      };

      expect(edge.id).toBe("edge-1");
      expect(edge.conversationId).toBe("conv-1");
      expect(edge.sourceNodeId).toBe("node-1");
      expect(edge.targetNodeId).toBe("node-2");
      expect(edge.type).toBe("auto");
      expect(edge.metadata?.markdownElementId).toBe("element-1");
    });

    it("should work without optional metadata", () => {
      const edge: Edge = {
        id: "edge-1",
        conversationId: "conv-1",
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        type: "manual",
        createdAt: new Date("2024-01-01"),
      };

      expect(edge.metadata).toBeUndefined();
    });
  });

  describe("ConversationMetadata", () => {
    it("should have correct structure", () => {
      const metadata: ConversationMetadata = {
        nodeCount: 5,
        lastActiveNodeId: "node-3",
        tags: ["important", "draft"],
      };

      expect(metadata.nodeCount).toBe(5);
      expect(metadata.lastActiveNodeId).toBe("node-3");
      expect(metadata.tags).toEqual(["important", "draft"]);
    });

    it("should work with minimal fields", () => {
      const metadata: ConversationMetadata = {
        nodeCount: 0,
      };

      expect(metadata.nodeCount).toBe(0);
      expect(metadata.lastActiveNodeId).toBeUndefined();
      expect(metadata.tags).toBeUndefined();
    });
  });

  describe("Conversation", () => {
    it("should have correct structure", () => {
      const conversation: Conversation = {
        id: "conv-1",
        title: "Test Conversation",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        nodes: [],
        edges: [],
        metadata: {
          nodeCount: 0,
        },
      };

      expect(conversation.id).toBe("conv-1");
      expect(conversation.title).toBe("Test Conversation");
      expect(conversation.nodes).toEqual([]);
      expect(conversation.edges).toEqual([]);
      expect(conversation.metadata.nodeCount).toBe(0);
    });
  });

  describe("ApiResponse", () => {
    it("should have correct structure for success", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test data",
        message: "Success",
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe("test data");
      expect(response.message).toBe("Success");
      expect(response.error).toBeUndefined();
    });

    it("should have correct structure for error", () => {
      const response: ApiResponse = {
        success: false,
        error: "Something went wrong",
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe("Something went wrong");
      expect(response.data).toBeUndefined();
    });
  });

  describe("Database Document Types", () => {
    it("should have correct structure for ConversationDocument", () => {
      const doc: ConversationDocument = {
        _id: "507f1f77bcf86cd799439011",
        title: "Test",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0 },
      };

      expect(doc._id).toBe("507f1f77bcf86cd799439011");
      expect(doc.title).toBe("Test");
    });

    it("should have correct structure for NodeDocument", () => {
      const doc: NodeDocument = {
        _id: "507f1f77bcf86cd799439011",
        conversationId: "conv-1",
        type: "input",
        userMessage: "Hello",
        assistantResponse: "Hi",
        position: { x: 0, y: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(doc._id).toBe("507f1f77bcf86cd799439011");
      expect(doc.conversationId).toBe("conv-1");
    });

    it("should have correct structure for EdgeDocument", () => {
      const doc: EdgeDocument = {
        _id: "507f1f77bcf86cd799439011",
        conversationId: "conv-1",
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        type: "auto",
        createdAt: new Date(),
      };

      expect(doc._id).toBe("507f1f77bcf86cd799439011");
      expect(doc.sourceNodeId).toBe("node-1");
      expect(doc.targetNodeId).toBe("node-2");
    });
  });

  describe("Error Types", () => {
    it("should have correct structure for DatabaseError", () => {
      const error: DatabaseError = {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "email" },
      };

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Validation failed");
      expect(error.details).toEqual({ field: "email" });
    });

    it("should have correct structure for ValidationError", () => {
      const error: ValidationError = {
        field: "email",
        message: "Invalid email format",
        value: "invalid-email",
      };

      expect(error.field).toBe("email");
      expect(error.message).toBe("Invalid email format");
      expect(error.value).toBe("invalid-email");
    });
  });
});
