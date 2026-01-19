// ABOUTME: Admin endpoint to send a loan to external collections agency
// ABOUTME: Marks the loan as sent to collections and logs the action

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate session
  const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await validateSession(sessionToken)
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const { id: loanId } = await params

  try {
    const body = await request.json()
    const { agency } = body

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency name is required' },
        { status: 400 }
      )
    }

    // Verify loan exists and is eligible
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.sentToCollections) {
      return NextResponse.json(
        { error: 'Loan is already in collections' },
        { status: 400 }
      )
    }

    // Update loan
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        sentToCollections: new Date(),
        collectionAgency: agency,
        updatedAt: new Date(),
      },
    })

    // Add a note
    await prisma.collectionNote.create({
      data: {
        loanId,
        note: `Loan sent to external collections agency: ${agency}`,
        noteType: 'escalation',
        createdBy: user.id,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'loan',
        entityId: loanId,
        actor: user.id,
        action: 'sent_to_collections',
        payload: {
          agency,
          sentBy: user.email,
          daysOverdue: loan.daysOverdue,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Loan sent to ${agency}`,
    })
  } catch (error: any) {
    console.error('Send to collections error:', error)
    return NextResponse.json(
      { error: 'Failed to send to collections' },
      { status: 500 }
    )
  }
}
