import { Message } from './types';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    loadUser();
  }, []);

  const isCurrentUser = message.sender_id === currentUserId;

  // Parse message content to highlight @mentions
  const renderContent = () => {
    const parts = message.content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className={`font-semibold ${
              isCurrentUser ? 'text-primary-foreground/90' : 'text-primary'
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground px-2">{message.sender_name}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{renderContent()}</p>
        </div>
      </div>
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};
