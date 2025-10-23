import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MentionUser {
  user_id: string;
  name: string;
  email: string;
}

export const useMentions = (inputValue: string, cursorPosition: number) => {
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(0);

  // Fetch users from profiles
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .not('name', 'is', null);

      if (data && !error) {
        setUsers(data as MentionUser[]);
      }
    };

    fetchUsers();
  }, []);

  // Detect @ mentions in input
  useEffect(() => {
    const textBeforeCursor = inputValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's a space after @, if so, don't show mentions
      if (textAfterAt.includes(' ')) {
        setShowMentions(false);
        return;
      }

      setMentionQuery(textAfterAt.toLowerCase());
      setMentionStartPos(lastAtIndex);
      setShowMentions(true);
      setSelectedIndex(0);

      // Filter users based on query
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(textAfterAt.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setShowMentions(false);
    }
  }, [inputValue, cursorPosition, users]);

  const selectUser = useCallback((user: MentionUser) => {
    return {
      beforeMention: inputValue.slice(0, mentionStartPos),
      mention: `@${user.name}`,
      afterMention: inputValue.slice(cursorPosition),
    };
  }, [inputValue, mentionStartPos, cursorPosition]);

  const navigateUp = useCallback(() => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredUsers.length - 1));
  }, [filteredUsers.length]);

  const navigateDown = useCallback(() => {
    setSelectedIndex(prev => (prev < filteredUsers.length - 1 ? prev + 1 : 0));
  }, [filteredUsers.length]);

  return {
    showMentions,
    filteredUsers,
    selectedIndex,
    selectUser,
    navigateUp,
    navigateDown,
  };
};
