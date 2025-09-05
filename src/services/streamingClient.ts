import { StreamingResponse, ChatRequest } from "../types";

class StreamingClient {
  private abortController: AbortController | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  async streamResponse(
    request: ChatRequest,
    onChunk: (response: StreamingResponse) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      // Cancel any existing request
      if (this.abortController) {
        this.abortController.abort();
      }

      // Create new abort controller
      this.abortController = new AbortController();

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onComplete();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                onChunk(data);
              } catch (parseError) {
                console.warn("Failed to parse streaming data:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled, don't retry
        return;
      }

      console.error("Streaming client error:", error);

      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(
          `Retrying streaming request (${this.retryCount}/${this.maxRetries})`
        );

        setTimeout(() => {
          this.streamResponse(request, onChunk, onError, onComplete);
        }, this.retryDelay * this.retryCount);
      } else {
        onError(
          error instanceof Error ? error : new Error("Unknown streaming error")
        );
      }
    }
  }

  stopStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.retryCount = 0;
  }

  isStreaming(): boolean {
    return (
      this.abortController !== null && !this.abortController.signal.aborted
    );
  }

  updateRetryConfig(maxRetries: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
}

export const streamingClient = new StreamingClient();
