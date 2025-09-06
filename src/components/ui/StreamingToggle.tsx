"use client";

import { useState, useEffect } from "react";

interface StreamingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function StreamingToggle({
  enabled,
  onToggle,
  className = "",
}: StreamingToggleProps) {
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load preference from localStorage on mount
  useEffect(() => {
    if (isClient) {
      const savedPreference = localStorage.getItem("streaming-enabled");
      if (savedPreference !== null) {
        const isEnabled = savedPreference === "true";
        onToggle(isEnabled);
      }
    }
  }, [isClient, onToggle]);

  // Save preference to localStorage when changed
  const handleToggle = (newEnabled: boolean) => {
    onToggle(newEnabled);
    if (isClient) {
      localStorage.setItem("streaming-enabled", newEnabled.toString());
    }
  };

  if (!isClient) {
    // Render placeholder during SSR
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
          <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg transition-all duration-200 hover:shadow-xl">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Stream Answer
        </span>
        <button
          onClick={() => handleToggle(!enabled)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle streaming mode"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <div className="flex items-center">
          <span
            className={`text-xs ${
              enabled
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {enabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
