import mongoose, { Schema, Document } from "mongoose";
import {
  Conversation as IConversation,
  ConversationNode,
  ConversationEdge,
} from "../types";

export interface ConversationDocument extends IConversation, Document {}

const ConversationNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    data: {
      userMessage: { type: String },
      assistantMessage: { type: String },
      isStreaming: { type: Boolean, default: false },
      isActive: { type: Boolean, default: false },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
    },
  },
  { _id: false }
);

const ConversationEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String },
    targetHandle: { type: String },
    type: { type: String },
  },
  { _id: false }
);

const ConversationSchema = new Schema<ConversationDocument>({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  nodes: [ConversationNodeSchema],
  edges: [ConversationEdgeSchema],
  activeNodeId: { type: String },
});

// Update the updatedAt field before saving
ConversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Conversation ||
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);
