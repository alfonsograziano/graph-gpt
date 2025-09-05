import { renderHook, waitFor, act } from "@testing-library/react";
import { useConversation } from "@/hooks/useConversation";
import { FrontendConversationService } from "@/services/frontendConversationService";
import { Conversation, Node, Edge } from "@/types";

// Mock the frontend conversation service
jest.mock("@/services/frontendConversationService", () => ({
  FrontendConversationService: {
    getConversation: jest.fn(),
    updateConversation: jest.fn(),
  },
}));

const mockNode: Node = {
  id: "node-1",
  conversationId: "conv-1",
  type: "completed",
  userMessage: "Test message",
  assistantResponse: "Test response",
  position: { x: 100, y: 200 },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [mockNode],
  edges: [],
  metadata: {
    nodeCount: 1,
    lastActiveNodeId: "node-1",
  },
};

describe("useConversation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads conversation on mount", async () => {
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversation("conv-1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(mockConversation);
    expect(result.current.error).toBe(null);
    expect(FrontendConversationService.getConversation).toHaveBeenCalledWith(
      "conv-1"
    );
  });

  it("handles loading error", async () => {
    const errorMessage = "Failed to load conversation";
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useConversation("conv-1"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it("handles non-Error rejection", async () => {
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockRejectedValue("String error");

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe("Failed to load conversation");
  });

  it("refetches conversation when refetch is called", async () => {
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(FrontendConversationService.getConversation).toHaveBeenCalledTimes(
      2
    );
  });

  it("updates conversation successfully", async () => {
    const updatedConversation = { ...mockConversation, title: "Updated Title" };
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(mockConversation);
    (
      FrontendConversationService.updateConversation as jest.Mock
    ).mockResolvedValue(updatedConversation);

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateConversation({ title: "Updated Title" });
    });

    expect(FrontendConversationService.updateConversation).toHaveBeenCalledWith(
      "conv-1",
      { title: "Updated Title" }
    );
    expect(result.current.conversation).toEqual(updatedConversation);
  });

  it("handles update error", async () => {
    const errorMessage = "Failed to update conversation";
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(mockConversation);
    (
      FrontendConversationService.updateConversation as jest.Mock
    ).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.updateConversation({ title: "Updated Title" })
      ).rejects.toThrow(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it("handles update error with non-Error rejection", async () => {
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(mockConversation);
    (
      FrontendConversationService.updateConversation as jest.Mock
    ).mockRejectedValue("String error");

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.updateConversation({ title: "Updated Title" })
      ).rejects.toThrow("String error");
    });

    expect(result.current.error).toBe("Failed to update conversation");
  });

  it("does not update if conversation is null", async () => {
    (
      FrontendConversationService.getConversation as jest.Mock
    ).mockResolvedValue(null);

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateConversation({ title: "Updated Title" });
    });

    expect(
      FrontendConversationService.updateConversation
    ).not.toHaveBeenCalled();
  });

  it("does not fetch if id is empty", async () => {
    const { result } = renderHook(() => useConversation(""));

    expect(result.current.isLoading).toBe(true);
    expect(FrontendConversationService.getConversation).not.toHaveBeenCalled();
  });

  describe("createBranch", () => {
    it("creates a new branch successfully", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );
      (conversationService.updateConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newNode: Node | null = null;
      await act(async () => {
        newNode = await result.current.createBranch("node-1");
      });

      expect(newNode).toBeTruthy();
      expect(newNode?.type).toBe("input");
      expect(newNode?.parentNodeId).toBe("node-1");
      expect(newNode?.position.x).toBe(100); // Same x as parent
      expect(newNode?.position.y).toBe(320); // Parent y + NODE_SPACING (120)
      expect(conversationService.updateConversation).toHaveBeenCalled();
    });

    it("returns null if conversation is null", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        null
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newNode: Node | null = null;
      await act(async () => {
        newNode = await result.current.createBranch("node-1");
      });

      expect(newNode).toBeNull();
    });

    it("throws error if parent node not found", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createBranch("non-existent-node")
        ).rejects.toThrow("Parent node not found");
      });
    });
  });

  describe("addNode", () => {
    it("adds a new node successfully", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );
      (conversationService.updateConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newNode: Node | null = null;
      await act(async () => {
        newNode = await result.current.addNode({
          type: "input",
          position: { x: 200, y: 300 },
          userMessage: "Test message",
        });
      });

      expect(newNode).toBeTruthy();
      expect(newNode?.type).toBe("input");
      expect(newNode?.userMessage).toBe("Test message");
      expect(conversationService.updateConversation).toHaveBeenCalled();
    });

    it("returns null if conversation is null", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        null
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newNode: Node | null = null;
      await act(async () => {
        newNode = await result.current.addNode({
          type: "input",
          position: { x: 200, y: 300 },
        });
      });

      expect(newNode).toBeNull();
    });
  });

  describe("addEdge", () => {
    it("adds a new edge successfully", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );
      (conversationService.updateConversation as jest.Mock).mockResolvedValue(
        mockConversation
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newEdge: Edge | null = null;
      await act(async () => {
        newEdge = await result.current.addEdge({
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          type: "auto",
        });
      });

      expect(newEdge).toBeTruthy();
      expect(newEdge?.sourceNodeId).toBe("node-1");
      expect(newEdge?.targetNodeId).toBe("node-2");
      expect(newEdge?.type).toBe("auto");
      expect(conversationService.updateConversation).toHaveBeenCalled();
    });

    it("returns null if conversation is null", async () => {
      (conversationService.getConversation as jest.Mock).mockResolvedValue(
        null
      );

      const { result } = renderHook(() => useConversation("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newEdge: Edge | null = null;
      await act(async () => {
        newEdge = await result.current.addEdge({
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          type: "auto",
        });
      });

      expect(newEdge).toBeNull();
    });
  });
});
