import { ConversationPage } from "@/components/pages/ConversationPage";
import { ConversationProvider } from "@/context";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    return <div>No conversation ID found</div>;
  }
  return (
    <ConversationProvider conversationId={id as string}>
      <ConversationPage />
    </ConversationProvider>
  );
}
