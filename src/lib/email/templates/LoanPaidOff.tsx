// ABOUTME: Loan paid off celebration email template
// ABOUTME: Sent when a borrower completes all payments

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface LoanPaidOffProps {
  customerName: string;
  totalPaid: number;
}

export function LoanPaidOff({
  customerName,
  totalPaid,
}: LoanPaidOffProps) {
  return (
    <BaseLayout preview="Congratulations! Your loan is paid off!">
      <div style={celebrationBanner}>
        <span style={celebrationIcon}>🎉</span>
        <span style={celebrationText}>Congratulations!</span>
      </div>

      <h1 style={heading}>Your Loan is Paid Off!</h1>
      
      <p style={text}>Hi {customerName},</p>
      
      <p style={text}>
        <strong>Congratulations!</strong> You've successfully paid off your loan with SuprFi. 
        This is a significant financial achievement, and we're proud to have been part of your journey.
      </p>

      <div style={summaryBox}>
        <p style={summaryLabel}>Total Paid</p>
        <p style={summaryAmount}>${totalPaid.toFixed(2)}</p>
        <p style={summaryStatus}>✓ Loan Complete</p>
      </div>

      <h2 style={subheading}>What's Next?</h2>
      
      <ul style={list}>
        <li style={listItem}>
          <strong>Your account is closed:</strong> No further payments will be deducted 
          from your bank account.
        </li>
        <li style={listItem}>
          <strong>Records available:</strong> You can still access your payment history 
          in the borrower portal for your records.
        </li>
        <li style={listItem}>
          <strong>Future financing:</strong> If you ever need home service financing again, 
          we'd love to help! Your positive payment history is noted in our system.
        </li>
      </ul>

      <div style={thankYouBox}>
        <p style={thankYouTitle}>Thank You!</p>
        <p style={thankYouText}>
          Thank you for choosing SuprFi for your home service financing needs. 
          We hope we made the process easy and affordable for you.
        </p>
      </div>

      <p style={text}>
        If you have any questions or need documentation of your completed loan, 
        please don't hesitate to contact us.
      </p>

      <div style={buttonContainer}>
        <a href="https://suprfi.com/portal" style={button}>
          View Payment History
        </a>
      </div>

      <p style={signature}>
        Congratulations again,
        <br />
        The SuprFi Team
      </p>
    </BaseLayout>
  );
}

const celebrationBanner: React.CSSProperties = {
  backgroundColor: '#d4edda',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const celebrationIcon: React.CSSProperties = {
  fontSize: '32px',
  display: 'block',
  marginBottom: '8px',
};

const celebrationText: React.CSSProperties = {
  color: '#155724',
  fontSize: '24px',
  fontWeight: 700,
};

const heading: React.CSSProperties = {
  color: '#0F2D4A',
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: '36px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
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

const summaryBox: React.CSSProperties = {
  backgroundColor: '#2A9D8F',
  borderRadius: '12px',
  padding: '32px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const summaryLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const summaryAmount: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '42px',
  fontWeight: 700,
  margin: '0 0 12px',
};

const summaryStatus: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  margin: 0,
};

const list: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '0 0 24px',
};

const listItem: React.CSSProperties = {
  marginBottom: '12px',
};

const thankYouBox: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const thankYouTitle: React.CSSProperties = {
  color: '#2A9D8F',
  fontSize: '20px',
  fontWeight: 600,
  margin: '0 0 12px',
};

const thankYouText: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
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

export default LoanPaidOff;
