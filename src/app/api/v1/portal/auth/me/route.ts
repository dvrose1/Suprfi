// ABOUTME: Borrower portal current user API
// ABOUTME: Returns authenticated borrower info

import { NextResponse } from 'next/server';
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session';

export async function GET() {
  try {
    const user = await getBorrowerSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        customerId: user.customerId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    console.error('Borrower me error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
