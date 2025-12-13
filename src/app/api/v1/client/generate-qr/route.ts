// ABOUTME: SuprClient QR code generation API
// ABOUTME: Generates QR codes for technicians to share with customers

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { canPerformAction } from '@/lib/auth/contractor-roles';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!canPerformAction(user.role, 'application:generate_qr')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, serviceType, customerName } = body;

    if (!amount || amount < 500 || amount > 25000) {
      return NextResponse.json(
        { error: 'Amount must be between $500 and $25,000' },
        { status: 400 }
      );
    }

    // Build the application URL with parameters
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.suprfi.com';
    const params = new URLSearchParams({
      c: user.contractorId, // contractor ID
      a: amount.toString(), // amount
    });
    
    if (serviceType) {
      params.set('s', serviceType);
    }
    if (customerName) {
      params.set('n', customerName);
    }

    const applicationUrl = `${baseUrl}/apply/start?${params.toString()}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(applicationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0F2D4A', // Navy
        light: '#FFFFFF',
      },
    });

    // Log the QR generation
    await logContractorAudit({
      userId: user.id,
      action: 'generated_qr',
      metadata: { amount, serviceType, customerName },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      qrCodeDataUrl,
      applicationUrl,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
