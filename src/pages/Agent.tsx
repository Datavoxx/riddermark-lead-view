import { useParams, Navigate } from 'react-router-dom';
import { ChatContainer } from '@/components/ChatInterface/ChatContainer';

const agentNames: Record<string, string> = {
  'agent-1': 'Agent 1',
  'agent-2': 'Agent 2',
  'agent-3': 'Agent 3',
};

export default function Agent() {
  const { agentId } = useParams<{ agentId: string }>();
  
  // Om ingen agentId, redirect till agent-1
  if (!agentId) {
    return <Navigate to="/fordonstatus/agent/agent-1" replace />;
  }

  // Om ogiltigt agentId, redirect till agent-1
  if (!agentNames[agentId]) {
    return <Navigate to="/fordonstatus/agent/agent-1" replace />;
  }

  return (
    <ChatContainer 
      agentId={agentId}
      agentName={agentNames[agentId]}
    />
  );
}
