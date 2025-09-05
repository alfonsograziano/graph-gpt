import { ConversationModel } from "../../lib/models/Conversation";
import { Conversation } from "../../types";
import { connectToDatabase } from "../../lib/database";

export class ConversationRepository {
  private async ensureConnection(): Promise<void> {
    await connectToDatabase();
  }

  private convertToConversation(doc: unknown): Conversation {
    // Ensure we have a plain object by serializing and parsing
    const serialized = JSON.parse(JSON.stringify(doc));
    const docObj = serialized as Record<string, unknown>;
    return {
      ...docObj,
      id: docObj.id as string, // Use the custom id field, not _id
      _id: undefined, // Remove MongoDB's _id field
    } as unknown as Conversation;
  }

  async create(
    conversationData: Omit<Conversation, "createdAt" | "updatedAt">
  ): Promise<Conversation> {
    try {
      await this.ensureConnection();

      const conversation = new ConversationModel({
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedConversation = await conversation.save();

      // Convert to plain object to avoid serialization issues
      const conversationObj = JSON.parse(JSON.stringify(savedConversation));

      return {
        ...conversationObj,
        id: conversationObj.id, // Use the custom ID, not MongoDB's _id
        _id: undefined,
      } as Conversation;
    } catch (error) {
      throw new Error(
        `Failed to create conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findById(id: string): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const conversation = await ConversationModel.findOne({ id }).lean();
      if (!conversation) return null;

      return this.convertToConversation(conversation);
    } catch (error) {
      throw new Error(
        `Failed to find conversation by id: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findAll(): Promise<Conversation[]> {
    try {
      await this.ensureConnection();

      const conversations = await ConversationModel.find({})
        .sort({ updatedAt: -1 })
        .lean();

      return conversations.map((conversation) =>
        this.convertToConversation(conversation)
      );
    } catch (error) {
      throw new Error(
        `Failed to find all conversations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async update(
    id: string,
    updateData: Partial<Omit<Conversation, "id" | "createdAt">>
  ): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const updatedConversation = await ConversationModel.findOneAndUpdate(
        { id },
        {
          ...updateData,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedConversation) return null;

      return this.convertToConversation(updatedConversation);
    } catch (error) {
      throw new Error(
        `Failed to update conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.ensureConnection();

      const result = await ConversationModel.findOneAndDelete({ id });
      return result !== null;
    } catch (error) {
      throw new Error(
        `Failed to delete conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteAll(): Promise<number> {
    try {
      await this.ensureConnection();

      const result = await ConversationModel.deleteMany({});
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(
        `Failed to delete all conversations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findByNodeId(nodeId: string): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const conversation = await ConversationModel.findOne({
        "nodes.id": nodeId,
      }).lean();

      if (!conversation) return null;

      return this.convertToConversation(conversation);
    } catch (error) {
      throw new Error(
        `Failed to find conversation by node id: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async addNode(
    conversationId: string,
    node: Conversation["nodes"][0]
  ): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const updatedConversation = await ConversationModel.findOneAndUpdate(
        { id: conversationId },
        {
          $push: { nodes: node },
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedConversation) return null;

      return this.convertToConversation(updatedConversation);
    } catch (error) {
      throw new Error(
        `Failed to add node to conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async addEdge(
    conversationId: string,
    edge: Conversation["edges"][0]
  ): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const updatedConversation = await ConversationModel.findOneAndUpdate(
        { id: conversationId },
        {
          $push: { edges: edge },
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedConversation) return null;

      return this.convertToConversation(updatedConversation);
    } catch (error) {
      throw new Error(
        `Failed to add edge to conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateNode(
    conversationId: string,
    nodeId: string,
    nodeData: Partial<Conversation["nodes"][0]>
  ): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      const updatedConversation = await ConversationModel.findOneAndUpdate(
        { id: conversationId, "nodes.id": nodeId },
        {
          $set: {
            "nodes.$": { ...nodeData, id: nodeId, updatedAt: new Date() },
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedConversation) return null;

      return this.convertToConversation(updatedConversation);
    } catch (error) {
      throw new Error(
        `Failed to update node in conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteNode(
    conversationId: string,
    nodeId: string
  ): Promise<Conversation | null> {
    try {
      await this.ensureConnection();

      // First remove the node
      const updatedConversation = await ConversationModel.findOneAndUpdate(
        { id: conversationId },
        {
          $pull: { nodes: { id: nodeId } },
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (updatedConversation) {
        // Then remove all edges connected to this node
        await ConversationModel.findOneAndUpdate(
          { id: conversationId },
          {
            $pull: {
              edges: {
                $or: [{ sourceNodeId: nodeId }, { targetNodeId: nodeId }],
              },
            },
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        );
      }

      if (!updatedConversation) return null;

      // Convert to plain object to avoid serialization issues
      const conversationObj = JSON.parse(JSON.stringify(updatedConversation));
      return this.convertToConversation(conversationObj);
    } catch (error) {
      throw new Error(
        `Failed to delete node from conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
