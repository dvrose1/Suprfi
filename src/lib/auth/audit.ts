// ABOUTME: Audit logging for admin actions
// ABOUTME: Tracks important actions for security and compliance

import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'user_reactivated'
  | 'role_changed'
  | 'session_force_logout'
  | 'application_approved'
  | 'application_declined'
  | 'contractor_approved'
  | 'contractor_suspended';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    // Log to console but don't fail the main operation
    console.error('[Audit] Failed to log audit event:', error);
  }
}

export async function getAuditLogs(options: {
  userId?: string;
  action?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};
  
  if (options.userId) {
    where.userId = options.userId;
  }
  if (options.action) {
    where.action = options.action;
  }
  if (options.targetType) {
    where.targetType = options.targetType;
  }
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      (where.createdAt as Record<string, Date>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.createdAt as Record<string, Date>).lte = options.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { logs, total };
}

export function getActionDisplayName(action: AuditAction): string {
  const names: Record<AuditAction, string> = {
    login: 'Logged in',
    logout: 'Logged out',
    login_failed: 'Failed login attempt',
    password_reset_requested: 'Requested password reset',
    password_reset_completed: 'Reset password',
    user_created: 'Created user',
    user_updated: 'Updated user',
    user_deactivated: 'Deactivated user',
    user_reactivated: 'Reactivated user',
    role_changed: 'Changed user role',
    session_force_logout: 'Force logged out user',
    application_approved: 'Approved application',
    application_declined: 'Declined application',
    contractor_approved: 'Approved contractor',
    contractor_suspended: 'Suspended contractor',
  };
  return names[action] || action;
}
