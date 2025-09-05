"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { EditableTitle } from "@/components/ui/EditableTitle";
import { Button } from "@/components/ui/Button";
import { useConversation } from "@/hooks/useConversation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Node, ChatRequest } from "@/types";
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
    updateConversation,
    createBranch,
    deleteNode,
    updateNodePosition,
  } = useConversation(conversationId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(conversation?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

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

  const handleMessageSubmit = async (message: string, nodeId: string) => {
    if (!conversation || isSubmittingMessage) return;

    setIsSubmittingMessage(true);

    try {
      // Find the specific node that submitted the message and update its type to "loading"
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
        nodes: updatedNodes,
        metadata: {
          ...conversation.metadata,
          lastActiveNodeId: nodeId,
        },
      });

      // Get conversation context for the API call
      const context = contextService.getConversationContext(
        conversation,
        nodeId
      );

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
        nodes: finalUpdatedNodes,
        metadata: {
          ...conversation.metadata,
          lastActiveNodeId: nodeId,
        },
      });
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
            onMessageSubmit={handleMessageSubmit}
            onBranchCreate={handleBranchCreate}
            onNodeDelete={handleNodeDelete}
            onNodePositionUpdate={handleNodePositionUpdate}
          />
        )}
      </div>
    </div>
  );
};
