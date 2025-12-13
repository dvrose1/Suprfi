// ABOUTME: SuprClient password change endpoint
// ABOUTME: Change password for authenticated contractor users

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies, invalidateAllContractorSessions, createContractorSession, setContractorSessionCookie } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get user with password hash
    const contractorUser = await prisma.contractorUser.findUnique({
      where: { id: user.id },
    });

    if (!contractorUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, contractorUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.contractorUser.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all existing sessions
    await invalidateAllContractorSessions(user.id);

    // Create a new session for current user
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const token = await createContractorSession(user.id, false, ipAddress, userAgent);
    await setContractorSessionCookie(token, false);

    // Log the password change
    await logContractorAudit({
      userId: user.id,
      action: 'password_changed',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
