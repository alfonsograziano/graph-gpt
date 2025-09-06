"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { ConversationContextType } from "@/types";
import { useConversation } from "@/hooks/useConversation";

// Create the context
const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

// Provider component
interface ConversationProviderProps {
  children: ReactNode;
  conversationId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
  conversationId,
}) => {
  // Use the existing working hook
  const conversationHook = useConversation(conversationId);

  // Local state for UI-specific features
  const [streamingEnabled, setStreamingEnabled] = useState(false);

  // Load streaming preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("streaming-enabled");
    if (savedPreference !== null) {
      setStreamingEnabled(savedPreference === "true");
    }
  }, []);

  // Save streaming preference to localStorage when changed
  const handleStreamingToggle = (enabled: boolean) => {
    setStreamingEnabled(enabled);
    localStorage.setItem("streaming-enabled", enabled.toString());
  };

  // Map the hook's return type to our context type
  const contextValue: ConversationContextType = {
    // State
    conversation: conversationHook.conversation,
    isLoading: conversationHook.isLoading,
    error: conversationHook.error,
    activeNodePath: conversationHook.activeNodePath,
    streamingEnabled,

    // Actions - map to existing hook methods
    loadConversation: async (id: string) => {
      // The hook automatically loads on mount, but we can provide this for manual refresh
      await conversationHook.refetch();
    },
    updateConversation: conversationHook.updateConversation,
    setActiveNodePath: (nodeId: string | null) => {
      if (nodeId) {
        conversationHook.setActiveNodePath(nodeId);
      } else {
        conversationHook.clearActivePath();
      }
    },
    setLoading: (loading: boolean) => {
      // The hook manages loading state internally, but we can provide this for edge cases
      console.warn(
        "setLoading called - loading state is managed internally by the hook"
      );
    },
    setError: (error: string | null) => {
      // The hook manages error state internally, but we can provide this for edge cases
      console.warn(
        "setError called - error state is managed internally by the hook"
      );
    },
    createBranch: async (nodeId: string, parentNodeHeight?: number) => {
      await conversationHook.createBranch(nodeId, parentNodeHeight);
    },
    createDirectionalBranch: async (
      parentNodeId: string,
      direction: "left" | "right",
      elementType: string,
      content: React.ReactNode,
      handleId: string,
      parentNodeHeight?: number,
      handleYOffset?: number
    ) => {
      await conversationHook.createDirectionalBranch(
        parentNodeId,
        direction,
        elementType,
        content,
        handleId,
        parentNodeHeight,
        handleYOffset
      );
    },
    deleteNode: conversationHook.deleteNode,
    updateNodePosition: conversationHook.updateNodePosition,

    // UI Actions
    updateTitle: async (title: string) => {
      if (conversationHook.conversation) {
        await conversationHook.updateConversation({
          ...conversationHook.conversation,
          title,
        });
      }
    },
    setStreamingEnabled: handleStreamingToggle,
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

// Custom hook to use the context
export const useConversationContext = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversationContext must be used within a ConversationProvider"
    );
  }
  return context;
};
