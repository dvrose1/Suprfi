// ABOUTME: Verify magic link and create session
// ABOUTME: Returns whether user needs to set password

import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkAndCreateSession, setBorrowerSessionCookie } from '@/lib/auth/borrower-session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await verifyMagicLinkAndCreateSession(token, ipAddress, userAgent);

    if (!result.success || !result.sessionToken) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Set session cookie
    await setBorrowerSessionCookie(result.sessionToken);

    // Check if user needs to set password
    const session = await prisma.borrowerSession.findUnique({
      where: { token: result.sessionToken },
      include: { customer: { select: { passwordHash: true } } },
    });

    const needsPassword = !session?.customer?.passwordHash;

    return NextResponse.json({
      success: true,
      needsPassword,
    });
  } catch (error) {
    console.error('Verify magic link error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
