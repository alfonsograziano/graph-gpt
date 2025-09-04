"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "../../types";
import { FrontendConversationService } from "../../services/frontendConversationService";
import { ConversationCard } from "../ui/ConversationCard";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const HomePage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await FrontendConversationService.getConversations();
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const title = `New Conversation ${new Date().toLocaleDateString()}`;
      const newConversation =
        await FrontendConversationService.createConversation(title);

      // Navigate to the new conversation
      router.push(`/chat/${newConversation.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation"
      );
      setIsCreating(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No conversations yet
      </h3>
      <p className="text-gray-500 mb-6">
        Start a new conversation to begin exploring ideas with AI
      </p>
      <Button onClick={handleCreateConversation} isLoading={isCreating}>
        Create Your First Conversation
      </Button>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <Button onClick={loadConversations} variant="outline">
        Try Again
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Conversations
              </h1>
              <p className="mt-2 text-gray-600">
                {conversations.length === 0
                  ? "Start exploring ideas with AI"
                  : `${conversations.length} conversation${
                      conversations.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>
            <Button
              onClick={handleCreateConversation}
              isLoading={isCreating}
              size="lg"
            >
              New Conversation
            </Button>
          </div>
        </div>

        {/* Content */}
        {conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conversation, index) => (
              <ConversationCard
                key={conversation.id || `conversation-${index}`}
                conversation={conversation}
                onClick={handleConversationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
