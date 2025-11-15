import { Card } from '@/components/ui/card';
import { Lightbulb, Sparkles, Zap, Target, Rocket } from 'lucide-react';
import { SuggestedPrompt } from './types';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isAnimating?: boolean;
}

const prompts: SuggestedPrompt[] = [
  { id: '1', text: 'Hjälp mig att förstå något komplext', icon: 'lightbulb' },
  { id: '2', text: 'Skriv en kreativ berättelse', icon: 'sparkles' },
  { id: '3', text: 'Ge mig produktiva tips', icon: 'zap' },
  { id: '4', text: 'Förklara ett svårt koncept', icon: 'target' },
  { id: '5', text: 'Brainstorma idéer med mig', icon: 'rocket' },
];

const getIcon = (iconName: string) => {
  const icons = {
    lightbulb: Lightbulb,
    sparkles: Sparkles,
    zap: Zap,
    target: Target,
    rocket: Rocket,
  };
  const Icon = icons[iconName as keyof typeof icons] || Lightbulb;
  return <Icon className="w-5 h-5" />;
};

export const SuggestedPrompts = ({ onSelectPrompt, isAnimating }: SuggestedPromptsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 py-6">
      {prompts.map((prompt, index) => (
        <Card
          key={prompt.id}
          className={`p-4 cursor-pointer hover:bg-accent/50 transition-all duration-200 border-border hover:border-primary/20 rounded-xl hover:scale-[1.02] animate-fade-in ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100'
          }`}
          onClick={() => onSelectPrompt(prompt.text)}
        >
          <div className="flex items-center gap-3">
            <div className="text-primary">{getIcon(prompt.icon)}</div>
            <p className="text-sm text-foreground">{prompt.text}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
