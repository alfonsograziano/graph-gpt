"use client";

import React, { useState, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { Node } from "@/types";
import { useConversationContext } from "@/context";
import { NodeInput } from "./NodeInput";
import { NodeLoading } from "./NodeLoading";
import { NodeCompleted } from "./NodeCompleted";
import { DeleteButton } from "./DeleteButton";
import { UserMessage } from "./UserMessage";
import { ContextBanner } from "./ContextBanner";
import { findContextSnippetForNode } from "@/utils/graphUtils";

interface ConversationNodeProps {
  node: Node;
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  nodeHeight?: number;
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({
  node,
  isActive: propIsActive,
  onNodeClick,
  nodeHeight,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    conversation,
    handleMessageSubmit,
    createBranch,
    createDirectionalBranch,
    deleteNode,
    streamingContent,
  } = useConversationContext();

  // Use the isActive prop directly, defaulting to false if undefined
  const isActive = propIsActive ?? false;

  // Find context snippet for this node if it has incoming edges
  const contextSnippet = conversation
    ? findContextSnippetForNode(conversation, node.id)
    : undefined;
  const handleNodeClick = (e: React.MouseEvent) => {
    // Don't trigger node click if clicking on buttons
    // But allow clicks on input fields to still activate the node
    if (
      e.target instanceof HTMLButtonElement ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  const handleMessageSubmitLocal = useCallback(
    (message: string) => {
      handleMessageSubmit(message, node.id);
    },
    [handleMessageSubmit, node.id]
  );

  const handleMessageChange = useCallback(() => {
    // No-op: We don't need to update the conversation on every keystroke
    // The userMessage will be set when the form is submitted
  }, []);

  const handleBranchCreate = useCallback(() => {
    createBranch(node.id, nodeHeight);
  }, [createBranch, node.id, nodeHeight]);

  const handleNodeDelete = useCallback(() => {
    deleteNode(node.id);
  }, [deleteNode, node.id]);

  const handleMarkdownBranchCreate = useCallback(
    (
      direction: "left" | "right",
      elementType: string,
      content: React.ReactNode,
      parentNodeId: string,
      handleId: string,
      handleYOffset?: number
    ) => {
      createDirectionalBranch(
        parentNodeId,
        direction,
        elementType,
        content,
        handleId,
        undefined, // parentNodeHeight
        handleYOffset
      );
    },
    [createDirectionalBranch]
  );

  const renderNodeContent = () => {
    switch (node.type) {
      case "input":
        return (
          <div className="p-4 w-[600px] transition-all duration-300 ease-in-out">
            <NodeInput
              onSubmit={handleMessageSubmitLocal}
              onInputChange={handleMessageChange}
              placeholder="What do you have in mind?"
            />
          </div>
        );
      case "loading":
        return <NodeLoading message={node.userMessage || ""} />;
      case "generating":
        return (
          <div className="p-4 w-[600px]">
            <div className="space-y-3">
              {/* User Message */}
              <UserMessage message={node.userMessage || ""} />

              {/* Separator */}
              <div className="border-t border-gray-200 my-3"></div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              <span className="text-sm">Generating response...</span>
            </div>
          </div>
        );
      case "streaming":
        return (
          <NodeCompleted
            userMessage={node.userMessage || ""}
            assistantResponse={streamingContent || node.assistantResponse}
            onMarkdownBranchCreate={handleMarkdownBranchCreate}
            isHovered={isHovered}
            parentNodeId={node.id}
          />
        );
      case "completed":
        return (
          <NodeCompleted
            userMessage={node.userMessage || ""}
            assistantResponse={node.assistantResponse}
            onBranchCreate={handleBranchCreate}
            onMarkdownBranchCreate={handleMarkdownBranchCreate}
            isHovered={isHovered}
            parentNodeId={node.id}
          />
        );
      default:
        return (
          <div className="p-4 w-[600px]">
            <div className="text-sm text-gray-500">Unknown node type</div>
          </div>
        );
    }
  };

  const getNodeStyling = () => {
    const baseClasses =
      "border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing";

    if (isActive) {
      const activeClasses =
        "ring-2 ring-blue-500 ring-opacity-50 bg-white border-blue-400 shadow-lg";
      return `${baseClasses} ${activeClasses}`;
    } else {
      const inactiveClasses = "border-gray-300";
      switch (node.type) {
        case "input":
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
        case "loading":
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
        case "generating":
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
        case "streaming":
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
        case "completed":
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
        default:
          return `${baseClasses} ${inactiveClasses} bg-gray-100`;
      }
    }
  };

  return (
    <div
      className={`${getNodeStyling()} relative`}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${node.type} node - drag to move`}
      draggable={true}
    >
      {/* Context Banner - only show if there's a context snippet */}
      {contextSnippet && <ContextBanner contextSnippet={contextSnippet} />}

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      {renderNodeContent()}

      <DeleteButton
        onDelete={handleNodeDelete}
        isVisible={isHovered}
        nodeId={node.id}
      />
    </div>
  );
};
