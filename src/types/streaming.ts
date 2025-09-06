import { ChatMessage } from "./index";

// Streaming response interface
export interface StreamingResponse {
  id: string;
  nodeId: string;
  content: string;
  isComplete: boolean;
  timestamp: Date;
  metadata?: {
    chunkIndex: number;
    totalChunks?: number;
    streamingDuration?: number;
  };
}

// Streaming configuration interface
export interface StreamingConfig {
  enableStreaming: boolean;
  chunkSize: number;
  maxRetries: number;
  retryDelay: number;
  connectionTimeout: number;
  bufferSize: number;
}

// Streaming toggle interface
export interface StreamingToggle {
  enabled: boolean;
  position: "bottom-left" | "bottom-right" | "top-right";
  label: string;
  persistPreference: boolean;
}

// Streaming state types
export type StreamingState =
  | "idle"
  | "generating"
  | "streaming"
  | "completed"
  | "error";

// Streaming request interface
export interface StreamingChatRequest {
  message: string;
  context: ChatMessage[];
  nodeId: string;
  conversationId: string;
  streaming: boolean;
}

// Streaming chunk interface
export interface StreamingChunk {
  content: string;
  isComplete: boolean;
  chunkIndex: number;
  timestamp: Date;
}
