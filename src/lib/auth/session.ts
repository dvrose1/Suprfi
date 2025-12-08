// ABOUTME: Session management for admin auth
// ABOUTME: Handles session creation, validation, and cleanup

import { prisma } from '@/lib/prisma';
import { generateSecureToken } from './password';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'suprfi_admin_session';
const SESSION_DURATION_HOURS = 24;
const REMEMBER_ME_DURATION_DAYS = 30;
const INACTIVITY_TIMEOUT_MINUTES = 30;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'god' | 'admin' | 'ops' | 'viewer';
}

export async function createSession(
  userId: string,
  rememberMe: boolean = false,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateSecureToken();
  
  const expiresAt = rememberMe
    ? new Date(Date.now() + REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      userId,
      token,
      expiresAt,
      rememberMe,
      ipAddress,
      userAgent,
    },
  });

  // Update user's last login
  await prisma.adminUser.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return token;
}

export async function validateSession(token: string): Promise<SessionUser | null> {
  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  // Check inactivity timeout (only for non-remember-me sessions)
  if (!session.rememberMe) {
    const inactivityLimit = new Date(Date.now() - INACTIVITY_TIMEOUT_MINUTES * 60 * 1000);
    if (session.lastActiveAt < inactivityLimit) {
      await prisma.adminSession.delete({ where: { id: session.id } });
      return null;
    }
  }

  // Check if user is still active
  if (!session.user.isActive) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  // Update last active time
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as 'god' | 'admin' | 'ops' | 'viewer',
  };
}

export async function destroySession(token: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { token } });
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { userId } });
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    return null;
  }

  return validateSession(sessionToken);
}

export function setSessionCookie(token: string, rememberMe: boolean = false): void {
  // This is called from API routes - cookies are set in the response
  const maxAge = rememberMe
    ? REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60
    : SESSION_DURATION_HOURS * 60 * 60;
  
  // Return the cookie config for the API route to use
  return;
}

export const SESSION_COOKIE_CONFIG = {
  name: SESSION_COOKIE_NAME,
  getMaxAge: (rememberMe: boolean) => 
    rememberMe
      ? REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60
      : SESSION_DURATION_HOURS * 60 * 60,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
};
