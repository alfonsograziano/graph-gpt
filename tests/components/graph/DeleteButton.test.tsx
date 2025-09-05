import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteButton } from "@/components/graph/DeleteButton";

describe("DeleteButton", () => {
  const mockOnDelete = jest.fn();
  const nodeId = "test-node-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders delete button with correct accessibility attributes", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={true} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute("aria-label", `Delete node ${nodeId}`);
    expect(deleteButton).toHaveAttribute("title", "Delete this node");
  });

  it("shows button when isVisible is true", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={true} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toHaveClass("opacity-100", "scale-100");
    expect(deleteButton).toHaveStyle("pointer-events: auto");
  });

  it("hides button when isVisible is false", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={false} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toHaveClass("opacity-0", "scale-75");
    expect(deleteButton).toHaveStyle("pointer-events: none");
  });

  it("calls onDelete when clicked", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={true} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("prevents event propagation when clicked", () => {
    const mockParentClick = jest.fn();

    render(
      <div onClick={mockParentClick}>
        <DeleteButton
          onDelete={mockOnDelete}
          isVisible={true}
          nodeId={nodeId}
        />
      </div>
    );

    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it("renders delete icon correctly", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={true} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    const icon = deleteButton.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("width", "12");
    expect(icon).toHaveAttribute("height", "12");
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("has correct styling classes", () => {
    render(
      <DeleteButton onDelete={mockOnDelete} isVisible={true} nodeId={nodeId} />
    );

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toHaveClass(
      "absolute",
      "top-2",
      "right-2",
      "w-6",
      "h-6",
      "rounded-full",
      "bg-red-500",
      "hover:bg-red-600",
      "text-white",
      "flex",
      "items-center",
      "justify-center",
      "transition-all",
      "duration-200",
      "ease-in-out"
    );
  });
});
