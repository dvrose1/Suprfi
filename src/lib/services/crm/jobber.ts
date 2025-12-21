// ABOUTME: Jobber CRM OAuth and GraphQL client
// ABOUTME: Handles OAuth flow, token management, and API calls to Jobber

import { prisma } from '@/lib/prisma'

// Jobber OAuth Configuration
const JOBBER_AUTH_URL = 'https://api.getjobber.com/api/oauth/authorize'
const JOBBER_TOKEN_URL = 'https://api.getjobber.com/api/oauth/token'
const JOBBER_API_URL = 'https://api.getjobber.com/api/graphql'

const JOBBER_CLIENT_ID = process.env.JOBBER_CLIENT_ID
const JOBBER_CLIENT_SECRET = process.env.JOBBER_CLIENT_SECRET
const JOBBER_REDIRECT_URI = process.env.JOBBER_REDIRECT_URI

// Default scopes needed for financing integration
const DEFAULT_SCOPES = [
  'read_clients',
  'read_quotes',
  'read_jobs',
  'write_custom_fields',
]

export interface JobberTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  scope: string
  created_at: number
}

export interface JobberClient {
  id: string
  firstName: string
  lastName: string
  email: string
  phones: Array<{ number: string }>
  billingAddress?: {
    street: string
    city: string
    province: string
    postalCode: string
  }
}

export interface JobberQuote {
  id: string
  quoteNumber: string
  total: number
  status: string
  client: { id: string }
  lineItems: Array<{
    name: string
    unitPrice: number
    quantity: number
  }>
}

/**
 * Generate the OAuth authorization URL for Jobber
 */
