import { useParams, Navigate } from 'react-router-dom';
import { ChatContainer } from '@/components/ChatInterface/ChatContainer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AgentSidebar } from '@/components/AgentSidebar';

const agentNames: Record<string, string> = {
  'agent-1': 'Agent 1',
  'agent-2': 'Agent 2',
  'agent-3': 'Agent 3',
};

export default function Agent() {
  const { agentId } = useParams<{ agentId: string }>();
  
  // Om ingen agentId, redirect till agent-1
  if (!agentId) {
    return <Navigate to="/agent/agent-1" replace />;
  }

  // Om ogiltigt agentId, redirect till agent-1
  if (!agentNames[agentId]) {
    return <Navigate to="/agent/agent-1" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AgentSidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b border-border bg-background flex items-center px-4">
            <SidebarTrigger />
          </div>
          <ChatContainer 
            agentId={agentId}
            agentName={agentNames[agentId]}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
