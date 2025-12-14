// ABOUTME: SuprClient login API endpoint
// ABOUTME: Authenticates contractor users and creates sessions

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createContractorSession } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';

const SESSION_COOKIE_NAME = 'contractor_session';
const SESSION_DURATION_HOURS = 24;
const REMEMBER_ME_DURATION_DAYS = 30;

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

    // Find user by email
    const user = await prisma.contractorUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        contractor: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact your administrator.' },
        { status: 403 }
      );
    }

    // Check if contractor is active
    if (user.contractor.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your organization has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Log failed login attempt
      await logContractorAudit({
        userId: user.id,
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    const token = await createContractorSession(user.id, rememberMe, ipAddress, userAgent);

    // Log successful login
    await logContractorAudit({
      userId: user.id,
      action: 'login',
      ipAddress,
      userAgent,
    });

    // Set cookie directly on response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        contractorId: user.contractorId,
        contractorName: user.contractor.businessName,
      },
    });

    const maxAge = rememberMe
      ? REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60
      : SESSION_DURATION_HOURS * 60 * 60;

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
