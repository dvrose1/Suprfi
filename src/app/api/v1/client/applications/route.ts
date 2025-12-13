// ABOUTME: SuprClient applications list API
// ABOUTME: Returns applications for the contractor's jobs

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get contractor's job IDs
    const contractorJobs = await prisma.contractorJob.findMany({
      where: { contractorId: user.contractorId },
      select: { jobId: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);

    if (jobIds.length === 0) {
      return NextResponse.json({
        applications: [],
        stats: {},
        pagination: { page: 1, limit, total: 0, pages: 0 },
      });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      jobId: { in: jobIds },
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.customer = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          customer: true,
          job: true,
          loan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Get stats (all statuses for contractor)
    const allApps = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      select: { status: true },
    });

    const stats: Record<string, number> = {};
    allApps.forEach(app => {
      stats[app.status] = (stats[app.status] || 0) + 1;
    });

    // Format response
    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      customer: {
        name: `${app.customer.firstName} ${app.customer.lastName.charAt(0)}.`,
        maskedEmail: maskEmail(app.customer.email),
        maskedPhone: maskPhone(app.customer.phone),
      },
      job: {
        amount: Number(app.job.estimateAmount),
        serviceType: app.job.serviceType,
      },
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      fundedAt: app.loan?.fundingDate?.toISOString(),
    }));

    return NextResponse.json({
      applications: formattedApplications,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Applications API error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***.com';
  const maskedUser = user.charAt(0) + '***' + (user.length > 1 ? user.charAt(user.length - 1) : '');
  return `${maskedUser}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '(***) ***-****';
  return `(***) ***-${phone.slice(-4)}`;
}
