import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const { message, userId, agentId } = await req.json();

    if (!message || !agentId) {
      return new Response(
        JSON.stringify({ error: 'Message and agentId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Skapa Supabase client med service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Skapa channel ID för agent-konversationen
    const channelId = `agent-${agentId}-${userId}`;

    // Hämta senaste 30 meddelanden för konversationshistorik
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('sender_id, content, created_at')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Formatera historiken för n8n (äldsta först)
    const conversationHistory = (history || []).reverse().map(msg => ({
      role: msg.sender_id === '00000000-0000-0000-0000-000000000001' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Spara användarens nya meddelande
    const { error: insertError } = await supabase.from('messages').insert({
      channel_id: channelId,
      sender_id: userId,
      content: message,
      mentions: []
    });

    if (insertError) {
      console.error('Error saving user message:', insertError);
    }

    console.log('Sending to n8n:', { 
      message, 
      userId, 
      agentId,
      conversationHistoryLength: conversationHistory.length 
    });

    // Skicka till n8n webhook med konversationshistorik
    const n8nResponse = await fetch('https://datavox.app.n8n.cloud/webhook-test/lovableagent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: message,
        userId: userId || 'anonymous',
        agentId: agentId,
        conversationHistory: conversationHistory,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', n8nResponse.status, await n8nResponse.text());
      throw new Error(`n8n webhook returned ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('Full n8n response:', n8nData);

    // Extrahera texten från n8n's output-struktur
    const text = 
      n8nData?.output?.[0]?.content?.[0]?.text ?? 
      n8nData?.message ?? 
      null;

    console.log('Extracted text:', text);

    // Spara agentens svar i databasen
    if (text) {
      const { error: agentInsertError } = await supabase.from('messages').insert({
        channel_id: channelId,
        sender_id: '00000000-0000-0000-0000-000000000001', // Agent UUID
        content: text,
        mentions: []
      });

      if (agentInsertError) {
        console.error('Error saving agent response:', agentInsertError);
      }
    }

    // Returnera svaret från n8n
    return new Response(
      JSON.stringify({ 
        response: text || 'No response from agent' 
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
