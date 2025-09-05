"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Node } from "@/types";
import { NodeInput } from "./NodeInput";
import { NodeLoading } from "./NodeLoading";
import { NodeCompleted } from "./NodeCompleted";

interface ConversationNodeProps {
  node: Node;
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onMessageSubmit?: (message: string, nodeId: string) => void;
  onBranchCreate?: (nodeId: string) => void;
  isStreaming?: boolean;
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({
  node,
  isActive = false,
  onNodeClick,
  onMessageSubmit,
  onBranchCreate,
  isStreaming = false,
}) => {
  const handleNodeClick = () => {
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

  const renderNodeContent = () => {
    switch (node.type) {
      case "input":
        return (
          <div className="p-4 min-w-[300px] transition-all duration-300 ease-in-out">
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
          />
        );
      default:
        return (
          <div className="p-4 min-w-[200px]">
            <div className="text-sm text-gray-500">Unknown node type</div>
          </div>
        );
    }
  };

  const getNodeStyling = () => {
    const baseClasses =
      "border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer";
    const activeClasses = isActive ? "ring-2 ring-blue-500" : "";

    switch (node.type) {
      case "input":
        return `${baseClasses} bg-white ${activeClasses}`;
      case "loading":
        return `${baseClasses} bg-gray-200 ${activeClasses}`;
      case "completed":
        // Completed nodes have white background when active, light gray when inactive
        const completedBg = isActive ? "bg-white" : "bg-gray-100";
        return `${baseClasses} ${completedBg} ${activeClasses}`;
      default:
        return `${baseClasses} bg-gray-100 ${activeClasses}`;
    }
  };

  return (
    <div className={getNodeStyling()} onClick={handleNodeClick}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      {renderNodeContent()}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
};
