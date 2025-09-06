import { NextRequest, NextResponse } from "next/server";
import { chatService } from "@/services/chatService";
import { configService } from "@/services/configService";
import { ErrorResponse, StreamingChatRequest } from "@/types";
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
  streaming: z.boolean().optional().default(false),
});

// Handle streaming requests
async function handleStreamingRequest(chatRequest: StreamingChatRequest) {
  try {
    // Create a ReadableStream for HTTP streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send streaming message to OpenAI
          await chatService.sendStreamingMessage(chatRequest, (chunk) => {
            // Send chunk as JSON line
            const chunkData =
              JSON.stringify({
                content: chunk.content,
                isComplete: chunk.isComplete,
                chunkIndex: chunk.chunkIndex,
                timestamp: chunk.timestamp.toISOString(),
              }) + "\n";

            controller.enqueue(new TextEncoder().encode(chunkData));
          });

          // Close the stream
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData =
            JSON.stringify({
              error: error instanceof Error ? error.message : "Streaming error",
              isComplete: true,
            }) + "\n";
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Streaming setup error:", error);
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : "Streaming setup error",
      code: "STREAMING_ERROR",
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    configService.validateEnvironment();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    // Create chat request object
    const chatRequest: StreamingChatRequest = {
      message: validatedData.message,
      context: validatedData.context,
      nodeId: validatedData.nodeId,
      conversationId: validatedData.conversationId,
      streaming: validatedData.streaming,
    };

    // Handle streaming vs non-streaming requests
    if (chatRequest.streaming) {
      return await handleStreamingRequest(chatRequest);
    } else {
      // Send message to OpenAI (non-streaming)
      const response = await chatService.sendMessage(chatRequest);
      return NextResponse.json(response);
    }
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
