import mongoose, { Schema } from "mongoose";
import {
  Conversation,
  Node,
  Edge,
  ConversationMetadata,
  Position,
  NodeType,
  EdgeType,
} from "@/types";

// Position Schema
const PositionSchema = new Schema<Position>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

// Node Schema
const NodeSchema = new Schema<Node>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["input", "loading", "completed"] as NodeType[],
      required: true,
    },
    userMessage: { type: String, required: false, default: "" },
    assistantResponse: { type: String, default: "" },
    position: { type: PositionSchema, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    parentNodeId: { type: String, required: false },
  },
  { _id: false }
);

// Edge Schema
const EdgeSchema = new Schema<Edge>(
  {
    id: { type: String, required: true },
    sourceNodeId: { type: String, required: true },
    targetNodeId: { type: String, required: true },
    type: {
      type: String,
      enum: ["auto", "manual", "markdown"] as EdgeType[],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    metadata: {
      markdownElementId: { type: String, required: false },
      contextSnippet: { type: String, required: false },
    },
  },
  { _id: false }
);

// Conversation Metadata Schema
const ConversationMetadataSchema = new Schema<ConversationMetadata>(
  {
    nodeCount: { type: Number, default: 0 },
    lastActiveNodeId: { type: String, required: false },
    tags: [{ type: String }],
  },
  { _id: false }
);

// Main Conversation Schema
const ConversationSchema = new Schema<Conversation>(
  {
    id: { type: String, required: true, unique: true },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    nodes: [NodeSchema],
    edges: [EdgeSchema],
    metadata: { type: ConversationMetadataSchema, required: true },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);

// Pre-save middleware to update metadata
ConversationSchema.pre("save", function (next) {
  if (this.isModified("nodes")) {
    this.metadata.nodeCount = this.nodes.length;
    if (this.nodes.length > 0) {
      // Set lastActiveNodeId to the most recently updated node
      const lastNode = this.nodes.reduce((latest, current) =>
        current.updatedAt > latest.updatedAt ? current : latest
      );
      this.metadata.lastActiveNodeId = lastNode.id;
    }
  }
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model<Conversation>("Conversation", ConversationSchema);
