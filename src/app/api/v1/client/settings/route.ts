// ABOUTME: SuprClient settings API
// ABOUTME: Get and update contractor user settings

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies, getActiveContractorSessions } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const contractorUser = await prisma.contractorUser.findUnique({
      where: { id: user.id },
      include: {
        contractor: true,
      },
    });

    if (!contractorUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active sessions
    const sessions = await getActiveContractorSessions(user.id);
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('contractor_session')?.value;

    // Parse notification settings from contractor settings JSON
    const contractorSettings = (contractorUser.contractor.settings as Record<string, unknown>) || {};
    const notifications = {
      emailOnSubmission: contractorSettings.emailOnSubmission !== false,
      emailOnApproval: contractorSettings.emailOnApproval !== false,
      emailOnFunding: contractorSettings.emailOnFunding !== false,
      emailWeeklyDigest: contractorSettings.emailWeeklyDigest === true,
      smsOnHighValue: contractorSettings.smsOnHighValue === true,
    };

    return NextResponse.json({
      profile: {
        businessName: contractorUser.contractor.businessName,
        name: contractorUser.name,
        email: contractorUser.email,
        phone: contractorUser.phone,
      },
      notifications,
      apiKey: contractorUser.contractor.apiKey,
      sessions: sessions.map((s) => ({
        id: s.id,
        lastActiveAt: s.lastActiveAt.toISOString(),
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        current: false, // Will be set below
      })).map(s => {
        // Find current session by checking token match (simplified)
        const session = sessions.find(sess => sess.id === s.id);
        return {
          ...s,
          current: session ? currentToken?.includes(session.id.slice(0, 8)) || false : false,
        };
      }),
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, notifications } = body;

    // Update user profile
    if (name !== undefined || phone !== undefined) {
      await prisma.contractorUser.update({
        where: { id: user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // Update notification settings (stored on contractor)
    if (notifications) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: user.contractorId },
      });

      const currentSettings = (contractor?.settings as Record<string, unknown>) || {};
      
      await prisma.contractor.update({
        where: { id: user.contractorId },
        data: {
          settings: {
            ...currentSettings,
            ...notifications,
          },
        },
      });
    }

    // Log the update
    await logContractorAudit({
      userId: user.id,
      action: 'settings_updated',
      metadata: { updated: Object.keys(body).join(',') },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
