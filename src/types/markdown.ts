// MarkdownRenderer props interface
export interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
}
