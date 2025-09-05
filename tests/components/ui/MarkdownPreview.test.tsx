import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownPreview } from "@/components/ui/MarkdownPreview";

// Mock the markdown utilities
jest.mock("@/utils/markdownUtils", () => ({
  analyzeMarkdown: jest.fn(),
  createMarkdownPreview: jest.fn(),
}));

import { analyzeMarkdown, createMarkdownPreview } from "@/utils/markdownUtils";

const mockAnalyzeMarkdown = analyzeMarkdown as jest.MockedFunction<
  typeof analyzeMarkdown
>;
const mockCreateMarkdownPreview = createMarkdownPreview as jest.MockedFunction<
  typeof createMarkdownPreview
>;

describe("MarkdownPreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 10,
      characterCount: 50,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: false,
      hasMath: false,
      headingCount: 1,
      listCount: 0,
      estimatedReadTime: 1,
    });

    mockCreateMarkdownPreview.mockImplementation((content, maxLength) =>
      content.length > maxLength
        ? content.substring(0, maxLength) + "..."
        : content
    );
  });

  it("should render short content without preview", () => {
    const content = "Short content";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 2,
      characterCount: 13,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: false,
      hasMath: false,
      headingCount: 0,
      listCount: 0,
      estimatedReadTime: 1,
    });

    render(<MarkdownPreview content={content} maxPreviewLength={200} />);

    expect(screen.getByText("Short content")).toBeInTheDocument();
    expect(screen.queryByText("Show full content")).not.toBeInTheDocument();
  });

  it("should show preview for long content", () => {
    const content = "Very long content that exceeds the preview length limit";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 10,
      characterCount: 60,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: false,
      hasMath: false,
      headingCount: 0,
      listCount: 0,
      estimatedReadTime: 1,
    });

    mockCreateMarkdownPreview.mockReturnValue("Very long content...");

    render(<MarkdownPreview content={content} maxPreviewLength={20} />);

    expect(screen.getByText("Very long content...")).toBeInTheDocument();
    expect(screen.getByText("Show full content")).toBeInTheDocument();
  });

  it("should toggle between preview and full content", () => {
    const content = "Very long content that exceeds the preview length limit";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 10,
      characterCount: 60,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: false,
      hasMath: false,
      headingCount: 0,
      listCount: 0,
      estimatedReadTime: 1,
    });

    mockCreateMarkdownPreview.mockReturnValue("Very long content...");

    render(<MarkdownPreview content={content} maxPreviewLength={20} />);

    // Initially showing preview
    expect(screen.getByText("Very long content...")).toBeInTheDocument();
    expect(screen.getByText("Show full content")).toBeInTheDocument();

    // Click to show full content
    fireEvent.click(screen.getByText("Show full content"));

    expect(
      screen.getByText(
        "Very long content that exceeds the preview length limit"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Show preview")).toBeInTheDocument();

    // Click to show preview again
    fireEvent.click(screen.getByText("Show preview"));

    expect(screen.getByText("Very long content...")).toBeInTheDocument();
    expect(screen.getByText("Show full content")).toBeInTheDocument();
  });

  it("should display content analysis", () => {
    const content = "Test content";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 2,
      characterCount: 13,
      hasCodeBlocks: true,
      hasImages: true,
      hasLinks: true,
      hasTables: false,
      hasMath: false,
      headingCount: 1,
      listCount: 2,
      estimatedReadTime: 1,
    });

    render(<MarkdownPreview content={content} />);

    expect(screen.getByText("2 words")).toBeInTheDocument();
    expect(screen.getByText("13 characters")).toBeInTheDocument();
    expect(screen.getByText("~1 min read")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("1 headings, 2 lists")).toBeInTheDocument();
  });

  it("should show different analysis badges", () => {
    const content = "Test content";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 2,
      characterCount: 13,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: true,
      hasMath: true,
      headingCount: 0,
      listCount: 0,
      estimatedReadTime: 1,
    });

    render(<MarkdownPreview content={content} />);

    expect(screen.getByText("Tables")).toBeInTheDocument();
    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Images")).not.toBeInTheDocument();
    expect(screen.queryByText("Links")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const content = "Test content";
    const customClass = "custom-preview";

    render(<MarkdownPreview content={content} className={customClass} />);

    const container = screen.getByText("Test content").closest("div");
    expect(container).toHaveClass(customClass);
  });

  it("should use custom maxPreviewLength", () => {
    const content = "Test content";
    const maxLength = 5;

    render(<MarkdownPreview content={content} maxPreviewLength={maxLength} />);

    expect(mockCreateMarkdownPreview).toHaveBeenCalledWith(content, maxLength);
  });

  it("should call analyzeMarkdown with content", () => {
    const content = "Test content";

    render(<MarkdownPreview content={content} />);

    expect(mockAnalyzeMarkdown).toHaveBeenCalledWith(content);
  });

  it("should handle empty content", () => {
    const content = "";
    mockAnalyzeMarkdown.mockReturnValue({
      wordCount: 0,
      characterCount: 0,
      hasCodeBlocks: false,
      hasImages: false,
      hasLinks: false,
      hasTables: false,
      hasMath: false,
      headingCount: 0,
      listCount: 0,
      estimatedReadTime: 0,
    });

    render(<MarkdownPreview content={content} />);

    expect(screen.getByText("0 words")).toBeInTheDocument();
    expect(screen.getByText("0 characters")).toBeInTheDocument();
    expect(screen.getByText("~0 min read")).toBeInTheDocument();
  });
});
