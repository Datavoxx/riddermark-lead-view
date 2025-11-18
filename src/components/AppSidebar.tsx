import { useState, useEffect } from "react";
import { Home, FileText, Archive, LogOut, Car, Bot, Hash, ChevronDown, Bell, Plus, Users } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { CreateChannelDialog } from "@/components/CreateChannelDialog";
import { GroupChannelMenu } from "@/components/GroupChannelMenu";
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
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false);
  const [groupChannels, setGroupChannels] = useState<any[]>([]);
  const { unreadCounts } = useUnreadMessages(user?.id);

  const fetchConversations = async () => {
    if (!user?.id) return;

    const { data: conversationsData, error: convError } = await supabase
      .from('conversations')
      .select('id, participant_1_id, participant_2_id')
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);
    
    if (convError) {
      console.error('Error fetching conversations:', convError);
      return;
    }

    const conversationsWithUsers: ConversationWithUser[] = [];
    
    for (const conv of conversationsData || []) {
      const otherUserId = conv.participant_1_id === user.id 
        ? conv.participant_2_id 
        : conv.participant_1_id;
      
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

    conversationsWithUsers.sort((a, b) => 
      a.other_user_name.localeCompare(b.other_user_name)
    );
    
    setConversations(conversationsWithUsers);
  };

  const fetchGroupChannels = async () => {
    if (!user?.id) return;

    const { data: channels, error } = await supabase
      .from('group_channels')
      .select('id, name, created_at, created_by')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group channels:', error);
      return;
    }

    setGroupChannels(channels || []);
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchConversations();
    fetchGroupChannels();

    const conversationsChannel = supabase
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

    const groupChannelsChannel = supabase
      .channel('group-channels-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_channels'
        },
        () => {
          fetchGroupChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(groupChannelsChannel);
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
          <Logo h={56} />
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
            className="text-xs font-semibold text-muted-foreground px-2 flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md"
            onClick={() => setChannelsOpen(!channelsOpen)}
          >
            <div className="flex items-center gap-1">
              <ChevronDown className={`h-3 w-3 transition-transform ${channelsOpen ? '' : '-rotate-90'}`} />
              Kanaler
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 p-0 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateChannelDialog(true);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          {channelsOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.conversation_id}>
                  <SidebarMenuButton 
                    asChild
                    className={location.pathname === `/channel/${conv.conversation_id}` ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : ""}
                  >
                    <NavLink 
                      to={`/channel/${conv.conversation_id}`}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span>{conv.other_user_name}</span>
                      </div>
                      {unreadCounts[conv.conversation_id] > 0 && (
                        <Badge 
                          variant="default" 
                          className="ml-auto h-5 min-w-5 rounded-full px-1.5 text-xs font-medium bg-primary text-primary-foreground"
                        >
                          {unreadCounts[conv.conversation_id]}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {groupChannels.map((channel) => (
                <SidebarMenuItem key={channel.id} className="group">
                  <SidebarMenuButton 
                    asChild
                    className={location.pathname === `/channel/${channel.id}` ? "bg-accent text-accent-foreground font-medium hover:bg-accent" : ""}
                  >
                    <NavLink 
                      to={`/channel/${channel.id}`}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {unreadCounts[channel.id] > 0 && (
                          <Badge 
                            variant="default" 
                            className="h-5 min-w-5 rounded-full px-1.5 text-xs font-medium bg-primary text-primary-foreground"
                          >
                            {unreadCounts[channel.id]}
                          </Badge>
                        )}
                        <GroupChannelMenu
                          channelId={channel.id}
                          channelName={channel.name}
                          createdBy={channel.created_by}
                          currentChannelId={location.pathname.split('/')[2]}
                          onSuccess={() => {
                            fetchGroupChannels();
                          }}
                        />
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {conversations.length === 0 && groupChannels.length === 0 && (
                <SidebarMenuItem>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Inga konversationer tillgängliga
                  </div>
                </SidebarMenuItem>
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
                    className={location.pathname === agent.url ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" : "hover:bg-primary/10"}
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

      <CreateChannelDialog 
        open={showCreateChannelDialog}
        onOpenChange={setShowCreateChannelDialog}
        onChannelCreated={() => {
          fetchGroupChannels();
        }}
      />
    </Sidebar>
  );
}