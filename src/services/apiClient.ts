import { ApiResponse, ChatRequest, ChatResponse } from "../types";

class ApiClient {
  private baseUrl = "/api";

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || "API request failed");
    }

    return data.data as T;
  }

  /**
   * Send a chat request to the API
   */
  async sendChatRequest(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Chat API Error: ${response.status}`
        );
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to send chat request");
    }
  }

  /**
   * Handle API errors with proper error messages
   */
  handleApiError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }
}

export const apiClient = new ApiClient();
