// ABOUTME: API endpoint to get a single contractor by ID
// ABOUTME: Returns contractor details from waitlist table

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const { id } = await params;

    const contractor = await prisma.waitlist.findFirst({
      where: {
        id,
        type: 'contractor',
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contractor });
  } catch (err) {
    console.error('Error fetching contractor:', err);
    return NextResponse.json(
      { error: 'Failed to fetch contractor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireAuth(request, 'ops');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const contractor = await prisma.waitlist.findFirst({
      where: {
        id,
        type: 'contractor',
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ contractor: updated });
  } catch (err) {
    console.error('Error updating contractor:', err);
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    );
  }
}
