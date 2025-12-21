// ABOUTME: OAuth initiation endpoint for Jobber CRM
// ABOUTME: Redirects user to Jobber's authorization page

import { NextRequest, NextResponse } from 'next/server'
import { getJobberAuthUrl, isJobberConfigured } from '@/lib/services/crm/jobber'
import { cookies } from 'next/headers'

/**
 * GET /api/v1/auth/jobber/connect
 * 
 * Initiates OAuth flow with Jobber.
 * Generates a state token for CSRF protection and redirects to Jobber.
 */
export async function GET(request: NextRequest) {
  // Check if Jobber OAuth is configured
  if (!isJobberConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Jobber OAuth not configured',
      message: 'Please set JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET, and JOBBER_REDIRECT_URI environment variables',
    }, { status: 503 })
  }

  // Get optional contractor ID from query params (for linking connection to a contractor)
  const searchParams = request.nextUrl.searchParams
  const contractorId = searchParams.get('contractor_id')

  // Generate state token for CSRF protection
  const stateData = {
    nonce: crypto.randomUUID(),
    contractorId,
    timestamp: Date.now(),
  }
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url')

  // Store state in cookie for verification on callback
  const cookieStore = await cookies()
  cookieStore.set('jobber_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  // Generate authorization URL and redirect
  const authUrl = getJobberAuthUrl(state)
  
  console.log('🔗 Initiating Jobber OAuth flow:', {
    contractorId,
    redirectTo: authUrl.split('?')[0],
  })

  return NextResponse.redirect(authUrl)
}
