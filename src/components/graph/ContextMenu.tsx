"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Position } from "@/types";

interface ContextMenuProps {
  isVisible: boolean;
  position: Position;
  onClose: () => void;
  onCreateNode: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  onCreateNode,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedItemRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      // Use a small delay to prevent immediate closure when the menu opens
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }, 100);

      // Focus the first menu item when menu opens
      setTimeout(() => {
        focusedItemRef.current?.focus();
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onCreateNode();
          break;
        case "ArrowDown":
          event.preventDefault();
          // Focus next item (only one item for now)
          break;
        case "ArrowUp":
          event.preventDefault();
          // Focus previous item (only one item for now)
          break;
      }
    },
    [onClose, onCreateNode]
  );

  // Handle menu item click
  const handleCreateNodeClick = useCallback(() => {
    onCreateNode();
  }, [onCreateNode]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
      role="menu"
      aria-label="Canvas context menu"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={focusedItemRef}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={handleCreateNodeClick}
        role="menuitem"
        aria-label="Create new node"
      >
        Create new node
      </button>
    </div>
  );
};
