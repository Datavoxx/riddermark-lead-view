import { Clock, Hash, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  channelId?: string;
  channelName?: string;
  onClearMessages: () => void;
}

export const ChatHeader = ({ channelId, channelName, onClearMessages }: ChatHeaderProps) => {
  const displayName = channelName || 'AI Assistant';
  const Icon = channelId ? Hash : Clock;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{displayName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearMessages}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Ny chatt
      </Button>
    </div>
  );
};
