import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Participant {
  user_id: string;
  name: string | null;
  email: string | null;
}

interface ChannelParticipantsProps {
  channelId: string;
}

export const ChannelParticipants = ({ channelId }: ChannelParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadParticipants();
    }
  }, [isOpen, channelId]);

  const loadParticipants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('channel_participants')
        .select(`
          user_id,
          profiles!channel_participants_user_id_fkey(
            name,
            email
          )
        `)
        .eq('channel_id', channelId);

      if (error) throw error;

      const formattedParticipants: Participant[] = (data || []).map((p: any) => ({
        user_id: p.user_id,
        name: p.profiles?.name,
        email: p.profiles?.email,
      }));

      setParticipants(formattedParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Deltagare</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Deltagare i kanalen</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-6">
          <div className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {participants.map((participant) => (
                  <div key={participant.user_id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(participant.name, participant.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {participant.name || 'Inget namn'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {participant.email || 'Ingen email'}
                      </p>
                    </div>
                  </div>
                ))}
                {participants.length === 0 && !isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Inga deltagare hittades
                  </p>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
