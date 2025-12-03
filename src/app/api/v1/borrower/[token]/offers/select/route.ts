import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

const SelectOfferSchema = z.object({
  offerId: z.string().min(1),
})

/**
 * POST /api/v1/borrower/:token/offers/select
 * Select a financing offer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Verify token
    const decoded = verifyApplicationToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request
    const body = await request.json()
    const { offerId } = SelectOfferSchema.parse(body)

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
      include: {
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

    if (!application.decision) {
      return NextResponse.json(
        { success: false, error: 'No decision found for this application' },
        { status: 400 }
      )
    }

    // Verify offer belongs to this decision
    const offer = application.decision.offers.find(o => o.id === offerId)
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if already selected an offer
    const alreadySelected = application.decision.offers.find(o => o.selected)
    if (alreadySelected) {
      return NextResponse.json(
        { success: false, error: 'An offer has already been selected', selectedOfferId: alreadySelected.id },
        { status: 400 }
      )
    }

    // Mark offer as selected
    await prisma.offer.update({
      where: { id: offerId },
      data: { selected: true },
    })

    // Update application status
    await prisma.application.update({
      where: { id: application.id },
      data: { status: 'offer_selected' },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'offer',
        entityId: offerId,
        actor: application.customerId,
        action: 'selected',
        payload: {
          applicationId: application.id,
          termMonths: offer.termMonths,
          apr: Number(offer.apr),
          monthlyPayment: Number(offer.monthlyPayment),
        },
      },
    })

    console.log('✅ Offer selected:', offerId, 'for application:', application.id)

    return NextResponse.json({
      success: true,
      message: 'Offer selected successfully',
      offer: {
        id: offer.id,
        termMonths: offer.termMonths,
        apr: Number(offer.apr),
        monthlyPayment: Number(offer.monthlyPayment),
        totalAmount: Number(offer.totalAmount),
      },
    })
  } catch (error) {
    console.error('Error selecting offer:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to select offer' },
      { status: 500 }
    )
  }
}
