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
  sourceHandle?: string;
  targetHandle?: string;
  type: string;
  data: {
    type: EdgeType;
    createdAt: Date;
    metadata?: EdgeMetadata;
  };
}

// Node types
export type NodeType =
  | "input"
  | "loading"
  | "generating"
  | "streaming"
  | "completed";

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
  sourceHandle?: string;
  targetHandle?: string;
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
  referenceContextSnippet?: string;
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

// Re-export streaming types
export * from "./streaming";

// Conversation Context Types
export interface ConversationContextState {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  activeNodePath: string[];
  streamingEnabled: boolean;
}

export interface ConversationContextType {
  // State
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  activeNodePath: string[];
  streamingEnabled: boolean;
  isSubmittingMessage: boolean;
  streamingNodeId: string | null;
  streamingContent: string;
  isStreaming: boolean;
  isGenerating: boolean;

  // Actions
  loadConversation: (conversationId: string) => Promise<void>;
  updateConversation: (updates: Partial<Conversation>) => Promise<void>;
  setActiveNodePath: (nodeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createBranch: (nodeId: string, parentNodeHeight?: number) => Promise<void>;
  createDirectionalBranch: (
    parentNodeId: string,
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    handleId: string,
    parentNodeHeight?: number,
    handleYOffset?: number
  ) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number }
  ) => Promise<void>;

  // UI Actions
  updateTitle: (title: string) => Promise<void>;
  setStreamingEnabled: (enabled: boolean) => void;
  handleMessageSubmit: (message: string, nodeId: string) => Promise<void>;
}

export type ConversationContextAction =
  | { type: "SET_CONVERSATION"; payload: Conversation | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ACTIVE_NODE_PATH"; payload: string | null }
  | { type: "UPDATE_CONVERSATION"; payload: Partial<Conversation> };
