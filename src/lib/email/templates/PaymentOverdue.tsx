// ABOUTME: Payment overdue notification email template
// ABOUTME: Sent with escalating urgency based on days overdue

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface PaymentOverdueProps {
  customerName: string;
  amount: number;
  daysOverdue: number;
  urgencyLevel: 'reminder' | 'warning' | 'urgent' | 'final';
}

export function PaymentOverdue({
  customerName,
  amount,
  daysOverdue,
  urgencyLevel,
}: PaymentOverdueProps) {
  const styles = getUrgencyStyles(urgencyLevel);
  const title = getTitle(urgencyLevel, daysOverdue);
  const message = getMessage(urgencyLevel, daysOverdue, amount);

  return (
    <BaseLayout preview={`${title} - $${amount.toFixed(2)}`}>
      <div style={{ ...alertBanner, backgroundColor: styles.bannerBg }}>
        <span style={{ ...alertIcon, backgroundColor: styles.iconBg }}>!</span>
        <span style={{ ...alertText, color: styles.textColor }}>{title}</span>
      </div>

      <h1 style={heading}>{title}</h1>
      
      <p style={text}>Hi {customerName},</p>
      
      <p style={text}>{message}</p>

      <div style={{ ...amountBox, borderColor: styles.iconBg }}>
        <p style={amountLabel}>Amount Overdue</p>
        <p style={{ ...amountValue, color: styles.iconBg }}>${amount.toFixed(2)}</p>
        <p style={daysText}>{daysOverdue} days past due</p>
      </div>

      {urgencyLevel === 'final' && (
        <div style={warningBox}>
          <p style={warningTitle}>Important Notice</p>
          <p style={warningText}>
            If this payment is not resolved promptly, your account may be referred 
            to collections, which could affect your credit score. Please contact us 
            immediately if you're experiencing financial hardship.
          </p>
        </div>
      )}

      <h2 style={subheading}>How to Resolve This</h2>
      <ol style={list}>
        <li style={listItem}>
          <strong>Make a payment:</strong> Log in to your borrower portal and pay now
        </li>
        <li style={listItem}>
          <strong>Update your bank account:</strong> If there was an issue with your 
          linked account, update it in the portal
        </li>
        <li style={listItem}>
          <strong>Contact us:</strong> If you're having trouble, we may be able to 
          help with a payment arrangement
        </li>
      </ol>

      <div style={buttonContainer}>
        <a href="https://suprfi.com/portal" style={{ ...button, backgroundColor: styles.iconBg }}>
          Pay Now
        </a>
      </div>

      <p style={text}>
        Need help? Contact us at{' '}
        <a href="mailto:support@suprfi.com" style={link}>support@suprfi.com</a>{' '}
        or call <a href="tel:+18001234567" style={link}>(800) 123-4567</a>.
      </p>

      <p style={signature}>
        The SuprFi Team
      </p>
    </BaseLayout>
  );
}

function getUrgencyStyles(level: string) {
  switch (level) {
    case 'final':
      return {
        bannerBg: '#f8d7da',
        iconBg: '#dc3545',
        textColor: '#721c24',
      };
    case 'urgent':
      return {
        bannerBg: '#f8d7da',
        iconBg: '#dc3545',
        textColor: '#721c24',
      };
    case 'warning':
      return {
        bannerBg: '#fff3cd',
        iconBg: '#ffc107',
        textColor: '#856404',
      };
    default:
      return {
        bannerBg: '#cce5ff',
        iconBg: '#007bff',
        textColor: '#004085',
      };
  }
}

function getTitle(level: string, days: number): string {
  switch (level) {
    case 'final':
      return `FINAL NOTICE: Payment ${days} Days Overdue`;
    case 'urgent':
      return `URGENT: Payment ${days} Days Overdue`;
    case 'warning':
      return `Payment ${days} Days Overdue`;
    default:
      return `Payment Reminder: ${days} Day${days !== 1 ? 's' : ''} Overdue`;
  }
}

function getMessage(level: string, days: number, amount: number): string {
  switch (level) {
    case 'final':
      return `Your payment of $${amount.toFixed(2)} is now ${days} days past due. This is your final notice before further action is taken. Please pay immediately to avoid additional consequences.`;
    case 'urgent':
      return `Your payment of $${amount.toFixed(2)} is ${days} days overdue. Please make this payment as soon as possible to avoid further action.`;
    case 'warning':
      return `Your payment of $${amount.toFixed(2)} is ${days} days past due. Please pay at your earliest convenience to bring your account current.`;
    default:
      return `Your payment of $${amount.toFixed(2)} was due ${days} day${days !== 1 ? 's' : ''} ago. Please ensure your account is up to date.`;
  }
}

const alertBanner: React.CSSProperties = {
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const alertIcon: React.CSSProperties = {
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

const amountBox: React.CSSProperties = {
  borderRadius: '8px',
  border: '2px solid',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const amountLabel: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const amountValue: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 700,
  margin: '0 0 8px',
};

const daysText: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '14px',
  margin: 0,
};

const warningBox: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  borderLeft: '4px solid #dc3545',
};

const warningTitle: React.CSSProperties = {
  color: '#721c24',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 8px',
};

const warningText: React.CSSProperties = {
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
  marginBottom: '12px',
};

const buttonContainer: React.CSSProperties = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button: React.CSSProperties = {
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

export default PaymentOverdue;
