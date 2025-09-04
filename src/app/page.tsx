"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const conversation = await response.json();
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Graph GPT</h1>
          <button
            onClick={createConversation}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {creating ? "Creating..." : "New Conversation"}
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Think non-linearly. Create graph-based conversations with AI.
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No conversations yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start your first graph-based conversation
            </p>
            <button
              onClick={createConversation}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {creating ? "Creating..." : "Create Conversation"}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => router.push(`/chat/${conversation._id}`)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                  {conversation.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {formatDate(conversation.updatedAt)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{conversation.nodes.length} nodes</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
