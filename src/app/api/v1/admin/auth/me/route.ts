// ABOUTME: Get current admin user endpoint
// ABOUTME: Returns the currently authenticated user's info

import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await validateSession(sessionToken);

    if (!user) {
      const response = NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
      // Clear invalid cookie
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
