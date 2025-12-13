// ABOUTME: Borrower portal session management
// ABOUTME: Handles magic link auth and session tokens for borrowers

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'borrower_session';
const SESSION_DURATION_HOURS = 24;
const MAGIC_LINK_DURATION_MINUTES = 15;

export interface BorrowerUser {
  id: string;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a magic link for borrower login
export async function createMagicLink(customerId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_DURATION_MINUTES * 60 * 1000);

  await prisma.borrowerMagicLink.create({
    data: {
      customerId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify magic link and create session
export async function verifyMagicLinkAndCreateSession(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  const magicLink = await prisma.borrowerMagicLink.findUnique({
    where: { token },
    include: { customer: true },
  });

  if (!magicLink) {
    return { success: false, error: 'Invalid or expired link' };
  }

  if (magicLink.usedAt) {
    return { success: false, error: 'This link has already been used' };
  }

  if (magicLink.expiresAt < new Date()) {
    return { success: false, error: 'This link has expired' };
  }

  // Mark magic link as used
  await prisma.borrowerMagicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  // Create session
  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await prisma.borrowerSession.create({
    data: {
      customerId: magicLink.customerId,
      token: sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return { success: true, sessionToken };
}

// Create session directly (for loan ID + email lookup)
export async function createBorrowerSession(
  customerId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await prisma.borrowerSession.create({
    data: {
      customerId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return token;
}

// Validate session token
export async function validateBorrowerSession(token: string): Promise<BorrowerUser | null> {
  const session = await prisma.borrowerSession.findUnique({
    where: { token },
    include: { customer: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.borrowerSession.delete({ where: { id: session.id } });
    return null;
  }

  // Update last active
  await prisma.borrowerSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    id: session.id,
    customerId: session.customerId,
    email: session.customer.email,
    firstName: session.customer.firstName,
    lastName: session.customer.lastName,
  };
}

// Get session from cookies
export async function getBorrowerSessionFromCookies(): Promise<BorrowerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return validateBorrowerSession(token);
}

// Set session cookie
export async function setBorrowerSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });
}

// Clear session cookie
export async function clearBorrowerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Invalidate session
export async function invalidateBorrowerSession(token: string): Promise<void> {
  await prisma.borrowerSession.deleteMany({
    where: { token },
  });
}

// Find customer by email and loan ID (for login)
export async function findCustomerByEmailAndLoan(
  email: string,
  loanId: string
): Promise<{ customerId: string } | null> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      application: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!loan || !loan.application) {
    return null;
  }

  // Verify email matches (case-insensitive)
  if (loan.application.customer.email.toLowerCase() !== email.toLowerCase()) {
    return null;
  }

  return { customerId: loan.application.customerId };
}
