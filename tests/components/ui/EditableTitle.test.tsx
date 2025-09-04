import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditableTitle } from "@/components/ui/EditableTitle";

// Mock the Button and LoadingSpinner components
jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: ({ size }: any) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

describe("EditableTitle", () => {
  const defaultProps = {
    value: "Test Title",
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input with initial value", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("selects all text when focused", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    expect(input).toHaveFocus();
  });

  it("calls onSave when Enter key is pressed", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "New Title" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onSave).toHaveBeenCalledWith("New Title");
  });

  it("calls onCancel when Escape key is pressed", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("calls onSave when Save button is clicked", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "New Title" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith("New Title");
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(<EditableTitle {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("updates input value when typing", () => {
    render(<EditableTitle {...defaultProps} />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "New Title" } });

    expect(input).toHaveValue("New Title");
  });

  it("respects maxLength prop", () => {
    render(<EditableTitle {...defaultProps} maxLength={10} />);

    const input = screen.getByDisplayValue("Test Title");
    const longValue = "This is a very long title that exceeds max length";
    fireEvent.change(input, { target: { value: longValue } });

    // The component should not update the input value when maxLength is exceeded
    expect(input).toHaveValue("Test Title");
  });

  it("disables Save button when value is empty", () => {
    render(<EditableTitle {...defaultProps} value="" />);

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("disables Save button when value is unchanged", () => {
    render(<EditableTitle {...defaultProps} value="Test Title" />);

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("enables Save button when value is changed", () => {
    render(<EditableTitle {...defaultProps} value="Test Title" />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "New Title" } });

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();
  });

  it("shows loading state when isLoading is true", () => {
    render(<EditableTitle {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    // When loading, the Save button shows the loading spinner instead of text
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("disables input when loading", () => {
    render(<EditableTitle {...defaultProps} isLoading={true} />);

    const input = screen.getByDisplayValue("Test Title");
    expect(input).toBeDisabled();
  });

  it("disables buttons when loading", () => {
    render(<EditableTitle {...defaultProps} isLoading={true} />);

    // When loading, the Save button shows loading spinner, Cancel button should be disabled
    const cancelButton = screen.getByText("Cancel");
    const saveButton = screen.getByRole("button", { name: /loading/i });

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("shows placeholder text", () => {
    render(<EditableTitle {...defaultProps} placeholder="Enter title..." />);

    const input = screen.getByPlaceholderText("Enter title...");
    expect(input).toBeInTheDocument();
  });

  it("trims whitespace when saving", () => {
    render(<EditableTitle {...defaultProps} value="Test Title" />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "  New Title  " } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith("New Title");
  });

  it("does not save if trimmed value is empty", () => {
    render(<EditableTitle {...defaultProps} value="Test Title" />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "   " } });

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("does not save if trimmed value equals original", () => {
    render(<EditableTitle {...defaultProps} value="Test Title" />);

    const input = screen.getByDisplayValue("Test Title");
    fireEvent.change(input, { target: { value: "  Test Title  " } });

    const saveButton = screen.getByText("Save");
    // Save button should be disabled when trimmed value equals original
    expect(saveButton).toBeDisabled();
  });
});
