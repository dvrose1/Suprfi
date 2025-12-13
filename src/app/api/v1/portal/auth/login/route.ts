// ABOUTME: Borrower portal login API
// ABOUTME: Verify email + loan ID and create session

import { NextRequest, NextResponse } from 'next/server';
import { findCustomerByEmailAndLoan, createBorrowerSession, setBorrowerSessionCookie } from '@/lib/auth/borrower-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, loanId } = body;

    if (!email || !loanId) {
      return NextResponse.json(
        { error: 'Email and Loan ID are required' },
        { status: 400 }
      );
    }

    // Find customer by email and loan ID
    const result = await findCustomerByEmailAndLoan(email.toLowerCase().trim(), loanId.trim());

    if (!result) {
      return NextResponse.json(
        { error: 'No loan found with this email and Loan ID combination' },
        { status: 401 }
      );
    }

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const token = await createBorrowerSession(result.customerId, ipAddress, userAgent);

    // Set cookie
    await setBorrowerSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Borrower login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
