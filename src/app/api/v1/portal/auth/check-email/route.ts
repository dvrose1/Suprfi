// ABOUTME: Check if email has a loan and whether user has password set
// ABOUTME: First step in borrower auth flow

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find customer by email who has at least one funded loan
    const customer = await prisma.customer.findFirst({
      where: {
        email: { equals: email.toLowerCase().trim(), mode: 'insensitive' },
        applications: {
          some: {
            loan: { isNot: null },
          },
        },
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'No account found with this email. Please check your email or contact support.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      hasPassword: !!customer.passwordHash,
    });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
