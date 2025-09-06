import { Position, Node, Edge, Conversation } from "../types";

// Constants for node positioning
export const NODE_SPACING = 100; // Vertical spacing between nodes
export const EDGE_OFFSET = 20; // Offset for edge connections
export const NODE_WIDTH = 300; // Default node width
export const NODE_HEIGHT = 100; // Default node height

/**
 * Calculate the position for a new node below the parent node
 * @param parentNode - The parent node to position below
 * @param parentNodeHeight - The actual height of the parent node (optional, falls back to NODE_HEIGHT)
 * @returns Position for the new node
 */
export function calculateNodePosition(
  parentNode: Node,
  parentNodeHeight?: number
): Position {
  // Use actual node height if provided, otherwise fall back to default
  const actualHeight = parentNodeHeight || NODE_HEIGHT;

  return {
    x: parentNode.position.x, // Maintain horizontal alignment
    y: parentNode.position.y + actualHeight + NODE_SPACING, // Position below with spacing
  };
}

/**
 * Calculate the position for a new node based on direction (left or right)
 * @param parentNode - The parent node to position relative to
 * @param direction - The direction to position the new node ('left' or 'right')
 * @param parentNodeHeight - The actual height of the parent node (optional, falls back to NODE_HEIGHT)
 * @returns Position for the new node
 */
export function calculateDirectionalNodePosition(
  parentNode: Node,
  direction: "left" | "right",
  parentNodeHeight?: number
): Position {
  // Use actual node height if provided, otherwise fall back to default
  const actualHeight = parentNodeHeight || NODE_HEIGHT;

  // Horizontal offset for left/right positioning (100px as per requirements)
  const HORIZONTAL_OFFSET = 100;

  return {
    x:
      direction === "left"
        ? parentNode.position.x - HORIZONTAL_OFFSET
        : parentNode.position.x + HORIZONTAL_OFFSET,
    y: parentNode.position.y + actualHeight / 2, // Center vertically with parent
  };
}

/**
 * Generate a unique node ID
 * @returns A unique node ID string
 */
export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique edge ID
 * @returns A unique edge ID string
 */
export function generateEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new input node with proper attributes
 * @param conversationId - The conversation ID
 * @param position - The position for the new node
 * @param parentNodeId - The parent node ID (optional)
 * @returns A new input node
 */
export function createInputNode(
  conversationId: string,
  position: Position,
  parentNodeId?: string
): Omit<Node, "id" | "createdAt" | "updatedAt"> {
  return {
    conversationId,
    type: "input",
    userMessage: "",
    assistantResponse: "",
    position,
    parentNodeId,
  };
}

/**
 * Create a new edge between two nodes
 * @param conversationId - The conversation ID
 * @param sourceNodeId - The source node ID
 * @param targetNodeId - The target node ID
 * @param type - The edge type (default: "auto")
 * @returns A new edge
 */
export function createEdge(
  conversationId: string,
  sourceNodeId: string,
  targetNodeId: string,
  type: "auto" | "manual" | "markdown" = "auto"
): Omit<Edge, "id" | "createdAt"> {
  return {
    conversationId,
    sourceNodeId,
    targetNodeId,
    type,
    metadata: {},
  };
}

/**
 * Check if a position is within canvas boundaries
 * @param position - The position to check
 * @param canvasWidth - The canvas width
 * @param canvasHeight - The canvas height
 * @returns True if position is within boundaries
 */
export function isPositionWithinBounds(
  position: Position,
  canvasWidth: number = 1000,
  canvasHeight: number = 1000
): boolean {
  return (
    position.x >= 0 &&
    position.x <= canvasWidth - NODE_WIDTH &&
    position.y >= 0 &&
    position.y <= canvasHeight - NODE_HEIGHT
  );
}

/**
 * Adjust position to stay within canvas boundaries
 * @param position - The position to adjust
 * @param canvasWidth - The canvas width
 * @param canvasHeight - The canvas height
 * @returns Adjusted position within boundaries
 */
export function adjustPositionToBounds(
  position: Position,
  canvasWidth: number = 1000,
  canvasHeight: number = 1000
): Position {
  return {
    x: Math.max(0, Math.min(position.x, canvasWidth - NODE_WIDTH)),
    y: Math.max(0, Math.min(position.y, canvasHeight - NODE_HEIGHT)),
  };
}

/**
 * Find edges targeting a specific node and check for context snippets
 * @param conversation - The conversation containing edges
 * @param targetNodeId - The target node ID to find edges for
 * @returns The context snippet if found, undefined otherwise
 */
export function findContextSnippetForNode(
  conversation: Conversation,
  targetNodeId: string
): string | undefined {
  // Find edges where targetNodeId matches the given nodeId
  const incomingEdges = conversation.edges.filter(
    (edge) => edge.targetNodeId === targetNodeId
  );

  // Check each incoming edge
  for (const edge of incomingEdges) {
    // If sourceHandle starts with "bottom-branch", skip this edge
    if (edge.sourceHandle?.startsWith("bottom-branch")) {
      continue;
    }

    // Check if the edge has metadata with contextSnippet
    if (edge.metadata?.contextSnippet) {
      return edge.metadata.contextSnippet;
    }
  }

  return undefined;
}
