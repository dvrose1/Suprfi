import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { getInquiry, isInquiryApproved, isInquiryFailed } from '@/lib/services/persona'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { inquiryId, status: clientStatus } = body

    if (!inquiryId) {
      return NextResponse.json(
        { error: 'Inquiry ID is required' },
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

    // Verify the inquiry belongs to this application
    const existingData = application.personaData as any
    if (!existingData || existingData.inquiryId !== inquiryId) {
      return NextResponse.json(
        { error: 'Inquiry does not match application' },
        { status: 403 }
      )
    }

    // Fetch latest inquiry status from Persona
    const inquiryData = await getInquiry(inquiryId)

    // Determine verification status
    let verificationStatus: 'pending' | 'verified' | 'failed' = 'pending'
    
    if (isInquiryApproved(inquiryData.status)) {
      verificationStatus = 'verified'
    } else if (isInquiryFailed(inquiryData.status)) {
      verificationStatus = 'failed'
    }

    // Update application with verification results
    const updatedPersonaData = {
      ...existingData,
      status: inquiryData.status,
      verificationStatus,
      fields: inquiryData.fields,
      verifications: inquiryData.verifications,
      completedAt: inquiryData.completedAt || new Date().toISOString(),
      failedAt: inquiryData.failedAt,
    }

    await prisma.application.update({
      where: { id: application.id },
      data: {
        personaData: updatedPersonaData,
      },
    })

    return NextResponse.json({
      success: true,
      inquiryId,
      status: inquiryData.status,
      verificationStatus,
      verified: verificationStatus === 'verified',
    })
  } catch (error) {
    console.error('Error completing Persona verification:', error)
    return NextResponse.json(
      { error: 'Failed to complete verification' },
      { status: 500 }
    )
  }
}
