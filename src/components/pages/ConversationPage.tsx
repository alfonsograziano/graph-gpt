"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { EditableTitle } from "@/components/ui/EditableTitle";
import { Button } from "@/components/ui/Button";
import { useConversation } from "@/hooks/useConversation";

interface ConversationPageProps {
  conversation: Conversation;
}

export const ConversationPage: React.FC<ConversationPageProps> = ({
  conversation: initialConversation,
}) => {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialConversation.title);
  const [isSaving, setIsSaving] = useState(false);

  const { updateConversation } = useConversation(initialConversation.id);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleTitleSave = async (newTitle: string) => {
    if (newTitle.trim() === initialConversation.title) {
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
      setTitle(initialConversation.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleCancel = () => {
    setTitle(initialConversation.title);
    setIsEditingTitle(false);
  };

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
        <GraphCanvas conversation={initialConversation} />
      </div>
    </div>
  );
};
