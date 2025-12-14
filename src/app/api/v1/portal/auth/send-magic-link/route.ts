// ABOUTME: Send magic link for passwordless login
// ABOUTME: Creates magic link and sends email (email sending is placeholder for now)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMagicLink } from '@/lib/auth/borrower-session';

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
        email: true,
        firstName: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Create magic link token
    const token = await createMagicLink(customer.id);
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://suprfi.com'}/portal/magic-link?token=${token}`;

    // TODO: Send email with magic link via Resend/Twilio
    // For now, log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== MAGIC LINK (DEV ONLY) ===');
      console.log(`Email: ${customer.email}`);
      console.log(`Link: ${magicLinkUrl}`);
      console.log('=============================');
    }

    // In production, we'd send the email here
    // await sendMagicLinkEmail(customer.email, customer.firstName, magicLinkUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send magic link error:', error);
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 });
  }
}
