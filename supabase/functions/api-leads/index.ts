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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const leadId = url.pathname.split('/')[3]; // /api/leads/{id}
  
  try {
    if (req.method === 'GET' && leadId && leadId !== 'incoming') {
      // Get specific lead by ID
      console.log(`Fetching lead with id: ${leadId}`);
      
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Returning single lead:', lead);
      return new Response(JSON.stringify(lead), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // List leads with query parameters
      const order = url.searchParams.get('order') || 'created_at.desc';
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const status = url.searchParams.get('status'); // all, claimed, unclaimed
      const q = url.searchParams.get('q'); // search query

      console.log('Fetching leads with params:', { order, limit, offset, status, q });

      let query = supabase.from('leads').select('*');

      // Apply status filter
      if (status === 'claimed') {
        query = query.eq('claimed', true);
      } else if (status === 'unclaimed') {
        query = query.eq('claimed', false);
      }

      // Apply search filter
      if (q) {
        query = query.or(
          `subject.ilike.%${q}%,lead_namn.ilike.%${q}%,lead_email.ilike.%${q}%,regnr.ilike.%${q}%`
        );
      }

      // Apply ordering
      const [column, direction] = order.split('.');
      query = query.order(column, { ascending: direction === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: leads, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Found ${leads?.length || 0} leads`);
      
      return new Response(JSON.stringify(leads || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && leadId === 'incoming') {
      // Create new lead
      const body = await req.json();
      console.log('Creating new lead:', body);

      const leadData = {
        subject: body.subject,
        blocket_url: body.blocket_url,
        summary: body.summary,
        lead_namn: body.lead_namn,
        lead_email: body.lead_email,
        regnr: body.regnr,
        preview_title: body.preview?.title,
        preview_description: body.preview?.description,
        preview_image_url: body.preview?.image_url,
      };

      const { data: lead, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Created lead:', lead);

      return new Response(JSON.stringify(lead), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in api-leads function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});