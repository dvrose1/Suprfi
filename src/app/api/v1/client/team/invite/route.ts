// ABOUTME: SuprClient team invite API
// ABOUTME: Sends invitation email to new team member

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { canPerformAction, canManageRole, type ContractorRole } from '@/lib/auth/contractor-roles';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const INVITE_EXPIRY_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAction(user.role, 'team:invite')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Validate role
    const validRoles: ContractorRole[] = ['owner', 'manager', 'tech', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user can assign this role
    if (!canManageRole(user.role, role)) {
      return NextResponse.json({ error: 'You cannot assign this role' }, { status: 403 });
    }

    // Check if email already exists
    const existingUser = await prisma.contractorUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + INVITE_EXPIRY_DAYS);

    // Generate temporary password (user will set their own via invite link)
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Create user with invite token
    const newUser = await prisma.contractorUser.create({
      data: {
        contractorId: user.contractorId,
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        role,
        isActive: false, // Inactive until they accept invite
        invitedBy: user.id,
        inviteToken,
        inviteExpiresAt,
      },
    });

    // Build invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.suprfi.com';
    const inviteUrl = `${baseUrl}/client/invite/${inviteToken}`;

    // TODO: Send invitation email via Resend
    console.log(`Invitation URL for ${email}: ${inviteUrl}`);

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: 'team_member_invited',
      targetType: 'contractor_user',
      targetId: newUser.id,
      metadata: { email, role },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      inviteUrl, // Remove in production - just for testing
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
