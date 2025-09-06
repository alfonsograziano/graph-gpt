import { useState, useCallback, useRef, useEffect } from "react";
import { StreamingState, StreamingChatRequest } from "@/types";

interface UseLLMStreamOptions {
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

interface UseLLMStreamReturn {
  state: StreamingState;
  content: string;
  isStreaming: boolean;
  isGenerating: boolean;
  error: Error | null;
  startStream: (request: StreamingChatRequest) => void;
  stopStream: () => void;
  reset: () => void;
}

export function useLLMStream(
  options: UseLLMStreamOptions = {}
): UseLLMStreamReturn {
  const [state, setState] = useState<StreamingState>("idle");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { onComplete, onError } = options;

  const isStreaming = state === "streaming";
  const isGenerating = state === "generating";

  const startStream = useCallback(
    async (request: StreamingChatRequest) => {
      try {
        // Reset state
        setState("generating");
        setContent("");
        setError(null);

        // Create abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Start the streaming request
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Transition to streaming state
        setState("streaming");

        // Read the stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body reader available");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const chunkData = JSON.parse(line);
                  console.log("chunkData", chunkData);
                  if (chunkData.error) {
                    throw new Error(chunkData.error);
                  }

                  if (chunkData.content) {
                    fullContent += chunkData.content;
                    setContent(fullContent);
                  }

                  if (chunkData.isComplete) {
                    setState("completed");
                    onComplete?.(fullContent);
                    return;
                  }
                } catch (parseError) {
                  console.warn("Failed to parse chunk:", parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, don't treat as error
          setState("idle");
          return;
        }

        const errorObj =
          error instanceof Error ? error : new Error("Unknown streaming error");
        setError(errorObj);
        setState("error");
        onError?.(errorObj);
      }
    },
    [onComplete, onError]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setState("idle");
    setContent("");
    setError(null);
  }, [stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    state,
    content,
    isStreaming,
    isGenerating,
    error,
    startStream,
    stopStream,
    reset,
  };
}
