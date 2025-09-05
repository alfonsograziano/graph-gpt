import { renderHook, act } from "@testing-library/react";
import { useConversation } from "@/hooks/useConversation";
import { FrontendConversationService } from "@/services/frontendConversationService";
import { Conversation, Node, Edge } from "@/types";

// Mock the service
jest.mock("@/services/frontendConversationService");
const mockFrontendConversationService =
  FrontendConversationService as jest.Mocked<
    typeof FrontendConversationService
  >;

// Mock test conversation
const mockConversation: Conversation = {
  id: "test-conversation-123",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [
    {
      id: "node-1",
      conversationId: "test-conversation-123",
      type: "input",
      userMessage: "Hello",
      assistantResponse: "",
      position: { x: 100, y: 100 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "node-2",
      conversationId: "test-conversation-123",
      type: "completed",
      userMessage: "How are you?",
      assistantResponse: "I'm doing well, thank you!",
      position: { x: 200, y: 200 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  edges: [
    {
      id: "edge-1",
      conversationId: "test-conversation-123",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      type: "auto",
      createdAt: new Date("2024-01-01"),
    },
  ],
  metadata: {
    nodeCount: 2,
    lastActiveNodeId: "node-2",
  },
};

describe("useConversation - deleteNode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrontendConversationService.getConversation.mockResolvedValue(
      mockConversation
    );
    mockFrontendConversationService.updateConversation.mockImplementation(
      async (id, updates) => ({ ...mockConversation, ...updates })
    );
  });

  it("deletes a node and removes connected edges", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.conversation).toEqual(mockConversation);

    // Delete node-1
    await act(async () => {
      await result.current.deleteNode("node-1");
    });

    // Verify the node was removed
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: "node-2" }),
        ]),
        edges: [], // Edge should be removed since it connected to deleted node
        metadata: expect.objectContaining({
          nodeCount: 1,
          lastActiveNodeId: "node-2", // Should remain unchanged
        }),
      })
    );
  });

  it("deletes a node and keeps unrelated edges", async () => {
    const conversationWithMultipleEdges: Conversation = {
      ...mockConversation,
      nodes: [
        ...mockConversation.nodes,
        {
          id: "node-3",
          conversationId: "test-conversation-123",
          type: "completed",
          userMessage: "Another question",
          assistantResponse: "Another response",
          position: { x: 300, y: 300 },
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],
      edges: [
        ...mockConversation.edges,
        {
          id: "edge-2",
          conversationId: "test-conversation-123",
          sourceNodeId: "node-2",
          targetNodeId: "node-3",
          type: "auto",
          createdAt: new Date("2024-01-01"),
        },
      ],
      metadata: {
        nodeCount: 3,
        lastActiveNodeId: "node-3",
      },
    };

    mockFrontendConversationService.getConversation.mockResolvedValue(
      conversationWithMultipleEdges
    );

    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Delete node-1 (which has edge to node-2)
    await act(async () => {
      await result.current.deleteNode("node-1");
    });

    // Verify only the edge connected to deleted node was removed
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: "node-2" }),
          expect.objectContaining({ id: "node-3" }),
        ]),
        edges: [
          expect.objectContaining({ id: "edge-2" }), // This edge should remain
        ],
        metadata: expect.objectContaining({
          nodeCount: 2,
        }),
      })
    );
  });

  it("clears lastActiveNodeId when deleting the active node", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Delete node-2 (which is the last active node)
    await act(async () => {
      await result.current.deleteNode("node-2");
    });

    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        metadata: expect.objectContaining({
          lastActiveNodeId: undefined,
        }),
      })
    );
  });

  it("handles deletion of non-existent node", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Try to delete non-existent node
    await act(async () => {
      await expect(
        result.current.deleteNode("non-existent-node")
      ).rejects.toThrow("Node not found");
    });
  });

  it("handles deletion when conversation is null", async () => {
    mockFrontendConversationService.getConversation.mockResolvedValue(
      null as any
    );

    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Try to delete node when conversation is null
    await act(async () => {
      await result.current.deleteNode("node-1");
    });

    // Should not call updateConversation
    expect(
      mockFrontendConversationService.updateConversation
    ).not.toHaveBeenCalled();
  });

  it("handles deletion errors gracefully", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Mock updateConversation to throw error
    mockFrontendConversationService.updateConversation.mockRejectedValue(
      new Error("Update failed")
    );

    // Try to delete node
    await act(async () => {
      await expect(result.current.deleteNode("node-1")).rejects.toThrow(
        "Update failed"
      );
    });

    // Verify error state is set
    expect(result.current.error).toBe("Update failed");
  });

  it("updates node count correctly after deletion", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Delete a node
    await act(async () => {
      await result.current.deleteNode("node-1");
    });

    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        metadata: expect.objectContaining({
          nodeCount: 1, // Should be reduced from 2 to 1
        }),
      })
    );
  });
});

