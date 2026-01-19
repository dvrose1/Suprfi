// ABOUTME: Payment success confirmation email template
// ABOUTME: Sent when a payment is successfully processed

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface PaymentSuccessProps {
  customerName: string;
  amount: number;
  paymentNumber: number;
  remainingBalance: number;
  paymentDate: Date;
}

export function PaymentSuccess({
  customerName,
  amount,
  paymentNumber,
  remainingBalance,
  paymentDate,
}: PaymentSuccessProps) {
  const formattedDate = paymentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <BaseLayout preview={`Payment received: $${amount.toFixed(2)}`}>
      <div style={successBanner}>
        <span style={checkIcon}>✓</span>
        <span style={successText}>Payment Successful</span>
      </div>

      <h1 style={heading}>Payment Received</h1>
      
      <p style={text}>Hi {customerName},</p>
      
      <p style={text}>
        Great news! Your payment has been successfully processed.
      </p>

      <div style={receiptBox}>
        <div style={receiptRow}>
          <span style={receiptLabel}>Payment #</span>
          <span style={receiptValue}>{paymentNumber}</span>
        </div>
        <div style={receiptRow}>
          <span style={receiptLabel}>Amount Paid</span>
          <span style={receiptValue}>${amount.toFixed(2)}</span>
        </div>
        <div style={receiptRow}>
          <span style={receiptLabel}>Date</span>
          <span style={receiptValue}>{formattedDate}</span>
        </div>
        <div style={divider} />
        <div style={receiptRow}>
          <span style={receiptLabel}>Remaining Balance</span>
          <span style={balanceValue}>${remainingBalance.toFixed(2)}</span>
        </div>
      </div>

      <p style={text}>
        Thank you for your payment! You can view your complete payment history 
        and upcoming payments in your borrower portal.
      </p>

      <div style={buttonContainer}>
        <a href="https://suprfi.com/portal" style={button}>
          View Payment History
        </a>
      </div>

      <p style={signature}>
        Thanks for choosing SuprFi,
        <br />
        The SuprFi Team
      </p>
    </BaseLayout>
  );
}

const successBanner: React.CSSProperties = {
  backgroundColor: '#d4edda',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const checkIcon: React.CSSProperties = {
  color: '#28a745',
  fontSize: '20px',
  fontWeight: 700,
};

const successText: React.CSSProperties = {
  color: '#155724',
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

const text: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const receiptBox: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const receiptRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
};

const receiptLabel: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '14px',
};

const receiptValue: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '16px',
  fontWeight: 600,
};

const balanceValue: React.CSSProperties = {
  color: '#2A9D8F',
  fontSize: '18px',
  fontWeight: 700,
};

const divider: React.CSSProperties = {
  borderTop: '1px solid #e6ebf1',
  margin: '12px 0',
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

export default PaymentSuccess;
