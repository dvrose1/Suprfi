import { NextRequest, NextResponse } from 'next/server'
import { verifyApplicationToken } from '@/lib/utils/token'
import { getAssetReport } from '@/lib/services/plaid'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/borrower/:token/plaid/asset-report
 * Check status and fetch Asset Report when ready
 */
export async function GET(
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

    // Get application with Plaid data
    const application = await prisma.application.findUnique({
      where: { id: payload.applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const plaidData = application.plaidData as any
    if (!plaidData?.assetReport?.assetReportToken) {
      return NextResponse.json(
        { error: 'No asset report requested', status: 'not_requested' },
        { status: 400 }
      )
    }

    // Check if already fetched
    if (plaidData.assetReport.status === 'ready' && plaidData.assetReport.report) {
      return NextResponse.json({
        status: 'ready',
        report: plaidData.assetReport.report,
      })
    }

    // Try to fetch the asset report
    console.log('🔄 Fetching Asset Report...')
    const assetReport = await getAssetReport(plaidData.assetReport.assetReportToken)

    // Check if still pending
    if ('status' in assetReport && assetReport.status === 'pending') {
      return NextResponse.json({
        status: 'pending',
        message: assetReport.message,
      })
    }

    // Report is ready - update application
    console.log('✅ Asset Report ready')
    const updatedPlaidData = {
      ...plaidData,
      assetReport: {
        ...plaidData.assetReport,
        status: 'ready',
        report: assetReport,
        fetchedAt: new Date().toISOString(),
      },
    }

    await prisma.application.update({
      where: { id: application.id },
      data: { plaidData: updatedPlaidData },
    })

    return NextResponse.json({
      status: 'ready',
      report: assetReport,
    })
  } catch (error) {
    console.error('Error fetching asset report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset report' },
      { status: 500 }
    )
  }
}
