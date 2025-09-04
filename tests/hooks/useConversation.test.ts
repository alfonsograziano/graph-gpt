import { renderHook, waitFor, act } from "@testing-library/react";
import { useConversation } from "@/hooks/useConversation";
import { conversationService } from "@/services/conversationService";
import { Conversation } from "@/types";

// Mock the conversation service
jest.mock("@/services/conversationService", () => ({
  conversationService: {
    getConversation: jest.fn(),
    updateConversation: jest.fn(),
  },
}));

const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [],
  edges: [],
  metadata: {},
};

describe("useConversation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads conversation on mount", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );

    const { result } = renderHook(() => useConversation("conv-1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(mockConversation);
    expect(result.current.error).toBe(null);
    expect(conversationService.getConversation).toHaveBeenCalledWith("conv-1");
  });

  it("handles loading error", async () => {
    const errorMessage = "Failed to load conversation";
    (conversationService.getConversation as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useConversation("conv-1"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it("handles non-Error rejection", async () => {
    (conversationService.getConversation as jest.Mock).mockRejectedValue(
      "String error"
    );

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toBe(null);
    expect(result.current.error).toBe("Failed to load conversation");
  });

  it("refetches conversation when refetch is called", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(conversationService.getConversation).toHaveBeenCalledTimes(2);
  });

  it("updates conversation successfully", async () => {
    const updatedConversation = { ...mockConversation, title: "Updated Title" };
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );
    (conversationService.updateConversation as jest.Mock).mockResolvedValue(
      updatedConversation
    );

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateConversation({ title: "Updated Title" });
    });

    expect(conversationService.updateConversation).toHaveBeenCalledWith(
      "conv-1",
      { title: "Updated Title" }
    );
    expect(result.current.conversation).toEqual(updatedConversation);
  });

  it("handles update error", async () => {
    const errorMessage = "Failed to update conversation";
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );
    (conversationService.updateConversation as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

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
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );
    (conversationService.updateConversation as jest.Mock).mockRejectedValue(
      "String error"
    );

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
    (conversationService.getConversation as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useConversation("conv-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateConversation({ title: "Updated Title" });
    });

    expect(conversationService.updateConversation).not.toHaveBeenCalled();
  });

  it("does not fetch if id is empty", async () => {
    const { result } = renderHook(() => useConversation(""));

    expect(result.current.isLoading).toBe(true);
    expect(conversationService.getConversation).not.toHaveBeenCalled();
  });
});
