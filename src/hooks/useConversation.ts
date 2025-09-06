import { useState, useEffect, useCallback } from "react";
import { Conversation, Node, Edge, Position, EdgeMetadata } from "@/types";
import { FrontendConversationService } from "@/services/frontendConversationService";
import {
  calculateNodePosition,
  calculateDirectionalNodePosition,
  createInputNode,
  createEdge,
} from "@/utils/graphUtils";
import { extractTextContent } from "@/utils/handleIdUtils";

import {
  calculatePathToRoot,
  validatePath,
  isNodeActive,
} from "@/utils/graphTraversal";

interface UseConversationReturn {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  activeNodePath: string[];
  refetch: () => Promise<void>;
  updateConversation: (updates: Partial<Conversation>) => Promise<void>;
  createBranch: (
    parentNodeId: string,
    parentNodeHeight?: number
  ) => Promise<Node | null>;
  createDirectionalBranch: (
    parentNodeId: string,
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    handleId: string,
    parentNodeHeight?: number,
    handleYOffset?: number
  ) => Promise<Node | null>;
  addNode: (nodeData: {
    type: "input" | "loading" | "completed";
    position: Position;
    userMessage?: string;
    assistantResponse?: string;
    parentNodeId?: string;
  }) => Promise<Node | null>;
  createNodeAtPosition: (position: Position) => Promise<Node | null>;
  addEdge: (edgeData: {
    sourceNodeId: string;
    targetNodeId: string;
    type: "auto" | "manual" | "markdown";
    metadata?: EdgeMetadata;
  }) => Promise<Edge | null>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodePosition: (nodeId: string, position: Position) => Promise<void>;
  setActiveNodePath: (nodeId: string) => void;
  clearActivePath: () => void;
  isNodeActive: (nodeId: string) => boolean;
}

