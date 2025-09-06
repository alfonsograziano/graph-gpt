"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { MarkdownRendererProps } from "@/types/markdown";
import { sanitizeMarkdown } from "@/utils/markdownUtils";
import { Handle, Position } from "reactflow";

export const MarkdownItemWithHandles: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [showHandles, setShowHandles] = useState(false);

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
    >
      <Handle
        type="source"
        id={`p-left-${children}`}
        position={Position.Left}
        style={{
          position: "absolute",
          top: "50%",
          left: "-25px",
          transform: "translateY(-50%)",
          width: 10, // keep default handle size
          height: 10,
          pointerEvents: "all",
          zIndex: 1,
          visibility: showHandles ? "visible" : "hidden",
        }}
        className="react-flow__handle"
      />

      {children}
      <Handle
        type="source"
        id={`p-right-${children}`}
        position={Position.Right}
        style={{
          position: "absolute",
          top: "50%",
          right: "-25px",
          transform: "translateY(-50%)",
          width: 10, // keep default handle size
          height: 10,
          pointerEvents: "all",
          zIndex: 1,
          visibility: showHandles ? "visible" : "hidden",
        }}
        className="react-flow__handle"
      />
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
  className = "",
  onContentChange,
}) => {
  // Handle content changes during streaming
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  // Sanitize content for security
  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for better integration with our design
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-900 mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-medium text-gray-900 mb-1 mt-2 first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-medium text-gray-800 mb-1 mt-2 first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-medium text-gray-800 mb-1 mt-2 first:mt-0">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <MarkdownItemWithHandles>
              <p className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">
                {children}
              </p>
            </MarkdownItemWithHandles>
          ),
          ul: ({ children }) => (
            <ul className="text-sm text-gray-700 mb-2 ml-4 space-y-1 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-sm text-gray-700 mb-2 ml-4 space-y-1 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700 leading-relaxed">
              {children}
            </li>
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
            <pre className="bg-gray-100 rounded-md p-3 overflow-x-auto text-xs font-mono text-gray-800 mb-2 border">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2 bg-gray-50 py-2">
              {children}
            </blockquote>
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
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full text-xs border-collapse border border-gray-300">
                {children}
              </table>
            </div>
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
