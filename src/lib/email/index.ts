// ABOUTME: Email module exports
// ABOUTME: Central export point for email service and templates

export { sendEmail, sendBatchEmails } from './resend';
export type { SendEmailOptions, EmailResult } from './resend';

// Template exports
export { WaitlistConfirmation } from './templates/WaitlistConfirmation';
export { BaseLayout } from './templates/BaseLayout';