export const useConversation = (id: string): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNodePath, setActiveNodePathState] = useState<string[]>([]);

  const fetchConversation = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await FrontendConversationService.getConversation(id);
      setConversation(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversation";
      setError(errorMessage);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateConversation = useCallback(
    async (updates: Partial<Conversation>) => {
      if (!conversation) return;

      try {
        const updatedConversation =
          await FrontendConversationService.updateConversation(
            conversation.id,
            updates
          );
        setConversation(updatedConversation);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update conversation";
        setError(errorMessage);
        throw err; // Re-throw to allow component to handle the error
      }
    },
    [conversation]
  );

  const createBranch = async (
    parentNodeId: string,
    parentNodeHeight?: number
  ): Promise<Node | null> => {
    if (!conversation) return null;

    try {
      // Find the parent node
      const parentNode = conversation.nodes.find(
        (node) => node.id === parentNodeId
      );
      if (!parentNode) {
        throw new Error("Parent node not found");
      }

      // Calculate position for new node
      const position = calculateNodePosition(parentNode, parentNodeHeight);

      // Create the new input node
      const newNode: Node = {
        ...createInputNode(conversation.id, position, parentNodeId),
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create edge between parent and new node
      const newEdge: Edge = {
        ...createEdge(conversation.id, parentNodeId, newNode.id, "auto"),
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        sourceHandle: `bottom-branch-${parentNodeId}`,
        metadata: {
          markdownElementId: `bottom-branch-${parentNodeId}`,
        },
      };

      // Update conversation with new node and edge
      const updatedConversation = {
        ...conversation,
        nodes: [...conversation.nodes, newNode],
        edges: [...conversation.edges, newEdge],
        metadata: {
          ...conversation.metadata,
          nodeCount: conversation.nodes.length + 1,
          lastActiveNodeId: newNode.id,
        },
      };

      // Update backend
      await updateConversation(updatedConversation);

      return newNode;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create branch";
      setError(errorMessage);
      throw err;
    }
  };

  const createDirectionalBranch = async (
    parentNodeId: string,
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    handleId: string,
    parentNodeHeight?: number,
    handleYOffset?: number
  ): Promise<Node | null> => {
    if (!conversation) return null;

    try {
      // Find the parent node
      const parentNode = conversation.nodes.find(
        (node) => node.id === parentNodeId
      );
      if (!parentNode) {
        throw new Error("Parent node not found");
      }

      // Calculate position for new node based on direction
      const position = calculateDirectionalNodePosition(
        parentNode,
        direction,
        parentNodeHeight,
        handleYOffset
      );
      const contextSnippet = extractTextContent(content);

      // Create the new input node
      const newNode: Node = {
        ...createInputNode(conversation.id, position, parentNodeId),
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use the provided handle ID (now required)

      // Create edge between parent and new node with markdown metadata
      const newEdge: Edge = {
        ...createEdge(conversation.id, parentNodeId, newNode.id, "markdown"),
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        sourceHandle: handleId,
        metadata: {
          markdownElementId: handleId,
          contextSnippet: contextSnippet,
        },
      };

      // Update conversation with new node and edge
      const updatedConversation = {
        ...conversation,
        nodes: [...conversation.nodes, newNode],
        edges: [...conversation.edges, newEdge],
        metadata: {
          ...conversation.metadata,
          nodeCount: conversation.nodes.length + 1,
          lastActiveNodeId: newNode.id,
        },
      };

      // Update backend
      await updateConversation(updatedConversation);

      return newNode;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create directional branch";
      setError(errorMessage);
      throw err;
    }
  };

  const addNode = async (nodeData: {
    type: "input" | "loading" | "completed";
    position: Position;
    userMessage?: string;
    assistantResponse?: string;
    parentNodeId?: string;
  }): Promise<Node | null> => {
    if (!conversation) return null;

    try {
      const newNode: Node = {
        ...createInputNode(
          conversation.id,
          nodeData.position,
          nodeData.parentNodeId
        ),
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: nodeData.type,
        userMessage: nodeData.userMessage || "",
        assistantResponse: nodeData.assistantResponse || "",
      };

      const updatedConversation = {
        ...conversation,
        nodes: [...conversation.nodes, newNode],
        metadata: {
          ...conversation.metadata,
          nodeCount: conversation.nodes.length + 1,
          lastActiveNodeId: newNode.id,
        },
      };

      await updateConversation(updatedConversation);
      return newNode;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add node";
      setError(errorMessage);
      throw err;
    }
  };

  const createNodeAtPosition = async (
    position: Position
  ): Promise<Node | null> => {
    if (!conversation) return null;

    try {
      const newNode: Node = {
        ...createInputNode(conversation.id, position),
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "input",
        userMessage: "",
        assistantResponse: "",
      };

      const updatedConversation = {
        ...conversation,
        nodes: [...conversation.nodes, newNode],
        metadata: {
          ...conversation.metadata,
          nodeCount: conversation.nodes.length + 1,
          lastActiveNodeId: newNode.id,
        },
      };

      await updateConversation(updatedConversation);

      // Set the new node as active
      setActiveNodePath(newNode.id);

      return newNode;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create node at position";
      setError(errorMessage);
      throw err;
    }
  };

  const addEdge = async (edgeData: {
    sourceNodeId: string;
    targetNodeId: string;
    type: "auto" | "manual" | "markdown";
    metadata?: EdgeMetadata;
  }): Promise<Edge | null> => {
    if (!conversation) return null;

    try {
      const newEdge: Edge = {
        ...createEdge(
          conversation.id,
          edgeData.sourceNodeId,
          edgeData.targetNodeId,
          edgeData.type
        ),
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        metadata: edgeData.metadata,
      };

      const updatedConversation = {
        ...conversation,
        edges: [...conversation.edges, newEdge],
      };

      await updateConversation(updatedConversation);
      return newEdge;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add edge";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteNode = async (nodeId: string): Promise<void> => {
    if (!conversation) return;

    try {
      // Find the node to delete
      const nodeToDelete = conversation.nodes.find(
        (node) => node.id === nodeId
      );
      if (!nodeToDelete) {
        throw new Error("Node not found");
      }

      // Remove all edges connected to this node (both incoming and outgoing)
      const remainingEdges = conversation.edges.filter(
        (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
      );

      // Remove the node from the nodes array
      const remainingNodes = conversation.nodes.filter(
        (node) => node.id !== nodeId
      );

      // Update metadata
      const updatedMetadata = {
        ...conversation.metadata,
        nodeCount: remainingNodes.length,
        // If the deleted node was the last active node, clear it
        lastActiveNodeId:
          conversation.metadata.lastActiveNodeId === nodeId
            ? undefined
            : conversation.metadata.lastActiveNodeId,
      };

      const updatedConversation = {
        ...conversation,
        nodes: remainingNodes,
        edges: remainingEdges,
        metadata: updatedMetadata,
      };

      await updateConversation(updatedConversation);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete node";
      setError(errorMessage);
      throw err;
    }
  };

  const updateNodePosition = async (
    nodeId: string,
    position: Position
  ): Promise<void> => {
    if (!conversation) return;

    try {
      // Find the node to update
      const nodeToUpdate = conversation.nodes.find(
        (node) => node.id === nodeId
      );
      if (!nodeToUpdate) {
        throw new Error("Node not found");
      }

      // Update the node position
      const updatedNode = {
        ...nodeToUpdate,
        position,
        updatedAt: new Date(),
      };

      // Update the nodes array
      const updatedNodes = conversation.nodes.map((node) =>
        node.id === nodeId ? updatedNode : node
      );

      const updatedConversation = {
        ...conversation,
        nodes: updatedNodes,
      };

      await updateConversation(updatedConversation);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update node position";
      setError(errorMessage);
      throw err;
    }
  };

  // Set active node path by calculating path from clicked node to root
  const setActiveNodePath = useCallback(
    (nodeId: string) => {
      if (!conversation) {
        console.warn("No conversation available for path calculation");
        return;
      }

      try {
        const path = calculatePathToRoot(
          nodeId,
          conversation.nodes,
          conversation.edges
        );

        // Validate the calculated path
        if (validatePath(path, conversation.nodes, conversation.edges)) {
          setActiveNodePathState(path);
        } else {
          console.warn("Invalid path calculated, not updating active path");
        }
      } catch (error) {
        console.error("Error calculating active path:", error);
        // Clear the active path on error
        setActiveNodePathState([]);
      }
    },
    [conversation]
  );

  // Clear active path
  const clearActivePath = useCallback(() => {
    setActiveNodePathState([]);
  }, []);

  // Check if a node is active
  const isNodeActiveCallback = useCallback(
    (nodeId: string): boolean => {
      return isNodeActive(nodeId, activeNodePath);
    },
    [activeNodePath]
  );

  // Clear active path when conversation changes
  useEffect(() => {
    setActiveNodePathState([]);
  }, [conversation?.id]);

  useEffect(() => {
    fetchConversation();
  }, [id, fetchConversation]);

  return {
    conversation, //testConversation,
    isLoading,
    error,
    activeNodePath,
    refetch: fetchConversation,
    updateConversation,
    createBranch,
    createDirectionalBranch,
    addNode,
    createNodeAtPosition,
    addEdge,
    deleteNode,
    updateNodePosition,
    setActiveNodePath,
    clearActivePath,
    isNodeActive: isNodeActiveCallback,
  };
};
