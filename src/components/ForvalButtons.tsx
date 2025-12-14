import { Button } from "@/components/ui/button";
import { ForvalOption } from "@/types/lead";
import { cn } from "@/lib/utils";

interface ForvalButtonsProps {
  options: ForvalOption[];
  selectedId?: string;
  onSelect: (option: ForvalOption) => void;
}

export function ForvalButtons({ options, selectedId, onSelect }: ForvalButtonsProps) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <Button
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto py-3 px-4 text-left justify-start rounded-xl transition-all",
              "hover:border-primary/50 hover:-translate-y-0.5",
              isSelected && "ring-2 ring-primary/20"
            )}
            onClick={() => onSelect(option)}
          >
            <span className={cn(
              "text-xs font-semibold mr-2",
              isSelected ? "text-primary-foreground" : "text-primary"
            )}>
              {option.id}
            </span>
            <span className="text-sm">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
