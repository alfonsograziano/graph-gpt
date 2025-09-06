/**
 * Utility functions for generating stable, unique handle IDs for markdown elements
 */

/**
 * Generates a stable hash from a string using a simple hash function
 * @param str - The string to hash
 * @returns A hash string
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Extracts text content from a React node for hashing
 * @param node - React node to extract text from
 * @returns Extracted text content
 */
export function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return node.toString();
  }

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const props = (node as unknown as { props: { children: React.ReactNode } })
      .props;
    if (props.children) {
      return extractTextContent(props.children);
    }
  }

  return "";
}

/**
 * Generates a stable, unique handle ID for a markdown element
 * @param elementType - The type of markdown element (h1, p, ul, etc.)
 * @param content - The content of the element
 * @param position - The position of the element in the document
 * @returns A unique handle ID
 */
export function generateHandleId(
  elementType: string,
  content: React.ReactNode,
  position: number
): string {
  const textContent = extractTextContent(content);
  const contentHash = simpleHash(textContent);
  const positionHash = simpleHash(position.toString());

  return `${elementType}-${contentHash}-${positionHash}`;
}

/**
 * Generates handle IDs for left and right branch buttons
 * @param elementType - The type of markdown element
 * @param content - The content of the element
 * @param position - The position of the element in the document
 * @returns Object with left and right handle IDs
 */
export function generateBranchHandleIds(
  elementType: string,
  content: React.ReactNode,
  position: number
): { leftId: string; rightId: string } {
  const baseId = generateHandleId(elementType, content, position);
  return {
    leftId: `${baseId}-left`,
    rightId: `${baseId}-right`,
  };
}
