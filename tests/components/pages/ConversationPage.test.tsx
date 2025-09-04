import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ConversationPage } from "@/components/pages/ConversationPage";
import { useConversation } from "@/hooks/useConversation";
import { Conversation } from "@/types";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the useConversation hook
jest.mock("@/hooks/useConversation", () => ({
  useConversation: jest.fn(() => ({
    updateConversation: jest.fn(),
  })),
}));

// Mock the GraphCanvas component
jest.mock("@/components/graph/GraphCanvas", () => ({
  GraphCanvas: ({ conversation }: { conversation: Conversation }) => (
    <div data-testid="graph-canvas">Graph Canvas - {conversation.title}</div>
  ),
}));

// Mock the EditableTitle component
jest.mock("@/components/ui/EditableTitle", () => ({
  EditableTitle: ({ value, onSave, onCancel, isLoading }: any) => (
    <div data-testid="editable-title">
      <input
        data-testid="title-input"
        value={value}
        onChange={(e) => {
          /* mock onChange */
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
      />
      <button data-testid="save-button" onClick={() => onSave(value)}>
        Save
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
      {isLoading && <span data-testid="loading">Loading...</span>}
    </div>
  ),
}));

const mockPush = jest.fn();
const mockUpdateConversation = jest.fn();

const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [],
  edges: [],
  metadata: {},
};

describe("ConversationPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useConversation as jest.Mock).mockReturnValue({
      updateConversation: mockUpdateConversation,
    });
  });

  it("renders conversation title and back button", () => {
    render(<ConversationPage conversation={mockConversation} />);

    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    expect(screen.getByText("← Back")).toBeInTheDocument();
  });

  it("renders GraphCanvas with conversation data", () => {
    render(<ConversationPage conversation={mockConversation} />);

    expect(screen.getByTestId("graph-canvas")).toBeInTheDocument();
    expect(
      screen.getByText("Graph Canvas - Test Conversation")
    ).toBeInTheDocument();
  });

  it("navigates back to home when back button is clicked", () => {
    render(<ConversationPage conversation={mockConversation} />);

    fireEvent.click(screen.getByText("← Back"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("enters edit mode when title is clicked", () => {
    render(<ConversationPage conversation={mockConversation} />);

    fireEvent.click(screen.getByText("Test Conversation"));
    expect(screen.getByTestId("editable-title")).toBeInTheDocument();
  });

  it("saves title when save is clicked", async () => {
    mockUpdateConversation.mockResolvedValue(undefined);

    render(<ConversationPage conversation={mockConversation} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Test Conversation"));

    // Change the input value to trigger save
    const input = screen.getByTestId("title-input");
    fireEvent.change(input, { target: { value: "New Title" } });

    // Click save
    fireEvent.click(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(mockUpdateConversation).toHaveBeenCalledWith({
        title: "New Title",
      });
    });
  });

  it("cancels editing when cancel is clicked", () => {
    render(<ConversationPage conversation={mockConversation} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Test Conversation"));

    // Click cancel
    fireEvent.click(screen.getByTestId("cancel-button"));

    // Should be back to display mode
    expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    expect(screen.queryByTestId("editable-title")).not.toBeInTheDocument();
  });

  it("handles title update error gracefully", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockUpdateConversation.mockRejectedValue(new Error("Update failed"));

    render(<ConversationPage conversation={mockConversation} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Test Conversation"));

    // Change the input value to trigger save
    const input = screen.getByTestId("title-input");
    fireEvent.change(input, { target: { value: "New Title" } });

    // Click save
    fireEvent.click(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to update title:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it("does not save if title is unchanged", async () => {
    render(<ConversationPage conversation={mockConversation} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Test Conversation"));

    // Click save without changing title
    fireEvent.click(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(mockUpdateConversation).not.toHaveBeenCalled();
    });
  });
});
