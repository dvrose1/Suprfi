// ABOUTME: SuprClient team list API
// ABOUTME: Returns team members for the contractor

import { NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { canPerformAction } from '@/lib/auth/contractor-roles';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAction(user.role, 'team:view')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get team members
    const members = await prisma.contractorUser.findMany({
      where: { contractorId: user.contractorId },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Get activity stats for each member
    const memberStats = await Promise.all(
      members.map(async (member) => {
        const [linksSent, applicationsInitiated] = await Promise.all([
          prisma.contractorAuditLog.count({
            where: {
              userId: member.id,
              action: { in: ['sent_link_sms', 'sent_link_email', 'generated_qr'] },
            },
          }),
          prisma.contractorJob.count({
            where: { initiatedBy: member.id },
          }),
        ]);

        return {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
          lastLoginAt: member.lastLoginAt?.toISOString() || null,
          createdAt: member.createdAt.toISOString(),
          stats: {
            linksSent,
            applicationsInitiated,
          },
        };
      })
    );

    return NextResponse.json({ members: memberStats });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
