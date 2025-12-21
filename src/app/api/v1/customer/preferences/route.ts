// ABOUTME: Customer preferences API for financing opt-in/out
// ABOUTME: Allows customers to manage their SMS notification preferences

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const UpdatePreferencesSchema = z.object({
  customer_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  financing_opt_in: z.boolean(),
})

/**
 * POST /api/v1/customer/preferences
 * 
 * Update customer financing preferences (opt-in/opt-out)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = UpdatePreferencesSchema.parse(body)

    // Find customer by ID, phone, or email
    let customer = null

    if (data.customer_id) {
      customer = await prisma.customer.findUnique({
        where: { id: data.customer_id },
      })
    } else if (data.phone) {
      customer = await prisma.customer.findFirst({
        where: { phone: data.phone },
      })
    } else if (data.email) {
      customer = await prisma.customer.findFirst({
        where: { email: data.email },
      })
    }

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found',
      }, { status: 404 })
    }

    // Update preferences
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        financingOptIn: data.financing_opt_in,
        financingOptInAt: new Date(),
      },
    })

    // Log the preference change
    await prisma.auditLog.create({
      data: {
        entityType: 'customer',
        entityId: customer.id,
        actor: 'customer',
        action: data.financing_opt_in ? 'financing_opt_in' : 'financing_opt_out',
        payload: {
          previous_value: customer.financingOptIn,
          new_value: data.financing_opt_in,
        },
      },
    })

    console.log(`Customer ${customer.id} ${data.financing_opt_in ? 'opted in' : 'opted out'} of financing offers`)

    return NextResponse.json({
      success: true,
      message: data.financing_opt_in 
        ? 'You will now receive financing offers' 
        : 'You have been unsubscribed from financing offers',
    })
  } catch (error) {
    console.error('Error updating customer preferences:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update preferences',
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/customer/preferences
 * 
 * Get customer preferences (requires customer_id, phone, or email)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const customerId = searchParams.get('customer_id')
  const phone = searchParams.get('phone')
  const email = searchParams.get('email')

  if (!customerId && !phone && !email) {
    return NextResponse.json({
      success: false,
      error: 'Must provide customer_id, phone, or email',
    }, { status: 400 })
  }

  let customer = null

  if (customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        financingOptIn: true,
        financingOptInAt: true,
      },
    })
  } else if (phone) {
    customer = await prisma.customer.findFirst({
      where: { phone },
      select: {
        id: true,
        financingOptIn: true,
        financingOptInAt: true,
      },
    })
  } else if (email) {
    customer = await prisma.customer.findFirst({
      where: { email },
      select: {
        id: true,
        financingOptIn: true,
        financingOptInAt: true,
      },
    })
  }

  if (!customer) {
    return NextResponse.json({
      success: false,
      error: 'Customer not found',
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    preferences: {
      financing_opt_in: customer.financingOptIn,
      updated_at: customer.financingOptInAt?.toISOString() || null,
    },
  })
}
