export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  mentions?: string[];
};

export type SuggestedPrompt = {
  id: string;
  text: string;
  icon: string;
};
