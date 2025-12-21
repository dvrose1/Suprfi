// ABOUTME: Client CRM integrations API
// ABOUTME: List CRM connections for the authenticated contractor

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateContractorSession } from '@/lib/auth/contractor-session';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('contractor_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = await validateContractorSession(sessionToken);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get CRM connections for this contractor
    const connections = await prisma.crmConnection.findMany({
      where: {
        contractorId: sessionUser.contractorId,
        isActive: true,
      },
      select: {
        id: true,
        crmType: true,
        accountId: true,
        accountName: true,
        lastUsedAt: true,
        lastError: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      connections: connections.map(c => ({
        ...c,
        connectedAt: c.createdAt.toISOString(),
        lastUsedAt: c.lastUsedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
