/**
 * Sanitizes markdown content by removing potentially dangerous elements
 */
export function sanitizeMarkdown(content: string): string {
  // Remove script tags and potentially dangerous HTML
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, ""); // Remove event handlers

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:[^"'\s)]*/gi, "");

  return sanitized;
}
