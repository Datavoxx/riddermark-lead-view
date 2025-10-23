import { Clock } from 'lucide-react';

export const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">AI Assistant</span>
      </div>
    </div>
  );
};
