// ABOUTME: Base email layout template with SuprFi branding
// ABOUTME: Used as wrapper for all transactional emails

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Supr<span style={logoAccent}>Fi</span>
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              SuprFi - The Home Repair Financing Specialists
            </Text>
            <Text style={footerLinks}>
              <Link href="https://suprfi.com" style={link}>
                Website
              </Link>
              {' · '}
              <Link href="https://suprfi.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {' · '}
              <Link href="https://suprfi.com/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              © {new Date().getFullYear()} SuprFi Inc. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '24px 32px',
  borderBottom: '1px solid #e6ebf1',
};

const logo = {
  fontSize: '28px',
  fontWeight: '700' as const,
  color: '#0F2D4A',
  margin: '0',
};

const logoAccent = {
  color: '#2A9D8F',
};

const content = {
  padding: '32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
};

const link = {
  color: '#2A9D8F',
  textDecoration: 'none',
};

const footerDisclaimer = {
  color: '#b7c1cd',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '16px 0 0',
};

export default BaseLayout;
