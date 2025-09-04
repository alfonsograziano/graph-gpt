import { apiClient } from "./apiClient";
import { Conversation } from "../types";

export class FrontendConversationService {
  static async getConversations(): Promise<Conversation[]> {
    return apiClient.request<Conversation[]>("/conversations");
  }

  static async createConversation(title: string): Promise<Conversation> {
    return apiClient.request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  }

  static async getConversation(id: string): Promise<Conversation> {
    return apiClient.request<Conversation>(`/conversations/${id}`);
  }

  static async updateConversation(
    id: string,
    updateData: Partial<Omit<Conversation, "id" | "createdAt">>
  ): Promise<Conversation> {
    return apiClient.request<Conversation>(`/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  static async deleteConversation(id: string): Promise<boolean> {
    return apiClient.request<boolean>(`/conversations/${id}`, {
      method: "DELETE",
    });
  }
}
