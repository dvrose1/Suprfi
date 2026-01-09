import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Allow skip in sandbox, development, or mock mode
    const canSkip = process.env.NEXT_PUBLIC_PERSONA_ENV === 'sandbox' || 
                    process.env.NODE_ENV === 'development' ||
                    process.env.USE_MOCK_PERSONA === 'true'
    
    if (!canSkip) {
      return NextResponse.json(
        { error: 'Skip verification is only available in sandbox/demo mode' },
        { status: 403 }
      )
    }

    const { token } = await params

    // Verify token
    const payload = verifyApplicationToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: payload.applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application with skipped verification
    const personaData = {
      inquiryId: 'skipped-sandbox-' + Date.now(),
      status: 'approved',
      skipped: true,
      skippedAt: new Date().toISOString(),
    }

    await prisma.application.update({
      where: { id: application.id },
      data: {
        personaData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Verification skipped for sandbox mode',
      verified: true,
    })
  } catch (error) {
    console.error('Error skipping Persona verification:', error)
    return NextResponse.json(
      { error: 'Failed to skip verification' },
      { status: 500 }
    )
  }
}
