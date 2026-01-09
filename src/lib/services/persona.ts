// ABOUTME: Persona API client for identity verification (KYC)
// ABOUTME: Creates and manages identity verification inquiries

const PERSONA_API_URL = 'https://withpersona.com/api/v1'
const PERSONA_API_KEY = process.env.PERSONA_API_KEY!

async function personaRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${PERSONA_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PERSONA_API_KEY}`,
      'Content-Type': 'application/json',
      'Persona-Version': '2023-01-05',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('Persona API error:', error)
    throw new Error(`Persona API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Create an inquiry for identity verification
 */
export async function createInquiry(params: {
  referenceId: string
  templateId: string
  fields: {
    nameFirst: string
    nameLast: string
    birthdate?: string
    addressStreet1?: string
    addressCity?: string
    addressSubdivision?: string
    addressPostalCode?: string
    emailAddress?: string
    phoneNumber?: string
  }
}) {
  const response = await personaRequest('/inquiries', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          'inquiry-template-id': params.templateId,
          'reference-id': params.referenceId,
          fields: {
            'name-first': params.fields.nameFirst,
            'name-last': params.fields.nameLast,
            'birthdate': params.fields.birthdate,
            'address-street-1': params.fields.addressStreet1,
            'address-city': params.fields.addressCity,
            'address-subdivision': params.fields.addressSubdivision,
            'address-postal-code': params.fields.addressPostalCode,
            'email-address': params.fields.emailAddress,
            'phone-number': params.fields.phoneNumber,
          },
        },
      },
    }),
  })

  return {
    inquiryId: response.data.id,
    sessionToken: response.meta?.['session-token'] || null,
    status: response.data.attributes.status,
    createdAt: response.data.attributes['created-at'],
  }
}

/**
 * Get inquiry details and verification status
 */
export async function getInquiry(inquiryId: string) {
  const response = await personaRequest(`/inquiries/${inquiryId}`)

  return {
    inquiryId: response.data.id,
    status: response.data.attributes.status,
    fields: response.data.attributes.fields,
    verifications: response.data.relationships?.verifications?.data || [],
    createdAt: response.data.attributes['created-at'],
    completedAt: response.data.attributes['completed-at'],
    failedAt: response.data.attributes['failed-at'],
  }
}

/**
 * Get verification details
 */
export async function getVerification(verificationId: string) {
  const response = await personaRequest(`/verifications/${verificationId}`)

  return {
    verificationId: response.data.id,
    type: response.data.type,
    status: response.data.attributes.status,
    checks: response.data.attributes.checks || [],
    createdAt: response.data.attributes['created-at'],
    submittedAt: response.data.attributes['submitted-at'],
    completedAt: response.data.attributes['completed-at'],
  }
}

/**
 * Create inquiry session for re-attempting verification
 */
export async function createInquirySession(inquiryId: string) {
  const response = await personaRequest(`/inquiries/${inquiryId}/resume`, {
    method: 'POST',
  })

  return {
    sessionToken: response.meta?.['session-token'],
    inquiryId: inquiryId,
  }
}

/**
 * Parse webhook event from Persona
 */
export function parseWebhookEvent(payload: any) {
  return {
    type: payload.data.type,
    inquiryId: payload.data.id,
    status: payload.data.attributes.status,
    fields: payload.data.attributes.fields,
    timestamp: payload.data.attributes['created-at'],
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function isInquiryApproved(status: string): boolean {
  return status === 'completed' || status === 'approved'
}

export function isInquiryFailed(status: string): boolean {
  return status === 'failed' || status === 'declined'
}

export function isInquiryPending(status: string): boolean {
  return status === 'created' || status === 'pending'
}
