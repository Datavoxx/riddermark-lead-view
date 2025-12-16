import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { ImapFlow } from "npm:imapflow@1.0.162";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  fromName: string | null;
  date: string;
  snippet: string;
  seen: boolean;
  body?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const emailUser = Deno.env.get("ONECOM_EMAIL_USER");
  const emailPass = Deno.env.get("ONECOM_EMAIL_PASS");

  if (!emailUser || !emailPass) {
    console.error("Missing email credentials");
    return new Response(
      JSON.stringify({ error: "Email credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const uid = url.searchParams.get("uid");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const folder = url.searchParams.get("folder") || "INBOX";

  console.log(`Connecting to IMAP: ${emailUser}, folder: ${folder}, uid: ${uid || "list"}, limit: ${limit}`);

  let client: ImapFlow | null = null;

  try {
    client = new ImapFlow({
      host: "imap.one.com",
      port: 993,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      logger: false,
    });

    await client.connect();
    console.log("IMAP connected successfully");

    const lock = await client.getMailboxLock(folder);

    try {
      if (uid) {
        // Fetch specific email with full body
        console.log(`Fetching email with UID: ${uid}`);
        
        const message = await client.fetchOne(uid, {
          uid: true,
          envelope: true,
          bodyStructure: true,
          flags: true,
        }, { uid: true });

        if (!message) {
          return new Response(
            JSON.stringify({ error: "Email not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch body parts separately - much faster than fetching full source
        let htmlBody = "";
        let plainBody = "";
        
        try {
          // Try to get HTML body first
          const htmlPart = await client.download(uid, "1.2", { uid: true });
          if (htmlPart) {
            const chunks: Uint8Array[] = [];
            for await (const chunk of htmlPart.content) {
              chunks.push(chunk);
            }
            htmlBody = new TextDecoder().decode(Buffer.concat(chunks));
          }
        } catch (e) {
          console.log("No HTML part or error fetching HTML:", e);
        }

        if (!htmlBody) {
          try {
            // Fallback to plain text
            const textPart = await client.download(uid, "1", { uid: true });
            if (textPart) {
              const chunks: Uint8Array[] = [];
              for await (const chunk of textPart.content) {
                chunks.push(chunk);
              }
              plainBody = new TextDecoder().decode(Buffer.concat(chunks));
            }
          } catch (e) {
            console.log("No plain text part or error fetching text:", e);
          }
        }

        // Mark as Seen on IMAP server
        try {
          await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
          console.log(`Marked email ${uid} as Seen on IMAP server`);
        } catch (e) {
          console.error("Error marking email as seen:", e);
        }

        const finalBody = htmlBody || plainBody || "";

        const email: EmailMessage = {
          uid: message.uid,
          subject: message.envelope?.subject || "(Inget ämne)",
          from: message.envelope?.from?.[0]?.address || "unknown",
          fromName: message.envelope?.from?.[0]?.name || null,
          date: message.envelope?.date?.toISOString() || new Date().toISOString(),
          snippet: plainBody.substring(0, 200) || htmlBody.replace(/<[^>]*>/g, '').substring(0, 200),
          seen: true, // We just marked it as seen
          body: finalBody,
        };

        return new Response(
          JSON.stringify({ email }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // List emails
        console.log(`Listing emails, limit: ${limit}`);
        
        const emails: EmailMessage[] = [];
        const totalMessages = client.mailbox?.exists || 0;
        
        if (totalMessages === 0) {
          return new Response(
            JSON.stringify({ emails: [], total: 0 }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch most recent emails
        const startSeq = Math.max(1, totalMessages - limit + 1);
        const range = `${startSeq}:*`;

        for await (const message of client.fetch(range, {
          uid: true,
          envelope: true,
          flags: true,
          bodyStructure: true,
        })) {
          const email: EmailMessage = {
            uid: message.uid,
            subject: message.envelope?.subject || "(Inget ämne)",
            from: message.envelope?.from?.[0]?.address || "unknown",
            fromName: message.envelope?.from?.[0]?.name || null,
            date: message.envelope?.date?.toISOString() || new Date().toISOString(),
            snippet: "", // We don't fetch body for list view
            seen: message.flags?.has("\\Seen") || false,
          };
          emails.push(email);
        }

        // Sort by date descending (newest first)
        emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`Found ${emails.length} emails`);

        return new Response(
          JSON.stringify({ emails, total: totalMessages }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } finally {
      lock.release();
    }
  } catch (error: any) {
    console.error("IMAP error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch emails" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch (e) {
        console.error("Error closing IMAP connection:", e);
      }
    }
  }
});
