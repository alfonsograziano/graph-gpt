"use client";

import React from "react";

interface DeleteButtonProps {
  onDelete: () => void;
  isVisible: boolean;
  nodeId: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  isVisible,
  nodeId,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node click when delete button is clicked
    onDelete();
  };

  return (
    <button
      onClick={handleDelete}
      className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 ease-in-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
      }`}
      aria-label={`Delete node ${nodeId}`}
      title="Delete this node"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
