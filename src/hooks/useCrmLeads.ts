import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CrmLead, CrmStats, CrmStatus, CrmStage } from '@/types/crm';
import { startOfDay, startOfWeek, startOfMonth, subHours } from 'date-fns';

export function useCrmLeads() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [stats, setStats] = useState<CrmStats>({
    newCallbacks: 0,
    inProgress: 0,
    completedToday: 0,
    completedWeek: 0,
    completedMonth: 0,
    overdueFollowups: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('claimed', true)
      .order('last_activity_at', { ascending: false });

    if (error) {
      console.error('Error fetching CRM leads:', error);
      setIsLoading(false);
      return;
    }

    const crmLeads = (data || []).map(lead => ({
      ...lead,
      crm_status: (lead.crm_status as CrmStatus) || 'new_callback',
      crm_stage: lead.crm_stage as CrmStage,
    })) as CrmLead[];

    setLeads(crmLeads);
    calculateStats(crmLeads);
    setIsLoading(false);
  };

  const calculateStats = (crmLeads: CrmLead[]) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const overdueThreshold = subHours(now, 48);

    const newStats: CrmStats = {
      newCallbacks: crmLeads.filter(l => l.crm_status === 'new_callback').length,
      inProgress: crmLeads.filter(l => l.crm_status === 'in_progress').length,
      completedToday: crmLeads.filter(l => 
        l.crm_status === 'completed' && 
        l.completed_at && 
        new Date(l.completed_at) >= todayStart
      ).length,
      completedWeek: crmLeads.filter(l => 
        l.crm_status === 'completed' && 
        l.completed_at && 
        new Date(l.completed_at) >= weekStart
      ).length,
      completedMonth: crmLeads.filter(l => 
        l.crm_status === 'completed' && 
        l.completed_at && 
        new Date(l.completed_at) >= monthStart
      ).length,
      overdueFollowups: crmLeads.filter(l => 
        l.crm_status === 'new_callback' && 
        l.last_activity_at && 
        new Date(l.last_activity_at) < overdueThreshold
      ).length,
    };

    setStats(newStats);
  };

  const updateLeadStatus = async (
    leadId: string, 
    status: CrmStatus, 
    stage?: CrmStage,
    lostReason?: string
  ) => {
    const updates: Record<string, unknown> = {
      crm_status: status,
      last_activity_at: new Date().toISOString(),
    };

    if (stage !== undefined) {
      updates.crm_stage = stage;
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    if (status === 'lost' && lostReason) {
      updates.lost_reason = lostReason;
    }

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead status:', error);
      return false;
    }

    await fetchLeads();
    return true;
  };

  const updateDealValue = async (leadId: string, value: number | null) => {
    const { error } = await supabase
      .from('leads')
      .update({ 
        deal_value: value,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating deal value:', error);
      return false;
    }

    await fetchLeads();
    return true;
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('crm-leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => fetchLeads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    leads,
    stats,
    isLoading,
    updateLeadStatus,
    updateDealValue,
    refetch: fetchLeads,
  };
}
