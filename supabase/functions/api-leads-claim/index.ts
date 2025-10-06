import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id;
  }

  // Get leadId from request body
  const { leadId } = await req.json();

  if (!leadId) {
    return new Response(JSON.stringify({ error: 'Lead ID is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log(`Attempting to claim lead ${leadId} for user ${userId}`);

    // First, fetch the user's name from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userName = profile.name || 'Okänd användare';

    // Then, check if the lead exists and is unclaimed
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('id, claimed, claimed_by')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      console.error('Error fetching lead:', fetchError);
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (lead.claimed) {
      console.log(`Lead ${leadId} already claimed by ${lead.claimed_by}`);
      return new Response(JSON.stringify({ 
        error: 'Lead already claimed',
        message: 'This lead has already been claimed by another user'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Attempt to claim the lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        claimed: true,
        claimed_by: userId,
        claimed_by_name: userName,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .or('claimed.is.null,claimed.eq.false') // Accept both NULL and false
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to claim lead',
        message: 'The lead may have been claimed by another user'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!updatedLead) {
      // This means the lead was claimed between our check and update
      console.log(`Lead ${leadId} was claimed by another user during the update`);
      return new Response(JSON.stringify({ 
        error: 'Lead already claimed',
        message: 'This lead was claimed by another user'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully claimed lead ${leadId} for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Lead claimed successfully',
      lead: updatedLead
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-leads-claim function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});