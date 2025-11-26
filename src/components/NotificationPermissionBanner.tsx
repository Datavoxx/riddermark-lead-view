import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted' || result === 'denied') {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  // Don't show banner if:
  // - Not supported
  // - Already granted
  // - Already denied (can't re-request)
  // - User dismissed it
  if (!isSupported || permission === 'granted' || permission === 'denied' || isDismissed) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-l-4 border-primary p-4 mb-4 mt-2 rounded-lg flex items-start gap-3 relative z-10">
      <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">Aktivera notiser</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Få direktnotiser när nya ärenden kommer in, även när du är på andra webbsidor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" size="default" onClick={handleRequestPermission}>
            Aktivera
          </Button>
          <Button type="button" size="default" variant="ghost" onClick={handleDismiss}>
            Inte nu
          </Button>
        </div>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 flex-shrink-0"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
