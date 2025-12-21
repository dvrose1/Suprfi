// ABOUTME: Jobber connection status and management endpoint
// ABOUTME: Returns connection status and allows disconnection

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isJobberConfigured } from '@/lib/services/crm/jobber'

/**
 * GET /api/v1/auth/jobber/status
 * 
 * Returns the current Jobber connection status.
 */
export async function GET(request: NextRequest) {
  // Check if Jobber OAuth is configured
  const isConfigured = isJobberConfigured()

  // Get optional contractor filter
  const searchParams = request.nextUrl.searchParams
  const contractorId = searchParams.get('contractor_id')

  // Find active connections
  const whereClause: { crmType: string; isActive: boolean; contractorId?: string | null } = {
    crmType: 'jobber',
    isActive: true,
  }
  
  if (contractorId) {
    whereClause.contractorId = contractorId
  }

  const connections = await prisma.crmConnection.findMany({
    where: whereClause,
    select: {
      id: true,
      accountId: true,
      accountName: true,
      scope: true,
      lastUsedAt: true,
      lastError: true,
      expiresAt: true,
      createdAt: true,
      contractorId: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    connected: connections.length > 0,
    connections: connections.map(conn => ({
      id: conn.id,
      accountId: conn.accountId,
      accountName: conn.accountName,
      scope: conn.scope,
      lastUsedAt: conn.lastUsedAt?.toISOString() || null,
      lastError: conn.lastError,
      tokenExpiresAt: conn.expiresAt?.toISOString() || null,
      connectedAt: conn.createdAt.toISOString(),
      contractorId: conn.contractorId,
    })),
  })
}

/**
 * DELETE /api/v1/auth/jobber/status
 * 
 * Disconnects a Jobber account.
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const connectionId = searchParams.get('connection_id')

  if (!connectionId) {
    return NextResponse.json({
      success: false,
      error: 'Missing connection_id parameter',
    }, { status: 400 })
  }

  // Find the connection
  const connection = await prisma.crmConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    return NextResponse.json({
      success: false,
      error: 'Connection not found',
    }, { status: 404 })
  }

  if (connection.crmType !== 'jobber') {
    return NextResponse.json({
      success: false,
      error: 'Connection is not a Jobber connection',
    }, { status: 400 })
  }

  // Soft delete by marking as inactive (preserves audit trail)
  await prisma.crmConnection.update({
    where: { id: connectionId },
    data: {
      isActive: false,
      accessToken: '[REVOKED]',
      refreshToken: null,
    },
  })

  // Log the disconnection
  await prisma.crmSyncLog.create({
    data: {
      crmType: 'jobber',
      direction: 'outbound',
      entityType: 'oauth_disconnect',
      entityId: connectionId,
      crmEntityId: connection.accountId,
      status: 'success',
    },
  })

  console.log('🔌 Disconnected Jobber account:', connection.accountName)

  return NextResponse.json({
    success: true,
    message: `Disconnected Jobber account: ${connection.accountName}`,
  })
}
