// ABOUTME: Admin API endpoint for contractor management
// ABOUTME: CRUD operations for contractor partners

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause for Contractor model
    const where: Record<string, unknown> = {};

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
      prisma.contractor.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.contractor.count({ where }),
    ]);

    // Get stats
    const [totalApproved, totalActive, totalSuspended] = await Promise.all([
      prisma.contractor.count({ where: { status: 'approved' } }),
      prisma.contractor.count({ where: { status: 'active' } }),
      prisma.contractor.count({ where: { status: 'suspended' } }),
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

// Create new contractor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      serviceType,
      phone,
      website,
      state,
      adminName,
      adminEmail,
      sendInvite = true,
    } = body;

    if (!businessName || !adminEmail) {
      return NextResponse.json(
        { error: 'Business name and admin email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.contractorUser.findUnique({
      where: { email: adminEmail.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create contractor and invite user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create contractor
      const contractor = await tx.contractor.create({
        data: {
          email: adminEmail.toLowerCase(),
          businessName,
          name: adminName || null,
          phone: phone || null,
          serviceType: serviceType || null,
          state: state || null,
          status: 'approved',
          source: 'admin_created',
        },
      });

      // Create user with invite token
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const user = await tx.contractorUser.create({
        data: {
          contractorId: contractor.id,
          email: adminEmail.toLowerCase(),
          name: adminName || null,
          passwordHash: '', // Will be set when they accept invite
          role: 'admin',
          isActive: false, // Activate when they set password
          inviteToken,
          inviteExpiresAt: inviteExpires,
        },
      });

      return { contractor, user, inviteToken };
    });

    // TODO: Send invite email if sendInvite is true
    if (sendInvite) {
      console.log(`Would send invite email to ${adminEmail} with token: ${result.inviteToken}`);
      // await sendInviteEmail(adminEmail, result.inviteToken);
    }

    return NextResponse.json({
      success: true,
      contractor: result.contractor,
      inviteLink: `/client/invite/${result.inviteToken}`,
    });
  } catch (error) {
    console.error('Admin contractor create error:', error);
    return NextResponse.json(
      { error: 'Failed to create contractor' },
      { status: 500 }
    );
  }
}

// Update contractor status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

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

    // Get contractor first to verify it exists
    const contractor = await prisma.contractor.findUnique({ where: { id } });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // Update contractor
    const updated = await prisma.contractor.update({
      where: { id },
      data: { status },
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
