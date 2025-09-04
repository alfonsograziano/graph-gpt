import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("renders completed node with user message and assistant response", () => {
    render(
      <ConversationNode
        node={mockCompletedNode}
        onNodeClick={mockOnNodeClick}
        onMessageSubmit={mockOnMessageSubmit}
      />
    );

    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    expect(
      screen.getByText("Hi there! How can I help you?")
    ).toBeInTheDocument();
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

  it("applies light gray background styling", () => {
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
    expect(nodeElement).toHaveClass("bg-gray-200");
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
});
