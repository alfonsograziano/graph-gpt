import React from "react";
import { render, screen } from "@testing-library/react";
import { NodeLoading } from "@/components/graph/NodeLoading";

// Mock LoadingSpinner component
jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: ({
    size,
    className,
  }: {
    size?: string;
    className?: string;
  }) => (
    <div data-testid="loading-spinner" data-size={size} className={className}>
      Loading...
    </div>
  ),
}));

describe("NodeLoading", () => {
  const defaultProps = {
    message: "Test message",
  };

  it("renders the submitted message", () => {
    render(<NodeLoading {...defaultProps} />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders loading indicator with correct text", () => {
    render(<NodeLoading {...defaultProps} />);

    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<NodeLoading {...defaultProps} />);

    const container = screen.getByText("Test message").closest("div")
      ?.parentElement?.parentElement;
    expect(container).toHaveClass(
      "bg-gray-200",
      "transition-all",
      "duration-300",
      "ease-in-out"
    );
  });

  it("applies minimum width constraint", () => {
    render(<NodeLoading {...defaultProps} />);

    const container = screen.getByText("Test message").closest("div")
      ?.parentElement?.parentElement;
    expect(container).toHaveClass("min-w-[300px]");
  });

  it("renders with proper spacing and layout", () => {
    render(<NodeLoading {...defaultProps} />);

    const messageContainer = screen
      .getByText("Test message")
      .closest("div")?.parentElement;
    expect(messageContainer).toHaveClass("space-y-3");

    const loadingContainer = screen.getByText("Generating...").closest("div");
    expect(loadingContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "space-x-2"
    );
  });

  it("applies correct text styling", () => {
    render(<NodeLoading {...defaultProps} />);

    const messageElement = screen.getByText("Test message");
    expect(messageElement).toHaveClass(
      "text-sm",
      "font-medium",
      "text-gray-900",
      "leading-relaxed"
    );

    const loadingText = screen.getByText("Generating...");
    expect(loadingText).toHaveClass("text-sm", "text-gray-600", "font-medium");
  });

  it("renders with different message content", () => {
    const customMessage = "Custom loading message";
    render(<NodeLoading message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("renders loading spinner with correct size", () => {
    render(<NodeLoading {...defaultProps} />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveAttribute("data-size", "sm");
  });

  it("maintains consistent layout with long messages", () => {
    const longMessage =
      "This is a very long message that should wrap properly and maintain the layout structure of the loading component without causing any visual issues or layout shifts.";
    render(<NodeLoading message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
    expect(screen.getByText("Generating...")).toBeInTheDocument();

    const container = screen.getByText(longMessage).closest("div")
      ?.parentElement?.parentElement;
    expect(container).toHaveClass("min-w-[300px]");
  });

  it("handles empty message gracefully", () => {
    render(<NodeLoading message="" />);

    // Check that the component renders without errors
    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Check that the container has the right styling
    const container = screen.getByText("Generating...").closest("div")
      ?.parentElement?.parentElement;
    expect(container).toHaveClass("min-w-[300px]", "bg-gray-200");
  });
});
