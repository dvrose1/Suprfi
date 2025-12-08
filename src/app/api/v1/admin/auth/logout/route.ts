// ABOUTME: Admin logout API endpoint
// ABOUTME: Destroys session and clears cookie

import { NextRequest, NextResponse } from 'next/server';
import { destroySession, logAuditEvent, SESSION_COOKIE_CONFIG, validateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value;

    if (sessionToken) {
      // Get user info for audit log before destroying session
      const user = await validateSession(sessionToken);
      
      if (user) {
        const ipAddress = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown';
        const userAgent = request.headers.get('user-agent') || undefined;

        await logAuditEvent({
          userId: user.id,
          action: 'logout',
          ipAddress,
          userAgent,
        });
      }

      await destroySession(sessionToken);
    }

    const response = NextResponse.json({ success: true });

    // Clear the session cookie
    response.cookies.set(
      SESSION_COOKIE_CONFIG.name,
      '',
      {
        ...SESSION_COOKIE_CONFIG.options,
        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({ success: true });
    response.cookies.set(
      SESSION_COOKIE_CONFIG.name,
      '',
      {
        ...SESSION_COOKIE_CONFIG.options,
        maxAge: 0,
      }
    );
    return response;
  }
}
