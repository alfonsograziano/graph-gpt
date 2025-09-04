import { NextRequest, NextResponse } from "next/server";
import { ConversationService } from "../../../../services/conversationService";
import { ApiResponse } from "../../../../types";

const conversationService = new ConversationService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required",
        },
        { status: 400 }
      );
    }

    const conversation = await conversationService.getConversation(id);

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      message: "Conversation retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch conversation",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the update data
    if (
      body.title !== undefined &&
      (typeof body.title !== "string" || body.title.trim().length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Title must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const updatedConversation = await conversationService.updateConversation(
      id,
      body
    );

    if (!updatedConversation) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedConversation,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error("Error updating conversation:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update conversation",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required",
        },
        { status: 400 }
      );
    }

    const deleted = await conversationService.deleteConversation(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete conversation",
      },
      { status: 500 }
    );
  }
}
