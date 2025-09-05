"use client";

import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface NodeLoadingProps {
  message: string;
}

export const NodeLoading: React.FC<NodeLoadingProps> = ({ message }) => {
  return (
    <div className="p-4 min-w-[300px] max-w-[600px] bg-gray-200 transition-all duration-300 ease-in-out">
      <div className="space-y-3">
        {/* Display the submitted message */}
        <div className="text-sm font-medium text-gray-900 leading-relaxed">
          {message}
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center space-x-2 py-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-600 font-medium">
            Generating...
          </span>
        </div>
      </div>
    </div>
  );
};
