import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatInput } from './ChatInput';
import { Message } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatContainerProps {
  channelId?: string;
}

export const ChatContainer = ({ channelId }: ChatContainerProps) => {
  const storageKey = channelId ? `chat-messages-${channelId}` : 'chat-messages-agent';
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  
  // Håll reda på aktiv kanal och avbryt controller
  const activeChannelRef = useRef(channelId);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Uppdatera aktiv kanal ref när channelId ändras
  useEffect(() => {
    activeChannelRef.current = channelId;
    
    // Avbryt pågående request när vi byter kanal
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [channelId]);

  // Ladda meddelanden när channelId ändras
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setMessages(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const sendMessage = async (content: string) => {
    setIsAnimating(true);
    
    // Kort delay för att låta fade-out animation spelas
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Spara vilket channelId denna request tillhör
    const requestChannelId = channelId;
    
    // Skapa en ny AbortController för denna request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { data, error } = await supabase.functions.invoke('chat-stream', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      // Kontrollera om vi fortfarande är på samma kanal
      if (activeChannelRef.current !== requestChannelId) {
        console.log('Channel changed, ignoring response');
        return;
      }

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Ignorera avbrutna requests
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      toast({
        title: 'Något gick fel',
        description: 'Kunde inte skicka meddelandet. Försök igen.',
        variant: 'destructive',
      });
    } finally {
      // Endast uppdatera loading state om vi fortfarande är på samma kanal
      if (activeChannelRef.current === requestChannelId) {
        setIsLoading(false);
        setIsAnimating(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClearMessages = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader channelId={channelId} onClearMessages={handleClearMessages} />
      
      {messages.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold mb-2">Hur kan jag hjälpa dig idag?</h1>
              <p className="text-muted-foreground">Välj ett förslag eller skriv din egen fråga</p>
            </div>
            <SuggestedPrompts onSelectPrompt={handlePromptSelect} isAnimating={isAnimating} />
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={isLoading}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
};
