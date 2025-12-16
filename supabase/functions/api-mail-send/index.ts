import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  html?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

  try {
    const { to, subject, body, html, cc, bcc, replyTo }: SendEmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    // Create SMTP transporter for one.com
    const transporter = nodemailer.createTransport({
      host: "send.one.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    // Send email
    const mailOptions: nodemailer.SendMailOptions = {
      from: emailUser,
      to,
      subject,
      text: body,
    };

    if (html) {
      mailOptions.html = html;
    }

    if (cc) {
      mailOptions.cc = cc;
    }

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        message: "Email sent successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("SMTP error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
