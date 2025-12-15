export type CrmStatus = 'new_callback' | 'in_progress' | 'completed' | 'lost';
export type CrmStage = 'negotiation' | 'test_drive' | 'agreement' | null;

export interface CrmLead {
  id: string;
  lead_namn: string | null;
  lead_email: string | null;
  regnr: string | null;
  subject: string | null;
  blocket_url: string | null;
  preview_title: string | null;
  preview_description: string | null;
  preview_image_url: string | null;
  created_at: string | null;
  claimed: boolean | null;
  claimed_by: string | null;
  claimed_by_name: string | null;
  summering: string | null;
  resume_url: string | null;
  // CRM fields
  crm_status: CrmStatus;
  crm_stage: CrmStage;
  deal_value: number | null;
  source_channel: string | null;
  last_activity_at: string | null;
  lost_reason: string | null;
  completed_at: string | null;
}

export interface CrmStats {
  newCallbacks: number;
  inProgress: number;
  completedToday: number;
  completedWeek: number;
  completedMonth: number;
  overdueFollowups: number;
}

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  new_callback: 'Kräver åtgärd',
  in_progress: 'Pågående',
  completed: 'Färdig',
  lost: 'Förlorad',
};

export const CRM_STAGE_LABELS: Record<string, string> = {
  negotiation: 'Förhandling',
  test_drive: 'Provkörning',
  agreement: 'Avtal på gång',
};

export const SOURCE_CHANNEL_LABELS: Record<string, string> = {
  blocket: 'Blocket',
  wayke: 'Wayke',
  bytbil: 'Bytbil',
  other: 'Övrig',
};
