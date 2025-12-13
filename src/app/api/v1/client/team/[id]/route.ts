// ABOUTME: SuprClient team member update/delete API
// ABOUTME: Update role or deactivate team members

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies, invalidateAllContractorSessions } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { canPerformAction, canManageRole, type ContractorRole } from '@/lib/auth/contractor-roles';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAction(user.role, 'team:update_role')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    // Can't update own role
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot update your own role' }, { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.contractorUser.findUnique({
      where: { id },
    });

    if (!targetUser || targetUser.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate new role
    const validRoles: ContractorRole[] = ['owner', 'manager', 'tech', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user can manage the target's current role and the new role
    if (!canManageRole(user.role, targetUser.role as ContractorRole) ||
        !canManageRole(user.role, role)) {
      return NextResponse.json({ error: 'Cannot assign this role' }, { status: 403 });
    }

    // Update role
    await prisma.contractorUser.update({
      where: { id },
      data: { role },
    });

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: 'team_member_role_changed',
      targetType: 'contractor_user',
      targetId: id,
      metadata: { oldRole: targetUser.role, newRole: role },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAction(user.role, 'team:deactivate')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Can't deactivate self
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.contractorUser.findUnique({
      where: { id },
    });

    if (!targetUser || targetUser.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can manage the target's role
    if (!canManageRole(user.role, targetUser.role as ContractorRole)) {
      return NextResponse.json({ error: 'Cannot deactivate this user' }, { status: 403 });
    }

    // Deactivate user (soft delete)
    await prisma.contractorUser.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate all their sessions
    await invalidateAllContractorSessions(id);

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: 'team_member_deactivated',
      targetType: 'contractor_user',
      targetId: id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team deactivate error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
