// ABOUTME: Set password for borrower account
// ABOUTME: Requires active session (after magic link verification)

import { NextRequest, NextResponse } from 'next/server';
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getBorrowerSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Hash and save password
    const passwordHash = await hashPassword(password);

    await prisma.customer.update({
      where: { id: user.customerId },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
