// ABOUTME: Email module exports
// ABOUTME: Central export point for email service

export { sendEmail, sendBatchEmails } from './resend';
export type { SendEmailOptions, EmailResult } from './resend';

// Note: Email templates should be imported directly from their files
// to avoid Next.js static analysis issues with <html> elements
// e.g., import { WaitlistConfirmation } from '@/lib/email/templates/WaitlistConfirmation';
