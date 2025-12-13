// ABOUTME: Borrower portal logout API
// ABOUTME: Invalidate session and clear cookie

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateBorrowerSession, clearBorrowerSessionCookie } from '@/lib/auth/borrower-session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('borrower_session')?.value;

    if (token) {
      await invalidateBorrowerSession(token);
    }

    await clearBorrowerSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Borrower logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
