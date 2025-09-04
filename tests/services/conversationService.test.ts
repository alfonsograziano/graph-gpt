import mongoose from "mongoose";
import { ConversationService } from "../../src/services/conversationService";
import { ConversationRepository } from "../../src/services/repositories/ConversationRepository";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../../src/lib/database";

// Mock the database connection
jest.mock("../../src/lib/database", () => ({
  connectToDatabase: jest.fn(),
  disconnectFromDatabase: jest.fn(),
}));

// Mock the ConversationRepository
jest.mock("../../src/services/repositories/ConversationRepository");

describe("ConversationService", () => {
  let conversationService: ConversationService;
  let mockRepository: jest.Mocked<ConversationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    conversationService = new ConversationService();
    mockRepository =
      new ConversationRepository() as jest.Mocked<ConversationRepository>;
    (conversationService as any).repository = mockRepository;
  });

  describe("createConversation", () => {
    it("should create a conversation with valid title", async () => {
      const mockConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.create.mockResolvedValue(mockConversation);

      const result = await conversationService.createConversation(
        "Test Conversation"
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Conversation",
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, lastActiveNodeId: undefined, tags: [] },
        })
      );
      expect(result).toEqual(mockConversation);
    });

    it("should throw error for empty title", async () => {
      await expect(conversationService.createConversation("")).rejects.toThrow(
        "Title is required and cannot be empty"
      );
      await expect(
        conversationService.createConversation("   ")
      ).rejects.toThrow("Title is required and cannot be empty");
    });

    it("should trim whitespace from title", async () => {
      const mockConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.create.mockResolvedValue(mockConversation);

      await conversationService.createConversation("  Test Conversation  ");

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Conversation",
        })
      );
    });
  });

  describe("getConversation", () => {
    it("should return conversation for valid id", async () => {
      const mockConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.findById.mockResolvedValue(mockConversation);

      const result = await conversationService.getConversation("test-id");

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(result).toEqual(mockConversation);
    });

    it("should throw error for empty id", async () => {
      await expect(conversationService.getConversation("")).rejects.toThrow(
        "Conversation ID is required"
      );
    });
  });

  describe("getAllConversations", () => {
    it("should return all conversations", async () => {
      const mockConversations = [
        {
          id: "test-id-1",
          title: "Test Conversation 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, tags: [] },
        },
        {
          id: "test-id-2",
          title: "Test Conversation 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, tags: [] },
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockConversations);

      const result = await conversationService.getAllConversations();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockConversations);
    });
  });

  describe("updateConversation", () => {
    it("should update conversation with valid data", async () => {
      const mockUpdatedConversation = {
        id: "test-id",
        title: "Updated Title",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.update.mockResolvedValue(mockUpdatedConversation);

      const result = await conversationService.updateConversation("test-id", {
        title: "Updated Title",
      });

      expect(mockRepository.update).toHaveBeenCalledWith("test-id", {
        title: "Updated Title",
      });
      expect(result).toEqual(mockUpdatedConversation);
    });

    it("should throw error for empty id", async () => {
      await expect(
        conversationService.updateConversation("", { title: "New Title" })
      ).rejects.toThrow("Conversation ID is required");
    });
  });

  describe("deleteConversation", () => {
    it("should delete conversation with valid id", async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await conversationService.deleteConversation("test-id");

      expect(mockRepository.delete).toHaveBeenCalledWith("test-id");
      expect(result).toBe(true);
    });

    it("should throw error for empty id", async () => {
      await expect(conversationService.deleteConversation("")).rejects.toThrow(
        "Conversation ID is required"
      );
    });
  });

  describe("addNode", () => {
    it("should add node to conversation", async () => {
      const mockUpdatedConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [
          {
            id: "node-id",
            conversationId: "test-id",
            type: "input" as const,
            userMessage: "Hello",
            assistantResponse: "",
            position: { x: 100, y: 200 },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        edges: [],
        metadata: { nodeCount: 1, tags: [] },
      };

      mockRepository.addNode.mockResolvedValue(mockUpdatedConversation);

      const nodeData = {
        type: "input" as const,
        userMessage: "Hello",
        assistantResponse: "",
        position: { x: 100, y: 200 },
      };

      const result = await conversationService.addNode("test-id", nodeData);

      expect(mockRepository.addNode).toHaveBeenCalledWith(
        "test-id",
        expect.objectContaining({
          ...nodeData,
          id: expect.any(String),
          conversationId: "test-id",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(mockUpdatedConversation);
    });

    it("should throw error for empty conversation id", async () => {
      await expect(
        conversationService.addNode("", {
          type: "input",
          userMessage: "Hello",
          assistantResponse: "",
          position: { x: 100, y: 200 },
        })
      ).rejects.toThrow("Conversation ID is required");
    });
  });

  describe("addEdge", () => {
    it("should add edge to conversation", async () => {
      const mockUpdatedConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [
          {
            id: "edge-id",
            conversationId: "test-id",
            sourceNodeId: "node-1",
            targetNodeId: "node-2",
            type: "auto" as const,
            createdAt: new Date(),
          },
        ],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.addEdge.mockResolvedValue(mockUpdatedConversation);

      const edgeData = {
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        type: "auto" as const,
      };

      const result = await conversationService.addEdge("test-id", edgeData);

      expect(mockRepository.addEdge).toHaveBeenCalledWith(
        "test-id",
        expect.objectContaining({
          ...edgeData,
          id: expect.any(String),
          conversationId: "test-id",
          createdAt: expect.any(Date),
        })
      );
      expect(result).toEqual(mockUpdatedConversation);
    });

    it("should throw error for empty conversation id", async () => {
      await expect(
        conversationService.addEdge("", {
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          type: "auto",
        })
      ).rejects.toThrow("Conversation ID is required");
    });
  });

  describe("updateNode", () => {
    it("should update node in conversation", async () => {
      const mockUpdatedConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [
          {
            id: "node-id",
            conversationId: "test-id",
            type: "completed" as const,
            userMessage: "Updated message",
            assistantResponse: "Response",
            position: { x: 100, y: 200 },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        edges: [],
        metadata: { nodeCount: 1, tags: [] },
      };

      mockRepository.updateNode.mockResolvedValue(mockUpdatedConversation);

      const nodeData = {
        type: "completed" as const,
        userMessage: "Updated message",
        assistantResponse: "Response",
      };

      const result = await conversationService.updateNode(
        "test-id",
        "node-id",
        nodeData
      );

      expect(mockRepository.updateNode).toHaveBeenCalledWith(
        "test-id",
        "node-id",
        nodeData
      );
      expect(result).toEqual(mockUpdatedConversation);
    });

    it("should throw error for empty conversation id", async () => {
      await expect(
        conversationService.updateNode("", "node-id", {
          userMessage: "Updated",
        })
      ).rejects.toThrow("Conversation ID is required");
    });

    it("should throw error for empty node id", async () => {
      await expect(
        conversationService.updateNode("test-id", "", {
          userMessage: "Updated",
        })
      ).rejects.toThrow("Node ID is required");
    });
  });

  describe("deleteNode", () => {
    it("should delete node from conversation", async () => {
      const mockUpdatedConversation = {
        id: "test-id",
        title: "Test Conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockRepository.deleteNode.mockResolvedValue(mockUpdatedConversation);

      const result = await conversationService.deleteNode("test-id", "node-id");

      expect(mockRepository.deleteNode).toHaveBeenCalledWith(
        "test-id",
        "node-id"
      );
      expect(result).toEqual(mockUpdatedConversation);
    });

    it("should throw error for empty conversation id", async () => {
      await expect(
        conversationService.deleteNode("", "node-id")
      ).rejects.toThrow("Conversation ID is required");
    });

    it("should throw error for empty node id", async () => {
      await expect(
        conversationService.deleteNode("test-id", "")
      ).rejects.toThrow("Node ID is required");
    });
  });
});
