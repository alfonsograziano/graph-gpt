"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Node } from "@/types";
import { NodeInput } from "./NodeInput";
import { NodeLoading } from "./NodeLoading";

interface ConversationNodeProps {
  node: Node;
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onMessageSubmit?: (message: string) => void;
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({
  node,
  isActive = false,
  onNodeClick,
  onMessageSubmit,
}) => {
  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  const handleMessageSubmit = (message: string) => {
    if (onMessageSubmit) {
      onMessageSubmit(message);
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
        return <NodeLoading message={node.userMessage} />;
      case "completed":
        return (
          <div className="p-4 min-w-[300px] bg-white transition-all duration-300 ease-in-out">
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900 leading-relaxed">
                {node.userMessage}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {node.assistantResponse}
              </div>
            </div>
          </div>
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
        return `${baseClasses} bg-white ${activeClasses}`;
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
