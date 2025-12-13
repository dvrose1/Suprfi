// ABOUTME: SuprClient cancel application API
// ABOUTME: Cancels an in-progress application

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { canPerformAction } from '@/lib/auth/contractor-roles';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAction(user.role, 'application:cancel')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Get application
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify ownership
    const contractorJob = await prisma.contractorJob.findUnique({
      where: { jobId: application.jobId },
    });

    if (!contractorJob || contractorJob.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Can only cancel initiated or submitted applications
    if (!['initiated', 'submitted'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel applications that have been decided' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    await prisma.application.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: 'cancelled_application',
      targetType: 'application',
      targetId: application.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel application error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
