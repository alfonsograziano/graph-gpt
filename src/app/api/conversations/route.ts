import { NextRequest, NextResponse } from "next/server";
import { ConversationService } from "../../../services/conversationService";
import { ApiResponse } from "../../../types";

const conversationService = new ConversationService();

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const conversations = await conversationService.getAllConversations();

    return NextResponse.json({
      success: true,
      data: conversations,
      message: "Conversations retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch conversations",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();

    if (
      !body.title ||
      typeof body.title !== "string" ||
      body.title.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Title is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const conversation = await conversationService.createConversation(
      body.title
    );

    return NextResponse.json(
      {
        success: true,
        data: conversation,
        message: "Conversation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create conversation",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  try {
    const deletedCount = await conversationService.deleteAllConversations();

    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `Successfully deleted ${deletedCount} conversations`,
    });
  } catch (error) {
    console.error("Error deleting all conversations:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete all conversations",
      },
      { status: 500 }
    );
  }
}
