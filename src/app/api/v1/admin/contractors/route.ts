// ABOUTME: Admin API endpoint for contractor management
// ABOUTME: Lists approved contractors from waitlist with filtering and search

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // approved, suspended, active
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause - only contractors with approved status or beyond
    const where: Record<string, unknown> = {
      type: 'contractor',
      status: { in: ['approved', 'active', 'suspended'] },
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get contractors with pagination
    const [contractors, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.waitlist.count({ where }),
    ]);

    // Get stats
    const [totalApproved, totalActive, totalSuspended] = await Promise.all([
      prisma.waitlist.count({ 
        where: { type: 'contractor', status: 'approved' } 
      }),
      prisma.waitlist.count({ 
        where: { type: 'contractor', status: 'active' } 
      }),
      prisma.waitlist.count({ 
        where: { type: 'contractor', status: 'suspended' } 
      }),
    ]);

    return NextResponse.json({
      contractors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalApproved + totalActive + totalSuspended,
        approved: totalApproved,
        active: totalActive,
        suspended: totalSuspended,
      },
    });
  } catch (error) {
    console.error('Admin contractors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    );
  }
}

// Update contractor status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['approved', 'active', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, active, or suspended' },
        { status: 400 }
      );
    }

    // Get contractor first to verify it exists and is a contractor
    const contractor = await prisma.waitlist.findUnique({ where: { id } });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    if (contractor.type !== 'contractor') {
      return NextResponse.json(
        { error: 'Entry is not a contractor' },
        { status: 400 }
      );
    }

    // Update contractor
    const updated = await prisma.waitlist.update({
      where: { id },
      data: { 
        status,
        // Store notes in utmParams as a workaround (or we can add a notes field later)
      },
    });

    return NextResponse.json({ 
      success: true, 
      contractor: updated,
    });
  } catch (error) {
    console.error('Admin contractor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    );
  }
}
