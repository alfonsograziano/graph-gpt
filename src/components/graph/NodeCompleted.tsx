"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BranchButton } from "./BranchButton";
import { UserMessage } from "./UserMessage";

interface NodeCompletedProps {
  userMessage: string;
  assistantResponse: string;
  onBranchCreate?: () => void;
  onMarkdownBranchCreate?: (
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    parentNodeId: string,
    handleId: string
  ) => void;
  isHovered?: boolean;
  parentNodeId?: string;
}

export const NodeCompleted: React.FC<NodeCompletedProps> = ({
  userMessage,
  assistantResponse,
  onBranchCreate,
  onMarkdownBranchCreate,
  isHovered = false,
  parentNodeId,
}) => {
  return (
    <div className="p-4 w-[600px] transition-all duration-300 ease-in-out">
      <div className="space-y-3">
        {/* User Message */}
        <UserMessage message={userMessage} />
        {/* Separator */}
        <div className="border-t border-gray-200 my-3"></div>
        {/* Assistant Response with Markdown */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <MarkdownRenderer
            content={assistantResponse}
            isStreaming={false}
            onBranchCreate={onMarkdownBranchCreate}
            parentNodeId={parentNodeId}
          />
        </div>
      </div>

      {/* Separator to make a bit of spacing for the branch button */}
      <div className="mt-4"></div>

      {/* Branch Creation Button */}
      {onBranchCreate && (
        <>
          <Handle
            type="source"
            id={`bottom-branch-${parentNodeId || "default"}`}
            position={Position.Bottom}
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 10,
              height: 10,
              pointerEvents: "auto",
              zIndex: 10,
              visibility: "visible",
            }}
            className="react-flow__handle"
          />
          <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2 z-[100]">
            <BranchButton onClick={onBranchCreate} isVisible={isHovered} />
          </div>
        </>
      )}
    </div>
  );
};
