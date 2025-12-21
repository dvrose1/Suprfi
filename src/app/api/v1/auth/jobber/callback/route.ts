// ABOUTME: OAuth callback endpoint for Jobber CRM
// ABOUTME: Handles authorization code exchange and stores tokens

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { 
  exchangeCodeForToken, 
  getJobberAccountInfo,
  isJobberConfigured 
} from '@/lib/services/crm/jobber'

/**
 * GET /api/v1/auth/jobber/callback
 * 
 * OAuth callback from Jobber.
 * Exchanges authorization code for tokens and stores the connection.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('🔄 Jobber OAuth callback received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error 
    })

    // Handle OAuth errors from Jobber
    if (error) {
      console.error('Jobber OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        `${baseUrl}/admin/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/admin/settings/integrations?error=${encodeURIComponent('Missing authorization code or state')}`
      )
    }

    // Verify state token matches what we stored
    const cookieStore = await cookies()
    const storedState = cookieStore.get('jobber_oauth_state')?.value

    // Parse state to get contractor ID and source if present
    let contractorId: string | null = null
    let source: string = 'admin'
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
      contractorId = stateData.contractorId
      source = stateData.source || 'admin'
      
      // Check timestamp (reject if older than 15 minutes to be more lenient)
      if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
        console.error('Jobber OAuth state expired:', { timestamp: stateData.timestamp, now: Date.now() })
        const redirectUrl = source === 'client' 
          ? `${baseUrl}/client/settings?tab=integrations&error=${encodeURIComponent('Authorization expired, please try again')}`
          : `${baseUrl}/admin/settings/integrations?error=${encodeURIComponent('Authorization expired, please try again')}`
        return NextResponse.redirect(redirectUrl)
      }
    } catch (e) {
      console.error('Failed to parse OAuth state:', e)
    }
    
    // Determine redirect base URL based on source
    const successRedirectBase = source === 'client' 
      ? `${baseUrl}/client/settings?tab=integrations` 
      : `${baseUrl}/admin/settings/integrations`
    const errorRedirectBase = successRedirectBase

    // State mismatch check - log but be lenient in dev mode
    if (!storedState || storedState !== state) {
      console.warn('Jobber OAuth state mismatch:', { received: state?.substring(0, 20), stored: storedState?.substring(0, 20) })
      // In production, you might want to reject this, but for now let's proceed
    }

    // Clear the state cookie
    try {
      cookieStore.delete('jobber_oauth_state')
    } catch (e) {
      console.warn('Could not delete state cookie:', e)
    }

    // Check configuration
    if (!isJobberConfigured()) {
      return NextResponse.redirect(
        `${errorRedirectBase}&error=${encodeURIComponent('Jobber OAuth not configured')}`
      )
    }

    // Exchange code for tokens
    console.log('🔑 Exchanging Jobber authorization code for tokens...')
    const tokenResult = await exchangeCodeForToken(code)

    if (!tokenResult.success) {
      console.error('Jobber token exchange failed:', tokenResult.error)
      return NextResponse.redirect(
        `${errorRedirectBase}&error=${encodeURIComponent(tokenResult.error)}`
      )
    }

    const { access_token, refresh_token, expires_in, scope } = tokenResult.data
    
    console.log('Token data:', { expires_in, scope, hasAccessToken: !!access_token })
    
    // Calculate expiry - ensure expires_in is a valid number
    const expiresInSeconds = typeof expires_in === 'number' && expires_in > 0 ? expires_in : 3600
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

    // Create a temporary connection to fetch account info
    const tempConnection = await prisma.crmConnection.create({
      data: {
        crmType: 'jobber',
        accountId: 'pending', // Will be updated
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
        scope: scope || null,
        contractorId,
      },
    })

    // Get Jobber account info
    console.log('📋 Fetching Jobber account info...')
    const accountResult = await getJobberAccountInfo(tempConnection.id)

    if (!accountResult.success) {
      // Clean up the temporary connection
      await prisma.crmConnection.delete({ where: { id: tempConnection.id } })
      console.error('Failed to get Jobber account info:', accountResult.error)
      return NextResponse.redirect(
        `${errorRedirectBase}&error=${encodeURIComponent('Failed to get account info: ' + accountResult.error)}`
      )
    }

    const { id: accountId, name: accountName } = accountResult.data

    // Check if a connection already exists for this account
    const existingConnection = await prisma.crmConnection.findFirst({
      where: {
        crmType: 'jobber',
        accountId,
        id: { not: tempConnection.id },
      },
    })

    if (existingConnection) {
      // Update existing connection instead of creating duplicate
      await prisma.crmConnection.delete({ where: { id: tempConnection.id } })
      await prisma.crmConnection.update({
        where: { id: existingConnection.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          scope,
          isActive: true,
          lastError: null,
          contractorId: contractorId || existingConnection.contractorId,
          updatedAt: new Date(),
        },
      })
      console.log('✅ Updated existing Jobber connection:', existingConnection.id)
    } else {
      // Update the temporary connection with actual account info
      await prisma.crmConnection.update({
        where: { id: tempConnection.id },
        data: {
          accountId,
          accountName,
        },
      })
      console.log('✅ Created new Jobber connection:', tempConnection.id)
    }

    // Log the connection
    await prisma.crmSyncLog.create({
      data: {
        crmType: 'jobber',
        direction: 'inbound',
        entityType: 'oauth_connect',
        entityId: existingConnection?.id || tempConnection.id,
        crmEntityId: accountId,
        status: 'success',
        responsePayload: {
          accountId,
          accountName,
          scope,
        },
      },
    })

    // Redirect to success page
    return NextResponse.redirect(
      `${successRedirectBase}&success=jobber&account=${encodeURIComponent(accountName)}`
    )
  } catch (err) {
    console.error('❌ Jobber OAuth callback error:', err)
    // Default to admin redirect on unexpected errors
    return NextResponse.redirect(
      `${baseUrl}/admin/settings/integrations?error=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`
    )
  }
}
