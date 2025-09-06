"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { MarkdownRendererProps } from "@/types/markdown";
import { sanitizeMarkdown } from "@/utils/markdownUtils";
import { Handle, Position } from "reactflow";
import { generateBranchHandleIds } from "@/utils/handleIdUtils";
import { BranchButton } from "./BranchButton";

interface MarkdownItemWithHandlesProps {
  children: React.ReactNode;
  elementType: string;
  position: number;
  onBranchCreate?: (
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    parentNodeId: string,
    handleId: string
  ) => void;
  parentNodeId?: string;
}

export const MarkdownItemWithHandles: React.FC<
  MarkdownItemWithHandlesProps
> = ({ children, elementType, position, onBranchCreate, parentNodeId }) => {
  const [showHandles, setShowHandles] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleIds = generateBranchHandleIds(elementType, children, position);

  const handleLeftBranch = () => {
    if (onBranchCreate && parentNodeId) {
      onBranchCreate(
        "left",
        elementType,
        children,
        parentNodeId,
        handleIds.leftId
      );
    }
  };

  const handleRightBranch = () => {
    if (onBranchCreate && parentNodeId) {
      onBranchCreate(
        "right",
        elementType,
        children,
        parentNodeId,
        handleIds.rightId
      );
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowHandles(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowHandles(false);
    }, 200); // 200ms delay before hiding
    setHoverTimeout(timeout);
  };

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Branch Button */}
      <div
        className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-10 p-2 -m-2"
        style={{
          visibility: showHandles ? "visible" : "hidden",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <BranchButton onClick={handleLeftBranch} isVisible={showHandles} />
      </div>

      {/* Right Branch Button */}
      <div
        className="absolute top-1/2 -right-12 transform -translate-y-1/2 z-10 p-2 -m-2"
        style={{
          visibility: showHandles ? "visible" : "hidden",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <BranchButton onClick={handleRightBranch} isVisible={showHandles} />
      </div>

      {/* React Flow Handles for connections - invisible but functional */}
      <Handle
        type="source"
        id={handleIds.leftId}
        position={Position.Left}
        style={{
          position: "absolute",
          top: "50%",
          left: "-25px",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          pointerEvents: "none",
          zIndex: 1,
          visibility: "visible",
          backgroundColor: "transparent",
          border: "none",
        }}
        className="react-flow__handle"
        onConnect={(params) => {}}
      />

      {children}

      <Handle
        type="source"
        id={handleIds.rightId}
        position={Position.Right}
        style={{
          position: "absolute",
          top: "50%",
          right: "-25px",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          pointerEvents: "none",
          zIndex: 1,
          visibility: "visible",
          backgroundColor: "transparent",
          border: "none",
        }}
        className="react-flow__handle"
        onConnect={(params) => {}}
      />
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
  className = "",
  onContentChange,
  onBranchCreate,
  parentNodeId,
}) => {
  // Handle content changes during streaming
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  // Sanitize content for security
  const sanitizedContent = sanitizeMarkdown(content);

  // Track element positions for stable IDs
  const elementPositions = React.useRef<Map<string, number>>(new Map());
  const getElementPosition = (
    elementType: string,
    content: React.ReactNode
  ): number => {
    const key = `${elementType}-${JSON.stringify(content)}`;
    if (!elementPositions.current.has(key)) {
      elementPositions.current.set(key, elementPositions.current.size);
    }
    return elementPositions.current.get(key)!;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for better integration with our design
          h1: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h1"
              position={getElementPosition("h1", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h1 className="text-lg font-semibold text-gray-900 mb-2 mt-4 first:mt-0">
                {children}
              </h1>
            </MarkdownItemWithHandles>
          ),
          h2: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h2"
              position={getElementPosition("h2", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h2 className="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
                {children}
              </h2>
            </MarkdownItemWithHandles>
          ),
          h3: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h3"
              position={getElementPosition("h3", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-2 first:mt-0">
                {children}
              </h3>
            </MarkdownItemWithHandles>
          ),
          h4: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h4"
              position={getElementPosition("h4", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h4 className="text-sm font-medium text-gray-900 mb-1 mt-2 first:mt-0">
                {children}
              </h4>
            </MarkdownItemWithHandles>
          ),
          h5: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h5"
              position={getElementPosition("h5", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h5 className="text-sm font-medium text-gray-800 mb-1 mt-2 first:mt-0">
                {children}
              </h5>
            </MarkdownItemWithHandles>
          ),
          h6: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="h6"
              position={getElementPosition("h6", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <h6 className="text-xs font-medium text-gray-800 mb-1 mt-2 first:mt-0">
                {children}
              </h6>
            </MarkdownItemWithHandles>
          ),
          p: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="p"
              position={getElementPosition("p", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <p className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">
                {children}
              </p>
            </MarkdownItemWithHandles>
          ),
          ul: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="ul"
              position={getElementPosition("ul", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <ul className="text-sm text-gray-700 mb-2 ml-4 space-y-1 list-disc">
                {children}
              </ul>
            </MarkdownItemWithHandles>
          ),
          ol: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="ol"
              position={getElementPosition("ol", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <ol className="text-sm text-gray-700 mb-2 ml-4 space-y-1 list-decimal">
                {children}
              </ol>
            </MarkdownItemWithHandles>
          ),
          li: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="li"
              position={getElementPosition("li", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <li className="text-sm text-gray-700 leading-relaxed">
                {children}
              </li>
            </MarkdownItemWithHandles>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="pre"
              position={getElementPosition("pre", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <pre className="bg-gray-100 rounded-md p-3 overflow-x-auto text-xs font-mono text-gray-800 mb-2 border">
                {children}
              </pre>
            </MarkdownItemWithHandles>
          ),
          blockquote: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="blockquote"
              position={getElementPosition("blockquote", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2 bg-gray-50 py-2">
                {children}
              </blockquote>
            </MarkdownItemWithHandles>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline break-words"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          table: ({ children }) => (
            <MarkdownItemWithHandles
              elementType="table"
              position={getElementPosition("table", children)}
              onBranchCreate={onBranchCreate}
              parentNodeId={parentNodeId}
            >
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full text-xs border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            </MarkdownItemWithHandles>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-gray-300" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-md mb-2"
              loading="lazy"
            />
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Streaming...
        </div>
      )}
    </div>
  );
};
