import { ConversationRepository } from "./repositories/ConversationRepository";
import { Conversation, Node, Edge } from "../types";

export class ConversationService {
  private repository: ConversationRepository;

  constructor() {
    this.repository = new ConversationRepository();
  }

  async createConversation(title: string): Promise<Conversation> {
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required and cannot be empty");
    }

    const conversationData: Omit<Conversation, "createdAt" | "updatedAt"> = {
      id: this.generateId(),
      title: title.trim(),
      nodes: [],
      edges: [],
      metadata: {
        nodeCount: 0,
        lastActiveNodeId: undefined,
        tags: [],
      },
    };

    return await this.repository.create(conversationData);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }

    return await this.repository.findById(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return await this.repository.findAll();
  }

  async updateConversation(
    id: string,
    updateData: Partial<Omit<Conversation, "id" | "createdAt">>
  ): Promise<Conversation | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }

    return await this.repository.update(id, updateData);
  }

  async deleteConversation(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }

    return await this.repository.delete(id);
  }

  async deleteAllConversations(): Promise<number> {
    return await this.repository.deleteAll();
  }

  async addNode(
    conversationId: string,
    node: Omit<Node, "id" | "conversationId" | "createdAt" | "updatedAt">
  ): Promise<Conversation | null> {
    if (!conversationId || conversationId.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }

    const nodeData: Node = {
      ...node,
      id: this.generateId(),
      conversationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.repository.addNode(conversationId, nodeData);
  }

  async addEdge(
    conversationId: string,
    edge: Omit<Edge, "id" | "conversationId" | "createdAt">
  ): Promise<Conversation | null> {
    if (!conversationId || conversationId.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }

    const edgeData: Edge = {
      ...edge,
      id: this.generateId(),
      conversationId,
      createdAt: new Date(),
    };

    return await this.repository.addEdge(conversationId, edgeData);
  }

  async updateNode(
    conversationId: string,
    nodeId: string,
    nodeData: Partial<Omit<Node, "id" | "conversationId" | "createdAt">>
  ): Promise<Conversation | null> {
    if (!conversationId || conversationId.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }
    if (!nodeId || nodeId.trim().length === 0) {
      throw new Error("Node ID is required");
    }

    return await this.repository.updateNode(conversationId, nodeId, nodeData);
  }

  async deleteNode(
    conversationId: string,
    nodeId: string
  ): Promise<Conversation | null> {
    if (!conversationId || conversationId.trim().length === 0) {
      throw new Error("Conversation ID is required");
    }
    if (!nodeId || nodeId.trim().length === 0) {
      throw new Error("Node ID is required");
    }

    return await this.repository.deleteNode(conversationId, nodeId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export const conversationService = new ConversationService();
