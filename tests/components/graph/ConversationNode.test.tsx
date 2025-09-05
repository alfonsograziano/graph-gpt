import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReactFlowProvider } from "reactflow";
import { ConversationNode } from "@/components/graph/ConversationNode";
import { Node } from "@/types";

// Mock the child components
jest.mock("@/components/graph/NodeInput", () => ({
  NodeInput: ({ onSubmit }: { onSubmit: (message: string) => void }) => (
    <div data-testid="node-input">
      <button onClick={() => onSubmit("test message")}>Submit</button>
    </div>
  ),
}));

jest.mock("@/components/graph/NodeLoading", () => ({
  NodeLoading: ({ message }: { message: string }) => (
    <div data-testid="node-loading">{message}</div>
  ),
}));

jest.mock("@/components/graph/NodeCompleted", () => ({
  NodeCompleted: ({ onBranchCreate }: { onBranchCreate: () => void }) => (
    <div data-testid="node-completed">
      <button onClick={onBranchCreate}>Create Branch</button>
    </div>
  ),
}));

jest.mock("@/components/graph/DeleteButton", () => ({
  DeleteButton: ({
    onDelete,
    isVisible,
    nodeId,
  }: {
    onDelete: () => void;
    isVisible: boolean;
    nodeId: string;
  }) => (
    <button
      data-testid="delete-button"
      onClick={onDelete}
      style={{ display: isVisible ? "block" : "none" }}
    >
      Delete {nodeId}
    </button>
  ),
}));

