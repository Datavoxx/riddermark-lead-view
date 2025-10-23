export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type SuggestedPrompt = {
  id: string;
  text: string;
  icon: string;
};
