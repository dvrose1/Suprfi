import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

// Routing number validation (9 digits with ABA checksum)
function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false
  
  const digits = routing.split('').map(Number)
  const checksum = 
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    1 * (digits[2] + digits[5] + digits[8])
  
  return checksum % 10 === 0
}

const ManualBankSchema = z.object({
  bankName: z.string().min(2),
  accountHolderName: z.string().min(2),
  routingNumber: z.string()
    .length(9)
    .regex(/^\d+$/)
    .refine(validateRoutingNumber, 'Invalid routing number'),
  accountNumber: z.string()
    .min(4)
    .max(17)
    .regex(/^\d+$/),
  accountType: z.enum(['checking', 'savings']),
})

/**
 * POST /api/v1/borrower/:token/bank/manual
 * Submit manual bank account details (alternative to Plaid)
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = ManualBankSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid bank details', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if Plaid is already connected (skip check in development for easier testing)
    const existingPlaidData = application.plaidData as Record<string, unknown> | null
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && existingPlaidData?.accessToken && !existingPlaidData?.manualEntry) {
      return NextResponse.json(
        { success: false, error: 'Bank account already connected via Plaid' },
        { status: 400 }
      )
    }

    // Store manual bank data
    // Note: In production, account number should be encrypted
    const manualBankData = {
      manualEntry: true,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      accountType: data.accountType,
      accountMask: data.accountNumber.slice(-4),
      achNumbers: {
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber, // TODO: Encrypt in production
      },
      // No balance/transaction data available for manual entry
      balance: null,
      allAccounts: null,
      assetReport: null,
      institutionName: data.bankName,
      verificationStatus: 'pending', // Could require micro-deposits
      submittedAt: new Date().toISOString(),
    }

    // Update application with manual bank data
    await prisma.application.update({
      where: { id: application.id },
      data: {
        plaidData: manualBankData,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'application',
        entityId: application.id,
        actor: application.customerId,
        action: 'manual_bank_entry',
        payload: {
          bankName: data.bankName,
          accountType: data.accountType,
          accountMask: data.accountNumber.slice(-4),
          routingNumberLast4: data.routingNumber.slice(-4),
        },
      },
    })

    console.log('Manual bank entry saved for application:', application.id)

    return NextResponse.json({
      success: true,
      message: 'Bank details saved successfully',
      bankName: data.bankName,
      accountMask: data.accountNumber.slice(-4),
    })
  } catch (error) {
    console.error('Error saving manual bank details:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to save bank details' },
      { status: 500 }
    )
  }
}
