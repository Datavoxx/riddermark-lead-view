import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
  currentChannelId?: string;
  onSuccess?: () => void;
}

export function DeleteChannelDialog({
  open,
  onOpenChange,
  channelId,
  channelName,
  currentChannelId,
  onSuccess,
}: DeleteChannelDialogProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      // 1. Delete all messages in the channel
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channelId);

      if (messagesError) throw messagesError;

      // 2. Delete all participants
      const { error: participantsError } = await supabase
        .from('channel_participants')
        .delete()
        .eq('channel_id', channelId);

      if (participantsError) throw participantsError;

      // 3. Delete the channel itself
      const { error: channelError } = await supabase
        .from('group_channels')
        .delete()
        .eq('id', channelId);

      if (channelError) throw channelError;

      toast({
        title: 'Klart!',
        description: 'Kanalen har tagits bort',
      });

      // If user is currently in this channel, navigate away
      if (currentChannelId === channelId) {
        navigate('/');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: 'Något gick fel',
        description: 'Kunde inte ta bort kanalen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Är du säker?</AlertDialogTitle>
          <AlertDialogDescription>
            Du är på väg att ta bort kanalen <strong>"{channelName}"</strong>.
            <br />
            <br />
            Alla meddelanden i kanalen kommer att raderas permanent. Denna åtgärd kan inte ångras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Tar bort...' : 'Ta bort kanal'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
