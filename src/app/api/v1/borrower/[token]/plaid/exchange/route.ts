import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { exchangePublicToken, getAccountInfo, getInstitution } from '@/lib/services/plaid'
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
    const { accessToken, itemId } = await exchangePublicToken(publicToken)

    // Get account information
    const accountInfo = await getAccountInfo(accessToken)

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

    // Store Plaid data in application
    const plaidData = {
      accessToken, // In production, encrypt this!
      itemId,
      accountId: primaryAccount.accountId,
      institutionId: metadata?.institution?.institution_id,
      institutionName,
      accountName: primaryAccount.name,
      accountMask: primaryAccount.mask,
      accountType: primaryAccount.type,
      accountSubtype: primaryAccount.subtype,
      balance: primaryAccount.balance,
      linkedAt: new Date().toISOString(),
      metadata,
    }

    // Update application with Plaid data
    await prisma.application.update({
      where: { id: payload.applicationId },
      data: {
        plaidData,
      },
    })

    return NextResponse.json({
      success: true,
      bankName: institutionName,
      accountMask: primaryAccount.mask,
      accountName: primaryAccount.name,
      balance: primaryAccount.balance,
    })
  } catch (error) {
    console.error('Error exchanging Plaid token:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}
