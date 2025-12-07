// ABOUTME: Admin API endpoint for waitlist management
// ABOUTME: Supports filtering, search, pagination, and status updates

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // homeowner, contractor
    const status = searchParams.get('status'); // active, converted, unsubscribed
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
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

    // Get waitlist entries with pagination
    const [entries, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.waitlist.count({ where }),
    ]);

    // Get stats
    const [totalAll, homeowners, contractors, thisWeek, converted] = await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.count({ where: { type: 'homeowner' } }),
      prisma.waitlist.count({ where: { type: 'contractor' } }),
      prisma.waitlist.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.waitlist.count({ where: { status: 'converted' } }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalAll,
        homeowners,
        contractors,
        thisWeek,
        converted,
      },
    });
  } catch (error) {
    console.error('Admin waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// Update waitlist entry status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ids, bulkStatus } = body;

    // Bulk update
    if (ids && bulkStatus) {
      await prisma.waitlist.updateMany({
        where: { id: { in: ids } },
        data: { status: bulkStatus },
      });
      return NextResponse.json({ success: true, updated: ids.length });
    }

    // Single update
    if (id && status) {
      const updated = await prisma.waitlist.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, entry: updated });
    }

    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin waitlist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// Delete waitlist entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await prisma.waitlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin waitlist delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
