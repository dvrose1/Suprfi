// ABOUTME: Password reset email template
// ABOUTME: Sent when admin requests password reset

import * as React from 'react';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#0F2D4A', padding: '20px', textAlign: 'center' as const }}>
        <h1 style={{ color: 'white', margin: 0 }}>
          Supr<span style={{ color: '#2A9D8F' }}>Fi</span>
        </h1>
      </div>
      <div style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#0F2D4A', marginTop: 0 }}>Reset Your Password</h2>
        <p style={{ color: '#374151', lineHeight: '1.6' }}>Hi {name},</p>
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          We received a request to reset your SuprOps admin password. Click the button below to create a new password:
        </p>
        <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <a
            href={resetUrl}
            style={{
              backgroundColor: '#2A9D8F',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Reset Password
          </a>
        </div>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
          This link will expire in 1 hour. If you didn&apos;t request this reset, you can safely ignore this email.
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
          If the button doesn&apos;t work, copy and paste this link into your browser:
          <br />
          <span style={{ color: '#2A9D8F', wordBreak: 'break-all' as const }}>{resetUrl}</span>
        </p>
      </div>
      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', textAlign: 'center' as const }}>
        <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>
          SuprFi Admin Portal
        </p>
      </div>
    </div>
  );
}
