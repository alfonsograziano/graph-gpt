// MarkdownRenderer props interface
export interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  onBranchCreate?: (
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    parentNodeId: string,
    handleId: string
  ) => void;
  parentNodeId?: string;
}
