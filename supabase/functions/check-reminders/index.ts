import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Checking for due reminders...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all pending reminders that are due
    const now = new Date().toISOString();
    
    const { data: dueReminders, error: fetchError } = await supabase
      .from('follow_up_reminders')
      .select(`
        id,
        user_id,
        lead_id,
        sent_email_text,
        original_message,
        remind_at,
        leads!follow_up_reminders_lead_id_fkey (
          lead_namn,
          subject,
          summering
        )
      `)
      .eq('status', 'pending')
      .lte('remind_at', now);

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${dueReminders?.length || 0} due reminders`);

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No due reminders', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each reminder
    const notifications = [];
    const reminderIds = [];

    for (const reminder of dueReminders) {
      const lead = reminder.leads as any;
      const leadName = lead?.lead_namn || 'Okänd kund';
      const subject = lead?.subject || 'Ärende';

      // Create notification with reminder_id as reference
      notifications.push({
        user_id: reminder.user_id,
        type: 'follow_up',
        title: 'Dags att följa upp',
        message: `Påminnelse: ${leadName} - ${subject}`,
        reference_id: reminder.id,
        reference_type: 'follow_up_reminder',
        read: false,
      });

      reminderIds.push(reminder.id);
    }

    // Insert all notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
      throw insertError;
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    // Update reminder statuses to 'sent'
    const { error: updateError } = await supabase
      .from('follow_up_reminders')
      .update({ status: 'sent' })
      .in('id', reminderIds);

    if (updateError) {
      console.error('Error updating reminder statuses:', updateError);
      throw updateError;
    }

    console.log(`✅ Updated ${reminderIds.length} reminders to 'sent' status`);

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processed successfully',
        count: notifications.length 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
