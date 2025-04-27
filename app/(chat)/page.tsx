export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { UIMessage } from 'ai';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const id = generateUUID();

  // parse search params including follow-up
  const params = await searchParams;
  const { q, originalQuery, aiResponse, followUp } = params;
  let initialMessages: UIMessage[] = [];
  let autoMessage: string | undefined;

  if (originalQuery && aiResponse) {
    initialMessages = [
      { id: generateUUID(), role: 'user', content: originalQuery, createdAt: new Date(), parts: [{ type: 'text', text: originalQuery }] },
      { id: generateUUID(), role: 'assistant', content: aiResponse, createdAt: new Date(), parts: [{ type: 'text', text: aiResponse }] },
    ];
    autoMessage = followUp?.trim() || undefined;
  } else {
    initialMessages = [];
    autoMessage = typeof q === 'string' && q.trim() ? q.trim() : undefined;
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={initialMessages}
          autoMessage={autoMessage}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={initialMessages}
        autoMessage={autoMessage}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
