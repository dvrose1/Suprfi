// ABOUTME: Base email layout template with SuprFi branding
// ABOUTME: Returns a div wrapper - the actual html/body tags are added by Resend

import * as React from 'react';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  // Note: Resend handles the html/head/body wrapper
  // We just return the email content structure
  return (
    <div style={main}>
      {/* Hidden preview text for email clients */}
      <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
        {preview}
      </div>
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <p style={logo}>
            Supr<span style={logoAccent}>Fi</span>
          </p>
        </div>

        {/* Content */}
        <div style={content}>{children}</div>

        {/* Footer */}
        <hr style={hr} />
        <div style={footer}>
          <p style={footerText}>
            SuprFi - The Home Repair Financing Specialists
          </p>
          <p style={footerLinks}>
            <a href="https://suprfi.com" style={link}>
              Website
            </a>
            {' · '}
            <a href="https://suprfi.com/privacy" style={link}>
              Privacy Policy
            </a>
            {' · '}
            <a href="https://suprfi.com/terms" style={link}>
              Terms of Service
            </a>
          </p>
          <p style={footerDisclaimer}>
            © {new Date().getFullYear()} SuprFi Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header: React.CSSProperties = {
  padding: '24px 32px',
  borderBottom: '1px solid #e6ebf1',
};

const logo: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#0F2D4A',
  margin: 0,
};

const logoAccent: React.CSSProperties = {
  color: '#2A9D8F',
};

const content: React.CSSProperties = {
  padding: '32px',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '20px 0',
};

const footer: React.CSSProperties = {
  padding: '0 32px',
};

const footerText: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const footerLinks: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
};

const link: React.CSSProperties = {
  color: '#2A9D8F',
  textDecoration: 'none',
};

const footerDisclaimer: React.CSSProperties = {
  color: '#b7c1cd',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '16px 0 0',
};

export default BaseLayout;
