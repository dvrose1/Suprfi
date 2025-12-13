// ABOUTME: SuprClient current user API endpoint
// ABOUTME: Returns current authenticated contractor user

import { NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';

export async function GET() {
  try {
    const user = await getContractorSessionFromCookies();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
