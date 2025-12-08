// ABOUTME: Reset password API endpoint
// ABOUTME: Validates token and updates password

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword, logAuditEvent, destroyAllUserSessions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password requirements
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Destroy all existing sessions for security
    await destroyAllUserSessions(user.id);

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await logAuditEvent({
      userId: user.id,
      action: 'password_reset_completed',
      ipAddress,
      userAgent,
    });

    console.log(`[Auth] Password reset completed for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset. Please log in with your new password.',
    });
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}

// Validate token endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid reset link' });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Reset link has expired' });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ valid: false, error: 'Reset link already used' });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[Auth] Validate token error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
