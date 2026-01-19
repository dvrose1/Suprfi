// ABOUTME: Admin endpoint to add collection notes to a loan
// ABOUTME: Tracks contact attempts, payment plans, and other collection activities

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
    const { note, noteType = 'general' } = body

    if (!note || !note.trim()) {
      return NextResponse.json(
        { error: 'Note is required' },
        { status: 400 }
      )
    }

    // Verify loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    // Create note
    const collectionNote = await prisma.collectionNote.create({
      data: {
        loanId,
        note: note.trim(),
        noteType,
        createdBy: user.id,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'loan',
        entityId: loanId,
        actor: user.id,
        action: 'collection_note_added',
        payload: {
          noteId: collectionNote.id,
          noteType,
          addedBy: user.email,
        },
      },
    })

    return NextResponse.json({
      success: true,
      note: collectionNote,
    })
  } catch (error: any) {
    console.error('Add collection note error:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}

export async function GET(
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
    const notes = await prisma.collectionNote.findMany({
      where: { loanId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Fetch collection notes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
