"use client";

import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BranchButton } from "./BranchButton";
import { UserMessage } from "./UserMessage";

interface NodeCompletedProps {
  userMessage: string;
  assistantResponse: string;
  onBranchCreate?: () => void;
  isHovered?: boolean;
}

export const NodeCompleted: React.FC<NodeCompletedProps> = ({
  userMessage,
  assistantResponse,
  onBranchCreate,
  isHovered = false,
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
          <MarkdownRenderer content={assistantResponse} isStreaming={false} />
        </div>
      </div>

      {/* Separator to make a bit of spacing for the branch button */}
      <div className="mt-4"></div>

      {/* Branch Creation Button */}
      {onBranchCreate && (
        <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2 z-[100]">
          <BranchButton onClick={onBranchCreate} isVisible={isHovered} />
        </div>
      )}
    </div>
  );
};
