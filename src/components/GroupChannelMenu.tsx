import { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditChannelDialog } from './EditChannelDialog';
import { DeleteChannelDialog } from './DeleteChannelDialog';
import { useAuth } from '@/contexts/AuthContext';

interface GroupChannelMenuProps {
  channelId: string;
  channelName: string;
  createdBy: string;
  currentChannelId?: string;
  onSuccess?: () => void;
}

export function GroupChannelMenu({
  channelId,
  channelName,
  createdBy,
  currentChannelId,
  onSuccess,
}: GroupChannelMenuProps) {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Only show menu if user is the creator
  if (user?.id !== createdBy) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Byt namn
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Ta bort kanal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditChannelDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        channelId={channelId}
        currentName={channelName}
        onSuccess={onSuccess}
      />

      <DeleteChannelDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        channelId={channelId}
        channelName={channelName}
        currentChannelId={currentChannelId}
        onSuccess={onSuccess}
      />
    </>
  );
}
