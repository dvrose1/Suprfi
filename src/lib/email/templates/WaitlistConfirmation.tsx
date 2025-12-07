// ABOUTME: Waitlist confirmation email template
// ABOUTME: Supports both homeowner and contractor variants

import * as React from 'react';
import { BaseLayout } from './BaseLayout';

interface WaitlistConfirmationProps {
  name: string;
  type: 'homeowner' | 'contractor';
}

export function WaitlistConfirmation({
  name,
  type,
}: WaitlistConfirmationProps) {
  const isContractor = type === 'contractor';

  const preview = isContractor
    ? "You're on the list! We'll be in touch about partnering with SuprFi."
    : "You're on the list! We'll notify you when direct financing launches.";

  return (
    <BaseLayout preview={preview}>
      <h1 style={heading}>
        {isContractor ? "Welcome to SuprFi Partners!" : "You're on the List!"}
      </h1>

      <p style={paragraph}>Hi {name},</p>

      {isContractor ? (
        <>
          <p style={paragraph}>
            Thanks for your interest in partnering with SuprFi! We&apos;re excited to
            help you close more jobs and get paid faster with instant financing
            for your customers.
          </p>

          <p style={paragraph}>
            <strong>What happens next?</strong>
          </p>

          <p style={listItem}>
            1. Our partnerships team will review your information
          </p>
          <p style={listItem}>
            2. We&apos;ll reach out to discuss your business needs
          </p>
          <p style={listItem}>
            3. Get set up with our simple integration (works with most CRMs)
          </p>

          <p style={paragraph}>
            In the meantime, learn more about how SuprFi helps contractors like
            you:
          </p>

          <div style={buttonContainer}>
            <a style={button} href="https://suprfi.com/contractors">
              Learn More for Contractors
            </a>
          </div>
        </>
      ) : (
        <>
          <p style={paragraph}>
            Thanks for joining the SuprFi waitlist! You&apos;re now in line for early
            access when we launch direct-to-consumer financing.
          </p>

          <p style={paragraph}>
            <strong>As a waitlist member, you&apos;ll get:</strong>
          </p>

          <p style={listItem}>✓ Early access to apply before public launch</p>
          <p style={listItem}>✓ Exclusive launch-day rates</p>
          <p style={listItem}>✓ Priority support</p>

          <p style={paragraph}>
            <strong>Need financing now?</strong> Ask your home service
            contractor if they offer SuprFi financing. Many HVAC, plumbing, and
            electrical contractors in your area already partner with us.
          </p>

          <div style={buttonContainer}>
            <a style={button} href="https://suprfi.com/how-it-works">
              See How It Works
            </a>
          </div>
        </>
      )}

      <p style={paragraph}>
        Have questions? Just reply to this email - we&apos;re happy to help.
      </p>

      <p style={signature}>
        Best,
        <br />
        The SuprFi Team
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
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 8px',
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
  padding: '12px 24px',
};

const signature: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '32px 0 0',
};

export default WaitlistConfirmation;
