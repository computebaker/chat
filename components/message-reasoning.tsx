'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Markdown } from './markdown';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading, // Keep isLoading prop for potential future use, but don't use it for conditional rendering here
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Log the reasoning prop to see its value during render
  console.log('MessageReasoning rendering with reasoning:', reasoning);

  return (
    <div className="flex flex-col">
      {/* Always show the toggle header, regardless of isLoading */}
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium">Reasoning</div>
        {/* Optionally show spinner if needed, but keep toggle visible */}
        {isLoading && (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        )}
        <button
          data-testid="message-reasoning-toggle"
          type="button"
          className="cursor-pointer ml-auto" // Adjust positioning if needed
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <span className={`transition-transform duration-200 inline-block ${isExpanded ? '' : '-rotate-90'}`}>
            <ChevronDownIcon />
          </span>
        </button>
      </div>

      {/* Reasoning content area (simplified from previous step) */}
      {isExpanded && (
        <div
          data-testid="message-reasoning"
          style={{ overflow: 'hidden' }}
          className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4 mt-4 mb-2"
        >
          {/* Temporarily use <pre> instead of <Markdown> */}
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {reasoning}
          </pre>
        </div>
      )}
    </div>
  );
}
