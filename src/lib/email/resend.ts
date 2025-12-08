// ABOUTME: Email service wrapper using Resend API
// ABOUTME: Provides typed email sending functions for transactional emails

import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'SuprFi <noreply@suprfi.com>';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  // Skip sending if no API key or resend not initialized
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping email send - no RESEND_API_KEY configured');
    console.log('[Email] Would have sent:', {
      to: options.to,
      subject: options.subject,
    });
    return { success: true, id: 'dev-mode-skipped' };
  }

  try {
    // Render React component to HTML using dynamic import
    const ReactDOMServer = (await import('react-dom/server')).default;
    const html = ReactDOMServer.renderToStaticMarkup(options.react);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Exception during send:', message);
    return { success: false, error: message };
  }
}

// Batch send for multiple recipients (each gets their own email)
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<EmailResult[]> {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return { success: false, error: 'Promise rejected' };
  });
}
