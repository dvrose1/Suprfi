import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { 
  exchangePublicToken, 
  getAccountInfo, 
  getAuthInfo,
  getInstitution,
  createAssetReport 
} from '@/lib/services/plaid'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { publicToken, metadata } = body

    if (!publicToken) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      )
    }

    // Verify token
    const payload = verifyApplicationToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Exchange public token for access token
    console.log('🔄 Exchanging public token for access token...')
    const { accessToken, itemId } = await exchangePublicToken(publicToken)
    console.log('✅ Access token obtained')

    // Get account information with balances
    console.log('🔄 Fetching account balances...')
    const accountInfo = await getAccountInfo(accessToken)
    console.log('✅ Account info retrieved:', accountInfo.accounts.length, 'accounts')

    // Get auth information (account + routing numbers for ACH)
    console.log('🔄 Fetching auth info (account/routing numbers)...')
    let authInfo = null
    try {
      authInfo = await getAuthInfo(accessToken)
      console.log('✅ Auth info retrieved')
    } catch (error) {
      console.warn('⚠️ Could not fetch auth info (may not be enabled):', error)
    }

    // Get institution information
    let institutionName = metadata?.institution?.name || 'Bank'
    if (metadata?.institution?.institution_id) {
      const institutionData = await getInstitution(metadata.institution.institution_id)
      if (institutionData) {
        institutionName = institutionData.name
      }
    }

    // Select the primary account (first one or the one user selected)
    const primaryAccount = metadata?.account_id 
      ? accountInfo.accounts.find(acc => acc.accountId === metadata.account_id)
      : accountInfo.accounts[0]

    if (!primaryAccount) {
      return NextResponse.json(
        { error: 'No account found' },
        { status: 400 }
      )
    }

    // Get ACH numbers for the primary account
    let achNumbers = null
    if (authInfo?.numbers) {
      const achData = authInfo.numbers.ach?.find(
        (n: any) => n.account_id === primaryAccount.accountId
      )
      if (achData) {
        achNumbers = {
          accountNumber: achData.account,
          routingNumber: achData.routing,
          wireRoutingNumber: achData.wire_routing,
        }
        console.log('✅ ACH numbers found for primary account')
      }
    }

    // Start Asset Report generation (async - will be ready via webhook or polling)
    console.log('🔄 Starting Asset Report generation...')
    let assetReportData = null
    try {
      const assetReport = await createAssetReport([accessToken], 90)
      assetReportData = {
        assetReportToken: assetReport.assetReportToken,
        assetReportId: assetReport.assetReportId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      }
      console.log('✅ Asset Report requested:', assetReport.assetReportId)
    } catch (error) {
      console.warn('⚠️ Could not create asset report (may not be enabled in sandbox):', error)
    }

    // Store comprehensive Plaid data in application
    const plaidData = {
      // Core data
      accessToken, // In production, encrypt this!
      itemId,
      linkedAt: new Date().toISOString(),
      
      // Account info
      accountId: primaryAccount.accountId,
      institutionId: metadata?.institution?.institution_id,
      institutionName,
      accountName: primaryAccount.name,
      accountMask: primaryAccount.mask,
      accountType: primaryAccount.type,
      accountSubtype: primaryAccount.subtype,
      
      // Balance data
      balance: primaryAccount.balance,
      
      // ACH numbers (for disbursement/payments)
      achNumbers,
      
      // All accounts (in case user has multiple)
      allAccounts: accountInfo.accounts,
      
      // Asset Report (for underwriting)
      assetReport: assetReportData,
      
      // Original metadata
      metadata,
    }

    // Update application with Plaid data
    await prisma.application.update({
      where: { id: payload.applicationId },
      data: {
        plaidData,
      },
    })

    console.log('✅ Plaid data saved to application')

    return NextResponse.json({
      success: true,
      bankName: institutionName,
      accountMask: primaryAccount.mask,
      accountName: primaryAccount.name,
      balance: primaryAccount.balance,
      hasAchNumbers: !!achNumbers,
      assetReportStatus: assetReportData?.status || 'not_requested',
    })
  } catch (error) {
    console.error('Error exchanging Plaid token:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}
