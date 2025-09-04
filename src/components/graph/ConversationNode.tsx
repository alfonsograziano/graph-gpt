"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Node } from "@/types";
import { NodeInput } from "./NodeInput";

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
          <div className="p-4 min-w-[300px]">
            <NodeInput
              onSubmit={handleMessageSubmit}
              placeholder="What do you have in mind?"
            />
          </div>
        );
      case "loading":
        return (
          <div className="p-4 min-w-[300px]">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {node.userMessage}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Generating...</span>
              </div>
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="p-4 min-w-[300px]">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {node.userMessage}
              </div>
              <div className="text-sm text-gray-600">
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

  return (
    <div
      className={`bg-gray-200 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={handleNodeClick}
    >
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
