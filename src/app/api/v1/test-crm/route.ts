import { NextResponse } from 'next/server'

/**
 * GET /api/v1/test-crm
 * 
 * Test endpoint to simulate CRM triggering financing
 * This will call our offer-financing endpoint
 */
export async function GET() {
  const testPayload = {
    crm_customer_id: 'FR12345',
    customer: {
      first_name: 'Doug',
      last_name: 'Test',
      email: 'doug@suprfi.com',
      phone: '+15162432868', // Your phone number
      address: {
        line1: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
    },
    job: {
      crm_job_id: 'JOB-9876',
      estimate_amount: 7500.00,
      service_type: 'HVAC Installation',
      technician_id: 'TECH-001',
    },
    metadata: {
      office_id: 'ATX-001',
      campaign: 'test_campaign',
    },
  }

  try {
    // Call our own API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/v1/crm/offer-financing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.json()

    return NextResponse.json({
      test_status: 'complete',
      api_response: result,
      test_payload: testPayload,
      instructions: result.success 
        ? 'Check the phone number for SMS! Also check database in Prisma Studio.'
        : 'Check logs for errors. Make sure Twilio is configured.',
    })
  } catch (error) {
    return NextResponse.json({
      test_status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
