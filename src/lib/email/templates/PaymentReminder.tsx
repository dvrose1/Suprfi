// ABOUTME: Payment reminder email template
// ABOUTME: Sent 3 days before a payment is due

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface PaymentReminderProps {
  customerName: string;
  amount: number;
  dueDate: Date;
  paymentNumber: number;
}

export function PaymentReminder({
  customerName,
  amount,
  dueDate,
  paymentNumber,
}: PaymentReminderProps) {
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <BaseLayout preview={`Payment reminder: $${amount.toFixed(2)} due ${formattedDate}`}>
      <h1 style={heading}>Payment Reminder</h1>
      
      <p style={text}>Hi {customerName},</p>
      
      <p style={text}>
        This is a friendly reminder that your payment #{paymentNumber} is coming up soon.
      </p>

      <div style={paymentBox}>
        <p style={paymentLabel}>Amount Due</p>
        <p style={paymentAmount}>${amount.toFixed(2)}</p>
        <p style={paymentDate}>Due: {formattedDate}</p>
      </div>

      <p style={text}>
        Please ensure that your linked bank account has sufficient funds to cover 
        this payment. We will automatically process the payment on the due date.
      </p>

      <p style={text}>
        If you need to update your payment method or have any questions, 
        please log in to your borrower portal or contact us.
      </p>

      <div style={buttonContainer}>
        <a href="https://suprfi.com/portal" style={button}>
          View My Account
        </a>
      </div>

      <p style={signature}>
        Thanks,
        <br />
        The SuprFi Team
      </p>
    </BaseLayout>
  );
}

const heading: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: '32px',
  margin: '0 0 24px',
};

const text: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const paymentBox: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const paymentLabel: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const paymentAmount: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '36px',
  fontWeight: 700,
  margin: '0 0 8px',
};

const paymentDate: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  margin: 0,
};

const buttonContainer: React.CSSProperties = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button: React.CSSProperties = {
  backgroundColor: '#2A9D8F',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 32px',
  textDecoration: 'none',
};

const signature: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 0',
};

export default PaymentReminder;
