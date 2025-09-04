import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NodeInput } from "@/components/graph/NodeInput";

describe("NodeInput", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input field with default placeholder", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText("What do you have in mind?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("renders input field with custom placeholder", () => {
    render(
      <NodeInput onSubmit={mockOnSubmit} placeholder="Custom placeholder" />
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });

  it("handles text input changes", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    fireEvent.change(input, { target: { value: "Test message" } });

    expect(input).toHaveValue("Test message");
  });

  it("calls onSubmit when form is submitted", async () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  it("calls onSubmit when Enter key is pressed", async () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  it("does not submit when Shift+Enter is pressed", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("clears input after successful submission", async () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("disables submit button when input is empty", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: "Send" });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when input has text", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const submitButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(input, { target: { value: "Test message" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("disables input and submit button when disabled prop is true", () => {
    render(<NodeInput onSubmit={mockOnSubmit} disabled={true} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const submitButton = screen.getByRole("button", { name: "Send" });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("does not submit when disabled", () => {
    render(<NodeInput onSubmit={mockOnSubmit} disabled={true} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.submit(form!);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("trims whitespace from submitted message", async () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "  Test message  " } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  it("does not submit empty or whitespace-only messages", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const form = input.closest("form");

    // Test empty message
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.submit(form!);
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Test whitespace-only message
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form!);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("has proper focus management", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    expect(input).toHaveFocus();
  });

  it("applies proper styling classes", () => {
    render(<NodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("What do you have in mind?");
    const submitButton = screen.getByRole("button", { name: "Send" });

    expect(input).toHaveClass(
      "flex-1",
      "px-3",
      "py-2",
      "text-sm",
      "border",
      "border-gray-300",
      "rounded-lg",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500",
      "focus:border-transparent"
    );

    expect(submitButton).toHaveClass(
      "inline-flex",
      "items-center",
      "justify-center"
    );
  });
});
