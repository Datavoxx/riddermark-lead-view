import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingChannel?: boolean;
}

export const MessageList = ({ messages, isLoading, isLoadingChannel = false }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 px-4">
      <div ref={scrollRef} className="space-y-4 py-4">
        {messages.length === 0 && !isLoadingChannel ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Inga meddelanden ännu. Börja konversationen!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
    </ScrollArea>
  );
};
