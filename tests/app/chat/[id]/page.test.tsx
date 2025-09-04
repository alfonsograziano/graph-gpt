import React from "react";
import { render, screen } from "@testing-library/react";
import { notFound, redirect } from "next/navigation";
import ChatPage from "@/app/chat/[id]/page";
import { conversationService } from "@/services/conversationService";
import { Conversation } from "@/types";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock the conversation service
jest.mock("@/services/conversationService", () => ({
  conversationService: {
    getConversation: jest.fn(),
  },
}));

// Mock the ConversationPage component
jest.mock("@/components/pages/ConversationPage", () => ({
  ConversationPage: ({ conversation }: { conversation: Conversation }) => (
    <div data-testid="conversation-page">
      Conversation: {conversation.title}
    </div>
  ),
}));

const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  nodes: [],
  edges: [],
  metadata: {},
};

describe("ChatPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders ConversationPage when conversation is found", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );

    const Page = await ChatPage({ params: { id: "conv-1" } });
    render(Page);

    expect(screen.getByTestId("conversation-page")).toBeInTheDocument();
    expect(
      screen.getByText("Conversation: Test Conversation")
    ).toBeInTheDocument();
    expect(conversationService.getConversation).toHaveBeenCalledWith("conv-1");
  });

  it("calls notFound when conversation is null", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(null);

    await ChatPage({ params: { id: "conv-1" } });

    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when conversation is undefined", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      undefined
    );

    await ChatPage({ params: { id: "conv-1" } });

    expect(notFound).toHaveBeenCalled();
  });

  it("redirects to home when service throws error", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (conversationService.getConversation as jest.Mock).mockRejectedValue(
      new Error("Service error")
    );

    await ChatPage({ params: { id: "conv-1" } });

    expect(redirect).toHaveBeenCalledWith("/");
    expect(consoleError).toHaveBeenCalledWith(
      "Error loading conversation:",
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it("handles different conversation IDs", async () => {
    (conversationService.getConversation as jest.Mock).mockResolvedValue(
      mockConversation
    );

    await ChatPage({ params: { id: "different-id" } });

    expect(conversationService.getConversation).toHaveBeenCalledWith(
      "different-id"
    );
  });
});
