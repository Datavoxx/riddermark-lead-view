import { Clock, Hash, RotateCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChannelParticipants } from './ChannelParticipants';

interface ChatHeaderProps {
  channelId?: string;
  channelName?: string;
  onClearMessages: () => void;
  isGroupChannel?: boolean;
}

export const ChatHeader = ({ channelId, channelName, onClearMessages, isGroupChannel }: ChatHeaderProps) => {
  const displayName = channelName || 'Chat';
  const Icon = isGroupChannel ? Users : (channelId ? Hash : Clock);

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        {!channelId ? (
          <SidebarTrigger />
        ) : (
          <Icon className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground">{displayName}</span>
      </div>
      <div className="flex items-center gap-2">
        {isGroupChannel && channelId && (
          <ChannelParticipants channelId={channelId} />
        )}
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
    </div>
  );
};
