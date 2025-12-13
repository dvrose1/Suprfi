// ABOUTME: Session management for SuprClient contractor authentication
// ABOUTME: Handles session creation, validation, and cleanup

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { ContractorRole } from './contractor-roles';

const SESSION_COOKIE_NAME = 'contractor_session';
const SESSION_DURATION_HOURS = 24;
const REMEMBER_ME_DURATION_DAYS = 30;

export interface ContractorSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: ContractorRole;
  contractorId: string;
  contractorName: string | null;
}

export async function createContractorSession(
  userId: string,
  rememberMe: boolean = false,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  const expiresAt = rememberMe
    ? new Date(Date.now() + REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  
  await prisma.contractorSession.create({
    data: {
      userId,
      token,
      expiresAt,
      rememberMe,
      ipAddress,
      userAgent,
    },
  });
  
  // Update last login time
  await prisma.contractorUser.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
  
  return token;
}

export async function validateContractorSession(token: string): Promise<ContractorSessionUser | null> {
  if (!token) return null;
  
  const session = await prisma.contractorSession.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          contractor: true,
        },
      },
    },
  });
  
  if (!session) return null;
  
  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await prisma.contractorSession.delete({ where: { id: session.id } });
    return null;
  }
  
  // Check if user is active
  if (!session.user.isActive) {
    return null;
  }
  
  // Check if contractor is active
  if (session.user.contractor.status === 'suspended') {
    return null;
  }
  
  // Update last active time
  await prisma.contractorSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as ContractorRole,
    contractorId: session.user.contractorId,
    contractorName: session.user.contractor.businessName,
  };
}

export async function invalidateContractorSession(token: string): Promise<void> {
  await prisma.contractorSession.deleteMany({
    where: { token },
  });
}

export async function invalidateAllContractorSessions(userId: string): Promise<void> {
  await prisma.contractorSession.deleteMany({
    where: { userId },
  });
}

export async function getContractorSessionFromCookies(): Promise<ContractorSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return validateContractorSession(token);
}

export async function setContractorSessionCookie(token: string, rememberMe: boolean = false): Promise<void> {
  const cookieStore = await cookies();
  
  const maxAge = rememberMe
    ? REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60
    : SESSION_DURATION_HOURS * 60 * 60;
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function clearContractorSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getActiveContractorSessions(userId: string) {
  return prisma.contractorSession.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
    select: {
      id: true,
      lastActiveAt: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });
}

export async function cleanupExpiredContractorSessions(): Promise<number> {
  const result = await prisma.contractorSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}
