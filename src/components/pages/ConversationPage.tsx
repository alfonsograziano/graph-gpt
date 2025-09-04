"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { EditableTitle } from "@/components/ui/EditableTitle";
import { Button } from "@/components/ui/Button";
import { useConversation } from "@/hooks/useConversation";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ConversationPageProps {
  conversationId: string;
}

export const ConversationPage: React.FC<ConversationPageProps> = ({
  conversationId,
}) => {
  const router = useRouter();
  const { conversation, isLoading, updateConversation } =
    useConversation(conversationId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(conversation?.title || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleTitleSave = async (newTitle: string) => {
    if (newTitle.trim() === conversation?.title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateConversation({ title: newTitle });
      setTitle(newTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      // Revert title on error
      setTitle(conversation?.title || "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleCancel = () => {
    setTitle(conversation?.title || "");
    setIsEditingTitle(false);
  };

  useEffect(() => {
    setTitle(conversation?.title || "");
  }, [conversation]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Button>
          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <EditableTitle
                value={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                isLoading={isSaving}
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {title}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        {isLoading || !conversation ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <GraphCanvas conversation={conversation} />
        )}
      </div>
    </div>
  );
};
