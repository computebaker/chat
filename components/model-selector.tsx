'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatProviderAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatProviders } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

export function ModelSelector({
  selectedProviderId,
  className,
}: {
  selectedProviderId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticProviderId, setOptimisticProviderId] =
    useOptimistic(selectedProviderId);

  const selectedChatProvider = useMemo(
    () => chatProviders.find((provider) => provider.id === optimisticProviderId),
    [optimisticProviderId],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="provider-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedChatProvider?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {chatProviders.map((chatProvider) => {
          const { id } = chatProvider;

          return (
            <DropdownMenuItem
              data-testid={`provider-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticProviderId(id);
                  saveChatProviderAsCookie(id);
                });
              }}
              data-active={id === optimisticProviderId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{chatProvider.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {chatProvider.description}
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
