"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface NodeInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const NodeInput: React.FC<NodeInputProps> = ({
  onSubmit,
  placeholder = "What do you have in mind?",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputValue.trim() && !disabled) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Focus the input when clicked
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 w-full"
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <Button
        type="submit"
        size="sm"
        variant="primary"
        disabled={!inputValue.trim() || disabled}
        className="flex-shrink-0"
        onClick={handleButtonClick}
      >
        Send
      </Button>
    </form>
  );
};
