import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Conversation, Node, Edge } from "@/types";

// Mock React Flow components
jest.mock("reactflow", () => {
  const ReactFlow = ({
    children,
    onNodeClick,
    onEdgeClick,
    onNodeDrag,
    onNodeDragStop,
    ...props
  }: any) => (
    <div data-testid="react-flow" {...props}>
      {children}
      <div data-testid="react-flow-content">
        {props.nodes?.map((node: any) => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            onClick={(e) => onNodeClick?.(e, node)}
            onDrag={(e) => onNodeDrag?.(e, node)}
            onDragEnd={(e) => onNodeDragStop?.(e, node)}
            draggable={node.draggable}
            style={{ cursor: node.draggable ? "grab" : "default" }}
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
  );

  return {
    ReactFlow,
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
  };
});

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
  const mockOnNodePositionUpdate = jest.fn();

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

  describe("Drag and Drop functionality", () => {
    it("renders nodes as draggable", () => {
      const conversation = createMockConversation();

      render(
        <GraphCanvas
          conversation={conversation}
          onNodeClick={mockOnNodeClick}
          onEdgeClick={mockOnEdgeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
          onNodePositionUpdate={mockOnNodePositionUpdate}
        />
      );

      const node1 = screen.getByTestId("node-node-1");
      const node2 = screen.getByTestId("node-node-2");

      expect(node1).toHaveAttribute("draggable", "true");
      expect(node2).toHaveAttribute("draggable", "true");
      expect(node1).toHaveStyle("cursor: grab");
      expect(node2).toHaveStyle("cursor: grab");
    });

    it("calls onNodePositionUpdate when node drag stops", () => {
      const conversation = createMockConversation();

      render(
        <GraphCanvas
          conversation={conversation}
          onNodeClick={mockOnNodeClick}
          onEdgeClick={mockOnEdgeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
          onNodePositionUpdate={mockOnNodePositionUpdate}
        />
      );

      const node1 = screen.getByTestId("node-node-1");
      const mockNode = {
        id: "node-1",
        position: { x: 150, y: 150 },
      };

      fireEvent.dragEnd(node1, { dataTransfer: { getData: () => "" } });

      // Simulate the onNodeDragStop call
      const reactFlowElement = screen.getByTestId("react-flow");
      const onNodeDragStop = reactFlowElement.props.onNodeDragStop;
      if (onNodeDragStop) {
        onNodeDragStop(new Event("dragend"), mockNode);
      }

      expect(mockOnNodePositionUpdate).toHaveBeenCalledWith("node-1", {
        x: 150,
        y: 150,
      });
    });

    it("handles drag events without onNodePositionUpdate callback", () => {
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

      const node1 = screen.getByTestId("node-node-1");
      const mockNode = {
        id: "node-1",
        position: { x: 150, y: 150 },
      };

      // Should not throw error when onNodePositionUpdate is not provided
      expect(() => {
        const reactFlowElement = screen.getByTestId("react-flow");
        const onNodeDragStop = reactFlowElement.props.onNodeDragStop;
        if (onNodeDragStop) {
          onNodeDragStop(new Event("dragend"), mockNode);
        }
      }).not.toThrow();
    });

    it("maintains node connections during drag", () => {
      const conversation = createMockConversation();

      render(
        <GraphCanvas
          conversation={conversation}
          onNodeClick={mockOnNodeClick}
          onEdgeClick={mockOnEdgeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
          onNodePositionUpdate={mockOnNodePositionUpdate}
        />
      );

      // Verify edges are still present after drag
      expect(screen.getByTestId("edge-edge-1")).toBeInTheDocument();
      expect(screen.getByText("node-1 → node-2")).toBeInTheDocument();

      // Simulate drag end
      const node1 = screen.getByTestId("node-node-1");
      const mockNode = {
        id: "node-1",
        position: { x: 300, y: 300 },
      };

      const reactFlowElement = screen.getByTestId("react-flow");
      const onNodeDragStop = reactFlowElement.props.onNodeDragStop;
      if (onNodeDragStop) {
        onNodeDragStop(new Event("dragend"), mockNode);
      }

      // Edges should still be present
      expect(screen.getByTestId("edge-edge-1")).toBeInTheDocument();
    });

    it("works with all node types (input, loading, completed)", () => {
      const conversationWithAllTypes: Conversation = {
        id: "test-conversation-all-types",
        title: "All Node Types",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        nodes: [
          {
            id: "input-node",
            conversationId: "test-conversation-all-types",
            type: "input",
            userMessage: "",
            assistantResponse: "",
            position: { x: 100, y: 100 },
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          {
            id: "loading-node",
            conversationId: "test-conversation-all-types",
            type: "loading",
            userMessage: "Loading...",
            assistantResponse: "",
            position: { x: 200, y: 200 },
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          {
            id: "completed-node",
            conversationId: "test-conversation-all-types",
            type: "completed",
            userMessage: "Hello",
            assistantResponse: "Hi there!",
            position: { x: 300, y: 300 },
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
        ],
        edges: [],
        metadata: {
          nodeCount: 3,
        },
      };

      render(
        <GraphCanvas
          conversation={conversationWithAllTypes}
          onNodeClick={mockOnNodeClick}
          onEdgeClick={mockOnEdgeClick}
          onMessageSubmit={mockOnMessageSubmit}
          onBranchCreate={mockOnBranchCreate}
          onNodeDelete={mockOnNodeDelete}
          onNodePositionUpdate={mockOnNodePositionUpdate}
        />
      );

      // All node types should be draggable
      expect(screen.getByTestId("node-input-node")).toHaveAttribute(
        "draggable",
        "true"
      );
      expect(screen.getByTestId("node-loading-node")).toHaveAttribute(
        "draggable",
        "true"
      );
      expect(screen.getByTestId("node-completed-node")).toHaveAttribute(
        "draggable",
        "true"
      );
    });
  });
});
