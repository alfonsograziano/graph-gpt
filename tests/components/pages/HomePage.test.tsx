import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { HomePage } from "../../../src/components/pages/HomePage";
import { FrontendConversationService } from "../../../src/services/frontendConversationService";
import { Conversation } from "../../../src/types";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the conversation service
jest.mock("../../../src/services/frontendConversationService", () => ({
  FrontendConversationService: {
    getConversations: jest.fn(),
    createConversation: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Test Conversation 1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    nodes: [],
    edges: [],
    metadata: { nodeCount: 5, tags: [] },
  },
  {
    id: "2",
    title: "Test Conversation 2",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-04"),
    nodes: [],
    edges: [],
    metadata: { nodeCount: 3, tags: [] },
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders loading state initially", () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HomePage />);
    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  it("renders conversations list when data is loaded", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue(mockConversations);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Conversations")).toBeInTheDocument();
      expect(screen.getByText("Test Conversation 1")).toBeInTheDocument();
      expect(screen.getByText("Test Conversation 2")).toBeInTheDocument();
    });
  });

  it("renders empty state when no conversations exist", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue([]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Start a new conversation to begin exploring ideas with AI"
        )
      ).toBeInTheDocument();
    });
  });

  it("renders error state when API call fails", async () => {
    const errorMessage = "Failed to load conversations";
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockRejectedValue(new Error(errorMessage));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("creates new conversation and navigates to it", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue([]);
    const newConversation = {
      id: "3",
      title: `New Conversation ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [],
      edges: [],
      metadata: { nodeCount: 0, tags: [] },
    };
    (
      FrontendConversationService.createConversation as jest.Mock
    ).mockResolvedValue(newConversation);

    render(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Create Your First Conversation")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create Your First Conversation"));

    await waitFor(() => {
      expect(
        FrontendConversationService.createConversation
      ).toHaveBeenCalledWith(
        `New Conversation ${new Date().toLocaleDateString()}`
      );
      expect(mockPush).toHaveBeenCalledWith("/chat/3");
    });
  });

  it("navigates to conversation when card is clicked", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue(mockConversations);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Test Conversation 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Test Conversation 1"));

    expect(mockPush).toHaveBeenCalledWith("/chat/1");
  });

  it("shows retry button in error state", async () => {
    (FrontendConversationService.getConversations as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockConversations);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() => {
      expect(screen.getByText("Test Conversation 1")).toBeInTheDocument();
    });
  });

  it("displays conversation count correctly", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue(mockConversations);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2 conversations")).toBeInTheDocument();
    });
  });

  it("displays single conversation count correctly", async () => {
    (
      FrontendConversationService.getConversations as jest.Mock
    ).mockResolvedValue([mockConversations[0]]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("1 conversation")).toBeInTheDocument();
    });
  });
});
