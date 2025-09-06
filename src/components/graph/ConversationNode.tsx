"use client";

import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Node } from "@/types";
import { NodeInput } from "./NodeInput";
import { NodeLoading } from "./NodeLoading";
import { NodeCompleted } from "./NodeCompleted";
import { DeleteButton } from "./DeleteButton";

interface ConversationNodeProps {
  node: Node;
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onMessageSubmit?: (message: string, nodeId: string) => void;
  onBranchCreate?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  isStreaming?: boolean;
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({
  node,
  isActive: propIsActive,
  onNodeClick,
  onMessageSubmit,
  onBranchCreate,
  onNodeDelete,
  isStreaming = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use the isActive prop directly, defaulting to false if undefined
  const isActive = propIsActive ?? false;
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

  const handleMessageSubmit = (message: string) => {
    if (onMessageSubmit) {
      onMessageSubmit(message, node.id);
    }
  };

  const handleBranchCreate = () => {
    if (onBranchCreate) {
      onBranchCreate(node.id);
    }
  };

  const handleNodeDelete = () => {
    if (onNodeDelete) {
      onNodeDelete(node.id);
    }
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case "input":
        return (
          <div className="p-4 w-[600px] transition-all duration-300 ease-in-out">
            <NodeInput
              onSubmit={handleMessageSubmit}
              placeholder="What do you have in mind?"
            />
          </div>
        );
      case "loading":
        return <NodeLoading message={node.userMessage || ""} />;
      case "completed":
        return (
          <NodeCompleted
            userMessage={node.userMessage || ""}
            assistantResponse={node.assistantResponse}
            isActive={isActive}
            onBranchCreate={handleBranchCreate}
            isStreaming={isStreaming}
            isHovered={isHovered}
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
          return `${baseClasses} ${inactiveClasses} bg-gray-200`;
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
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      {renderNodeContent()}
      {node.type === "completed" && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-gray-400"
        />
      )}

      <DeleteButton
        onDelete={handleNodeDelete}
        isVisible={isHovered}
        nodeId={node.id}
      />
    </div>
  );
};
