import { Node, Edge } from "@/types";

/**
 * Calculate the path from a given node to the root node
 * @param nodeId - The ID of the node to start from
 * @param nodes - Array of all nodes in the conversation
 * @param edges - Array of all edges in the conversation
 * @returns Array of node IDs representing the path from the given node to root
 */
export function calculatePathToRoot(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): string[] {
  // Validate inputs
  if (!nodeId || !nodes || !edges) {
    throw new Error("Invalid inputs: nodeId, nodes, and edges are required");
  }

  // Check if the node exists
  const node = findNodeById(nodeId, nodes);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Use a Set to track visited nodes to prevent infinite loops
  const visited = new Set<string>();
  const path: string[] = [];

  // Recursive function to traverse up the tree
  function traverseUp(currentNodeId: string): void {
    // Prevent infinite loops
    if (visited.has(currentNodeId)) {
      throw new Error(
        `Circular reference detected: node ${currentNodeId} is already in the path`
      );
    }

    visited.add(currentNodeId);
    path.push(currentNodeId);

    // Find the parent node by looking for edges where this node is the target
    const incomingEdges = edges.filter(
      (edge) => edge.targetNodeId === currentNodeId
    );

    if (incomingEdges.length === 0) {
      // This is a root node (no incoming edges)
      return;
    }

    if (incomingEdges.length > 1) {
      // Multiple parents - this shouldn't happen in a tree structure
      // For now, we'll use the first parent, but this could be enhanced
      // to handle more complex scenarios
      console.warn(
        `Node ${currentNodeId} has multiple parents, using the first one`
      );
    }

    const parentEdge = incomingEdges[0];
    const parentNodeId = parentEdge.sourceNodeId;

    // Verify the parent node exists
    const parentNode = findNodeById(parentNodeId, nodes);
    if (!parentNode) {
      throw new Error(`Parent node ${parentNodeId} not found`);
    }

    // Recursively traverse up to the parent
    traverseUp(parentNodeId);
  }

  try {
    traverseUp(nodeId);
    return path;
  } catch (error) {
    // If there's an error during traversal, return empty path
    console.error("Error calculating path to root:", error);
    return [];
  }
}

/**
 * Find a node by its ID
 * @param nodeId - The ID of the node to find
 * @param nodes - Array of all nodes
 * @returns The node if found, undefined otherwise
 */
export function findNodeById(nodeId: string, nodes: Node[]): Node | undefined {
  return nodes.find((node) => node.id === nodeId);
}

/**
 * Validate that a path is correct and doesn't contain circular references
 * @param path - Array of node IDs representing a path
 * @param nodes - Array of all nodes
 * @param edges - Array of all edges
 * @returns True if the path is valid, false otherwise
 */
export function validatePath(
  path: string[],
  nodes: Node[],
  edges: Edge[]
): boolean {
  if (!path || path.length === 0) {
    return false;
  }

  // Check for duplicate nodes in the path (circular reference)
  const uniqueNodes = new Set(path);
  if (uniqueNodes.size !== path.length) {
    return false;
  }

  // Check that all nodes in the path exist
  for (const nodeId of path) {
    if (!findNodeById(nodeId, nodes)) {
      return false;
    }
  }

  // Check that the path is actually connected
  for (let i = 0; i < path.length - 1; i++) {
    const currentNodeId = path[i];
    const nextNodeId = path[i + 1];

    // Check if there's an edge from nextNodeId to currentNodeId
    // (since we're going from leaf to root)
    const connectingEdge = edges.find(
      (edge) =>
        edge.sourceNodeId === nextNodeId && edge.targetNodeId === currentNodeId
    );

    if (!connectingEdge) {
      return false;
    }
  }

  return true;
}

/**
 * Get all nodes that are in the active path
 * @param activeNodePath - Array of node IDs in the active path
 * @param nodes - Array of all nodes
 * @returns Array of nodes that are in the active path
 */
export function getActiveNodes(
  activeNodePath: string[],
  nodes: Node[]
): Node[] {
  return activeNodePath
    .map((nodeId) => findNodeById(nodeId, nodes))
    .filter((node): node is Node => node !== undefined);
}

/**
 * Check if a node is active (in the active path)
 * @param nodeId - The ID of the node to check
 * @param activeNodePath - Array of node IDs in the active path
 * @returns True if the node is active, false otherwise
 */
export function isNodeActive(
  nodeId: string,
  activeNodePath: string[]
): boolean {
  return activeNodePath.includes(nodeId);
}

/**
 * Get the root node of a conversation
 * @param nodes - Array of all nodes
 * @param edges - Array of all edges
 * @returns The root node if found, undefined otherwise
 */
export function getRootNode(nodes: Node[], edges: Edge[]): Node | undefined {
  // Find nodes that have no incoming edges
  const nodeIds = nodes.map((node) => node.id);
  const targetNodeIds = edges.map((edge) => edge.targetNodeId);
  const rootNodeIds = nodeIds.filter(
    (nodeId) => !targetNodeIds.includes(nodeId)
  );

  if (rootNodeIds.length === 0) {
    return undefined;
  }

  if (rootNodeIds.length > 1) {
    console.warn(`Multiple root nodes found: ${rootNodeIds.join(", ")}`);
  }

  return findNodeById(rootNodeIds[0], nodes);
}

/**
 * Get all leaf nodes (nodes with no outgoing edges)
 * @param nodes - Array of all nodes
 * @param edges - Array of all edges
 * @returns Array of leaf nodes
 */
export function getLeafNodes(nodes: Node[], edges: Edge[]): Node[] {
  const sourceNodeIds = edges.map((edge) => edge.sourceNodeId);
  return nodes.filter((node) => !sourceNodeIds.includes(node.id));
}

/**
 * Get all edges that are in the active path
 * @param activeNodePath - Array of node IDs in the active path
 * @param edges - Array of all edges
 * @returns Array of edge IDs that are in the active path
 */
export function getActiveEdges(
  activeNodePath: string[],
  edges: Edge[]
): string[] {
  if (activeNodePath.length < 2) {
    return [];
  }

  const activeEdgeIds: string[] = [];

  // For each consecutive pair of nodes in the active path,
  // find the edge that connects them
  for (let i = 0; i < activeNodePath.length - 1; i++) {
    const currentNodeId = activeNodePath[i];
    const nextNodeId = activeNodePath[i + 1];

    // Find edge from nextNodeId to currentNodeId (since path goes from leaf to root)
    const connectingEdge = edges.find(
      (edge) =>
        edge.sourceNodeId === nextNodeId && edge.targetNodeId === currentNodeId
    );

    if (connectingEdge) {
      activeEdgeIds.push(connectingEdge.id);
    }
  }

  return activeEdgeIds;
}

/**
 * Check if an edge is active (in the active path)
 * @param edgeId - The ID of the edge to check
 * @param activeNodePath - Array of node IDs in the active path
 * @param edges - Array of all edges
 * @returns True if the edge is active, false otherwise
 */
export function isEdgeActive(
  edgeId: string,
  activeNodePath: string[],
  edges: Edge[]
): boolean {
  const activeEdges = getActiveEdges(activeNodePath, edges);
  return activeEdges.includes(edgeId);
}
