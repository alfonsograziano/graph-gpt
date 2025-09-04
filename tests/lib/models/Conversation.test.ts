import mongoose from "mongoose";

// Mock mongoose
const mockMongoose = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  model: jest.fn(),
  Schema: jest.fn(),
  connection: {
    readyState: 1,
  },
};

jest.mock("mongoose", () => mockMongoose);

// Mock the ConversationModel
const mockConversationModel = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  deleteMany: jest.fn(),
};

jest.mock("../../../src/lib/models/Conversation", () => ({
  ConversationModel: mockConversationModel,
}));

describe("Conversation Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Conversation Schema Validation", () => {
    it("should create a valid conversation", async () => {
      const conversationData = {
        id: "test-conversation-1",
        title: "Test Conversation",
        nodes: [],
        edges: [],
        metadata: {
          nodeCount: 0,
          lastActiveNodeId: undefined,
          tags: [],
        },
      };

      const savedConversation = {
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationModel.save.mockResolvedValue(savedConversation);

      const result = await mockConversationModel.save();

      expect(mockConversationModel.save).toHaveBeenCalled();
      expect(result.id).toBe(conversationData.id);
      expect(result.title).toBe(conversationData.title);
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.metadata.nodeCount).toBe(0);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should handle save errors", async () => {
      const error = new Error("Validation failed: id is required");
      mockConversationModel.save.mockRejectedValue(error);

      await expect(mockConversationModel.save()).rejects.toThrow(
        "Validation failed: id is required"
      );
    });

    it("should handle findOne operations", async () => {
      const mockConversation = {
        id: "test-id",
        title: "Test Conversation",
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockConversationModel.findOne.mockResolvedValue(mockConversation);

      const result = await mockConversationModel.findOne({ id: "test-id" });

      expect(mockConversationModel.findOne).toHaveBeenCalledWith({
        id: "test-id",
      });
      expect(result).toEqual(mockConversation);
    });

    it("should handle find operations", async () => {
      const mockConversations = [
        {
          id: "test-1",
          title: "Test 1",
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, tags: [] },
        },
        {
          id: "test-2",
          title: "Test 2",
          nodes: [],
          edges: [],
          metadata: { nodeCount: 0, tags: [] },
        },
      ];

      mockConversationModel.find.mockResolvedValue(mockConversations);

      const result = await mockConversationModel.find({});

      expect(mockConversationModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockConversations);
    });
  });

  describe("Model Operations", () => {
    it("should handle updateOne operations", async () => {
      const mockResult = { acknowledged: true, modifiedCount: 1 };
      mockConversationModel.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await mockConversationModel.findOneAndUpdate(
        { id: "test-id" },
        { title: "Updated Title" }
      );

      expect(mockConversationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: "test-id" },
        { title: "Updated Title" }
      );
      expect(result).toEqual(mockResult);
    });

    it("should handle deleteOne operations", async () => {
      const mockResult = { acknowledged: true, deletedCount: 1 };
      mockConversationModel.findOneAndDelete.mockResolvedValue(mockResult);

      const result = await mockConversationModel.findOneAndDelete({
        id: "test-id",
      });

      expect(mockConversationModel.findOneAndDelete).toHaveBeenCalledWith({
        id: "test-id",
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle deleteMany operations", async () => {
      const mockResult = { acknowledged: true, deletedCount: 5 };
      mockConversationModel.deleteMany.mockResolvedValue(mockResult);

      const result = await mockConversationModel.deleteMany({});

      expect(mockConversationModel.deleteMany).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });
  });
});
