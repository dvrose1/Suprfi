// ABOUTME: SuprClient invite acceptance API
// ABOUTME: Accept invitation and set password

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find user by invite token
    const user = await prisma.contractorUser.findUnique({
      where: { inviteToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    // Check if invite has expired
    if (user.inviteExpiresAt && user.inviteExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    // Check if already activated
    if (user.isActive) {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Activate user
    await prisma.contractorUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isActive: true,
        inviteToken: null,
        inviteExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite acceptance error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
