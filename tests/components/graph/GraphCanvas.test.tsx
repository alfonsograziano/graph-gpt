import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Conversation, Node, Edge } from "@/types";

// Mock React Flow components
jest.mock("reactflow", () => ({
  ReactFlow: ({ children, onNodeClick, onEdgeClick, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      {children}
      <div data-testid="react-flow-content">
        {props.nodes?.map((node: any) => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            onClick={(e) => onNodeClick?.(e, node)}
          >
            {node.data?.node && (
              <div data-testid={`node-content-${node.id}`}>
                {node.data.node.type}
              </div>
            )}
          </div>
        ))}
        {props.edges?.map((edge: any) => (
          <div
            key={edge.id}
            data-testid={`edge-${edge.id}`}
            onClick={(e) => onEdgeClick?.(e, edge)}
          >
            {edge.source} → {edge.target}
          </div>
        ))}
      </div>
    </div>
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  ),
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  Handle: ({ position }: { position: string }) => (
    <div data-testid={`handle-${position}`} />
  ),
  useNodesState: (initialNodes: any) => [initialNodes, jest.fn(), jest.fn()],
  useEdgesState: (initialEdges: any) => [initialEdges, jest.fn(), jest.fn()],
  ConnectionMode: { Loose: "loose" },
  BackgroundVariant: { Dots: "dots" },
  PanOnScrollMode: { Free: "free" },
}));

// Mock ConversationNode
jest.mock("@/components/graph/ConversationNode", () => ({
  ConversationNode: ({
    node,
    onNodeDelete,
    onNodeClick,
    onMessageSubmit,
    onBranchCreate,
  }: any) => (
    <div
      data-testid={`conversation-node-${node.id}`}
      onClick={() => onNodeClick?.(node.id)}
    >
      <div data-testid={`node-type-${node.type}`}>{node.type}</div>
      <button
        data-testid={`delete-button-${node.id}`}
        onClick={() => onNodeDelete?.(node.id)}
      >
        Delete
      </button>
      <button
        data-testid={`message-submit-${node.id}`}
        onClick={() => onMessageSubmit?.("test message", node.id)}
      >
        Submit Message
      </button>
      <button
        data-testid={`branch-create-${node.id}`}
        onClick={() => onBranchCreate?.(node.id)}
      >
        Create Branch
      </button>
    </div>
  ),
}));

describe("GraphCanvas", () => {
  const mockOnNodeClick = jest.fn();
  const mockOnEdgeClick = jest.fn();
  const mockOnMessageSubmit = jest.fn();
  const mockOnBranchCreate = jest.fn();
  const mockOnNodeDelete = jest.fn();

  const createMockConversation = (): Conversation => ({
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
        assistantResponse: "I'm doing well!",
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders conversation nodes correctly", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("conversation-node-node-1")).toBeInTheDocument();
    expect(screen.getByTestId("conversation-node-node-2")).toBeInTheDocument();
    expect(screen.getByTestId("node-type-input")).toBeInTheDocument();
    expect(screen.getByTestId("node-type-completed")).toBeInTheDocument();
  });

  it("renders conversation edges correctly", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("edge-edge-1")).toBeInTheDocument();
    expect(screen.getByText("node-1 → node-2")).toBeInTheDocument();
  });

  it("calls onNodeClick when node is clicked", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const node1 = screen.getByTestId("conversation-node-node-1");
    fireEvent.click(node1);

    expect(mockOnNodeClick).toHaveBeenCalledWith("node-1");
  });

  it("calls onEdgeClick when edge is clicked", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const edge1 = screen.getByTestId("edge-edge-1");
    fireEvent.click(edge1);

    expect(mockOnEdgeClick).toHaveBeenCalledWith("edge-1");
  });

  it("calls onMessageSubmit when message is submitted", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const submitButton = screen.getByTestId("message-submit-node-1");
    fireEvent.click(submitButton);

    expect(mockOnMessageSubmit).toHaveBeenCalledWith("test message", "node-1");
  });

  it("calls onBranchCreate when branch is created", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const branchButton = screen.getByTestId("branch-create-node-2");
    fireEvent.click(branchButton);

    expect(mockOnBranchCreate).toHaveBeenCalledWith("node-2");
  });

  it("calls onNodeDelete when node is deleted", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    const deleteButton = screen.getByTestId("delete-button-node-1");
    fireEvent.click(deleteButton);

    expect(mockOnNodeDelete).toHaveBeenCalledWith("node-1");
  });

  it("handles empty conversation gracefully", () => {
    const emptyConversation: Conversation = {
      id: "empty-conversation",
      title: "Empty Conversation",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      nodes: [],
      edges: [],
      metadata: {
        nodeCount: 0,
      },
    };

    render(
      <GraphCanvas
        conversation={emptyConversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(
      screen.queryByTestId("conversation-node-node-1")
    ).not.toBeInTheDocument();
  });

  it("handles missing optional props gracefully", () => {
    const conversation = createMockConversation();

    render(<GraphCanvas conversation={conversation} />);

    expect(screen.getByTestId("conversation-node-node-1")).toBeInTheDocument();
    expect(screen.getByTestId("conversation-node-node-2")).toBeInTheDocument();
  });

  it("renders React Flow controls and background", () => {
    const conversation = createMockConversation();

    render(
      <GraphCanvas
        conversation={conversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
        onBranchCreate={mockOnBranchCreate}
        onNodeDelete={mockOnNodeDelete}
      />
    );

    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
  });
});
