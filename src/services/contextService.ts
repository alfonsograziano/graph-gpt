import { Conversation, Node, ChatMessage } from "@/types";

export interface ContextMessage {
  role: "user" | "assistant";
  content: string;
  nodeId: string;
  timestamp: Date;
}

export interface ConversationPath {
  nodeIds: string[];
  messages: ContextMessage[];
  totalTokens: number;
  isComplete: boolean;
  lastTruncatedAt?: string;
}

export interface ContextConfig {
  maxTokens: number;
  maxMessages: number;
  preserveOrder: boolean;
  includeMetadata: boolean;
  truncationStrategy: "head" | "tail" | "smart";
}

class ContextService {
  private config: ContextConfig = {
    maxTokens: 4000, // Conservative limit for context
    maxMessages: 20,
    preserveOrder: true,
    includeMetadata: false,
    truncationStrategy: "head",
  };

  /**
   * Calculate the path from a given node to the root of the conversation
   */
  calculatePathToRoot(
    conversation: Conversation,
    startNodeId: string
  ): string[] {
    const path: string[] = [];
    const visited = new Set<string>();

    let currentNodeId: string | undefined = startNodeId;

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      path.unshift(currentNodeId); // Add to beginning to maintain chronological order

      const currentNode = conversation.nodes.find(
        (node) => node.id === currentNodeId
      );
      currentNodeId = currentNode?.parentNodeId;
    }

    return path;
  }

  /**
   * Flatten conversation path into user/assistant message pairs
   */
  flattenConversationPath(
    conversation: Conversation,
    nodeIds: string[]
  ): ContextMessage[] {
    const messages: ContextMessage[] = [];

    for (const nodeId of nodeIds) {
      const node = conversation.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      // Add user message if it exists
      if (node.userMessage && node.userMessage.trim()) {
        messages.push({
          role: "user",
          content: node.userMessage,
          nodeId: node.id,
          timestamp: node.createdAt,
        });
      }

      // Add assistant response if it exists
      if (node.assistantResponse && node.assistantResponse.trim()) {
        messages.push({
          role: "assistant",
          content: node.assistantResponse,
          nodeId: node.id,
          timestamp: node.updatedAt,
        });
      }
    }

    return messages;
  }

  /**
   * Calculate approximate token count for a message
   * This is a simple approximation - in production, you'd use a proper tokenizer
   */
  calculateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate total tokens for context messages
   */
  calculateContextTokens(messages: ContextMessage[]): number {
    return messages.reduce((total, message) => {
      return total + this.calculateTokens(message.content);
    }, 0);
  }

  /**
   * Truncate context to fit within token limits
   */
  truncateContext(messages: ContextMessage[]): ContextMessage[] {
    const totalTokens = this.calculateContextTokens(messages);

    if (
      totalTokens <= this.config.maxTokens &&
      messages.length <= this.config.maxMessages
    ) {
      return messages;
    }

    let truncatedMessages = [...messages];

    // First, limit by message count
    if (truncatedMessages.length > this.config.maxMessages) {
      truncatedMessages = truncatedMessages.slice(-this.config.maxMessages);
    }

    // Then, limit by token count
    while (
      this.calculateContextTokens(truncatedMessages) > this.config.maxTokens &&
      truncatedMessages.length > 1
    ) {
      if (this.config.truncationStrategy === "head") {
        truncatedMessages = truncatedMessages.slice(1);
      } else if (this.config.truncationStrategy === "tail") {
        truncatedMessages = truncatedMessages.slice(0, -1);
      } else {
        // Smart truncation: remove middle messages, keeping recent and early context
        const midPoint = Math.floor(truncatedMessages.length / 2);
        truncatedMessages = [
          ...truncatedMessages.slice(0, midPoint),
          ...truncatedMessages.slice(midPoint + 1),
        ];
      }
    }

    return truncatedMessages;
  }

  /**
   * Get conversation context for a specific node
   */
  getConversationContext(
    conversation: Conversation,
    nodeId: string
  ): ChatMessage[] {
    // Calculate path to root
    const path = this.calculatePathToRoot(conversation, nodeId);

    // Flatten path into messages
    const contextMessages = this.flattenConversationPath(conversation, path);

    // Truncate if necessary
    const truncatedMessages = this.truncateContext(contextMessages);

    // Convert to ChatMessage format for API
    return truncatedMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const contextService = new ContextService();
