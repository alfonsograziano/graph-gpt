import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { CreateConversationRequest } from "@/types";

export async function GET() {
  try {
    await connectDB();
    const conversations = await Conversation.find({})
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body: CreateConversationRequest = await request.json();

    const title = body.title || new Date().toISOString();

    // Create initial conversation with one empty node
    const initialNode = {
      id: "node-1",
      type: "conversation",
      data: {
        position: { x: 250, y: 250 },
        isActive: true,
      },
    };

    const conversation = new Conversation({
      title,
      nodes: [initialNode],
      edges: [],
      activeNodeId: "node-1",
    });

    await conversation.save();

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
