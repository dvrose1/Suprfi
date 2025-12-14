// ABOUTME: Borrower portal login API
// ABOUTME: Login with email + password (for returning users)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBorrowerSession } from '@/lib/auth/borrower-session';
import { verifyPassword } from '@/lib/auth/password';

const SESSION_COOKIE_NAME = 'borrower_session';
const SESSION_DURATION_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer by email who has at least one funded loan
    const customer = await prisma.customer.findFirst({
      where: {
        email: { equals: email.toLowerCase().trim(), mode: 'insensitive' },
        applications: {
          some: {
            loan: { isNot: null },
          },
        },
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const token = await createBorrowerSession(customer.id, ipAddress, userAgent);

    // Set cookie on response directly
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_HOURS * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Borrower login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
