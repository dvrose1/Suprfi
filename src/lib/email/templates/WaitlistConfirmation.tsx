// ABOUTME: Waitlist confirmation email template
// ABOUTME: Supports both homeowner and contractor variants

import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from '@react-email/components';
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
      <Heading style={heading}>
        {isContractor ? "Welcome to SuprFi Partners!" : "You're on the List!"}
      </Heading>

      <Text style={paragraph}>Hi {name},</Text>

      {isContractor ? (
        <>
          <Text style={paragraph}>
            Thanks for your interest in partnering with SuprFi! We're excited to
            help you close more jobs and get paid faster with instant financing
            for your customers.
          </Text>

          <Text style={paragraph}>
            <strong>What happens next?</strong>
          </Text>

          <Text style={listItem}>
            1. Our partnerships team will review your information
          </Text>
          <Text style={listItem}>
            2. We'll reach out to discuss your business needs
          </Text>
          <Text style={listItem}>
            3. Get set up with our simple integration (works with most CRMs)
          </Text>

          <Text style={paragraph}>
            In the meantime, learn more about how SuprFi helps contractors like
            you:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://suprfi.com/contractors">
              Learn More for Contractors
            </Button>
          </Section>
        </>
      ) : (
        <>
          <Text style={paragraph}>
            Thanks for joining the SuprFi waitlist! You're now in line for early
            access when we launch direct-to-consumer financing.
          </Text>

          <Text style={paragraph}>
            <strong>As a waitlist member, you'll get:</strong>
          </Text>

          <Text style={listItem}>✓ Early access to apply before public launch</Text>
          <Text style={listItem}>✓ Exclusive launch-day rates</Text>
          <Text style={listItem}>✓ Priority support</Text>

          <Text style={paragraph}>
            <strong>Need financing now?</strong> Ask your home service
            contractor if they offer SuprFi financing. Many HVAC, plumbing, and
            electrical contractors in your area already partner with us.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://suprfi.com/how-it-works">
              See How It Works
            </Button>
          </Section>
        </>
      )}

      <Text style={paragraph}>
        Have questions? Just reply to this email - we're happy to help.
      </Text>

      <Text style={signature}>
        Best,
        <br />
        The SuprFi Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#0F2D4A',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2A9D8F',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const signature = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '32px 0 0',
};

export default WaitlistConfirmation;
