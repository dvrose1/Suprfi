// ABOUTME: Auth helpers for API routes
// ABOUTME: Provides authentication validation for admin API endpoints

import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_CONFIG, SessionUser, AdminRole, hasRoleLevel } from '@/lib/auth';

export interface AuthResult {
  user: SessionUser | null;
  error?: NextResponse;
}

export async function requireAuth(
  request: NextRequest,
  requiredRole?: AdminRole
): Promise<AuthResult> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value;

  if (!sessionToken) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await validateSession(sessionToken);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }),
    };
  }

  if (requiredRole && !hasRoleLevel(user.role, requiredRole)) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return { user };
}
