// ABOUTME: SuprClient send financing link API
// ABOUTME: Sends application links via SMS or Email

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { canPerformAction } from '@/lib/auth/contractor-roles';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!canPerformAction(user.role, 'application:send_link')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { method, customerName, phone, email, amount, serviceType } = body;

    // Validate required fields
    if (!method || !['sms', 'email'].includes(method)) {
      return NextResponse.json({ error: 'Invalid send method' }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    if (method === 'sms' && !phone) {
      return NextResponse.json({ error: 'Phone number is required for SMS' }, { status: 400 });
    }

    if (method === 'email' && !email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!amount || amount < 500 || amount > 25000) {
      return NextResponse.json(
        { error: 'Amount must be between $500 and $25,000' },
        { status: 400 }
      );
    }

    // Parse customer name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // Create or find customer
    let customer = await prisma.customer.findFirst({
      where: method === 'email' 
        ? { email: email.toLowerCase() }
        : { phone: phone.replace(/\D/g, '') },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email: email?.toLowerCase() || `${phone.replace(/\D/g, '')}@temp.suprfi.com`,
          phone: phone?.replace(/\D/g, '') || '',
        },
      });
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        estimateAmount: amount,
        serviceType: serviceType || null,
        status: 'pending',
      },
    });

    // Link job to contractor
    await prisma.contractorJob.create({
      data: {
        contractorId: user.contractorId,
        jobId: job.id,
        initiatedBy: user.id,
        sendMethod: method,
      },
    });

    // Create application with token
    const token = crypto.randomBytes(16).toString('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 day expiry

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        customerId: customer.id,
        token,
        tokenExpiresAt,
        status: 'initiated',
      },
    });

    // Build application URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.suprfi.com';
    const applicationUrl = `${baseUrl}/apply/${token}`;

    // Send message
    if (method === 'sms') {
      // TODO: Integrate with Twilio
      console.log(`SMS to ${phone}: ${applicationUrl}`);
      // await sendSMS(phone, `Hi ${firstName}! Apply for financing here: ${applicationUrl}`);
    } else {
      // TODO: Integrate with Resend
      console.log(`Email to ${email}: ${applicationUrl}`);
      // await sendEmail(email, firstName, applicationUrl);
    }

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: method === 'sms' ? 'sent_link_sms' : 'sent_link_email',
      targetType: 'application',
      targetId: application.id,
      metadata: { customerName, amount, serviceType, method },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      applicationUrl,
    });
  } catch (error) {
    console.error('Send link error:', error);
    return NextResponse.json(
      { error: 'Failed to send financing link' },
      { status: 500 }
    );
  }
}
