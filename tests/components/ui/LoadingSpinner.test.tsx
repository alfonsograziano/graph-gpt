import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../../../src/components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders spinner with default size", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner.querySelector("svg")).toHaveClass("h-8", "w-8");
  });

  it("renders spinner with small size", () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner.querySelector("svg")).toHaveClass("h-4", "w-4");
  });

  it("renders spinner with medium size", () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner.querySelector("svg")).toHaveClass("h-8", "w-8");
  });

  it("renders spinner with large size", () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner.querySelector("svg")).toHaveClass("h-12", "w-12");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toHaveClass("custom-class");
  });

  it("has proper accessibility attributes", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toHaveClass("flex", "items-center", "justify-center");
  });

  it("spinner has animation class", () => {
    render(<LoadingSpinner />);
    const svg = screen
      .getByRole("status", { hidden: true })
      .querySelector("svg");
    expect(svg).toHaveClass("animate-spin");
  });

  it("spinner has blue color", () => {
    render(<LoadingSpinner />);
    const svg = screen
      .getByRole("status", { hidden: true })
      .querySelector("svg");
    expect(svg).toHaveClass("text-blue-600");
  });
});
