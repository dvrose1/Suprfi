import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

/**
 * GET /api/v1/borrower/:token/agreement?offer=offerId
 * Get agreement data for the selected offer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offer')

    // Verify token
    const decoded = verifyApplicationToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'Offer ID required' },
        { status: 400 }
      )
    }

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
      include: {
        customer: true,
        job: true,
        decision: {
          include: { offers: true },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check for client-generated offer in creditData first
    const creditData = application.creditData as Record<string, unknown> | null
    const selectedOffer = creditData?.selectedOffer as Record<string, unknown> | null
    
    if (selectedOffer && selectedOffer.id === offerId) {
      // Return the client-generated offer (BNPL format)
      return NextResponse.json({
        success: true,
        applicationId: application.id,
        offer: {
          id: selectedOffer.id,
          type: selectedOffer.type,
          name: selectedOffer.name,
          termWeeks: selectedOffer.termWeeks,
          termMonths: selectedOffer.termMonths,
          paymentFrequency: selectedOffer.paymentFrequency,
          apr: selectedOffer.apr,
          originationFee: selectedOffer.originationFee,
          downPaymentPercent: selectedOffer.downPaymentPercent,
          downPaymentAmount: selectedOffer.downPaymentAmount,
          installmentAmount: selectedOffer.installmentAmount,
          numberOfPayments: selectedOffer.numberOfPayments,
          totalAmount: selectedOffer.totalAmount,
          loanAmount: selectedOffer.loanAmount,
          // Legacy fields for compatibility
          monthlyPayment: selectedOffer.installmentAmount,
          downPayment: selectedOffer.downPaymentAmount,
        },
        customer: {
          firstName: application.customer.firstName,
          lastName: application.customer.lastName,
          email: application.customer.email,
          addressLine1: application.customer.addressLine1 || '',
          city: application.customer.city || '',
          state: application.customer.state || '',
          postalCode: application.customer.postalCode || '',
        },
        job: {
          estimateAmount: Number(application.job.estimateAmount),
          serviceType: application.job.serviceType,
        },
      })
    }

    // Legacy: Check database offers
    if (!application.decision) {
      return NextResponse.json(
        { success: false, error: 'No decision found' },
        { status: 400 }
      )
    }

    // Find the specific offer
    const offer = application.decision.offers.find(o => o.id === offerId)
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      offer: {
        id: offer.id,
        termMonths: offer.termMonths,
        apr: Number(offer.apr),
        monthlyPayment: Number(offer.monthlyPayment),
        downPayment: Number(offer.downPayment),
        originationFee: Number(offer.originationFee),
        totalAmount: Number(offer.totalAmount),
      },
      customer: {
        firstName: application.customer.firstName,
        lastName: application.customer.lastName,
        email: application.customer.email,
        addressLine1: application.customer.addressLine1 || '',
        city: application.customer.city || '',
        state: application.customer.state || '',
        postalCode: application.customer.postalCode || '',
      },
      job: {
        estimateAmount: Number(application.job.estimateAmount),
        serviceType: application.job.serviceType,
      },
    })
  } catch (error) {
    console.error('Error fetching agreement data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agreement' },
      { status: 500 }
    )
  }
}
