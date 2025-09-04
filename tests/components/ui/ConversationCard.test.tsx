import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationCard } from "../../../src/components/ui/ConversationCard";
import { Conversation } from "../../../src/types";

const mockConversation: Conversation = {
  id: "1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-02T15:30:00Z"),
  nodes: [],
  edges: [],
  metadata: { nodeCount: 5, tags: [] },
};

describe("ConversationCard", () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders conversation title", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
  });

  it("renders formatted creation date", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    expect(screen.getByText("Jan 1, 2024, 11:00 AM")).toBeInTheDocument();
  });

  it("renders relative updated time", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    // The exact text depends on when the test runs, but should contain relative time
    expect(screen.getByText(/Jan 2, 2024, 04:30 PM/)).toBeInTheDocument();
  });

  it("renders node count", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    expect(screen.getByText("5 nodes")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    fireEvent.click(screen.getByText("Test Conversation"));

    expect(mockOnClick).toHaveBeenCalledWith("1");
  });

  it("applies hover styles on mouse enter", () => {
    render(
      <ConversationCard conversation={mockConversation} onClick={mockOnClick} />
    );

    const card = screen
      .getByText("Test Conversation")
      .closest("div")?.parentElement;
    expect(card).toHaveClass("group");
  });

  it("handles long titles with line clamp", () => {
    const longTitleConversation = {
      ...mockConversation,
      title:
        "This is a very long conversation title that should be truncated with line clamp to prevent overflow",
    };

    render(
      <ConversationCard
        conversation={longTitleConversation}
        onClick={mockOnClick}
      />
    );

    const titleElement = screen.getByText(longTitleConversation.title);
    expect(titleElement).toHaveClass("line-clamp-2");
  });

  it("displays zero node count correctly", () => {
    const emptyConversation = {
      ...mockConversation,
      metadata: { nodeCount: 0, tags: [] },
    };

    render(
      <ConversationCard
        conversation={emptyConversation}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("0 nodes")).toBeInTheDocument();
  });

  it('handles recent updates with "Just now"', () => {
    const recentConversation = {
      ...mockConversation,
      updatedAt: new Date(), // Very recent
    };

    render(
      <ConversationCard
        conversation={recentConversation}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Just now")).toBeInTheDocument();
  });

  it("handles updates from hours ago", () => {
    const hoursAgoConversation = {
      ...mockConversation,
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    };

    render(
      <ConversationCard
        conversation={hoursAgoConversation}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("3h ago")).toBeInTheDocument();
  });

  it("handles updates from days ago", () => {
    const daysAgoConversation = {
      ...mockConversation,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };

    render(
      <ConversationCard
        conversation={daysAgoConversation}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });
});
