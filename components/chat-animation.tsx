'use client';

import { useEffect, useState } from 'react';
import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from '@/components/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';

// Mock messages for animation based on the provided conversation
const mockMessages: UIMessage[] = [
    {
        id: '1',
        role: 'user',
        content: 'Hello, how does this work?',
        createdAt: new Date(),
        parts: [{ type: 'text', text: 'Hello, how does this work?' }],
    },
    {
        id: '2',
        role: 'assistant',
        content: 'This is how a conversation flows: you ask, I think, then I respond.',
        createdAt: new Date(),
        parts: [{ type: 'text', text: 'This is how a conversation flows: you ask, I think, then I respond.' }],
    },
    {
        id: '3',
        role: 'user',
        content: 'So what do you think about Tekir?',
        createdAt: new Date(),
        parts: [{ type: 'text', text: 'So what do you think about Tekir?' }],
    },
    {
        id: '4',
        role: 'assistant',
        content: 'Pretty cool search engine, and it is open source too!',
        createdAt: new Date(),
        parts: [{ type: 'text', text: 'Pretty cool search engine, and it is open source too!' }],
    },
];

export function ChatAnimation() {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [showThinking, setShowThinking] = useState(false);
    const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        // Step 1: show first user message
        timers.push(
            setTimeout(() => {
                setMessages([mockMessages[0]]);
            }, 50)
        );
        // Step 2: show thinking indicator
        timers.push(
            setTimeout(() => {
                setShowThinking(true);
            }, 2500)
        );
        // Step 3: show first assistant answer
        timers.push(
            setTimeout(() => {
                setShowThinking(false);
                setMessages([mockMessages[0], mockMessages[1]]);
            }, 5000)
        );
        // Step 4: show second user message
        timers.push(
            setTimeout(() => {
                setMessages([mockMessages[0], mockMessages[1], mockMessages[2]]);
            }, 8000)
        );
        // Step 5: show thinking indicator again
        timers.push(
            setTimeout(() => {
                setShowThinking(true);
            }, 10000)
        );
        // Step 6: show final assistant answer
        timers.push(
            setTimeout(() => {
                setShowThinking(false);
                setMessages([mockMessages[0], mockMessages[1], mockMessages[2], mockMessages[3]]);
            }, 12000)
        );

        return () => timers.forEach(clearTimeout);
    }, []);


    return (
        <div ref={containerRef} className="flex-1 flex flex-col space-y-4 overflow-y-auto p-2 border-l border-gray-200 dark:border-zinc-700">
            {messages.map((message) => (
                <PreviewMessage
                    key={message.id}
                    chatId=""
                    message={message}
                    vote={undefined}
                    isLoading={false}
                    setMessages={() => {}}
                    reload={async () => null}
                    isReadonly={true}
                />
            ))}
            {showThinking && <ThinkingMessage useReasoning={true} />}
            <div ref={endRef} />
        </div>
    );
}