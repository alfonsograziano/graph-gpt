"use client";

import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BranchButton } from "./BranchButton";

interface NodeCompletedProps {
  userMessage: string;
  assistantResponse: string;
  isActive: boolean;
  onBranchCreate: () => void;
}

export const NodeCompleted: React.FC<NodeCompletedProps> = ({
  userMessage,
  assistantResponse,
  isActive,
  onBranchCreate,
}) => {
  return (
    <div className="p-4 min-w-[300px] transition-all duration-300 ease-in-out">
      <div className="space-y-3">
        {/* User Message */}
        <div className="text-sm font-medium text-gray-900 leading-relaxed">
          {userMessage}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Assistant Response with Markdown */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <MarkdownRenderer content={assistantResponse} />
        </div>
      </div>

      {/* Branch Creation Button */}
      <div className="flex justify-center mt-4">
        <BranchButton onClick={onBranchCreate} />
      </div>
    </div>
  );
};
