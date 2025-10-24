import { useState, useEffect } from "react";
import { Home, FileText, Archive, LogOut, Car, Bot, Hash, ChevronDown, Bell } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/Logo";
import { supabase } from "@/integrations/supabase/client";
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

type ConversationWithUser = {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
};

const agents = [
  { name: "Agent 1", id: "agent-1", url: "/agent/agent-1", icon: Bot },
  { name: "Agent 2", id: "agent-2", url: "/agent/agent-2", icon: Bot },
  { name: "Agent 3", id: "agent-3", url: "/agent/agent-3", icon: Bot },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);

  // Hämta konversationer från databasen
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      // Hämta alla konversationer för inloggade användaren
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('id, participant_1_id, participant_2_id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);
      
      if (convError) {
        console.error('Error fetching conversations:', convError);
        return;
      }

      // För varje konversation, hitta den andra användaren
      const conversationsWithUsers: ConversationWithUser[] = [];
      
      for (const conv of conversationsData || []) {
        const otherUserId = conv.participant_1_id === user.id 
          ? conv.participant_2_id 
          : conv.participant_1_id;
        
        // Hämta namn på den andra användaren
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', otherUserId)
          .single();
        
        if (!profileError && profile) {
          conversationsWithUsers.push({
            conversation_id: conv.id,
            other_user_id: otherUserId,
            other_user_name: profile.name || 'Unknown'
          });
        }
      }

      // Sortera efter namn
      conversationsWithUsers.sort((a, b) => 
        a.other_user_name.localeCompare(b.other_user_name)
      );
      
      setConversations(conversationsWithUsers);
    };

    fetchConversations();

    // Real-time subscription för nya konversationer
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
              {conversations.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Inga konversationer tillgängliga
                  </div>
                </SidebarMenuItem>
              ) : (
                conversations.map((conv) => (
                  <SidebarMenuItem key={conv.conversation_id}>
                    <SidebarMenuButton 
                      asChild
                      className={location.pathname === `/channel/${conv.conversation_id}` ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : ""}
                    >
                      <NavLink 
                        to={`/channel/${conv.conversation_id}`}
                      >
                        <Hash className="h-4 w-4" />
                        <span>{conv.other_user_name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
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
                  <SidebarMenuButton 
                    asChild
                    className={location.pathname === agent.url ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : ""}
                  >
                    <NavLink 
                      to={agent.url}
                    >
                      <agent.icon className="h-4 w-4" />
                      <span>{agent.name}</span>
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
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className={location.pathname === '/notiser' ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : ""}
                >
                  <NavLink to="/notiser">
                    <Bell className="h-4 w-4" />
                    <span>Notiser</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
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