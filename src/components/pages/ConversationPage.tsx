"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { EditableTitle } from "@/components/ui/EditableTitle";
import { Button } from "@/components/ui/Button";
import { StreamingToggle } from "@/components/ui/StreamingToggle";
import { useConversation } from "@/hooks/useConversation";
import { useLLMStream } from "@/hooks/useLLMStream";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Node, ChatRequest, StreamingChatRequest } from "@/types";
import { apiClient } from "@/services/apiClient";
import { contextService } from "@/services/contextService";

interface ConversationPageProps {
  conversationId: string;
}

export const ConversationPage: React.FC<ConversationPageProps> = ({
  conversationId,
}) => {
  const router = useRouter();
  const {
    conversation,
    isLoading,
    activeNodePath,
    updateConversation,
    createBranch,
    createDirectionalBranch,
    deleteNode,
    updateNodePosition,
    setActiveNodePath,
  } = useConversation(conversationId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(conversation?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamingNodeId, setStreamingNodeId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const hasUpdatedToStreaming = useRef(false);
  const streamingNodeIdRef = useRef<string | null>(null);
  const streamingMessageRef = useRef<string>("");

  // Define streaming handlers first
  const handleStreamingComplete = async (fullContent: string) => {
    const currentNodeId = streamingNodeIdRef.current;
    if (!conversation || !currentNodeId) return;

    try {
      // Update the node with the complete streaming response
      const finalUpdatedNodes = conversation.nodes.map((node) => {
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
      });
      // Update the database
      await updateConversation({
        ...conversation,
        nodes: finalUpdatedNodes,
        metadata: {
          ...conversation.metadata,
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
    if (!conversation || !currentNodeId) return;

    try {
      // Update node to show error state
      const errorNodes = conversation.nodes.map((node) => {
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
      await updateConversation({
        ...conversation,
        nodes: errorNodes,
        metadata: {
          ...conversation.metadata,
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

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleTitleSave = async (newTitle: string) => {
    if (newTitle.trim() === conversation?.title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateConversation({ title: newTitle });
      setTitle(newTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      // Revert title on error
      setTitle(conversation?.title || "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleCancel = () => {
    setTitle(conversation?.title || "");
    setIsEditingTitle(false);
  };

  const handleBranchCreate = async (
    nodeId: string,
    parentNodeHeight?: number
  ) => {
    if (!conversation) return;

    try {
      await createBranch(nodeId, parentNodeHeight);
    } catch (error) {
      console.error("Failed to create branch:", error);
    }
  };

  const handleMarkdownBranchCreate = async (
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    parentNodeId: string,
    handleId: string
  ) => {
    if (!conversation) return;

    try {
      // Get the parent node to access its height
      const parentNode = conversation.nodes.find(
        (node) => node.id === parentNodeId
      );
      const parentNodeHeight = parentNode ? 100 : undefined; // Default height, could be improved

      await createDirectionalBranch(
        parentNodeId,
        direction,
        elementType,
        content,
        handleId,
        parentNodeHeight
      );
    } catch (error) {
      console.error("Failed to create markdown branch:", error);
    }
  };

  const handleNodeDelete = async (nodeId: string) => {
    if (!conversation) return;

    try {
      await deleteNode(nodeId);
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  const handleNodePositionUpdate = async (
    nodeId: string,
    position: { x: number; y: number }
  ) => {
    if (!conversation) return;

    try {
      await updateNodePosition(nodeId, position);
    } catch (error) {
      console.error("Failed to update node position:", error);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setActiveNodePath(nodeId);
  };

  const handleMessageChange = () => {
    // No-op: We don't need to update the conversation on every keystroke
    // The userMessage will be set when the form is submitted
  };

  const handleMessageSubmit = async (message: string, nodeId: string) => {
    if (!conversation || isSubmittingMessage) return;

    setIsSubmittingMessage(true);

    try {
      // Get conversation context for the API call
      const context = contextService.getConversationContext(
        conversation,
        nodeId
      );

      if (streamingEnabled) {
        // Handle streaming request
        setStreamingNodeId(nodeId);
        streamingNodeIdRef.current = nodeId;
        streamingMessageRef.current = message;

        // Update node to generating state
        const generatingNodes = conversation.nodes.map((node) => {
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
        });

        await updateConversation({
          ...conversation,
          nodes: generatingNodes,
          metadata: {
            ...conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });

        // Create streaming chat request
        const streamingRequest: StreamingChatRequest = {
          message,
          context,
          nodeId,
          conversationId: conversation.id,
          streaming: true,
        };

        // Reset the streaming state flag
        hasUpdatedToStreaming.current = false;

        // Start streaming
        await startStream(streamingRequest);
      } else {
        // Handle non-streaming request (existing logic)
        const updatedNodes = conversation.nodes.map((node) => {
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

        await updateConversation({
          ...conversation,
          nodes: updatedNodes,
          metadata: {
            ...conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });

        // Create chat request
        const chatRequest: ChatRequest = {
          message,
          context,
          nodeId,
          conversationId: conversation.id,
        };

        // Send request to chat API
        const response = await apiClient.sendChatRequest(chatRequest);

        // Update the node with the assistant response
        const finalUpdatedNodes = conversation.nodes.map((node) => {
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
        });

        await updateConversation({
          ...conversation,
          nodes: finalUpdatedNodes,
          metadata: {
            ...conversation.metadata,
            lastActiveNodeId: nodeId,
          },
        });
      }
    } catch (error) {
      console.error("Failed to submit message:", error);

      // Update node to show error state
      const errorNodes = conversation.nodes.map((node) => {
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

      await updateConversation({
        ...conversation,
        nodes: errorNodes,
        metadata: {
          ...conversation.metadata,
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
      if (streamingNodeId && conversation && !hasUpdatedToStreaming.current) {
        hasUpdatedToStreaming.current = true;

        const updatedNodes = conversation.nodes.map((node: Node) => {
          if (node.id === streamingNodeId) {
            return {
              ...node,
              type: "streaming" as const,
              updatedAt: new Date(),
            };
          }
          return node;
        });

        // Update database to show streaming state
        updateConversation({
          nodes: updatedNodes,
          metadata: {
            ...conversation.metadata,
            lastActiveNodeId: streamingNodeId,
          },
        });
      }
    }
  }, [hookStreamingContent, streamingNodeId, conversation, updateConversation]);

  // Reset streaming content when streaming stops
  useEffect(() => {
    if (!isStreaming && !isGenerating) {
      setStreamingContent("");
    }
  }, [isStreaming, isGenerating]);

  useEffect(() => {
    setTitle(conversation?.title || "");

    // If conversation has no nodes, create a default input node
    if (conversation && conversation.nodes.length === 0) {
      const defaultNode: Node = {
        id: "default-input-node",
        conversationId: conversation.id,
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position: { x: 400, y: 300 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateConversation({
        nodes: [defaultNode],
        metadata: {
          ...conversation.metadata,
          nodeCount: 1,
          lastActiveNodeId: defaultNode.id,
        },
      }).catch(console.error);
    }
  }, [conversation, updateConversation]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Button>
          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <EditableTitle
                value={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                isLoading={isSaving}
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {title}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        {isLoading || !conversation ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <GraphCanvas
            conversation={conversation}
            activeNodePath={activeNodePath}
            onNodeClick={handleNodeClick}
            onMessageSubmit={handleMessageSubmit}
            onMessageChange={handleMessageChange}
            onBranchCreate={handleBranchCreate}
            onMarkdownBranchCreate={handleMarkdownBranchCreate}
            onNodeDelete={handleNodeDelete}
            onNodePositionUpdate={handleNodePositionUpdate}
            streamingNodeId={streamingNodeId}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
          />
        )}
      </div>

      {/* Streaming Toggle */}
      <StreamingToggle
        enabled={streamingEnabled}
        onToggle={setStreamingEnabled}
      />
    </div>
  );
};
