"use client";

import React from "react";

interface UserMessageProps {
  message: string;
  className?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  className = "",
}) => {
  return (
    <div
      className={`text-sm font-medium text-gray-900 leading-relaxed ${className}`}
    >
      <span className="text-gray-600 font-semibold">User:</span> {message}
    </div>
  );
};
