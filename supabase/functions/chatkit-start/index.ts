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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('🚀 ChatKit session request mottagen');
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY saknas i environment variables');
      throw new Error('OPENAI_API_KEY är inte konfigurerad');
    }

    console.log('✅ OPENAI_API_KEY finns tillgänglig');
    console.log('📡 Anropar OpenAI ChatKit API...');

    const requestBody = {
      workflow: { 
        id: 'wf_68eaeb8ac54481909e822336a91727b60297fb9b627b27f0' 
      },
      user: "anonymous-user"
    };
    console.log('📦 Request body:', JSON.stringify(requestBody));

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API returnerade ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 OpenAI response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (!data.client_secret) {
      console.error('❌ Ingen client_secret i OpenAI response');
      throw new Error('OpenAI returnerade ingen client_secret');
    }

    console.log('✅ client_secret framgångsrikt hämtad, längd:', data.client_secret.length);

    return new Response(
      JSON.stringify({ client_secret: data.client_secret }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error i chatkit-start:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'no stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Okänt fel' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
