import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChannelCreated: () => void;
}

interface Profile {
  user_id: string;
  name: string | null;
  email: string | null;
}

export function CreateChannelDialog({ open, onOpenChange, onChannelCreated }: CreateChannelDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open]);

  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .neq('user_id', user?.id);

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Kunde inte ladda säljare',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!channelName.trim()) {
      toast({
        title: 'Kanalnamn krävs',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: 'Välj minst en deltagare',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inte inloggad');

      const { data: channel, error: channelError } = await supabase
        .from('group_channels')
        .insert({
          name: channelName,
          created_by: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      const participants = [...selectedUsers, user.id].map(userId => ({
        channel_id: channel.id,
        user_id: userId,
      }));

      const { error: participantsError } = await supabase
        .from('channel_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast({
        title: 'Kanal skapad!',
        description: `${channelName} har skapats`,
      });

      setChannelName('');
      setSelectedUsers([]);
      onChannelCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Kunde inte skapa kanal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Skapa ny gruppchat</DialogTitle>
          <DialogDescription>
            Namnge din gruppchat och välj deltagare
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Kanalnamn</Label>
            <Input
              id="channel-name"
              placeholder="t.ex. Göteborg-teamet"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Välj deltagare</Label>
            {isLoadingProfiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[250px] border rounded-md p-4">
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div key={profile.user_id} className="flex items-center space-x-3">
                      <Checkbox
                        id={profile.user_id}
                        checked={selectedUsers.includes(profile.user_id)}
                        onCheckedChange={() => toggleUser(profile.user_id)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={profile.user_id}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div>{profile.name || 'Inget namn'}</div>
                        <div className="text-xs text-muted-foreground">{profile.email}</div>
                      </label>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Inga säljare tillgängliga
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedUsers.length} deltagare valda
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Skapa kanal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
