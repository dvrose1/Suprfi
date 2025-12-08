// ABOUTME: Forgot password API endpoint
// ABOUTME: Sends password reset email to admin users

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSecureToken, logAuditEvent } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { PasswordResetEmail } from '@/lib/email/templates/PasswordReset';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user (but don't reveal if they exist)
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

    if (!user || !user.isActive) {
      // Log but don't reveal
      console.log(`[Auth] Password reset requested for unknown/inactive email: ${email}`);
      return successResponse;
    }

    // Generate reset token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: { email: user.email },
    });

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await logAuditEvent({
      userId: user.id,
      action: 'password_reset_requested',
      ipAddress,
      userAgent,
    });

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suprfi.com';
    const resetUrl = `${baseUrl}/admin/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your SuprOps Password',
      react: PasswordResetEmail({ 
        name: user.name || 'Admin',
        resetUrl,
      }),
      replyTo: 'support@suprfi.com',
    });

    console.log(`[Auth] Password reset email sent to: ${user.email}`);

    return successResponse;
  } catch (error) {
    console.error('[Auth] Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
