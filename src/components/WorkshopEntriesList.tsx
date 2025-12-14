import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Wrench } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { UpdateWorkshopStatusDialog } from "./UpdateWorkshopStatusDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const statusConfig = {
  in_workshop: { label: "I verkstad", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  in_progress: { label: "Pågående arbete", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  waiting_for_parts: { label: "Väntar på del", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  completed: { label: "Klar", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  picked_up: { label: "Uthämtad", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  relocated: { label: "Flyttad", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
};

export function WorkshopEntriesList() {
  const isMobile = useIsMobile();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['workshop-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop_entries')
        .select('*')
        .order('checked_in_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching workshop entries:', error);
        throw error;
      }
      console.log('Workshop entries fetched:', data);
      return data;
    },
    refetchInterval: 5000, // Uppdatera automatiskt var 5:e sekund
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/50 shadow-sm p-8 md:p-12">
        <div className="flex flex-col items-center gap-3">
          <Wrench className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Inga bilar i verkstad just nu
          </p>
        </div>
      </Card>
    );
  }

  const handleEditClick = (entry: any) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  return (
    <>
      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {entries.map((entry) => {
            const config = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.in_workshop;
            
            return (
              <Card key={entry.id} className="rounded-xl border border-border/50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{entry.workshop_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.workshop_address || 'Ingen adress'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ml-2 ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1 mb-3">
                  <p>Incheckad: {format(new Date(entry.checked_in_at), 'd MMM yyyy', { locale: sv })}</p>
                  <p className="font-mono text-xs">Bil: {entry.car_id.substring(0, 8)}...</p>
                </div>
                
                {entry.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 bg-muted/50 p-2 rounded-lg">
                    {entry.notes}
                  </p>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(entry)}
                  className="w-full rounded-lg"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Uppdatera status
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
        <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bil-ID</TableHead>
                <TableHead>Verkstad</TableHead>
                <TableHead>Adress</TableHead>
                <TableHead>Incheckad</TableHead>
                <TableHead>Uppdaterad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Anteckningar</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const config = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.in_workshop;
                
                return (
                  <TableRow key={entry.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-mono text-sm">
                      {entry.car_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{entry.workshop_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.workshop_address || '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(entry.checked_in_at), 'PPp', { locale: sv })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(entry.updated_at), 'PPp', { locale: sv })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {entry.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(entry)}
                        className="rounded-xl hover:bg-accent/60"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedEntry && (
        <UpdateWorkshopStatusDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          entry={selectedEntry}
        />
      )}
    </>
  );
}
