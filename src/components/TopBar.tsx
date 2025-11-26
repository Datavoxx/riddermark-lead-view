import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id);
  const { permission, requestPermission } = usePushNotifications();

  const handleNotificationClick = async () => {
    // If permission not granted, request it
    if (permission === 'default') {
      await requestPermission();
    }
    // Navigate to notifications page
    navigate('/notiser');
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        <h1 className="font-semibold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleNotificationClick}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 text-xs font-medium"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}