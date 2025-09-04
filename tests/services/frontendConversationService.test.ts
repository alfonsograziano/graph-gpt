import { FrontendConversationService } from "../../src/services/frontendConversationService";
import { apiClient } from "../../src/services/apiClient";
import { Conversation } from "../../src/types";

// Mock the API client
jest.mock("../../src/services/apiClient", () => ({
  apiClient: {
    request: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("FrontendConversationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConversations", () => {
    it("should fetch all conversations", async () => {
      const mockConversations: Conversation[] = [
        {
          id: "1",
          title: "Test Conversation 1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
          nodes: [],
          edges: [],
          metadata: { nodeCount: 5, tags: [] },
        },
      ];

      mockApiClient.request.mockResolvedValue(mockConversations);

      const result = await FrontendConversationService.getConversations();

      expect(mockApiClient.request).toHaveBeenCalledWith("/conversations");
      expect(result).toEqual(mockConversations);
    });

    it("should throw error when API call fails", async () => {
      const error = new Error("Network error");
      mockApiClient.request.mockRejectedValue(error);

      await expect(
        FrontendConversationService.getConversations()
      ).rejects.toThrow("Network error");
    });
  });

  describe("createConversation", () => {
    it("should create a new conversation", async () => {
      const mockConversation: Conversation = {
        id: "1",
        title: "New Conversation",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 0, tags: [] },
      };

      mockApiClient.request.mockResolvedValue(mockConversation);

      const result = await FrontendConversationService.createConversation(
        "New Conversation"
      );

      expect(mockApiClient.request).toHaveBeenCalledWith("/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "New Conversation" }),
      });
      expect(result).toEqual(mockConversation);
    });

    it("should throw error when creation fails", async () => {
      const error = new Error("Creation failed");
      mockApiClient.request.mockRejectedValue(error);

      await expect(
        FrontendConversationService.createConversation("Test")
      ).rejects.toThrow("Creation failed");
    });
  });

  describe("getConversation", () => {
    it("should fetch a specific conversation", async () => {
      const mockConversation: Conversation = {
        id: "1",
        title: "Test Conversation",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 5, tags: [] },
      };

      mockApiClient.request.mockResolvedValue(mockConversation);

      const result = await FrontendConversationService.getConversation("1");

      expect(mockApiClient.request).toHaveBeenCalledWith("/conversations/1");
      expect(result).toEqual(mockConversation);
    });
  });

  describe("updateConversation", () => {
    it("should update a conversation", async () => {
      const updateData = { title: "Updated Title" };
      const mockUpdatedConversation: Conversation = {
        id: "1",
        title: "Updated Title",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        nodes: [],
        edges: [],
        metadata: { nodeCount: 5, tags: [] },
      };

      mockApiClient.request.mockResolvedValue(mockUpdatedConversation);

      const result = await FrontendConversationService.updateConversation(
        "1",
        updateData
      );

      expect(mockApiClient.request).toHaveBeenCalledWith("/conversations/1", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockUpdatedConversation);
    });
  });

  describe("deleteConversation", () => {
    it("should delete a conversation", async () => {
      mockApiClient.request.mockResolvedValue(true);

      const result = await FrontendConversationService.deleteConversation("1");

      expect(mockApiClient.request).toHaveBeenCalledWith("/conversations/1", {
        method: "DELETE",
      });
      expect(result).toBe(true);
    });
  });
});
