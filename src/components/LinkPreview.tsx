import { ExternalLink } from "lucide-react";
import { Lead } from "@/types/lead";

interface LinkPreviewProps {
  lead: Lead;
}

export const LinkPreview = ({ lead }: LinkPreviewProps) => {
  const openLink = () => {
    window.open(lead.blocket_url, '_blank');
  };

  return (
    <div className="border border-slack-border rounded-lg overflow-hidden bg-slack-card hover:bg-slack-hover transition-colors cursor-pointer" onClick={openLink}>
      <div className="p-3 border-b border-slack-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm font-medium text-muted-foreground">Blocket</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 
              className="font-semibold text-foreground hover:text-primary cursor-pointer inline-flex items-center gap-1 mb-2"
              onClick={openLink}
            >
              {lead.preview_title}
              <ExternalLink className="h-3 w-3" />
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {lead.preview_description}
            </p>
          </div>
          
          {lead.preview_image_url && (
            <div className="w-24 h-16 flex-shrink-0">
              <img
                src={lead.preview_image_url}
                alt={lead.preview_title}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};