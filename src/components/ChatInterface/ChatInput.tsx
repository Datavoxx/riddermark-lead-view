import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const ChatInput = ({ onSendMessage, disabled, value, onChange }: ChatInputProps) => {
  const [localValue, setLocalValue] = useState('');
  
  const inputValue = value !== undefined ? value : localValue;
  const handleChange = onChange || setLocalValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      handleChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv ditt meddelande..."
          disabled={disabled}
          className="flex-1 rounded-xl"
        />
        <Button type="submit" disabled={disabled || !inputValue.trim()} size="icon" className="rounded-xl">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
