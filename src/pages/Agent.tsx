import { Bot } from "lucide-react";

export default function Agent() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agent</h1>
            <p className="text-muted-foreground">AI-agent för bilannonser</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>Agent-funktionalitet kommer snart...</p>
        </div>
      </div>
    </div>
  );
}
