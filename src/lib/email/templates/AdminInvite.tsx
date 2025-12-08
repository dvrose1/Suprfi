// ABOUTME: Admin invite email template
// ABOUTME: Sent when inviting new admin users

import * as React from 'react';

interface AdminInviteEmailProps {
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export function AdminInviteEmail({ name, email, tempPassword, loginUrl }: AdminInviteEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#0F2D4A', padding: '20px', textAlign: 'center' as const }}>
        <h1 style={{ color: 'white', margin: 0 }}>
          Supr<span style={{ color: '#2A9D8F' }}>Fi</span>
        </h1>
      </div>
      <div style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#0F2D4A', marginTop: 0 }}>Welcome to SuprOps!</h2>
        <p style={{ color: '#374151', lineHeight: '1.6' }}>Hi {name},</p>
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          You&apos;ve been invited to join the SuprOps admin team. Here are your login credentials:
        </p>
        <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }}>
          <p style={{ margin: '0 0 8px 0', color: '#374151' }}><strong>Email:</strong> {email}</p>
          <p style={{ margin: 0, color: '#374151' }}><strong>Temporary Password:</strong> {tempPassword}</p>
        </div>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
          Please change your password after your first login using the &quot;Forgot Password&quot; link.
        </p>
        <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <a
            href={loginUrl}
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
            Login to SuprOps
          </a>
        </div>
      </div>
      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', textAlign: 'center' as const }}>
        <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>
          SuprFi Admin Portal
        </p>
      </div>
    </div>
  );
}
