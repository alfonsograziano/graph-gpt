import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@/types";
import { FrontendConversationService } from "@/services/frontendConversationService";

interface UseConversationReturn {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConversation: (updates: Partial<Conversation>) => Promise<void>;
}

export const useConversation = (id: string): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await FrontendConversationService.getConversation(id);
      setConversation(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversation";
      setError(errorMessage);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateConversation = async (updates: Partial<Conversation>) => {
    if (!conversation) return;

    try {
      const updatedConversation =
        await FrontendConversationService.updateConversation(
          conversation.id,
          updates
        );
      setConversation(updatedConversation);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update conversation";
      setError(errorMessage);
      throw err; // Re-throw to allow component to handle the error
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [id, fetchConversation]);

  return {
    conversation,
    isLoading,
    error,
    refetch: fetchConversation,
    updateConversation,
  };
};
