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
  has_reminder?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forval?: any;
}

// Parse forval from string or object
export function parseForval(forval: unknown): Forval | null {
  if (!forval) return null;
  
  let parsed = forval;
  
  // Om det är en sträng, försök parsa den
  if (typeof forval === 'string') {
    try {
      parsed = JSON.parse(forval);
    } catch {
      return null;
    }
  }
  
  // Kontrollera att det är ett giltigt Forval-objekt
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'options' in parsed &&
    Array.isArray((parsed as Forval).options)
  ) {
    return parsed as Forval;
  }
  
  return null;
}

// Type guard to check if forval has valid options (handles both string and object)
export function hasForvalOptions(forval: unknown): forval is Forval {
  return parseForval(forval) !== null;
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