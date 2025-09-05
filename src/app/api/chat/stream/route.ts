import { NextRequest, NextResponse } from "next/server";
import { streamingChatService } from "@/services/streamingChatService";
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

    // Create ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of streamingChatService.streamResponse(
            chatRequest
          )) {
            const data = JSON.stringify(chunk);
            const eventData = `event: ${chunk.type}\ndata: ${data}\n\n`;
            controller.enqueue(encoder.encode(eventData));
          }

          // Close the stream
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            content: error instanceof Error ? error.message : "Unknown error",
            nodeId: chatRequest.nodeId,
            conversationId: chatRequest.conversationId,
            timestamp: new Date(),
            isComplete: true,
          });
          const eventData = `event: error\ndata: ${errorData}\n\n`;
          controller.enqueue(encoder.encode(eventData));
          controller.close();
        }
      },
    });

    // Return streaming response with proper headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Streaming API error:", error);

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
        code: "STREAMING_SERVICE_ERROR",
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
    // Health check endpoint for streaming
    configService.validateEnvironment();
    const isValid = await streamingChatService.getStreamingConfig();

    return NextResponse.json({
      status: "healthy",
      streaming: "enabled",
      config: isValid,
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
