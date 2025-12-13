// ABOUTME: SuprClient resend application link API
// ABOUTME: Resends the application link to the customer

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

    if (!canPerformAction(user.role, 'application:resend')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Get application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true,
      },
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

    // Can only resend for initiated applications
    if (application.status !== 'initiated') {
      return NextResponse.json(
        { error: 'Can only resend link for applications that have not been submitted' },
        { status: 400 }
      );
    }

    // Build application URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.suprfi.com';
    const applicationUrl = `${baseUrl}/apply/${application.token}`;

    // TODO: Send via original method (SMS or Email)
    // For now, log the URL
    console.log(`Resending application link to ${application.customer.email}: ${applicationUrl}`);

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: 'resent_application_link',
      targetType: 'application',
      targetId: application.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, applicationUrl });
  } catch (error) {
    console.error('Resend link error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
