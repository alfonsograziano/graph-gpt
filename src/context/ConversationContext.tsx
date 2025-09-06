"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  ConversationContextType,
  ChatRequest,
  StreamingChatRequest,
  Node,
} from "@/types";
import { useConversation } from "@/hooks/useConversation";
import { useLLMStream } from "@/hooks/useLLMStream";
import { apiClient } from "@/services/apiClient";
import { contextService } from "@/services/contextService";
import { findContextSnippetForNode } from "@/utils/graphUtils";

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
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [streamingNodeId, setStreamingNodeId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const hasUpdatedToStreaming = useRef(false);
  const streamingNodeIdRef = useRef<string | null>(null);
  const streamingMessageRef = useRef<string>("");

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

  // Define streaming handlers
  const handleStreamingComplete = async (fullContent: string) => {
    const currentNodeId = streamingNodeIdRef.current;
    if (!conversationHook.conversation || !currentNodeId) return;

    try {
      // Update the node with the complete streaming response
      const finalUpdatedNodes = conversationHook.conversation.nodes.map(
        (node) => {
          if (node.id === currentNodeId) {
            return {
              ...node,
              type: "completed" as const,
              userMessage: streamingMessageRef.current, // Use the stored message
              assistantResponse: fullContent,
              updatedAt: new Date(),
            };
          }
          return node;
        }
      );
      // Update the database
      await conversationHook.updateConversation({
        ...conversationHook.conversation,
        nodes: finalUpdatedNodes,
        metadata: {
          ...conversationHook.conversation.metadata,
          lastActiveNodeId: currentNodeId,
        },
      });

      // Reset streaming state after database update
      setStreamingNodeId(null);
      streamingNodeIdRef.current = null;
      streamingMessageRef.current = "";
      hasUpdatedToStreaming.current = false;
    } catch (error) {
      console.error("Failed to complete streaming:", error);
      handleStreamingError(
        error instanceof Error
          ? error
          : new Error("Streaming completion failed")
      );
    }
  };

  const handleStreamingError = async (error: Error) => {
    const currentNodeId = streamingNodeIdRef.current;
    if (!conversationHook.conversation || !currentNodeId) return;

    try {
      // Update node to show error state
      const errorNodes = conversationHook.conversation.nodes.map((node) => {
        if (node.id === currentNodeId) {
          return {
            ...node,
            type: "input" as const, // Revert to input state on error
            assistantResponse: `Error: ${error.message}`,
            updatedAt: new Date(),
          };
        }
        return node;
      });

      // Update the database
      await conversationHook.updateConversation({
        ...conversationHook.conversation,
        nodes: errorNodes,
        metadata: {
          ...conversationHook.conversation.metadata,
          lastActiveNodeId: currentNodeId,
        },
      });

      // Reset streaming state
      setStreamingNodeId(null);
      streamingNodeIdRef.current = null;
      streamingMessageRef.current = "";
      hasUpdatedToStreaming.current = false;
    } catch (updateError) {
      console.error("Failed to handle streaming error:", updateError);
    }
  };

  // Initialize streaming hook
  const {
    content: hookStreamingContent,
    isStreaming,
    isGenerating,
    startStream,
    reset: resetStream,
  } = useLLMStream({
    onComplete: handleStreamingComplete,
    onError: handleStreamingError,
  });

  // Message submission function
  const handleMessageSubmit = async (message: string, nodeId: string) => {
    if (!conversationHook.conversation || isSubmittingMessage) return;

    setIsSubmittingMessage(true);

    try {
      // Get conversation context for the API call
      const context = contextService.getConversationContext(
        conversationHook.conversation,
        nodeId
      );

      // Check for context snippet from incoming edges
      const referenceContextSnippet = findContextSnippetForNode(
        conversationHook.conversation,
        nodeId
      );

      if (streamingEnabled) {
        // Handle streaming request
        setStreamingNodeId(nodeId);
        streamingNodeIdRef.current = nodeId;
        streamingMessageRef.current = message;

        // Update node to generating state
        const generatingNodes = conversationHook.conversation.nodes.map(
          (node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                type: "generating" as const,
                userMessage: message,
                assistantResponse: "",
                updatedAt: new Date(),
              };
            }
            return node;
          }
        );

        await conversationHook.updateConversation({
          ...conversationHook.conversation,
          nodes: generatingNodes,
          metadata: {
            ...conversationHook.conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });

        // Create streaming chat request
        const streamingRequest: StreamingChatRequest = {
          message,
          context,
          nodeId,
          conversationId: conversationHook.conversation.id,
          streaming: true,
          referenceContextSnippet,
        };

        // Reset the streaming state flag
        hasUpdatedToStreaming.current = false;

        // Start streaming
        await startStream(streamingRequest);
      } else {
        // Handle non-streaming request (existing logic)
        const updatedNodes = conversationHook.conversation.nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              type: "loading" as const,
              userMessage: message,
              updatedAt: new Date(),
            };
          }
          return node;
        });

        await conversationHook.updateConversation({
          ...conversationHook.conversation,
          nodes: updatedNodes,
          metadata: {
            ...conversationHook.conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });

        // Create chat request
        const chatRequest: ChatRequest = {
          message,
          context,
          nodeId,
          conversationId: conversationHook.conversation.id,
          referenceContextSnippet,
        };

        // Send request to chat API
        const response = await apiClient.sendChatRequest(chatRequest);

        // Update the node with the assistant response
        const finalUpdatedNodes = conversationHook.conversation.nodes.map(
          (node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                type: "completed" as const,
                userMessage: message,
                assistantResponse: response.content,
                updatedAt: new Date(),
              };
            }
            return node;
          }
        );

        await conversationHook.updateConversation({
          ...conversationHook.conversation,
          nodes: finalUpdatedNodes,
          metadata: {
            ...conversationHook.conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });
      }
    } catch (error) {
      console.error("Failed to submit message:", error);

      // Update node to show error state
      const errorNodes = conversationHook.conversation!.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            type: "input" as const, // Revert to input state on error
            userMessage: message,
            assistantResponse: `Error: ${apiClient.handleApiError(error)}`,
            updatedAt: new Date(),
          };
        }
        return node;
      });

      await conversationHook.updateConversation({
        ...conversationHook.conversation!,
        nodes: errorNodes,
        metadata: {
          ...conversationHook.conversation!.metadata,
          lastActiveNodeId: nodeId,
        },
      });
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Reset stream when streamingNodeId is cleared
  useEffect(() => {
    if (!streamingNodeId) {
      resetStream();
      streamingNodeIdRef.current = null;
      streamingMessageRef.current = "";
      hasUpdatedToStreaming.current = false;
    }
  }, [streamingNodeId, resetStream]);

  // Update local streaming content for UI display
  useEffect(() => {
    if (hookStreamingContent) {
      setStreamingContent(hookStreamingContent);

      // Update node to streaming state when content starts arriving
      if (
        streamingNodeId &&
        conversationHook.conversation &&
        !hasUpdatedToStreaming.current
      ) {
        hasUpdatedToStreaming.current = true;

        const updatedNodes = conversationHook.conversation.nodes.map(
          (node: Node) => {
            if (node.id === streamingNodeId) {
              return {
                ...node,
                type: "streaming" as const,
                updatedAt: new Date(),
              };
            }
            return node;
          }
        );

        // Update database to show streaming state
        conversationHook.updateConversation({
          nodes: updatedNodes,
        });
      }
    }
  }, [
    hookStreamingContent,
    streamingNodeId,
    conversationHook.conversation,
    conversationHook.updateConversation,
  ]);

  // Map the hook's return type to our context type
  const contextValue: ConversationContextType = {
    // State
    conversation: conversationHook.conversation,
    isLoading: conversationHook.isLoading,
    error: conversationHook.error,
    activeNodePath: conversationHook.activeNodePath,
    streamingEnabled,
    isSubmittingMessage,
    streamingNodeId,
    streamingContent,
    isStreaming,
    isGenerating,

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
    handleMessageSubmit,
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
