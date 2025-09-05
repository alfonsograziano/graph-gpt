import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationPage } from "@/components/pages/ConversationPage";
import { Conversation, Node } from "@/types";
import { apiClient } from "@/services/apiClient";
import { contextService } from "@/services/contextService";

// Mock the hooks and services
jest.mock("@/hooks/useConversation");
jest.mock("@/services/apiClient");
jest.mock("@/services/contextService");

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockContextService = contextService as jest.Mocked<typeof contextService>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the GraphCanvas component
jest.mock("@/components/graph/GraphCanvas", () => ({
  GraphCanvas: ({
    onMessageSubmit,
  }: {
    onMessageSubmit?: (message: string, nodeId: string) => void;
  }) => (
    <div data-testid="graph-canvas">
      <button
        onClick={() => onMessageSubmit?.("Test message", "test-node")}
        data-testid="submit-message"
      >
        Submit Message
      </button>
    </div>
  ),
}));

const mockUseConversation = jest.fn();

describe("ConversationPage", () => {
  const mockConversation: Conversation = {
    id: "test-conversation",
    title: "Test Conversation",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    nodes: [
      {
        id: "test-node",
        conversationId: "test-conversation",
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position: { x: 100, y: 100 },
        createdAt: new Date("2024-01-01T10:00:00"),
        updatedAt: new Date("2024-01-01T10:00:00"),
      },
    ],
    edges: [],
    metadata: {
      nodeCount: 1,
      lastActiveNodeId: "test-node",
    },
  };

  const mockUpdateConversation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConversation.mockReturnValue({
      conversation: mockConversation,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      updateConversation: mockUpdateConversation,
    });

    // Mock the useConversation hook
    require("@/hooks/useConversation").useConversation = mockUseConversation;

    // Mock context service
    mockContextService.getConversationContext.mockReturnValue([
      { role: "user", content: "Previous message" },
    ]);

    // Mock API client
    mockApiClient.sendChatRequest.mockResolvedValue({
      content: "Test response",
      nodeId: "test-node",
      conversationId: "test-conversation",
      timestamp: new Date(),
    });
  });

  it("should render conversation page with title", () => {
    render(<ConversationPage conversationId="test-conversation" />);

    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    expect(screen.getByTestId("graph-canvas")).toBeInTheDocument();
  });

  it("should handle message submission successfully", async () => {
    render(<ConversationPage conversationId="test-conversation" />);

    const submitButton = screen.getByTestId("submit-message");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContextService.getConversationContext).toHaveBeenCalledWith(
        mockConversation,
        "test-node"
      );
    });

    await waitFor(() => {
      expect(mockApiClient.sendChatRequest).toHaveBeenCalledWith({
        message: "Test message",
        context: [{ role: "user", content: "Previous message" }],
        nodeId: "test-node",
        conversationId: "test-conversation",
      });
    });

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledTimes(2); // Loading, then completed
    });
  });

  it("should handle API errors gracefully", async () => {
    const error = new Error("API Error");
    mockApiClient.sendChatRequest.mockRejectedValueOnce(error);
    mockApiClient.handleApiError.mockReturnValue("API Error");

    render(<ConversationPage conversationId="test-conversation" />);

    const submitButton = screen.getByTestId("submit-message");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              type: "input",
              assistantResponse: "Error: API Error",
            }),
          ]),
        })
      );
    });
  });

  it("should show loading state during message submission", async () => {
    // Mock a delayed API response
    mockApiClient.sendChatRequest.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                content: "Test response",
                nodeId: "test-node",
                conversationId: "test-conversation",
                timestamp: new Date(),
              }),
            100
          )
        )
    );

    render(<ConversationPage conversationId="test-conversation" />);

    const submitButton = screen.getByTestId("submit-message");
    fireEvent.click(submitButton);

    // Should update to loading state first
    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              type: "loading",
              userMessage: "Test message",
            }),
          ]),
        })
      );
    });
  });

  it("should handle title editing", async () => {
    render(<ConversationPage conversationId="test-conversation" />);

    const titleButton = screen.getByText("Test Conversation");
    fireEvent.click(titleButton);

    // Should show editable title
    expect(screen.getByDisplayValue("Test Conversation")).toBeInTheDocument();
  });

  it("should handle back navigation", () => {
    render(<ConversationPage conversationId="test-conversation" />);

    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should create default input node when conversation has no nodes", async () => {
    const emptyConversation = {
      ...mockConversation,
      nodes: [],
    };

    mockUseConversation.mockReturnValue({
      conversation: emptyConversation,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      updateConversation: mockUpdateConversation,
    });

    // Mock updateConversation to return a promise
    mockUpdateConversation.mockResolvedValue(undefined);

    render(<ConversationPage conversationId="test-conversation" />);

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "default-input-node",
              type: "input",
            }),
          ]),
        })
      );
    });
  });

  it("should prevent multiple simultaneous submissions", async () => {
    // Mock a delayed API response
    mockApiClient.sendChatRequest.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                content: "Test response",
                nodeId: "test-node",
                conversationId: "test-conversation",
                timestamp: new Date(),
              }),
            100
          )
        )
    );

    render(<ConversationPage conversationId="test-conversation" />);

    const submitButton = screen.getByTestId("submit-message");

    // Click multiple times rapidly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Should only call API once
    await waitFor(() => {
      expect(mockApiClient.sendChatRequest).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle context service errors", async () => {
    mockContextService.getConversationContext.mockImplementation(() => {
      throw new Error("Context error");
    });

    render(<ConversationPage conversationId="test-conversation" />);

    const submitButton = screen.getByTestId("submit-message");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              type: "input",
              assistantResponse: expect.stringContaining("Error:"),
            }),
          ]),
        })
      );
    });
  });
});
