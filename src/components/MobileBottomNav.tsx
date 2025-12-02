import { NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Car, Bell, Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ComposeEmailModal } from "./ComposeEmailModal";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Hem", path: "/dashboard" },
  { icon: FileText, label: "Rapporter", path: "/reports" },
  { icon: Car, label: "Blocket", path: "/blocket/arenden" },
  { icon: Mail, label: "Inkorg", path: "/inkorg" },
  { icon: Bell, label: "Notiser", path: "/notiser" },
];

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  if (!isMobile) return null;

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Floating Compose Button */}
      <button
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-primary text-primary-foreground 
          px-5 py-3 rounded-full shadow-lg shadow-primary/30
          flex items-center gap-2 font-medium
          active:scale-95 transition-transform"
      >
        <PenLine className="h-5 w-5" />
        <span>Nytt e-post</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 
        bg-background/95 backdrop-blur-lg
        border-t border-border
        rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Compose Modal */}
      <ComposeEmailModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </>
  );
}
