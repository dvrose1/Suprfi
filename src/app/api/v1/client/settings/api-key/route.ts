// ABOUTME: SuprClient API key generation endpoint
// ABOUTME: Generate or regenerate API key for CRM integrations

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

    if (!canPerformAction(user.role, 'settings:manage_api_key')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if this is regeneration or first generation
    const contractor = await prisma.contractor.findUnique({
      where: { id: user.contractorId },
    });

    const isRegeneration = !!contractor?.apiKey;

    // Generate new API key
    const apiKey = `sf_${crypto.randomBytes(24).toString('hex')}`;

    // Update contractor
    await prisma.contractor.update({
      where: { id: user.contractorId },
      data: { apiKey },
    });

    // Log the action
    await logContractorAudit({
      userId: user.id,
      action: isRegeneration ? 'api_key_regenerated' : 'api_key_generated',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
