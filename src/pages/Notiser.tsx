import { Bell, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockNotifications = [
  {
    id: '1',
    type: 'mention',
    title: 'Johan nämnde dig',
    message: '@phille kan du kolla på detta lead?',
    time: '5 minuter sedan',
    read: false,
  },
  {
    id: '2',
    type: 'task',
    title: 'Ny uppgift tilldelad',
    message: 'Du har tilldelats en ny kund att kontakta',
    time: '1 timme sedan',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Lead konverterad',
    message: 'Ditt lead från Blocket har konverterats till en kund',
    time: '3 timmar sedan',
    read: true,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Deadline närmar sig',
    message: 'Du har 2 ärenden som måste slutföras idag',
    time: '5 timmar sedan',
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'mention':
      return <Bell className="h-5 w-5 text-primary" />;
    case 'task':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'alert':
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export default function Notiser() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Notiser</h1>
        <p className="text-muted-foreground mt-2">
          Håll koll på dina uppdateringar och notifikationer
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alla notiser</CardTitle>
              <CardDescription>
                Du har {mockNotifications.filter(n => !n.read).length} olästa notiser
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-4 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-background border-border'
                      : 'bg-accent/50 border-primary/20'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">
                          Ny
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
