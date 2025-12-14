export interface ForvalOption {
  id: string;
  label: string;
  directive: string;
}

export interface Forval {
  intent: string;
  options: ForvalOption[];
}

export interface Lead {
  id: string;
  summary: string;
  lead_namn: string;
  lead_email: string;
  regnr: string;
  subject: string;
  blocket_url: string;
  preview_title: string;
  preview_description: string;
  preview_image_url: string;
  created_at: string;
  claimed?: boolean;
  claimed_by?: string;
  claimed_by_name?: string;
  summering?: string;
  resume_url?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forval?: any;
}

// Type guard to check if forval has valid options
export function hasForvalOptions(forval: unknown): forval is Forval {
  return (
    typeof forval === 'object' &&
    forval !== null &&
    'options' in forval &&
    Array.isArray((forval as Forval).options)
  );
}

export interface CreateTestLeadRequest {
  blocket_url: string;
  lead_namn: string;
  lead_email: string;
  regnr: string;
  summary: string;
}

export interface ClaimLeadResponse {
  success: boolean;
  message?: string;
}