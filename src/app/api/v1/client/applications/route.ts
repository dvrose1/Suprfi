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
    const technicianId = searchParams.get('technician');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build contractor jobs filter
    const contractorJobsWhere: Record<string, unknown> = { 
      contractorId: user.contractorId 
    };
    
    // Filter by technician if specified
    if (technicianId && technicianId !== 'all') {
      contractorJobsWhere.initiatedBy = technicianId;
    }

    // Get contractor's job IDs (with optional technician filter)
    const contractorJobs = await prisma.contractorJob.findMany({
      where: contractorJobsWhere,
      select: { jobId: true, initiatedBy: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);
    
    // Build a map of jobId -> initiatedBy for later use
    const jobTechnicianMap = new Map(
      contractorJobs.map(cj => [cj.jobId, cj.initiatedBy])
    );

    // Get all technicians for this contractor (for filter dropdown)
    const technicians = await prisma.contractorUser.findMany({
      where: { contractorId: user.contractorId, isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });

    if (jobIds.length === 0) {
      return NextResponse.json({
        applications: [],
        stats: {},
        technicians: technicians.map(t => ({ id: t.id, name: t.name || t.email })),
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

    // Build technician lookup map
    const technicianMap = new Map(
      technicians.map(t => [t.id, t.name || t.email])
    );

    // Format response
    const formattedApplications = applications.map(app => {
      const technicianUserId = jobTechnicianMap.get(app.jobId);
      return {
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
        technician: technicianUserId ? {
          id: technicianUserId,
          name: technicianMap.get(technicianUserId) || 'Unknown',
        } : null,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        fundedAt: app.loan?.fundingDate?.toISOString(),
      };
    });

    return NextResponse.json({
      applications: formattedApplications,
      stats,
      technicians: technicians.map(t => ({ id: t.id, name: t.name || t.email })),
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
