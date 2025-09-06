"use client";

import React from "react";
import { SquareArrowOutDownRight } from "lucide-react";

interface ContextBannerProps {
  contextSnippet: string;
}

export const ContextBanner: React.FC<ContextBannerProps> = ({
  contextSnippet,
}) => {
  // Truncate the context snippet if it's too long
  const maxLength = 60; // Adjust this value as needed
  const displayText =
    contextSnippet.length > maxLength
      ? `${contextSnippet.substring(0, maxLength)}...`
      : contextSnippet;

  return (
    <div className="absolute -top-8 left-0 right-0 flex items-center justify-center pointer-events-none">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
        {/* Curved arrow */}
        <SquareArrowOutDownRight className="w-4 h-4 text-gray-400 mr-1" />

        {/* Context snippet text */}
        <span className="text-gray-400 text-xs ml-1 font-medium">
          {displayText}
        </span>
      </div>
    </div>
  );
};
