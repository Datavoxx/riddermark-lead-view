import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

export function WorkshopEntriesList() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['workshop-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop_entries')
        .select(`
          *,
          cars (
            regnr,
            marke_modell
          )
        `)
        .order('checked_in_at', { ascending: false });
      
      if (error) throw error;
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
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Inga bilar i verkstad just nu
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bil</TableHead>
            <TableHead>Regnummer</TableHead>
            <TableHead>Verkstad</TableHead>
            <TableHead>Adress</TableHead>
            <TableHead>Incheckad</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                {entry.cars?.marke_modell}
              </TableCell>
              <TableCell>{entry.cars?.regnr}</TableCell>
              <TableCell>{entry.workshop_name}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.workshop_address || '—'}
              </TableCell>
              <TableCell>
                {format(new Date(entry.checked_in_at), 'PPp', { locale: sv })}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  {entry.status === 'in_workshop' ? 'I verkstad' : entry.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
