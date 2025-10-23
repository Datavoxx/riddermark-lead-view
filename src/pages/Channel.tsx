import { useParams } from 'react-router-dom';
import { ChatContainer } from '@/components/ChatInterface/ChatContainer';

export default function Channel() {
  const { id } = useParams<{ id: string }>();
  
  return <ChatContainer channelId={id} />;
}
