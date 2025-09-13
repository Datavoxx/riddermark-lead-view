import { Skeleton } from "@/components/ui/skeleton";

export const LeadCardSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slack-card border border-slack-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slack-border">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-20 h-5" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <div className="bg-muted/30 p-3 rounded-md space-y-3">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
          <div className="space-y-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4" />
          </div>
          <Skeleton className="w-2/3 h-4" />
        </div>

        <div className="w-full h-px bg-border" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-48 h-10" />
        </div>

        {/* Link Preview */}
        <div className="border border-slack-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slack-border">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-4/5 h-4" />
              </div>
              <Skeleton className="w-24 h-16 rounded-md flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};