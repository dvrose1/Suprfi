// ABOUTME: Single admin user API endpoint
// ABOUTME: Get, update, and deactivate admin users

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/api';
import { logAuditEvent, canManageRole, destroyAllUserSessions, AdminRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user: currentUser, error } = await requireAuth(request, 'admin');
    if (error) return error;

    const { id } = await params;

    const user = await prisma.adminUser.findUnique({
      where: { id },
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { user: currentUser, error } = await requireAuth(request, 'admin');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { name, role, isActive } = body;

    // Get the target user
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deactivation
    if (id === currentUser!.id && isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Check role management permissions
    if (role && role !== targetUser.role) {
      if (!canManageRole(currentUser!.role, targetUser.role as AdminRole)) {
        return NextResponse.json(
          { error: 'You cannot modify users with this role' },
          { status: 403 }
        );
      }
      if (!canManageRole(currentUser!.role, role as AdminRole)) {
        return NextResponse.json(
          { error: 'You cannot assign this role' },
          { status: 403 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    // Log audit events
    if (role && role !== targetUser.role) {
      await logAuditEvent({
        userId: currentUser!.id,
        action: 'role_changed',
        targetType: 'admin_user',
        targetId: id,
        metadata: { oldRole: targetUser.role, newRole: role },
      });
    }

    if (isActive === false && targetUser.isActive) {
      await logAuditEvent({
        userId: currentUser!.id,
        action: 'user_deactivated',
        targetType: 'admin_user',
        targetId: id,
      });
      // Destroy all sessions for deactivated user
      await destroyAllUserSessions(id);
    }

    if (isActive === true && !targetUser.isActive) {
      await logAuditEvent({
        userId: currentUser!.id,
        action: 'user_reactivated',
        targetType: 'admin_user',
        targetId: id,
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Force logout user (destroy all sessions)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user: currentUser, error } = await requireAuth(request, 'god');
    if (error) return error;

    const { id } = await params;

    // Prevent self-logout
    if (id === currentUser!.id) {
      return NextResponse.json(
        { error: 'You cannot force logout yourself' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Destroy all sessions
    await destroyAllUserSessions(id);

    await logAuditEvent({
      userId: currentUser!.id,
      action: 'session_force_logout',
      targetType: 'admin_user',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'User sessions terminated' });
  } catch (err) {
    console.error('Error force logging out user:', err);
    return NextResponse.json(
      { error: 'Failed to force logout user' },
      { status: 500 }
    );
  }
}
