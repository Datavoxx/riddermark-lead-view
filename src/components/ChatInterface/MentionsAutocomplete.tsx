import { MentionUser } from '@/hooks/useMentions';
import { User } from 'lucide-react';

interface MentionsAutocompleteProps {
  users: MentionUser[];
  selectedIndex: number;
  onSelectUser: (user: MentionUser) => void;
}

export const MentionsAutocomplete = ({
  users,
  selectedIndex,
  onSelectUser,
}: MentionsAutocompleteProps) => {
  if (users.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="max-h-48 overflow-y-auto">
        {users.map((user, index) => (
          <button
            key={user.user_id}
            type="button"
            onClick={() => onSelectUser(user)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors ${
              index === selectedIndex ? 'bg-accent' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
