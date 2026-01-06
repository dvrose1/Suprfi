import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { createLinkToken } from '@/lib/services/plaid'
import { prisma } from '@/lib/prisma'

// Check if we should use mock mode (no valid Plaid credentials)
const USE_MOCK_PLAID = !process.env.PLAID_CLIENT_ID || 
                        !process.env.PLAID_SECRET || 
                        process.env.PLAID_CLIENT_ID === '' ||
                        process.env.USE_MOCK_PLAID === 'true'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Verify token
    const payload = verifyApplicationToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get application and customer info
    const application = await prisma.application.findUnique({
      where: { id: payload.applicationId },
      include: { customer: true },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Use mock mode for demos when Plaid isn't configured
    if (USE_MOCK_PLAID) {
      console.log('Using mock Plaid mode - returning mock link token')
      return NextResponse.json({
        linkToken: 'mock-link-token-for-demo',
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        mockMode: true,
      })
    }

    // Create real Plaid link token
    const linkTokenData = await createLinkToken(
      application.customerId,
      `${application.customer.firstName} ${application.customer.lastName}`
    )

    return NextResponse.json({
      linkToken: linkTokenData.linkToken,
      expiration: linkTokenData.expiration,
    })
  } catch (error: any) {
    console.error('Error creating Plaid link token:', error)
    console.error('Plaid error details:', error?.response?.data || error?.message || error)
    
    // Fallback to mock mode on error for demos
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock Plaid mode due to error')
      return NextResponse.json({
        linkToken: 'mock-link-token-for-demo',
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        mockMode: true,
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to create link token', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
