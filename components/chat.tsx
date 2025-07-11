'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts'; // Import useLocalStorage
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';

export function Chat({
  id,
  initialMessages,
  autoMessage,
  selectedChatProvider, // Renamed prop
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  autoMessage?: string;
  selectedChatProvider: string; // Renamed prop type
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  // Use localStorage to persist the reasoning state
  const [useReasoning, setUseReasoning] = useLocalStorage<boolean>(
    'useReasoning', // Key for localStorage
    false, // Default value
  );

  // Determine the actual model ID based on provider and reasoning state
  const selectedModelId = useMemo(() => {
    if (useReasoning) {
      return selectedChatProvider === 'deepseek'
        ? 'deepseek-reasoning'
        : 'chat-model-reasoning'; // Default reasoning for openai
    } else {
      return selectedChatProvider === 'deepseek'
        ? 'deepseek-chat'
        : 'chat-model'; // Default chat for openai
    }
  }, [selectedChatProvider, useReasoning]);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: {
      id,
      selectedChatModel: selectedModelId, // Send the determined model ID
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: () => {
      console.error('Error in chat');
    },
  });

  // Auto-send query when chat is ready
  const [autoSent, setAutoSent] = useState(false);
  useEffect(() => {
    if (autoMessage && !autoSent && status === 'ready') {
      append({
        content: autoMessage,
        role: 'user',
        createdAt: new Date(),
        experimental_attachments: []
      });
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
      setAutoSent(true);
    }
  }, [autoMessage, autoSent, status, append]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedProviderId={selectedChatProvider} // Pass provider ID
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          useReasoning={useReasoning} // Pass persisted state down
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              useReasoning={useReasoning}
              setUseReasoning={setUseReasoning}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
