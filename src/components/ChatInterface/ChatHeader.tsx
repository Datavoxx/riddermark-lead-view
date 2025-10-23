import { Clock, Hash, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  channelId?: string;
  channelName?: string;
  onClearMessages: () => void;
}

const channelNames: Record<string, string> = {
  '1': 'röstmeddelande-oliver',
  '2': 'röstmeddelande-säljare-1',
  '3': 'röstmeddelande-säljare-2',
  '4': 'sälj-1',
  '5': 'sälj-2',
  '6': 'sälj-3',
};

export const ChatHeader = ({ channelId, onClearMessages }: ChatHeaderProps) => {
  const displayName = channelId ? channelNames[channelId] : 'AI Assistant';
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
