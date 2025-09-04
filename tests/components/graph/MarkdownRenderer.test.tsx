import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock react-markdown and related modules
jest.mock("react-markdown", () => {
  return function MockReactMarkdown({ children, components }: any) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

jest.mock("remark-gfm", () => ({}));
jest.mock("rehype-highlight", () => ({}));

import { MarkdownRenderer } from "@/components/graph/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders content with markdown processing", () => {
    const content = "This is **bold** text with `code`";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByTestId("markdown-content")).toHaveTextContent(content);
  });

  it("applies custom className", () => {
    const content = "Test content";
    const customClass = "custom-class";
    render(<MarkdownRenderer content={content} className={customClass} />);

    const container = screen
      .getByTestId("markdown-content")
      .closest("div")?.parentElement;
    expect(container).toHaveClass(
      "prose",
      "prose-sm",
      "max-w-none",
      customClass
    );
  });

  it("handles empty content", () => {
    render(<MarkdownRenderer content="" />);

    expect(screen.getByTestId("markdown-content")).toHaveTextContent("");
  });

  it("renders complex markdown content", () => {
    const content =
      "# Title\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2";
    render(<MarkdownRenderer content={content} />);

    // Since we're mocking react-markdown, we just check that the content is passed through
    expect(screen.getByTestId("markdown-content")).toHaveTextContent("# Title");
    expect(screen.getByTestId("markdown-content")).toHaveTextContent(
      "This is **bold** and *italic* text."
    );
  });
});
