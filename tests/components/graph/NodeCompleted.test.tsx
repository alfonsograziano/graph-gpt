import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NodeCompleted } from "@/components/graph/NodeCompleted";

// Mock the MarkdownRenderer component
jest.mock("@/components/graph/MarkdownRenderer", () => ({
  MarkdownRenderer: ({
    content,
    className,
  }: {
    content: string;
    className?: string;
  }) => (
    <div data-testid="markdown-renderer" className={className}>
      {content}
    </div>
  ),
}));

// Mock the BranchButton component
jest.mock("@/components/graph/BranchButton", () => ({
  BranchButton: ({
    onClick,
    disabled,
  }: {
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid="branch-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Create new branch"
    >
      +
    </button>
  ),
}));

describe("NodeCompleted", () => {
  const defaultProps = {
    userMessage: "What is React?",
    assistantResponse:
      "React is a JavaScript library for building user interfaces.",
    isActive: false,
    onBranchCreate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user message and assistant response", () => {
    render(<NodeCompleted {...defaultProps} />);

    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "React is a JavaScript library for building user interfaces."
      )
    ).toBeInTheDocument();
  });

  it("renders the separator between user message and assistant response", () => {
    render(<NodeCompleted {...defaultProps} />);

    const separator = screen
      .getByText("What is React?")
      .closest("div")?.nextElementSibling;
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass("border-t", "border-gray-200", "my-3");
  });

  it("renders the MarkdownRenderer with assistant response", () => {
    render(<NodeCompleted {...defaultProps} />);

    const markdownRenderer = screen.getByTestId("markdown-renderer");
    expect(markdownRenderer).toBeInTheDocument();
    expect(markdownRenderer).toHaveTextContent(
      "React is a JavaScript library for building user interfaces."
    );
  });

  it("renders the BranchButton", () => {
    render(<NodeCompleted {...defaultProps} />);

    const branchButton = screen.getByTestId("branch-button");
    expect(branchButton).toBeInTheDocument();
    expect(branchButton).toHaveAttribute("aria-label", "Create new branch");
  });

  it("calls onBranchCreate when branch button is clicked", () => {
    const mockOnBranchCreate = jest.fn();
    render(
      <NodeCompleted {...defaultProps} onBranchCreate={mockOnBranchCreate} />
    );

    const branchButton = screen.getByTestId("branch-button");
    fireEvent.click(branchButton);

    expect(mockOnBranchCreate).toHaveBeenCalledTimes(1);
  });

  it("applies correct styling classes", () => {
    render(<NodeCompleted {...defaultProps} />);

    const container = screen.getByText("What is React?").closest("div")
      ?.parentElement?.parentElement;
    expect(container).toHaveClass(
      "p-4",
      "min-w-[300px]",
      "transition-all",
      "duration-300",
      "ease-in-out"
    );
  });

  it("renders user message with correct styling", () => {
    render(<NodeCompleted {...defaultProps} />);

    const userMessage = screen.getByText("What is React?");
    expect(userMessage).toHaveClass(
      "text-sm",
      "font-medium",
      "text-gray-900",
      "leading-relaxed"
    );
  });

  it("renders assistant response with correct styling", () => {
    render(<NodeCompleted {...defaultProps} />);

    const assistantResponse = screen
      .getByText("React is a JavaScript library for building user interfaces.")
      .closest("div")?.parentElement;
    expect(assistantResponse).toHaveClass(
      "text-sm",
      "text-gray-700",
      "leading-relaxed"
    );
  });

  it("renders branch button in center", () => {
    render(<NodeCompleted {...defaultProps} />);

    const buttonContainer = screen.getByTestId("branch-button").closest("div");
    expect(buttonContainer).toHaveClass("flex", "justify-center", "mt-4");
  });

  it("handles empty user message", () => {
    render(<NodeCompleted {...defaultProps} userMessage="" />);

    // The user message div should be empty but still present
    const userMessageDiv = screen
      .getByText("React is a JavaScript library for building user interfaces.")
      .closest("div")?.parentElement?.previousElementSibling;
    expect(userMessageDiv).toBeInTheDocument();
  });

  it("handles empty assistant response", () => {
    render(<NodeCompleted {...defaultProps} assistantResponse="" />);

    const markdownRenderer = screen.getByTestId("markdown-renderer");
    expect(markdownRenderer).toHaveTextContent("");
  });

  it("handles long content", () => {
    const longUserMessage =
      "This is a very long user message that should be handled properly by the component and should not cause any layout issues or overflow problems.";
    const longAssistantResponse =
      "This is a very long assistant response that contains a lot of information and should be rendered properly with markdown formatting and should not cause any layout issues or overflow problems.";

    render(
      <NodeCompleted
        {...defaultProps}
        userMessage={longUserMessage}
        assistantResponse={longAssistantResponse}
      />
    );

    expect(screen.getByText(longUserMessage)).toBeInTheDocument();
    expect(screen.getByText(longAssistantResponse)).toBeInTheDocument();
  });

  it("handles markdown content in assistant response", () => {
    const markdownResponse =
      "# React\n\nReact is a **JavaScript** library for building *user interfaces*.\n\n- Component-based\n- Declarative\n- Efficient";

    render(
      <NodeCompleted {...defaultProps} assistantResponse={markdownResponse} />
    );

    const markdownRenderer = screen.getByTestId("markdown-renderer");
    expect(markdownRenderer).toBeInTheDocument();
    // The markdown will be processed, so we check for the presence of key elements
    expect(markdownRenderer).toHaveTextContent("React");
    expect(markdownRenderer).toHaveTextContent("JavaScript");
  });

  it("maintains proper spacing between elements", () => {
    render(<NodeCompleted {...defaultProps} />);

    const spaceContainer = screen
      .getByText("What is React?")
      .closest("div")?.parentElement;
    expect(spaceContainer).toHaveClass("space-y-3");
  });

  it("handles multiple clicks on branch button", () => {
    const mockOnBranchCreate = jest.fn();
    render(
      <NodeCompleted {...defaultProps} onBranchCreate={mockOnBranchCreate} />
    );

    const branchButton = screen.getByTestId("branch-button");

    fireEvent.click(branchButton);
    fireEvent.click(branchButton);
    fireEvent.click(branchButton);

    expect(mockOnBranchCreate).toHaveBeenCalledTimes(3);
  });
});
