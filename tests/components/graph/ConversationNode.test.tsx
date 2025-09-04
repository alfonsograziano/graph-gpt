import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConversationNode } from "@/components/graph/ConversationNode";
import { Node } from "@/types";

// Mock React Flow components
jest.mock("reactflow", () => ({
  Handle: ({ position, type }: { position: string; type: string }) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
  Position: {
    Top: "top",
    Bottom: "bottom",
  },
}));

// Mock the NodeCompleted component
jest.mock("@/components/graph/NodeCompleted", () => ({
  NodeCompleted: ({
    userMessage,
    assistantResponse,
    isActive,
    onBranchCreate,
  }: any) => (
    <div data-testid="node-completed">
      <div data-testid="user-message">{userMessage}</div>
      <div data-testid="assistant-response">{assistantResponse}</div>
      <div data-testid="is-active">{isActive.toString()}</div>
      <button data-testid="branch-button" onClick={onBranchCreate}>
        Create Branch
      </button>
    </div>
  ),
}));

const mockNode: Node = {
  id: "test-node-1",
  conversationId: "test-conversation-1",
  type: "input",
  userMessage: "",
  assistantResponse: "",
  position: { x: 100, y: 100 },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockCompletedNode: Node = {
  id: "test-node-2",
  conversationId: "test-conversation-1",
  type: "completed",
  userMessage: "Hello, world!",
  assistantResponse: "Hi there! How can I help you?",
  position: { x: 200, y: 200 },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockLoadingNode: Node = {
  id: "test-node-3",
  conversationId: "test-conversation-1",
  type: "loading",
  userMessage: "Processing...",
  assistantResponse: "",
  position: { x: 300, y: 300 },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ConversationNode", () => {
  const mockOnNodeClick = jest.fn();
  const mockOnMessageSubmit = jest.fn();
  const mockOnBranchCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input node with input field and submit button", () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(
      screen.getByPlaceholderText("What do you have in mind?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.getByTestId("handle-target-top")).toBeInTheDocument();
    expect(screen.getByTestId("handle-source-bottom")).toBeInTheDocument();
  });

  it("renders completed node with NodeCompleted component", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    expect(screen.getByTestId("node-completed")).toBeInTheDocument();
    expect(screen.getByTestId("user-message")).toHaveTextContent(
      "Hello, world!"
    );
    expect(screen.getByTestId("assistant-response")).toHaveTextContent(
      "Hi there! How can I help you?"
    );
    expect(screen.getByTestId("branch-button")).toBeInTheDocument();
  });

  it("renders loading node with spinner", () => {
    render(
      <ConversationNode
        node={mockLoadingNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("calls onNodeClick when node is clicked", () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const nodeElement = screen
      .getByRole("button", { name: "Send" })
      .closest("div");
    fireEvent.click(nodeElement!);

    expect(mockOnNodeClick).toHaveBeenCalledWith("test-node-1");
  });

  it("handles message submission in input node", async () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const submitButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnMessageSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  it("handles Enter key submission in input node", async () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const input = screen.getByPlaceholderText("What do you have in mind?");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockOnMessageSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  it("disables submit button when input is empty", () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Send" });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when input has text", () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const submitButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(input, { target: { value: "Test message" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("applies active styling when isActive is true", () => {
    render(
      <ConversationNode
        node={mockNode}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const nodeElement = screen
      .getByRole("button", { name: "Send" })
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass("ring-2", "ring-blue-500");
  });

  it("applies correct background styling based on node type", () => {
    // Test input node (white background)
    const { rerender } = render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    let nodeElement = screen
      .getByRole("button", { name: "Send" })
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass("bg-white");

    // Test loading node (gray background)
    rerender(
      <ConversationNode
        node={mockLoadingNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    nodeElement = screen.getByText("Generating...").closest("div")
      ?.parentElement?.parentElement;
    expect(nodeElement).toHaveClass("bg-gray-200");

    // Test completed node (white background when active)
    rerender(
      <ConversationNode
        node={mockCompletedNode}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    nodeElement = screen
      .getByTestId("node-completed")
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass("bg-white");
  });

  it("renders unknown node type gracefully", () => {
    const unknownNode = { ...mockNode, type: "unknown" as any };

    render(
      <ConversationNode
        node={unknownNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByText("Unknown node type")).toBeInTheDocument();
  });

  it("applies smooth transition classes", () => {
    render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const nodeElement = screen
      .getByRole("button", { name: "Send" })
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass(
      "transition-all",
      "duration-300",
      "ease-in-out"
    );
  });

  it("maintains consistent dimensions during state transitions", () => {
    const { rerender } = render(
      <ConversationNode
        node={mockNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    // All states should have min-w-[300px]
    let contentElement = screen
      .getByPlaceholderText("What do you have in mind?")
      .closest("div");
    expect(contentElement).toHaveClass("min-w-[300px]");

    rerender(
      <ConversationNode
        node={mockLoadingNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    contentElement = screen.getByText("Generating...").closest("div")
      ?.parentElement?.parentElement;
    expect(contentElement).toHaveClass("min-w-[300px]");

    rerender(
      <ConversationNode
        node={mockCompletedNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    // Check that the completed node renders without errors
    expect(screen.getByTestId("node-completed")).toBeInTheDocument();
  });

  it("calls onBranchCreate when branch button is clicked in completed node", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    const branchButton = screen.getByTestId("branch-button");
    fireEvent.click(branchButton);

    expect(mockOnBranchCreate).toHaveBeenCalledWith("test-node-2");
  });

  it("passes isActive prop to NodeCompleted component", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    expect(screen.getByTestId("is-active")).toHaveTextContent("true");
  });

  it("passes isActive=false to NodeCompleted component when not active", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        isActive={false}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    expect(screen.getByTestId("is-active")).toHaveTextContent("false");
  });

  it("applies correct background styling for completed nodes based on active state", () => {
    // Test active completed node (white background)
    const { rerender } = render(
      <ConversationNode
        node={mockCompletedNode}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    let nodeElement = screen
      .getByTestId("node-completed")
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass("bg-white");

    // Test inactive completed node (gray background)
    rerender(
      <ConversationNode
        node={mockCompletedNode}
        isActive={false}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    nodeElement = screen
      .getByTestId("node-completed")
      .closest("div")?.parentElement;
    expect(nodeElement).toHaveClass("bg-gray-100");
  });

  it("handles completed node without onBranchCreate callback", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByTestId("node-completed")).toBeInTheDocument();
    expect(screen.getByTestId("branch-button")).toBeInTheDocument();

    // Should not throw error when clicking branch button without callback
    const branchButton = screen.getByTestId("branch-button");
    expect(() => fireEvent.click(branchButton)).not.toThrow();
  });

  it("passes correct props to NodeCompleted component", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
      />
    );

    expect(screen.getByTestId("user-message")).toHaveTextContent(
      mockCompletedNode.userMessage
    );
    expect(screen.getByTestId("assistant-response")).toHaveTextContent(
      mockCompletedNode.assistantResponse
    );
    expect(screen.getByTestId("is-active")).toHaveTextContent("true");
  });
});
