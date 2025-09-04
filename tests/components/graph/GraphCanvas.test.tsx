import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Conversation } from "@/types";

// Mock React Flow
jest.mock("reactflow", () => {
  const React = require("react");
  
  const MockReactFlow = React.forwardRef(({
    children,
    onNodeClick,
    onEdgeClick,
    nodes,
    edges,
    ...props
  }: any, ref: any) => (
    <div data-testid="react-flow" ref={ref} {...props}>
      {children}
      <div data-testid="nodes">
        {nodes?.map((node: any) => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            onClick={(e) => onNodeClick?.(e, node)}
          >
            {node.data?.label}
          </div>
        )) || []}
      </div>
      <div data-testid="edges">
        {edges?.map((edge: any) => (
          <div
            key={edge.id}
            data-testid={`edge-${edge.id}`}
            onClick={(e) => onEdgeClick?.(e, edge)}
          >
            {edge.source} → {edge.target}
          </div>
        )) || []}
      </div>
    </div>
  ));

  const MockReactFlowProvider = ({ children }: any) => (
    <div data-testid="react-flow-provider">{children}</div>
  );
  const MockControls = () => <div data-testid="controls">Controls</div>;
  const MockBackground = () => <div data-testid="background">Background</div>;

  return {
    ReactFlow: MockReactFlow,
    ReactFlowProvider: MockReactFlowProvider,
    Controls: MockControls,
    Background: MockBackground,
    useNodesState: (initialNodes: any) => [initialNodes, jest.fn(), jest.fn()],
    useEdgesState: (initialEdges: any) => [initialEdges, jest.fn(), jest.fn()],
    ConnectionMode: { Loose: "loose" },
    BackgroundVariant: { Dots: "dots" },
  };
});

const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [
    {
      id: "node-1",
      conversationId: "conv-1",
      type: "input",
      userMessage: "Hello",
      assistantResponse: "Hi there!",
      position: { x: 100, y: 100 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "node-2",
      conversationId: "conv-1",
      type: "completed",
      userMessage: "How are you?",
      assistantResponse: "I am doing well!",
      position: { x: 300, y: 200 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  edges: [
    {
      id: "edge-1",
      conversationId: "conv-1",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      type: "auto",
      createdAt: new Date("2024-01-01"),
    },
  ],
  metadata: {
    nodeCount: 2,
  },
};

describe("GraphCanvas", () => {
  it("renders React Flow with conversation data", () => {
    render(<GraphCanvas conversation={mockConversation} />);

    expect(screen.getByTestId("react-flow-provider")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
  });

  it("transforms conversation nodes to React Flow format", () => {
    render(<GraphCanvas conversation={mockConversation} />);

    expect(screen.getByTestId("node-node-1")).toBeInTheDocument();
    expect(screen.getByTestId("node-node-2")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
  });

  it("transforms conversation edges to React Flow format", () => {
    render(<GraphCanvas conversation={mockConversation} />);

    expect(screen.getByTestId("edge-edge-1")).toBeInTheDocument();
    expect(screen.getByText("node-1 → node-2")).toBeInTheDocument();
  });

  it("calls onNodeClick when node is clicked", () => {
    const mockOnNodeClick = jest.fn();
    render(
      <GraphCanvas
        conversation={mockConversation}
        onNodeClick={mockOnNodeClick}
      />
    );

    fireEvent.click(screen.getByTestId("node-node-1"));
    expect(mockOnNodeClick).toHaveBeenCalledWith("node-1");
  });

  it("calls onEdgeClick when edge is clicked", () => {
    const mockOnEdgeClick = jest.fn();
    render(
      <GraphCanvas
        conversation={mockConversation}
        onEdgeClick={mockOnEdgeClick}
      />
    );

    fireEvent.click(screen.getByTestId("edge-edge-1"));
    expect(mockOnEdgeClick).toHaveBeenCalledWith("edge-1");
  });

  it("handles empty conversation gracefully", () => {
    const emptyConversation: Conversation = {
      id: "conv-empty",
      title: "Empty Conversation",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      nodes: [],
      edges: [],
      metadata: {
        nodeCount: 0,
      },
    };

    render(<GraphCanvas conversation={emptyConversation} />);

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.queryByTestId("node-")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edge-")).not.toBeInTheDocument();
  });

  it("includes proper node data structure", () => {
    render(<GraphCanvas conversation={mockConversation} />);

    // The nodes should be rendered with the correct data
    const node1 = screen.getByTestId("node-node-1");
    expect(node1).toBeInTheDocument();

    const node2 = screen.getByTestId("node-node-2");
    expect(node2).toBeInTheDocument();
  });

  it("includes proper edge data structure", () => {
    render(<GraphCanvas conversation={mockConversation} />);

    // The edges should be rendered with the correct data
    const edge1 = screen.getByTestId("edge-edge-1");
    expect(edge1).toBeInTheDocument();
  });
});
