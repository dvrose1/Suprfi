import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { createInquiry } from '@/lib/services/persona'
import { prisma } from '@/lib/prisma'

// Check if we should use mock mode
const USE_MOCK_PERSONA = !process.env.PERSONA_API_KEY || 
                          process.env.PERSONA_API_KEY === '' ||
                          process.env.USE_MOCK_PERSONA === 'true'

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

    // Check if already verified
    if (application.personaData && (application.personaData as any).inquiryId) {
      const existingData = application.personaData as any
      return NextResponse.json({
        inquiryId: existingData.inquiryId,
        sessionToken: existingData.sessionToken,
        status: existingData.status || 'pending',
        alreadyCreated: true,
        mockMode: existingData.mockMode || false,
      })
    }

    // Use mock mode for demos when Persona isn't configured
    if (USE_MOCK_PERSONA) {
      console.log('Using mock Persona mode - returning mock inquiry')
      return NextResponse.json({
        inquiryId: 'mock-inquiry-for-demo',
        sessionToken: 'mock-session-token',
        status: 'pending',
        mockMode: true,
      })
    }

    // Get template ID from env
    const templateId = process.env.PERSONA_TEMPLATE_ID
    if (!templateId) {
      return NextResponse.json(
        { error: 'Persona template not configured' },
        { status: 500 }
      )
    }

    // Create inquiry with customer info
    const inquiryData = await createInquiry({
      referenceId: application.id,
      templateId,
      fields: {
        nameFirst: application.customer.firstName,
        nameLast: application.customer.lastName,
        addressStreet1: application.customer.addressLine1 || undefined,
        addressCity: application.customer.city || undefined,
        addressSubdivision: application.customer.state || undefined,
        addressPostalCode: application.customer.postalCode || undefined,
        emailAddress: application.customer.email,
        phoneNumber: application.customer.phone || undefined,
      },
    })

    // Store inquiry data in application
    const personaData = {
      inquiryId: inquiryData.inquiryId,
      sessionToken: inquiryData.sessionToken,
      status: inquiryData.status,
      createdAt: inquiryData.createdAt,
      templateId,
    }

    await prisma.application.update({
      where: { id: application.id },
      data: {
        personaData,
      },
    })

    return NextResponse.json({
      inquiryId: inquiryData.inquiryId,
      sessionToken: inquiryData.sessionToken,
      status: inquiryData.status,
    })
  } catch (error) {
    console.error('Error creating Persona inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to create identity verification' },
      { status: 500 }
    )
  }
}
