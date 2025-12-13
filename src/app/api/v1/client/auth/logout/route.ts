// ABOUTME: SuprClient logout API endpoint
// ABOUTME: Invalidates contractor session and clears cookie

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateContractorSession, clearContractorSessionCookie, getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('contractor_session')?.value;

    if (token) {
      // Get user before invalidating session for audit log
      const user = await getContractorSessionFromCookies();
      
      // Invalidate session
      await invalidateContractorSession(token);

      // Log logout
      if (user) {
        await logContractorAudit({
          userId: user.id,
          action: 'logout',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        });
      }
    }

    // Clear cookie
    await clearContractorSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the cookie even on error
    await clearContractorSessionCookie();
    return NextResponse.json({ success: true });
  }
}
