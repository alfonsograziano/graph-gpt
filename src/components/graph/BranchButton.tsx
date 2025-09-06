"use client";

import React from "react";

interface BranchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isVisible?: boolean;
}

export const BranchButton: React.FC<BranchButtonProps> = ({
  onClick,
  disabled = false,
  isVisible = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-8 h-8 rounded-full border-2 border-gray-300 bg-white
        flex items-center justify-center
        hover:border-blue-500 hover:bg-blue-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:bg-blue-100 active:border-blue-600
        transition-all duration-200 ease-in-out
        shadow-sm hover:shadow-md
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-white hover:shadow-sm"
            : "cursor-pointer"
        }
      `}
      aria-label="Create new branch"
      title="Create new branch"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};
