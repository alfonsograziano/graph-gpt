import { notFound, redirect } from "next/navigation";
import { ConversationPage } from "@/components/pages/ConversationPage";
import { conversationService } from "@/services/conversationService";

interface PageProps {
  params: { id: string };
}

export default async function ChatPage({ params }: PageProps) {
  try {
    const conversation = await conversationService.getConversation(params.id);

    if (!conversation) {
      notFound();
    }

    return <ConversationPage conversation={conversation} />;
  } catch (error) {
    console.error("Error loading conversation:", error);
    redirect("/");
  }
}
