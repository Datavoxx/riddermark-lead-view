import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, userId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Sending message to n8n webhook:', { message, userId });

    // Skicka till n8n webhook
    const n8nResponse = await fetch('https://datavox.app.n8n.cloud/webhook-test/lovableagent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: message,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', n8nResponse.status, await n8nResponse.text());
      throw new Error(`n8n webhook returned ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('n8n response:', n8nData);

    // Returnera svaret från n8n (förväntar sig JSON med 'response' field)
    return new Response(
      JSON.stringify({ 
        response: n8nData.response || 'No response from agent' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in agent-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Tyvärr kunde jag inte behandla din förfrågan just nu. Försök igen senare.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
