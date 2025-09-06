"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { LoadingSpinner } from "./LoadingSpinner";
import { useConversationContext } from "@/context";

interface EditableTitleProps {
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  onCancel,
  placeholder = "Enter title...",
  maxLength = 100,
}) => {
  const { conversation, isLoading, updateTitle } = useConversationContext();
  const [inputValue, setInputValue] = useState(conversation?.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Update input value when conversation title changes
  useEffect(() => {
    if (conversation?.title) {
      setInputValue(conversation.title);
    }
  }, [conversation?.title]);

  const handleSave = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && trimmedValue !== conversation?.title?.trim()) {
      await updateTitle(trimmedValue);
    }
    onCancel();
  };

  const handleCancel = () => {
    setInputValue(conversation?.title || "");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setInputValue(newValue);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="px-2 py-1 text-lg font-semibold text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={
            isLoading ||
            !inputValue.trim() ||
            inputValue.trim() === conversation?.title?.trim()
          }
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
