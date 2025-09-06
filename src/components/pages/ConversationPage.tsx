"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { EditableTitle } from "@/components/ui/EditableTitle";
import { Button } from "@/components/ui/Button";
import { StreamingToggle } from "@/components/ui/StreamingToggle";
import { useConversationContext } from "@/context";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Node } from "@/types";

export const ConversationPage: React.FC = () => {
  const router = useRouter();
  const {
    conversation,
    isLoading,
    activeNodePath,
    updateConversation,
    updateNodePosition,
    setActiveNodePath,
    createNodeAtPosition,
  } = useConversationContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
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

  useEffect(() => {
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
    <div className="h-screen bg-gray-50">
      {isLoading || !conversation ? (
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      ) : (
        <GraphCanvas
          conversation={conversation}
          activeNodePath={activeNodePath}
          onNodeClick={handleNodeClick}
          onNodePositionUpdate={handleNodePositionUpdate}
          createNodeAtPosition={createNodeAtPosition}
          conversationTitle={conversation.title}
          onBackToHome={handleBackToHome}
          onTitleEdit={() => setIsEditingTitle(true)}
          onTitleCancel={handleTitleCancel}
          isEditingTitle={isEditingTitle}
        />
      )}

      {/* Streaming Toggle */}
      <StreamingToggle />
    </div>
  );
};
