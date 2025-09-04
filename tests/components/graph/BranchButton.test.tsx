import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BranchButton } from "@/components/graph/BranchButton";

describe("BranchButton", () => {
  it("renders the button with correct accessibility attributes", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Create new branch");
    expect(button).toHaveAttribute("title", "Create new branch");
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("renders the plus icon", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("w-4", "h-4", "text-gray-600");
  });

  it("applies correct styling classes", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    expect(button).toHaveClass(
      "w-8",
      "h-8",
      "rounded-full",
      "border-2",
      "border-gray-300",
      "bg-white",
      "flex",
      "items-center",
      "justify-center",
      "hover:border-blue-500",
      "hover:bg-blue-50",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500",
      "focus:ring-offset-2",
      "active:bg-blue-100",
      "active:border-blue-600",
      "transition-all",
      "duration-200",
      "ease-in-out",
      "shadow-sm",
      "hover:shadow-md",
      "cursor-pointer"
    );
  });

  it("handles disabled state correctly", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    expect(button).not.toHaveClass("cursor-pointer");
  });

  it("does not call onClick when disabled and clicked", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies disabled styling when disabled", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    expect(button).toHaveClass(
      "hover:border-gray-300",
      "hover:bg-white",
      "hover:shadow-sm"
    );
  });

  it("is enabled by default", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass("cursor-pointer");
  });

  it("can be focused and maintains focus", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });

    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
  });

  it("maintains focus styles when focused", () => {
    const mockOnClick = jest.fn();
    render(<BranchButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Create new branch" });
    button.focus();

    expect(button).toHaveClass(
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500",
      "focus:ring-offset-2"
    );
  });
});
