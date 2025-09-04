import { ConversationPage } from "@/components/pages/ConversationPage";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    return <div>No conversation ID found</div>;
  }
  return <ConversationPage conversationId={id as string} />;
}
