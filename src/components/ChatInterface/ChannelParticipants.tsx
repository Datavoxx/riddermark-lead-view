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
      // Hämta deltagare och sedan deras profiler separat
      const { data: participantData, error: participantError } = await supabase
        .from('channel_participants')
        .select('user_id')
        .eq('channel_id', channelId);

      if (participantError) throw participantError;

      if (!participantData || participantData.length === 0) {
        setParticipants([]);
        return;
      }

      // Hämta profiler för alla användare
      const userIds = participantData.map(p => p.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      const formattedParticipants: Participant[] = (profileData || []).map((profile: any) => ({
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
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
