import { Node, Edge } from "@xyflow/react";

export interface ConversationNode {
  id: string;
  type: "conversation";
  data: {
    userMessage?: string;
    assistantMessage?: string;
    isStreaming?: boolean;
    isActive?: boolean;
    position: { x: number; y: number };
  };
}

export interface ConversationEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface Conversation {
  _id?: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: ConversationNode[];
  edges: ConversationEdge[];
  activeNodeId?: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  nodes?: ConversationNode[];
  edges?: ConversationEdge[];
  activeNodeId?: string;
}

export interface StreamMessageRequest {
  conversationId: string;
  message: string;
  context?: string; // For side connections
}

export interface StreamMessageResponse {
  type: "content" | "done" | "error";
  content?: string;
  error?: string;
}

// React Flow specific types
export type FlowNode = Node<ConversationNode["data"], "conversation">;
export type FlowEdge = Edge<ConversationEdge>;

// Node states
export type NodeState = "empty" | "user-input" | "streaming" | "complete";

// Connection types
export type ConnectionType = "bottom" | "side";
