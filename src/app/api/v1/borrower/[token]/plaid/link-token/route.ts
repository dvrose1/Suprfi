import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { createLinkToken } from '@/lib/services/plaid'
import { prisma } from '@/lib/prisma'

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

    // Create Plaid link token
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
    return NextResponse.json(
      { error: 'Failed to create link token', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
