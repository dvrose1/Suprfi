import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

interface RouteParams {
  params: Promise<{
    token: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const decisionId = searchParams.get('decision')
    
    // Verify token
    const decoded = verifyApplicationToken(token)
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 })
    }

    // Fetch decision and offers
    const decision = await prisma.decision.findFirst({
      where: {
        applicationId: decoded.applicationId,
        ...(decisionId ? { id: decisionId } : {}),
      },
      include: {
        offers: {
          orderBy: { termMonths: 'asc' },
        },
        application: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            job: {
              select: {
                estimateAmount: true,
                serviceType: true,
              }
            },
          },
        },
      },
      orderBy: { decidedAt: 'desc' },
    })

    if (!decision) {
      return NextResponse.json({
        success: false,
        error: 'Decision not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      decision: {
        id: decision.id,
        score: decision.score,
        decisionStatus: decision.decisionStatus,
        application: {
          customer: decision.application.customer,
          job: {
            estimateAmount: Number(decision.application.job.estimateAmount),
            serviceType: decision.application.job.serviceType,
          }
        },
        offers: decision.offers.map(offer => ({
          id: offer.id,
          termMonths: offer.termMonths,
          apr: Number(offer.apr),
          monthlyPayment: Number(offer.monthlyPayment),
          downPayment: Number(offer.downPayment),
          originationFee: Number(offer.originationFee),
          totalAmount: Number(offer.totalAmount),
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching decision:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch decision',
    }, { status: 500 })
  }
}