export function getJobberAuthUrl(state: string): string {
  if (!JOBBER_CLIENT_ID || !JOBBER_REDIRECT_URI) {
    throw new Error('Jobber OAuth not configured: missing JOBBER_CLIENT_ID or JOBBER_REDIRECT_URI')
  }

  const params = new URLSearchParams({
    client_id: JOBBER_CLIENT_ID,
    redirect_uri: JOBBER_REDIRECT_URI,
    response_type: 'code',
    scope: DEFAULT_SCOPES.join(' '),
    state,
  })

  return `${JOBBER_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{ success: true; data: JobberTokenResponse } | { success: false; error: string }> {
  if (!JOBBER_CLIENT_ID || !JOBBER_CLIENT_SECRET || !JOBBER_REDIRECT_URI) {
    return { success: false, error: 'Jobber OAuth not configured' }
  }

  try {
    const response = await fetch(JOBBER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: JOBBER_CLIENT_ID,
        client_secret: JOBBER_CLIENT_SECRET,
        redirect_uri: JOBBER_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Jobber token exchange failed:', errorText)
      return { success: false, error: `Token exchange failed: ${response.status}` }
    }

    const data = await response.json()
    console.log('Jobber token response:', JSON.stringify(data, null, 2))
    
    // Jobber may return expires_in or we derive from created_at
    const tokenResponse: JobberTokenResponse = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600, // Default to 1 hour if not provided
      scope: data.scope || '',
      created_at: data.created_at || Math.floor(Date.now() / 1000),
    }
    
    return { success: true, data: tokenResponse }
  } catch (error) {
    console.error('Jobber token exchange error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: true; data: JobberTokenResponse } | { success: false; error: string }> {
  if (!JOBBER_CLIENT_ID || !JOBBER_CLIENT_SECRET) {
    return { success: false, error: 'Jobber OAuth not configured' }
  }

  try {
    const response = await fetch(JOBBER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: JOBBER_CLIENT_ID,
        client_secret: JOBBER_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Jobber token refresh failed:', errorText)
      return { success: false, error: `Token refresh failed: ${response.status}` }
    }

    const data: JobberTokenResponse = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Jobber token refresh error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
  connectionId: string
): Promise<{ success: true; accessToken: string } | { success: false; error: string }> {
  const connection = await prisma.crmConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    return { success: false, error: 'Connection not found' }
  }

  if (!connection.isActive) {
    return { success: false, error: 'Connection is inactive' }
  }

  // Check if token is expired (with 5 minute buffer)
  const now = new Date()
  const bufferMs = 5 * 60 * 1000
  const isExpired = connection.expiresAt && connection.expiresAt.getTime() - bufferMs < now.getTime()

  if (!isExpired) {
    return { success: true, accessToken: connection.accessToken }
  }

  // Token is expired, refresh it
  if (!connection.refreshToken) {
    await prisma.crmConnection.update({
      where: { id: connectionId },
      data: { isActive: false, lastError: 'No refresh token available' },
    })
    return { success: false, error: 'No refresh token available' }
  }

  const refreshResult = await refreshAccessToken(connection.refreshToken)

  if (!refreshResult.success) {
    await prisma.crmConnection.update({
      where: { id: connectionId },
      data: { lastError: refreshResult.error },
    })
    return { success: false, error: refreshResult.error }
  }

  // Update the connection with new tokens
  const expiresAt = new Date(Date.now() + refreshResult.data.expires_in * 1000)
  
  await prisma.crmConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: refreshResult.data.access_token,
      refreshToken: refreshResult.data.refresh_token || connection.refreshToken,
      expiresAt,
      lastError: null,
      updatedAt: new Date(),
    },
  })

  return { success: true, accessToken: refreshResult.data.access_token }
}

/**
 * Execute a GraphQL query against Jobber API
 */
export async function executeGraphQL<T>(
  connectionId: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const tokenResult = await getValidAccessToken(connectionId)

  if (!tokenResult.success) {
    return { success: false, error: tokenResult.error }
  }

  try {
    console.log('Executing Jobber GraphQL query to:', JOBBER_API_URL)
    
    const response = await fetch(JOBBER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenResult.accessToken}`,
        'X-JOBBER-GRAPHQL-VERSION': '2023-11-15',
      },
      body: JSON.stringify({ query, variables }),
    })

    console.log('Jobber GraphQL response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Jobber GraphQL error response:', errorText)
      return { success: false, error: `GraphQL request failed: ${response.status}` }
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      console.error('Jobber GraphQL errors:', result.errors)
      return { success: false, error: result.errors[0].message }
    }

    // Update last used timestamp
    await prisma.crmConnection.update({
      where: { id: connectionId },
      data: { lastUsedAt: new Date() },
    })

    return { success: true, data: result.data }
  } catch (error) {
    console.error('Jobber GraphQL error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Fetch a client (customer) from Jobber
 */
export async function fetchJobberClient(
  connectionId: string,
  clientId: string
): Promise<{ success: true; data: JobberClient } | { success: false; error: string }> {
  const query = `
    query GetClient($id: EncodedId!) {
      client(id: $id) {
        id
        firstName
        lastName
        emails {
          address
          primary
        }
        phones {
          number
          primary
        }
        billingAddress {
          street
          city
          province
          postalCode
        }
      }
    }
  `

  const result = await executeGraphQL<{ client: any }>(connectionId, query, { id: clientId })

  if (!result.success) {
    return result
  }

  const client = result.data.client
  const primaryEmail = client.emails?.find((e: any) => e.primary)?.address || client.emails?.[0]?.address
  const primaryPhone = client.phones?.find((p: any) => p.primary)?.number || client.phones?.[0]?.number

  return {
    success: true,
    data: {
      id: client.id,
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: primaryEmail || '',
      phones: client.phones || [],
      billingAddress: client.billingAddress,
    },
  }
}

/**
 * Fetch a quote from Jobber
 */
export async function fetchJobberQuote(
  connectionId: string,
  quoteId: string
): Promise<{ success: true; data: JobberQuote } | { success: false; error: string }> {
  const query = `
    query GetQuote($id: EncodedId!) {
      quote(id: $id) {
        id
        quoteNumber
        total
        quoteStatus
        client {
          id
        }
        lineItems {
          edges {
            node {
              name
              unitPrice
              quantity
            }
          }
        }
      }
    }
  `

  const result = await executeGraphQL<{ quote: any }>(connectionId, query, { id: quoteId })

  if (!result.success) {
    return result
  }

  const quote = result.data.quote
  const lineItems = quote.lineItems?.edges?.map((e: any) => e.node) || []

  return {
    success: true,
    data: {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      total: parseFloat(quote.total) || 0,
      status: quote.quoteStatus,
      client: quote.client,
      lineItems,
    },
  }
}

/**
 * Get the current authenticated account info
 */
export async function getJobberAccountInfo(
  connectionId: string
): Promise<{ success: true; data: { id: string; name: string } } | { success: false; error: string }> {
  const query = `
    query GetAccount {
      account {
        id
        name
      }
    }
  `

  const result = await executeGraphQL<{ account: { id: string; name: string } }>(connectionId, query)

  if (!result.success) {
    return result
  }

  return { success: true, data: result.data.account }
}

/**
 * Check if Jobber OAuth is configured
 */
export function isJobberConfigured(): boolean {
  return !!(JOBBER_CLIENT_ID && JOBBER_CLIENT_SECRET && JOBBER_REDIRECT_URI)
}
