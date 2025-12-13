// ABOUTME: SuprClient invite verification API
// ABOUTME: Verify invite token and return invite details

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find user by invite token
    const user = await prisma.contractorUser.findUnique({
      where: { inviteToken: token },
      include: {
        contractor: true,
      },
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

    return NextResponse.json({
      email: user.email,
      name: user.name,
      contractorName: user.contractor.businessName,
      role: user.role,
    });
  } catch (error) {
    console.error('Invite verification error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
