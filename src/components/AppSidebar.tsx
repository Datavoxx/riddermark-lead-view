import { useState } from "react";
import { Home, FileText, Archive, LogOut, Car, Bot, Hash, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Hem", url: "/dashboard", icon: Home },
  { title: "Rapporter", url: "/reports", icon: FileText },
  { title: "Blocket", url: "/blocket/arenden", icon: Archive },
  { title: "Bil annonsgenerator", url: "/bil-annonsgenerator", icon: Car },
  { title: "Agent", url: "/agent", icon: Bot },
];

const channels = [
  { name: "röstmeddelande-oliver", id: "1" },
  { name: "röstmeddelande-säljare-1", id: "2" },
  { name: "röstmeddelande-säljare-2", id: "3" },
];

const agents = [
  { name: "Agent 1", id: "agent-1" },
  { name: "Agent 2", id: "agent-2" },
  { name: "Agent 3", id: "agent-3" },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : "hover:bg-accent/50";

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          <Logo h={32} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                      className={getNavClassName}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel 
            className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-1 cursor-pointer hover:bg-accent/50 rounded-md"
            onClick={() => setChannelsOpen(!channelsOpen)}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${channelsOpen ? '' : '-rotate-90'}`} />
            Kanaler
          </SidebarGroupLabel>
          {channelsOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              {channels.map((channel) => (
                <SidebarMenuItem key={channel.id}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/channel/${channel.id}`}
                      className={getNavClassName}
                    >
                      <Hash className="h-4 w-4" />
                      <span>{channel.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel 
            className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-1 cursor-pointer hover:bg-accent/50 rounded-md"
            onClick={() => setAgentsOpen(!agentsOpen)}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${agentsOpen ? '' : '-rotate-90'}`} />
            Agents
          </SidebarGroupLabel>
          {agentsOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              {agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/agent/${agent.id}`}
                      className={getNavClassName}
                    >
                      <Bot className="h-4 w-4" />
                      <span>{agent.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <div className="my-4 h-px bg-sidebar-border" />

      <SidebarFooter className="p-4">
        
        <div className="text-xs text-muted-foreground mb-2">
          {user?.email}
        </div>
        
        <SidebarMenuButton 
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Logga ut</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}