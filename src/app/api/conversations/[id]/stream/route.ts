import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { StreamMessageRequest } from "@/types";

// Mock LLM function - replace with actual LLM integration
async function* mockLLMStream(
  message: string,
  context?: string
): AsyncGenerator<string> {
  const fullMessage = context
    ? `This message is related to: ${context}\n\n${message}`
    : message;

  // Simulate streaming response
  const response = `I understand you're asking about: "${fullMessage}". This is a mock response that would normally come from an LLM. Here's some detailed information:

## Key Points
- This is a **streaming response**
- The content is being generated in real-time
- You can continue the conversation from any point

### Features
1. **Graph-based conversations** - Think non-linearly
2. **Multiple branches** - Explore different paths
3. **Context awareness** - Each node knows its history

Would you like to explore any specific aspect further?`;

  const words = response.split(" ");
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? " " : "");
    await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body: StreamMessageRequest = await request.json();
    const { message, context } = body;

    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial response
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "content", content: "" })}\n\n`
            )
          );

          let fullResponse = "";
          for await (const chunk of mockLLMStream(message, context)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "content",
                  content: fullResponse,
                })}\n\n`
              )
            );
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Streaming failed",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error streaming message:", error);
    return NextResponse.json(
      { error: "Failed to stream message" },
      { status: 500 }
    );
  }
}
