import { Bell, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TopBar } from '@/components/TopBar';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useEffect, useState } from 'react';

const getIcon = (type: string) => {
  switch (type) {
    case 'new_lead':
      return <Bell className="h-5 w-5 text-primary" />;
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
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to the referenced lead if it exists
    if (notification.reference_type === 'lead' && notification.reference_id) {
      navigate(`/blocket/arenden/${notification.reference_id}`);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: sv,
    });
  };

  return (
    <>
      <TopBar title="Notiser" />
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
                  {loading ? 'Laddar...' : `Du har ${unreadCount} olästa notiser`}
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  Markera alla som lästa
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {loading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg border">
                        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Inga notiser ännu</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/30 ${
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
                          <span>{formatRelativeTime(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
