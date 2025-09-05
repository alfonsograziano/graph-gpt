import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ConversationPage } from "@/components/pages/ConversationPage";
import { useConversation } from "@/hooks/useConversation";
import { apiClient } from "@/services/apiClient";
import { contextService } from "@/services/contextService";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useConversation");
jest.mock("@/services/apiClient");
jest.mock("@/services/contextService");

// Mock GraphCanvas
jest.mock("@/components/graph/GraphCanvas", () => ({
  GraphCanvas: ({ onNodeDelete, onMessageSubmit, onBranchCreate }: any) => (
    <div data-testid="graph-canvas">
      <button
        data-testid="delete-node-button"
        onClick={() => onNodeDelete?.("test-node-123")}
      >
        Delete Node
      </button>
      <button
        data-testid="submit-message-button"
        onClick={() => onMessageSubmit?.("test message", "test-node-123")}
      >
        Submit Message
      </button>
      <button
        data-testid="create-branch-button"
        onClick={() => onBranchCreate?.("test-node-123")}
      >
        Create Branch
      </button>
    </div>
  ),
}));

// Mock other components
jest.mock("@/components/ui/EditableTitle", () => ({
  EditableTitle: ({ value, onSave, onCancel, isLoading }: any) => (
    <div data-testid="editable-title">
      <input
        data-testid="title-input"
        defaultValue={value}
        onChange={(e) => e.target.value}
      />
      <button
        data-testid="save-title-button"
        onClick={() => onSave("New Title")}
        disabled={isLoading}
      >
        Save
      </button>
      <button data-testid="cancel-title-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockUseConversation = useConversation as jest.MockedFunction<
  typeof useConversation
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockContextService = contextService as jest.Mocked<typeof contextService>;

describe("ConversationPage", () => {
  const mockPush = jest.fn();
  const mockUpdateConversation = jest.fn();
  const mockCreateBranch = jest.fn();
  const mockDeleteNode = jest.fn();

  const mockConversation = {
    id: "test-conversation-123",
    title: "Test Conversation",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    nodes: [
      {
        id: "test-node-123",
        conversationId: "test-conversation-123",
        type: "input" as const,
        userMessage: "Hello",
        assistantResponse: "",
        position: { x: 100, y: 100 },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ],
    edges: [],
    metadata: {
      nodeCount: 1,
      lastActiveNodeId: "test-node-123",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    mockUseConversation.mockReturnValue({
      conversation: mockConversation,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      updateConversation: mockUpdateConversation,
      createBranch: mockCreateBranch,
      addNode: jest.fn(),
      addEdge: jest.fn(),
      deleteNode: mockDeleteNode,
    });

    mockApiClient.sendChatRequest.mockResolvedValue({
      content: "Test response",
      nodeId: "test-node-123",
      conversationId: "test-conversation-123",
      timestamp: new Date(),
    });

    mockContextService.getConversationContext.mockReturnValue([
      { role: "user" as const, content: "Hello" },
    ]);
  });

  it("renders conversation page with title", () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    expect(screen.getByText("← Back")).toBeInTheDocument();
    expect(screen.getByTestId("graph-canvas")).toBeInTheDocument();
  });

  it("navigates back to home when back button is clicked", () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("handles node deletion", async () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    const deleteButton = screen.getByTestId("delete-node-button");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteNode).toHaveBeenCalledWith("test-node-123");
    });
  });

  it("handles message submission", async () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    const submitButton = screen.getByTestId("submit-message-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalled();
    });
  });

  it("handles branch creation", async () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    const branchButton = screen.getByTestId("create-branch-button");
    fireEvent.click(branchButton);

    await waitFor(() => {
      expect(mockCreateBranch).toHaveBeenCalledWith("test-node-123");
    });
  });

  it("shows loading spinner when loading", () => {
    mockUseConversation.mockReturnValue({
      conversation: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      updateConversation: mockUpdateConversation,
      createBranch: mockCreateBranch,
      addNode: jest.fn(),
      addEdge: jest.fn(),
      deleteNode: mockDeleteNode,
    });

    render(<ConversationPage conversationId="test-conversation-123" />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("handles title editing", async () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    // Click on title to start editing
    const titleButton = screen.getByText("Test Conversation");
    fireEvent.click(titleButton);

    expect(screen.getByTestId("editable-title")).toBeInTheDocument();

    // Save new title
    const saveButton = screen.getByTestId("save-title-button");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith({
        title: "New Title",
      });
    });
  });

  it("handles title editing cancellation", () => {
    render(<ConversationPage conversationId="test-conversation-123" />);

    // Click on title to start editing
    const titleButton = screen.getByText("Test Conversation");
    fireEvent.click(titleButton);

    expect(screen.getByTestId("editable-title")).toBeInTheDocument();

    // Cancel editing
    const cancelButton = screen.getByTestId("cancel-title-button");
    fireEvent.click(cancelButton);

    // Should return to normal title display
    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
  });

  it("creates default input node when conversation has no nodes", async () => {
    const emptyConversation = {
      ...mockConversation,
      nodes: [],
      metadata: { ...mockConversation.metadata, nodeCount: 0 },
    };

    const mockUpdateConversationEmpty = jest.fn().mockResolvedValue(undefined);

    mockUseConversation.mockReturnValue({
      conversation: emptyConversation,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      updateConversation: mockUpdateConversationEmpty,
      createBranch: mockCreateBranch,
      addNode: jest.fn(),
      addEdge: jest.fn(),
      deleteNode: mockDeleteNode,
    });

    render(<ConversationPage conversationId="test-conversation-123" />);

    await waitFor(() => {
      expect(mockUpdateConversationEmpty).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "default-input-node",
              type: "input",
            }),
          ]),
          metadata: expect.objectContaining({
            nodeCount: 1,
            lastActiveNodeId: "default-input-node",
          }),
        })
      );
    });
  });

  it("handles delete node errors gracefully", async () => {
    mockDeleteNode.mockRejectedValue(new Error("Delete failed"));

    render(<ConversationPage conversationId="test-conversation-123" />);

    const deleteButton = screen.getByTestId("delete-node-button");
    fireEvent.click(deleteButton);

    // Should not throw error, just log it
    await waitFor(() => {
      expect(mockDeleteNode).toHaveBeenCalledWith("test-node-123");
    });
  });

  it("handles create branch errors gracefully", async () => {
    mockCreateBranch.mockRejectedValue(new Error("Branch creation failed"));

    render(<ConversationPage conversationId="test-conversation-123" />);

    const branchButton = screen.getByTestId("create-branch-button");
    fireEvent.click(branchButton);

    // Should not throw error, just log it
    await waitFor(() => {
      expect(mockCreateBranch).toHaveBeenCalledWith("test-node-123");
    });
  });
});
