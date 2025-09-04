"use client";

import { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ConversationNode as ConversationNodeType, NodeState } from "@/types";

interface ConversationNodeData {
  userMessage?: string;
  assistantMessage?: string;
  isStreaming?: boolean;
  isActive?: boolean;
  position: { x: number; y: number };
}

interface ConversationNodeProps extends NodeProps<ConversationNodeData> {
  onUpdateNode: (nodeId: string, data: Partial<ConversationNodeData>) => void;
  onCreateChildNode: (
    parentId: string,
    connectionType: "bottom" | "side",
    context?: string
  ) => void;
  onStreamMessage: (nodeId: string, message: string, context?: string) => void;
}

export default function ConversationNode({
  id,
  data,
  selected,
  onUpdateNode,
  onCreateChildNode,
  onStreamMessage,
}: ConversationNodeProps) {
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const nodeState: NodeState = data.userMessage
    ? data.isStreaming
      ? "streaming"
      : "complete"
    : "empty";

  const isActive = selected || data.isActive;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    onUpdateNode(id, { userMessage: inputValue, isStreaming: true });
    onStreamMessage(id, inputValue);
    setInputValue("");
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCreateChild = (connectionType: "bottom" | "side") => {
    onCreateChildNode(id, connectionType);
  };

  const handleMarkdownHover = (element: HTMLElement, isHovering: boolean) => {
    if (isHovering) {
      element.style.backgroundColor = "#f3f4f6";
      element.style.cursor = "pointer";
      element.style.borderRadius = "4px";
      element.style.padding = "2px 4px";
      element.style.position = "relative";

      // Add a visual indicator
      if (!element.querySelector(".connection-indicator")) {
        const indicator = document.createElement("div");
        indicator.className = "connection-indicator";
        indicator.innerHTML = "🔗";
        indicator.style.position = "absolute";
        indicator.style.right = "4px";
        indicator.style.top = "50%";
        indicator.style.transform = "translateY(-50%)";
        indicator.style.fontSize = "12px";
        indicator.style.opacity = "0.7";
        element.appendChild(indicator);
      }
    } else {
      element.style.backgroundColor = "transparent";
      element.style.cursor = "default";
      element.style.borderRadius = "0";
      element.style.padding = "0";
      element.style.position = "static";

      // Remove indicator
      const indicator = element.querySelector(".connection-indicator");
      if (indicator) {
        indicator.remove();
      }
    }
  };

  const handleMarkdownClick = (element: HTMLElement) => {
    const context = element.textContent || "";
    onCreateChildNode(id, "side", context);
  };

  const isInteractiveElement = (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase();
    return (
      [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "li",
        "blockquote",
        "code",
      ].includes(tagName) &&
      element.textContent &&
      element.textContent.trim().length > 0
    );
  };

  return (
    <div
      className={`min-w-[300px] max-w-[500px] rounded-lg border-2 p-4 transition-all ${
        isActive
          ? "bg-white border-blue-500 shadow-lg"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />

      {/* Node Content */}
      <div className="space-y-3">
        {/* User Message */}
        {data.userMessage && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-gray-800">{data.userMessage}</p>
          </div>
        )}

        {/* Separator */}
        {data.userMessage && (data.assistantMessage || data.isStreaming) && (
          <div className="border-t border-gray-200"></div>
        )}

        {/* Assistant Message */}
        {data.assistantMessage && (
          <div
            className="prose prose-sm max-w-none"
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              if (isInteractiveElement(target)) {
                handleMarkdownHover(target, true);
              }
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              if (isInteractiveElement(target)) {
                handleMarkdownHover(target, false);
              }
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (isInteractiveElement(target)) {
                handleMarkdownClick(target);
              }
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {data.assistantMessage}
            </ReactMarkdown>
          </div>
        )}

        {/* Loading State */}
        {data.isStreaming && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Generating...</span>
          </div>
        )}

        {/* Input Area */}
        {nodeState === "empty" && (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you have in mind?"
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {nodeState === "complete" && (
          <div className="flex justify-center space-x-2 pt-2">
            <button
              onClick={() => handleCreateChild("bottom")}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
              title="Create child node"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <button
              onClick={() => handleCreateChild("side")}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
              title="Create side connection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v14m7-7H5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
}
