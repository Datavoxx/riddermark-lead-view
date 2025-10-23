import { useState, useRef, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useMentions } from '@/hooks/useMentions';
import { MentionsAutocomplete } from './MentionsAutocomplete';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const ChatInput = ({ onSendMessage, disabled, value, onChange }: ChatInputProps) => {
  const [localValue, setLocalValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const inputValue = value !== undefined ? value : localValue;
  const handleChange = onChange || setLocalValue;

  const {
    showMentions,
    filteredUsers,
    selectedIndex,
    selectUser,
    navigateUp,
    navigateDown,
  } = useMentions(inputValue, cursorPosition);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSelectUser = (user: any) => {
    const { beforeMention, mention, afterMention } = selectUser(user);
    const newValue = beforeMention + mention + ' ' + afterMention;
    handleChange(newValue);
    
    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = (beforeMention + mention + ' ').length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateUp();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateDown();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSelectUser(filteredUsers[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      handleChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex gap-2 max-w-4xl mx-auto relative">
        <div className="flex-1 relative">
          {showMentions && (
            <MentionsAutocomplete
              users={filteredUsers}
              selectedIndex={selectedIndex}
              onSelectUser={handleSelectUser}
            />
          )}
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            placeholder="Skriv ditt meddelande... (använd @ för att tagga kollegor)"
            disabled={disabled}
            className="flex-1 rounded-xl resize-none min-h-[42px] max-h-32"
            rows={1}
          />
        </div>
        <Button type="submit" disabled={disabled || !inputValue.trim()} size="icon" className="rounded-full h-[42px]">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
