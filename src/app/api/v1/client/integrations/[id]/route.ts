// ABOUTME: Client CRM integration management API
// ABOUTME: Disconnect a CRM integration

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateContractorSession } from '@/lib/auth/contractor-session';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('contractor_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = await validateContractorSession(sessionToken);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the connection belongs to this contractor
    const connection = await prisma.crmConnection.findUnique({
      where: { id },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.contractorId !== sessionUser.contractorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete by marking inactive
    await prisma.crmConnection.update({
      where: { id },
      data: {
        isActive: false,
        lastError: 'Disconnected by user',
      },
    });

    console.log(`CRM connection ${id} disconnected by contractor ${sessionUser.contractorId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
