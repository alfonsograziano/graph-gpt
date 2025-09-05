import { NextRequest, NextResponse } from "next/server";
import { chatService } from "@/services/chatService";
import { configService } from "@/services/configService";
import { ChatRequest, ErrorResponse } from "@/types";
import { z } from "zod";

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  nodeId: z.string().min(1, "Node ID is required"),
  conversationId: z.string().min(1, "Conversation ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    configService.validateEnvironment();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    // Create chat request object
    const chatRequest: ChatRequest = {
      message: validatedData.message,
      context: validatedData.context,
      nodeId: validatedData.nodeId,
      conversationId: validatedData.conversationId,
    };

    // Send message to OpenAI
    const response = await chatService.sendMessage(chatRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        error: "Validation error",
        code: "VALIDATION_ERROR",
        details: error.errors,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (error instanceof Error) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        code: "CHAT_SERVICE_ERROR",
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  try {
    // Health check endpoint
    configService.validateEnvironment();
    const isValid = await chatService.validateApiKey();

    return NextResponse.json({
      status: "healthy",
      openai: isValid ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
