import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching preview for URL: ${url}`);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract meta tags using regex (basic implementation)
    const getMetaContent = (property: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*?)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*?)["']`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // Get title from title tag if og:title is not available
    const getTitleFromTitleTag = (): string | null => {
      const titleMatch = html.match(/<title[^>]*>([^<]*?)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : null;
    };

    const preview = {
      title: getMetaContent('og:title') || getMetaContent('title') || getTitleFromTitleTag() || 'No title found',
      description: getMetaContent('og:description') || getMetaContent('description') || 'No description available',
      image_url: getMetaContent('og:image') || null,
      url: url,
    };

    console.log('Extracted preview:', preview);

    return new Response(JSON.stringify(preview), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-url-preview function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch URL preview',
      message: error.message,
      // Provide fallback data
      title: 'Preview not available',
      description: 'Could not fetch preview for this URL',
      image_url: null,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});