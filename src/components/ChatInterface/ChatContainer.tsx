import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatInput } from './ChatInput';
import { Message } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

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

    try {
      const { data, error } = await supabase.functions.invoke('chat-stream', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Något gick fel',
        description: 'Kunde inte skicka meddelandet. Försök igen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />
      
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
