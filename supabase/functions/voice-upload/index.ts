import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const leadId = formData.get('lead_id') as string;
    const durationMs = parseInt(formData.get('duration_ms') as string);
    const threadId = formData.get('thread_id') as string || leadId;
    const waitWebhook = formData.get('wait_webhook') as string || '';

    if (!audioFile || !leadId) {
      throw new Error('Missing required fields: audio, lead_id');
    }

    console.log('Processing voice upload for lead:', leadId);

    // Generate correlation ID
    const correlationId = crypto.randomUUID();
    
    // Create storage path
    const storagePath = `voice/${threadId}/${correlationId}.webm`;
    
    // Upload to Supabase storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(`${user.id}/${storagePath}`, arrayBuffer, {
        contentType: 'audio/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    console.log('Audio uploaded successfully:', uploadData.path);

    // Get signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('voice-recordings')
      .createSignedUrl(`${user.id}/${storagePath}`, 3600);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw new Error('Failed to create signed URL');
    }

    const audioUrl = signedUrlData.signedUrl;
    console.log('Generated signed URL');

    // Send data to n8n webhook
    const webhookPayload = {
      thread_id: threadId,
      wait_webhook: waitWebhook,
      lead_id: leadId,
      correlation_id: correlationId,
      lang: 'sv',
      duration_ms: durationMs,
      storage_path: storagePath,
      audio_url: audioUrl
    };

    console.log('Sending to n8n webhook:', webhookPayload);

    const webhookResponse = await fetch("https://dataavx.app.n8n.cloud/webhook/voice-intake", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', webhookResponse.status, errorText);
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    const webhookResult = await webhookResponse.json();
    console.log('Webhook response:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        correlation_id: correlationId,
        storage_path: storagePath,
        webhook_response: webhookResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice-upload function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});