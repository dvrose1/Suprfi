// ABOUTME: Admin audit log API endpoint
// ABOUTME: View audit logs (God role only)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/api';

export async function GET(request: NextRequest) {
  try {
    // Only God can view audit logs
    const { user, error } = await requireAuth(request, 'god');
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

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
        skip,
        take: limit,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    // Get unique actions for filter
    const actions = await prisma.adminAuditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
    });

    // Get unique users for filter
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true },
      orderBy: { email: 'asc' },
    });

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
        user: log.user,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        actions: actions.map(a => ({ action: a.action, count: a._count })),
        users,
      },
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
