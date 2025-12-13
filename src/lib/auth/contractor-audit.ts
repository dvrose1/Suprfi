// ABOUTME: Audit logging for SuprClient actions
// ABOUTME: Tracks all contractor user actions for compliance

import { prisma } from '@/lib/prisma';

export type ContractorAuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'sent_link_sms'
  | 'sent_link_email'
  | 'generated_qr'
  | 'viewed_application'
  | 'viewed_loan'
  | 'cancelled_application'
  | 'resent_application_link'
  | 'exported_applications'
  | 'team_member_invited'
  | 'team_member_role_changed'
  | 'team_member_deactivated'
  | 'settings_updated'
  | 'api_key_generated'
  | 'api_key_regenerated';

interface AuditLogParams {
  userId: string;
  action: ContractorAuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logContractorAudit({
  userId,
  action,
  targetType,
  targetId,
  metadata,
  ipAddress,
  userAgent,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.contractorAuditLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId,
        metadata: metadata ? metadata : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw on audit log failure - just log to console
    console.error('Failed to create contractor audit log:', error);
  }
}

export async function getContractorAuditLogs(
  contractorId: string,
  options?: {
    userId?: string;
    action?: ContractorAuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = {
    user: {
      contractorId,
    },
  };
  
  if (options?.userId) {
    where.userId = options.userId;
  }
  
  if (options?.action) {
    where.action = options.action;
  }
  
  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      (where.createdAt as Record<string, unknown>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.createdAt as Record<string, unknown>).lte = options.endDate;
    }
  }
  
  const [logs, total] = await Promise.all([
    prisma.contractorAuditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.contractorAuditLog.count({ where }),
  ]);
  
  return { logs, total };
}

export async function getUserActivityStats(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await prisma.contractorAuditLog.groupBy({
    by: ['action'],
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    _count: true,
  });
  
  return logs.reduce((acc, log) => {
    acc[log.action] = log._count;
    return acc;
  }, {} as Record<string, number>);
}
