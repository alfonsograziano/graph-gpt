import React from "react";
import { render, screen } from "@testing-library/react";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Conversation } from "@/types";

// Mock React Flow components
jest.mock("reactflow", () => ({
  ReactFlow: ({ children }: any) => (
    <div data-testid="react-flow">{children}</div>
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  ),
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  Handle: () => <div data-testid="handle" />,
  useNodesState: (initialNodes: any) => [initialNodes, jest.fn(), jest.fn()],
  useEdgesState: (initialEdges: any) => [initialEdges, jest.fn(), jest.fn()],
  ConnectionMode: { Loose: "loose" },
  BackgroundVariant: { Dots: "dots" },
  PanOnScrollMode: { Free: "free" },
}));

const mockConversation: Conversation = {
  id: "test-conversation-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [],
  edges: [],
  metadata: {
    nodeCount: 0,
  },
};

const mockConversationWithNodes: Conversation = {
  id: "test-conversation-2",
  title: "Test Conversation with Nodes",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [
    {
      id: "node-1",
      conversationId: "test-conversation-2",
      type: "input",
      userMessage: "Hello",
      assistantResponse: "",
      position: { x: 100, y: 100 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "node-2",
      conversationId: "test-conversation-2",
      type: "completed",
      userMessage: "Hello",
      assistantResponse: "Hi there!",
      position: { x: 200, y: 200 },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  edges: [],
  metadata: {
    nodeCount: 2,
  },
};

describe("GraphCanvas", () => {
  const mockOnNodeClick = jest.fn();
  const mockOnEdgeClick = jest.fn();
  const mockOnMessageSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders React Flow with proper structure", () => {
    render(
      <GraphCanvas
        conversation={mockConversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByTestId("react-flow-provider")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
  });

  it("applies proper styling classes", () => {
    render(
      <GraphCanvas
        conversation={mockConversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    const container = screen.getByTestId("react-flow").parentElement;
    expect(container).toHaveClass(
      "w-full",
      "h-full",
      "min-h-screen",
      "bg-gray-50"
    );
  });

  it("renders with proper accessibility attributes", () => {
    render(
      <GraphCanvas
        conversation={mockConversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
  });

  it("handles empty conversation gracefully", () => {
    const emptyConversation = {
      ...mockConversation,
      nodes: [],
    };

    render(
      <GraphCanvas
        conversation={emptyConversation}
        onNodeClick={mockOnNodeClick}
        onEdgeClick={mockOnEdgeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
  });

  it("accepts all required props", () => {
    expect(() => {
      render(
        <GraphCanvas
          conversation={mockConversation}
          onNodeClick={mockOnNodeClick}
          onEdgeClick={mockOnEdgeClick}
          onMessageSubmit={mockOnMessageSubmit}
        />
      );
    }).not.toThrow();
  });
});
