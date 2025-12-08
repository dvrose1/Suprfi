// ABOUTME: Admin users API endpoint
// ABOUTME: List, create, and manage admin users

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/api';
import { hashPassword, logAuditEvent, canManageRole, getManageableRoles } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { AdminInviteEmail } from '@/lib/email/templates/AdminInvite';

// GET - List all admin users
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request, 'admin');
    if (error) return error;

    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get manageable roles for the current user
    const manageableRoles = getManageableRoles(user!.role);

    return NextResponse.json({
      users,
      currentUserId: user!.id,
      manageableRoles,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new admin user (invite)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request, 'admin');
    if (error) return error;

    const body = await request.json();
    const { email, name, role, sendInvite = true } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Check if current user can manage this role
    if (!canManageRole(user!.role, role)) {
      return NextResponse.json(
        { error: 'You cannot create users with this role' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create user
    const newUser = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        role,
        passwordHash,
        isActive: true,
        createdBy: user!.id,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user!.id,
      action: 'user_created',
      targetType: 'admin_user',
      targetId: newUser.id,
      metadata: { email: newUser.email, role: newUser.role },
    });

    // Send invite email if requested
    if (sendInvite) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suprfi.com';
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to SuprOps - Your Admin Account',
        react: AdminInviteEmail({
          name: newUser.name || 'Admin',
          email: newUser.email,
          tempPassword,
          loginUrl: `${baseUrl}/admin/login`,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      tempPassword: sendInvite ? undefined : tempPassword, // Only return if not sending email
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Helper to generate temp password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