describe("ConversationNode", () => {
  const mockOnNodeClick = jest.fn();
  const mockOnMessageSubmit = jest.fn();
  const mockOnBranchCreate = jest.fn();
  const mockOnNodeDelete = jest.fn();

  const createMockNode = (type: "input" | "loading" | "completed"): Node => ({
    id: "test-node-123",
    conversationId: "test-conversation-123",
    type,
    userMessage: "Test message",
    assistantResponse: "Test response",
    position: { x: 100, y: 100 },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input node correctly", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("node-input")).toBeInTheDocument();
  });

  it("renders loading node correctly", () => {
    const node = createMockNode("loading");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("node-loading")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders completed node correctly", () => {
    const node = createMockNode("completed");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("node-completed")).toBeInTheDocument();
  });

  it("calls onNodeClick when node is clicked", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const nodeElement = screen.getByTestId("node-input").closest("div");
    fireEvent.click(nodeElement!);

    expect(mockOnNodeClick).toHaveBeenCalledWith("test-node-123");
  });

  it("calls onMessageSubmit when message is submitted", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(mockOnMessageSubmit).toHaveBeenCalledWith(
      "test message",
      "test-node-123"
    );
  });

  it("calls onBranchCreate when branch is created", () => {
    const node = createMockNode("completed");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const branchButton = screen.getByText("Create Branch");
    fireEvent.click(branchButton);

    expect(mockOnBranchCreate).toHaveBeenCalledWith("test-node-123");
  });

  it("shows delete button on hover", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const nodeElement = screen.getByTestId("node-input").closest("div");

    // Initially hidden
    const deleteButton = screen.getByTestId("delete-button");
    expect(deleteButton).toHaveStyle("display: none");

    // Show on hover
    fireEvent.mouseEnter(nodeElement!);
    expect(deleteButton).toHaveStyle("display: block");

    // Hide on mouse leave
    fireEvent.mouseLeave(nodeElement!);
    expect(deleteButton).toHaveStyle("display: none");
  });

  it("calls onNodeDelete when delete button is clicked", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const nodeElement = screen.getByTestId("node-input").closest("div");
    fireEvent.mouseEnter(nodeElement!);

    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    expect(mockOnNodeDelete).toHaveBeenCalledWith("test-node-123");
  });

  it("applies correct styling for active state", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        isActive={true}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    // Find the outermost div that contains the node styling
    const nodeElement = screen.getByTestId("node-input").closest("div");
    const parentDiv = nodeElement?.parentElement?.parentElement;
    expect(parentDiv).toHaveClass("ring-2", "ring-blue-500");
  });

  it("applies correct styling for inactive state", () => {
    const node = createMockNode("input");

    renderWithProvider(
      <ConversationNode
        node={node}
        isActive={false}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const nodeElement = screen.getByTestId("node-input").closest("div");
    expect(nodeElement).not.toHaveClass("ring-2", "ring-blue-500");
  });

  it("handles missing optional props gracefully", () => {
    const node = createMockNode("input");

    renderWithProvider(<ConversationNode node={node} />);

    expect(screen.getByTestId("node-input")).toBeInTheDocument();
  });

  describe("Drag and Drop Accessibility", () => {
    it("has proper drag and drop attributes", () => {
      const node = createMockNode("input");

      renderWithProvider(
        <ConversationNode
          node={node}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      // Find the outermost div that contains the drag attributes
      const nodeElement = screen.getByTestId("node-input").closest("div");
      const parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveAttribute("draggable", "true");
      expect(parentDiv).toHaveAttribute("role", "button");
      expect(parentDiv).toHaveAttribute("tabIndex", "0");
      expect(parentDiv).toHaveAttribute(
        "aria-label",
        "input node - drag to move"
      );
    });

    it("has proper cursor styles for drag operations", () => {
      const node = createMockNode("input");

      renderWithProvider(
        <ConversationNode
          node={node}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      const nodeElement = screen.getByTestId("node-input").closest("div");
      const parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveClass("cursor-grab", "active:cursor-grabbing");
    });

    it("has different aria-labels for different node types", () => {
      const inputNode = createMockNode("input");
      const loadingNode = createMockNode("loading");
      const completedNode = createMockNode("completed");

      const { rerender } = renderWithProvider(
        <ConversationNode
          node={inputNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      let nodeElement = screen.getByTestId("node-input").closest("div");
      let parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveAttribute(
        "aria-label",
        "input node - drag to move"
      );

      rerender(
        <ConversationNode
          node={loadingNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      nodeElement = screen.getByTestId("node-loading").closest("div");
      parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveAttribute(
        "aria-label",
        "loading node - drag to move"
      );

      rerender(
        <ConversationNode
          node={completedNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      nodeElement = screen.getByTestId("node-completed").closest("div");
      parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveAttribute(
        "aria-label",
        "completed node - drag to move"
      );
    });

    it("maintains keyboard accessibility with drag attributes", () => {
      const node = createMockNode("input");

      renderWithProvider(
        <ConversationNode
          node={node}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      const nodeElement = screen.getByTestId("node-input").closest("div");
      const parentDiv = nodeElement?.parentElement?.parentElement;

      // Should be focusable
      expect(parentDiv).toHaveAttribute("tabIndex", "0");

      // Should have proper role
      expect(parentDiv).toHaveAttribute("role", "button");

      // Should be draggable
      expect(parentDiv).toHaveAttribute("draggable", "true");
    });

    it("applies drag styles consistently across all node types", () => {
      const inputNode = createMockNode("input");
      const loadingNode = createMockNode("loading");
      const completedNode = createMockNode("completed");

      const { rerender } = renderWithProvider(
        <ConversationNode
          node={inputNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      let nodeElement = screen.getByTestId("node-input").closest("div");
      let parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveClass("cursor-grab", "active:cursor-grabbing");

      rerender(
        <ConversationNode
          node={loadingNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      nodeElement = screen.getByTestId("node-loading").closest("div");
      parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveClass("cursor-grab", "active:cursor-grabbing");

      rerender(
        <ConversationNode
          node={completedNode}
          onNodeClick={mockOnNodeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
        />
      );

      nodeElement = screen.getByTestId("node-completed").closest("div");
      parentDiv = nodeElement?.parentElement?.parentElement;
      expect(parentDiv).toHaveClass("cursor-grab", "active:cursor-grabbing");
    });
  });
});
