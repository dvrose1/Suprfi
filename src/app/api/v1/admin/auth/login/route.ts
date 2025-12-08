// ABOUTME: Admin login API endpoint
// ABOUTME: Authenticates admin users and creates sessions

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession, logAuditEvent, SESSION_COOKIE_CONFIG } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Log failed attempt (but don't reveal user doesn't exist)
      console.log(`[Auth] Login failed - user not found: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      await logAuditEvent({
        userId: user.id,
        action: 'login_failed',
        metadata: { reason: 'account_disabled' },
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { error: 'Account is disabled. Please contact an administrator.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      await logAuditEvent({
        userId: user.id,
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession(user.id, rememberMe, ipAddress, userAgent);

    // Log successful login
    await logAuditEvent({
      userId: user.id,
      action: 'login',
      metadata: { rememberMe },
      ipAddress,
      userAgent,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set session cookie
    response.cookies.set(
      SESSION_COOKIE_CONFIG.name,
      token,
      {
        ...SESSION_COOKIE_CONFIG.options,
        maxAge: SESSION_COOKIE_CONFIG.getMaxAge(rememberMe),
      }
    );

    return response;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
