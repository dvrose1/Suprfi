// ABOUTME: Contractor approval/invite email template
// ABOUTME: Sent when a contractor is approved from the waitlist

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface ContractorInviteProps {
  name: string;
  businessName?: string;
}

export function ContractorInvite({
  name,
  businessName,
}: ContractorInviteProps) {
  const preview = "You're approved! Start offering SuprFi financing to your customers.";

  return (
    <BaseLayout preview={preview}>
      <h1 style={heading}>
        Welcome to SuprFi, {businessName || name}!
      </h1>

      <p style={paragraph}>Hi {name},</p>

      <p style={paragraph}>
        Great news - your application to join the SuprFi partner network has been 
        <strong> approved</strong>! You can now offer instant financing to your 
        customers and close more jobs.
      </p>

      <div style={highlightBox}>
        <p style={highlightTitle}>What This Means For You:</p>
        <p style={highlightItem}>✓ Close more jobs with instant customer financing</p>
        <p style={highlightItem}>✓ Get paid in full within 24-48 hours</p>
        <p style={highlightItem}>✓ Zero risk - we handle collections</p>
        <p style={highlightItem}>✓ Simple integration with your workflow</p>
      </div>

      <p style={paragraph}>
        <strong>Next Steps:</strong>
      </p>

      <p style={listItem}>
        1. <strong>Schedule Onboarding</strong> - We&apos;ll set up your account and show you how it works (15 min)
      </p>
      <p style={listItem}>
        2. <strong>Connect Your CRM</strong> - Optional but recommended for automated workflows
      </p>
      <p style={listItem}>
        3. <strong>Start Offering Financing</strong> - Send your first customer a financing link
      </p>

      <div style={buttonContainer}>
        <a style={button} href="https://calendly.com/suprfi/contractor-onboarding">
          Schedule Onboarding Call
        </a>
      </div>

      <p style={paragraph}>
        <strong>Questions before your call?</strong>
      </p>

      <p style={paragraph}>
        Reply to this email or call us at <strong>(555) 123-4567</strong>. 
        We&apos;re here to help you get started.
      </p>

      <div style={statsBox}>
        <p style={statsTitle}>SuprFi Partners See:</p>
        <p style={statItem}>📈 30% increase in job close rates</p>
        <p style={statItem}>💰 $15K average ticket increase</p>
        <p style={statItem}>⚡ Same-day funding available</p>
      </div>

      <p style={signature}>
        Looking forward to partnering with you,
        <br />
        <br />
        The SuprFi Partnerships Team
        <br />
        <span style={{ color: '#6B7280', fontSize: '14px' }}>partners@suprfi.com</span>
      </p>
    </BaseLayout>
  );
}

// Styles
const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#0F2D4A',
  margin: '0 0 24px',
};

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
};

const listItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#374151',
  margin: '0 0 12px',
  paddingLeft: '8px',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#2A9D8F',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
};

const highlightBox: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  borderLeft: '4px solid #2A9D8F',
};

const highlightTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#0F2D4A',
  margin: '0 0 12px',
};

const highlightItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 6px',
};

const statsBox: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center',
};

const statsTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#6B7280',
  margin: '0 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 4px',
};

const signature: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '32px 0 0',
};

export default ContractorInvite;
