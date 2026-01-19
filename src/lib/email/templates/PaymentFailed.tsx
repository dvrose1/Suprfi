// ABOUTME: Payment failed notification email template
// ABOUTME: Sent when a payment fails to process

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface PaymentFailedProps {
  customerName: string;
  amount: number;
  paymentNumber: number;
  reason: string;
  willRetry: boolean;
  nextRetryDate?: Date;
}

export function PaymentFailed({
  customerName,
  amount,
  paymentNumber,
  reason,
  willRetry,
  nextRetryDate,
}: PaymentFailedProps) {
  const formattedRetryDate = nextRetryDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <BaseLayout preview={`Payment failed: $${amount.toFixed(2)} - Action required`}>
      <div style={alertBanner}>
        <span style={alertIcon}>!</span>
        <span style={alertText}>Payment Failed</span>
      </div>

      <h1 style={heading}>Payment Could Not Be Processed</h1>
      
      <p style={text}>Hi {customerName},</p>
      
      <p style={text}>
        Unfortunately, we were unable to process your payment #{paymentNumber} 
        for <strong>${amount.toFixed(2)}</strong>.
      </p>

      <div style={reasonBox}>
        <p style={reasonLabel}>Reason</p>
        <p style={reasonText}>{reason}</p>
      </div>

      {willRetry && nextRetryDate ? (
        <>
          <div style={retryBox}>
            <p style={retryTitle}>We'll Try Again</p>
            <p style={retryText}>
              We will automatically retry this payment on <strong>{formattedRetryDate}</strong>. 
              Please ensure your linked bank account has sufficient funds before then.
            </p>
          </div>

          <h2 style={subheading}>What You Can Do</h2>
          <ul style={list}>
            <li style={listItem}>
              <strong>Check your balance:</strong> Make sure you have at least ${amount.toFixed(2)} 
              available in your linked account
            </li>
            <li style={listItem}>
              <strong>Update payment method:</strong> If your account has changed, 
              you can update it in your borrower portal
            </li>
            <li style={listItem}>
              <strong>Contact us:</strong> If you're having trouble, our team is here to help
            </li>
          </ul>
        </>
      ) : (
        <>
          <div style={actionBox}>
            <p style={actionTitle}>Action Required</p>
            <p style={actionText}>
              This payment cannot be automatically retried. Please update your payment 
              method or contact us to resolve this issue.
            </p>
          </div>

          <h2 style={subheading}>Next Steps</h2>
          <ul style={list}>
            <li style={listItem}>
              Log in to your borrower portal to update your payment method
            </li>
            <li style={listItem}>
              Contact our support team if you need assistance
            </li>
          </ul>
        </>
      )}

      <div style={buttonContainer}>
        <a href="https://suprfi.com/portal" style={button}>
          Update Payment Method
        </a>
      </div>

      <p style={text}>
        If you have any questions, please don't hesitate to contact us at{' '}
        <a href="mailto:support@suprfi.com" style={link}>support@suprfi.com</a>.
      </p>

      <p style={signature}>
        The SuprFi Team
      </p>
    </BaseLayout>
  );
}

const alertBanner: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const alertIcon: React.CSSProperties = {
  backgroundColor: '#dc3545',
  color: '#ffffff',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 700,
};

const alertText: React.CSSProperties = {
  color: '#721c24',
  fontSize: '16px',
  fontWeight: 600,
};

const heading: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: '32px',
  margin: '0 0 24px',
};

const subheading: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '18px',
  fontWeight: 600,
  margin: '24px 0 16px',
};

const text: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const reasonBox: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const reasonLabel: React.CSSProperties = {
  color: '#721c24',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const reasonText: React.CSSProperties = {
  color: '#721c24',
  fontSize: '16px',
  margin: 0,
};

const retryBox: React.CSSProperties = {
  backgroundColor: '#fff3cd',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const retryTitle: React.CSSProperties = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 8px',
};

const retryText: React.CSSProperties = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
};

const actionBox: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  borderLeft: '4px solid #dc3545',
};

const actionTitle: React.CSSProperties = {
  color: '#721c24',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 8px',
};

const actionText: React.CSSProperties = {
  color: '#721c24',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
};

const list: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '0 0 16px',
};

const listItem: React.CSSProperties = {
  marginBottom: '8px',
};

const buttonContainer: React.CSSProperties = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button: React.CSSProperties = {
  backgroundColor: '#dc3545',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 32px',
  textDecoration: 'none',
};

const link: React.CSSProperties = {
  color: '#2A9D8F',
  textDecoration: 'none',
};

const signature: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 0',
};

export default PaymentFailed;
