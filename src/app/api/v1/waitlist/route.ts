// ABOUTME: API endpoint for waitlist signups
// ABOUTME: Stores submissions in database and sends confirmation email

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      email,
      name,
      phone,
      // Homeowner fields
      zipCode,
      repairType,
      // Contractor fields
      businessName,
      serviceType,
      state,
      // Metadata
      source,
      referrer,
      utmParams,
    } = body;

    // Validation
    if (!type || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'homeowner' && type !== 'contractor') {
      return NextResponse.json(
        { error: 'Invalid type. Must be homeowner or contractor' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.waitlist.findFirst({
      where: {
        email: email.toLowerCase(),
        type,
      },
    });

    if (existing) {
      // Update existing record instead of creating duplicate
      const updated = await prisma.waitlist.update({
        where: { id: existing.id },
        data: {
          name,
          phone,
          zipCode,
          repairType,
          businessName,
          serviceType,
          state,
          source,
          referrer,
          utmParams,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Your information has been updated',
        id: updated.id,
      });
    }

    // Create new waitlist entry
    const waitlist = await prisma.waitlist.create({
      data: {
        type,
        email: email.toLowerCase(),
        name,
        phone,
        zipCode,
        repairType,
        businessName,
        serviceType,
        state,
        source,
        referrer,
        utmParams,
      },
    });

    // TODO: Send confirmation email via Resend
    // This will be implemented once Resend is configured
    // await sendWaitlistConfirmation(waitlist);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist',
      id: waitlist.id,
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist stats (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const where = type ? { type } : {};

    const total = await prisma.waitlist.count({ where });
    const homeowners = await prisma.waitlist.count({ where: { type: 'homeowner' } });
    const contractors = await prisma.waitlist.count({ where: { type: 'contractor' } });

    const recent = await prisma.waitlist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        total,
        homeowners,
        contractors,
      },
      recent,
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve waitlist stats' },
      { status: 500 }
    );
  }
}
