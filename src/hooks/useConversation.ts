import { useState, useEffect, useCallback } from "react";
import { Conversation, Node, Edge, Position } from "@/types";
import { FrontendConversationService } from "@/services/frontendConversationService";
import { testConversation } from "@/testConversation";
import {
  calculateNodePosition,
  createInputNode,
  createEdge,
} from "@/utils/graphUtils";

interface UseConversationReturn {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConversation: (updates: Partial<Conversation>) => Promise<void>;
  createBranch: (parentNodeId: string) => Promise<Node | null>;
  addNode: (nodeData: {
    type: "input" | "loading" | "completed";
    position: Position;
    userMessage?: string;
    assistantResponse?: string;
    parentNodeId?: string;
  }) => Promise<Node | null>;
  addEdge: (edgeData: {
    sourceNodeId: string;
    targetNodeId: string;
    type: "auto" | "manual" | "markdown";
    metadata?: any;
  }) => Promise<Edge | null>;
  deleteNode: (nodeId: string) => Promise<void>;
}

export const useConversation = (id: string): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const updateConversation = async (updates: Partial<Conversation>) => {
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
  };

  const createBranch = async (parentNodeId: string): Promise<Node | null> => {
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
      const position = calculateNodePosition(parentNode);

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

  const addEdge = async (edgeData: {
    sourceNodeId: string;
    targetNodeId: string;
    type: "auto" | "manual" | "markdown";
    metadata?: any;
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

  useEffect(() => {
    fetchConversation();
  }, [id, fetchConversation]);

  return {
    conversation, //: testConversation,
    isLoading,
    error,
    refetch: fetchConversation,
    updateConversation,
    createBranch,
    addNode,
    addEdge,
    deleteNode,
  };
};