describe("useConversation - updateNodePosition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrontendConversationService.getConversation.mockResolvedValue(
      mockConversation
    );
    mockFrontendConversationService.updateConversation.mockImplementation(
      async (id, updates) => ({ ...mockConversation, ...updates })
    );
  });

  it("updates node position successfully", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.conversation).toEqual(mockConversation);

    // Update node position
    const newPosition = { x: 300, y: 400 };
    await act(async () => {
      await result.current.updateNodePosition("node-1", newPosition);
    });

    // Verify the position was updated
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "node-1",
            position: newPosition,
            updatedAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: "node-2",
            position: { x: 200, y: 200 }, // Should remain unchanged
          }),
        ]),
      })
    );
  });

  it("handles update of non-existent node", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Try to update non-existent node
    await act(async () => {
      await expect(
        result.current.updateNodePosition("non-existent-node", {
          x: 100,
          y: 100,
        })
      ).rejects.toThrow("Node not found");
    });
  });

  it("handles update when conversation is null", async () => {
    mockFrontendConversationService.getConversation.mockResolvedValue(
      null as any
    );

    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Try to update node position when conversation is null
    await act(async () => {
      await result.current.updateNodePosition("node-1", { x: 100, y: 100 });
    });

    // Should not call updateConversation
    expect(
      mockFrontendConversationService.updateConversation
    ).not.toHaveBeenCalled();
  });

  it("handles update errors gracefully", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Mock updateConversation to throw error
    mockFrontendConversationService.updateConversation.mockRejectedValue(
      new Error("Update failed")
    );

    // Try to update node position
    await act(async () => {
      await expect(
        result.current.updateNodePosition("node-1", { x: 100, y: 100 })
      ).rejects.toThrow("Update failed");
    });

    // Verify error state is set
    expect(result.current.error).toBe("Update failed");
  });

  it("updates multiple nodes independently", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Update first node position
    const position1 = { x: 150, y: 150 };
    await act(async () => {
      await result.current.updateNodePosition("node-1", position1);
    });

    // Update second node position
    const position2 = { x: 250, y: 250 };
    await act(async () => {
      await result.current.updateNodePosition("node-2", position2);
    });

    // Verify both updates were called
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledTimes(2);

    // Verify first update
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenNthCalledWith(
      1,
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "node-1",
            position: position1,
          }),
        ]),
      })
    );

    // Verify second update
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenNthCalledWith(
      2,
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "node-2",
            position: position2,
          }),
        ]),
      })
    );
  });

  it("preserves other node properties when updating position", async () => {
    const { result } = renderHook(() =>
      useConversation("test-conversation-123")
    );

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Update node position
    const newPosition = { x: 500, y: 600 };
    await act(async () => {
      await result.current.updateNodePosition("node-1", newPosition);
    });

    // Verify other properties are preserved
    expect(
      mockFrontendConversationService.updateConversation
    ).toHaveBeenCalledWith(
      "test-conversation-123",
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "node-1",
            conversationId: "test-conversation-123",
            type: "input",
            userMessage: "Hello",
            assistantResponse: "",
            position: newPosition,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
      })
    );
  });
});
