// Position interface for node positioning
export interface Position {
  x: number;
  y: number;
}

// React Flow specific types
export interface ReactFlowNode {
  id: string;
  type: string;
  position: Position;
  data: {
    label: string;
    userMessage: string;
    assistantResponse: string;
    type: NodeType;
    createdAt: Date;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: {
    type: EdgeType;
    createdAt: Date;
    metadata?: EdgeMetadata;
  };
}

// Node types
export type NodeType = "input" | "loading" | "completed";

// Edge types
export type EdgeType = "auto" | "manual" | "markdown";

// Node interface
export interface Node {
  id: string;
  conversationId: string;
  type: NodeType;
  userMessage?: string;
  assistantResponse: string;
  position: Position;
  createdAt: Date;
  updatedAt: Date;
  parentNodeId?: string;
}

// Edge metadata interface
export interface EdgeMetadata {
  markdownElementId?: string;
  contextSnippet?: string;
}

// Edge interface
export interface Edge {
  id: string;
  conversationId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  createdAt: Date;
  metadata?: EdgeMetadata;
}

// Conversation metadata interface
export interface ConversationMetadata {
  nodeCount: number;
  lastActiveNodeId?: string;
  tags?: string[];
}

// Conversation interface
export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: Node[];
  edges: Edge[];
  metadata: ConversationMetadata;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database document types (for MongoDB)
export interface ConversationDocument extends Omit<Conversation, "id"> {
  _id?: string;
}

export interface NodeDocument extends Omit<Node, "id"> {
  _id?: string;
}

export interface EdgeDocument extends Omit<Edge, "id"> {
  _id?: string;
}

// Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  context: ChatMessage[];
  nodeId: string;
  conversationId: string;
}

export interface ChatResponse {
  content: string;
  nodeId: string;
  conversationId: string;
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// OpenAI API types
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
}

// Error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

// Re-export markdown types
export * from "./markdown";
