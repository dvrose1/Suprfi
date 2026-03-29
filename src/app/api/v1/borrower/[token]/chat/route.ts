import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  dateOfBirth: string
  ssn: string
  plaidAccessToken?: string
  plaidAccountId?: string
  bankName?: string
  accountMask?: string
  personaInquiryId?: string
  kycStatus?: string
  creditCheckConsent: boolean
  termsAccepted: boolean
  eSignConsent: boolean
}

const BORROWER_AGENT_PROMPT = `You are SuprFi's Borrower Agent, helping a homeowner complete their financing application through a friendly conversation. Your goal is to collect required information naturally while being helpful and reassuring.

## Your Personality
- Friendly, calm, and professional
- Explain why information is needed when asked
- Never pushy or aggressive
- Answer questions clearly and concisely

## Required Information to Collect
You need to help the borrower provide:
1. **Personal Info**: Full name, date of birth, SSN (for credit check)
2. **Address**: Street, city, state, ZIP (verify or collect)
3. **Bank Account**: Guide them to connect via Plaid (secure bank link)
4. **Identity Verification**: Guide them to complete Persona KYC
5. **Consent**: Credit check consent, terms acceptance, e-sign consent

## Conversation Flow
1. Start by confirming their address (if we have it from CRM)
2. If address is wrong, collect the correct one field by field
3. Ask for date of birth naturally
4. Ask for SSN last 4 (explain it's for identity verification only)
5. Then ask for full SSN (explain it's needed for the credit check, encrypted and secure)
6. Trigger bank account linking
7. Trigger identity verification
8. Get final consent and submit

## How to Respond

### When collecting data:
- Ask ONE question at a time
- Confirm what you heard before moving on
- If they give partial info, acknowledge it and ask for the rest

### When they ask questions:
- Answer clearly and reassuringly
- Common questions:
  - "Why do you need my SSN?" -> For the credit check required to approve your financing. It's encrypted and never shared.
  - "Is this secure?" -> Yes, 256-bit encryption, bank-level security, we never store your full SSN.
  - "What are the rates?" -> Rates depend on your credit profile. Once approved, you'll see your exact payment options.
  - "Can I talk to someone?" -> You can reach our team at support@suprfi.com or call 1-800-SUPRFI.

### Special Actions
When it's time to trigger an action, include a JSON marker at the END of your message:

- To trigger Plaid bank linking: [ACTION:plaid_link]
- To trigger KYC verification: [ACTION:kyc_verify]  
- To submit the application: [ACTION:submit]
- To update form data: [FIELD_UPDATE:{"fieldName": "value"}]

Example: "Great! Now let's securely connect your bank account. This lets us verify your income and set up payments. [ACTION:plaid_link]"

## Current Application State
The user has already received a financing link for their home service job. They're on the application page and chose to use the chat assistant instead of the form.

## Rules
- Never make up information about rates, approval odds, or terms
- Never ask for sensitive info (SSN) until you've built some rapport
- If they seem frustrated, offer to switch to the form view
- Keep messages concise (2-4 sentences usually)
- Don't use emojis
- Don't use em-dashes

## Context Provided
You'll receive:
- messages: The conversation history
- formData: Current state of collected information
- applicationId: The application being completed`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Verify token
    const decoded = verifyApplicationToken(token)
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { messages, formData, applicationId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch application for context
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        job: true,
      },
    })

    if (!application) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chat not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build context for the agent
    const contextInfo = `
## Current Form State
${JSON.stringify(formData, null, 2)}

## Application Details
- Job Type: ${application.job.serviceType || 'Home Service'}
- Amount: $${Number(application.job.estimateAmount).toLocaleString()}
- Customer Name: ${application.customer.firstName} ${application.customer.lastName}
- Customer Email: ${application.customer.email}
- Customer Phone: ${application.customer.phone}
- Address on File: ${application.customer.addressLine1 || 'Not provided'}, ${application.customer.city || ''}, ${application.customer.state || ''} ${application.customer.postalCode || ''}

## Fields Still Needed
${!formData.dateOfBirth ? '- Date of Birth' : ''}
${!formData.ssn ? '- Social Security Number' : ''}
${!formData.addressLine1 ? '- Full Address' : ''}
${!formData.plaidAccessToken ? '- Bank Account Connection' : ''}
${!formData.personaInquiryId ? '- Identity Verification' : ''}
${!formData.creditCheckConsent ? '- Credit Check Consent' : ''}
${!formData.termsAccepted ? '- Terms Acceptance' : ''}
`

    const anthropic = new Anthropic({ apiKey })

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: BORROWER_AGENT_PROMPT + '\n\n' + contextInfo,
      messages: messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta
              if ('text' in delta) {
                fullResponse += delta.text
                
                // Don't stream the action markers to the UI
                const cleanText = delta.text
                  .replace(/\[ACTION:\w+\]/g, '')
                  .replace(/\[FIELD_UPDATE:\{[^}]+\}\]/g, '')
                
                if (cleanText) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: cleanText })}\n\n`)
                  )
                }
              }
            }
          }

          // Parse and send actions after streaming complete
          const actionMatch = fullResponse.match(/\[ACTION:(\w+)\]/)
          if (actionMatch) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ action: actionMatch[1] })}\n\n`)
            )
          }

          // Parse and send field updates
          const fieldMatch = fullResponse.match(/\[FIELD_UPDATE:(\{[^}]+\})\]/)
          if (fieldMatch) {
            try {
              const fieldUpdate = JSON.parse(fieldMatch[1])
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ fieldUpdate })}\n\n`)
              )
            } catch {
              // Skip malformed JSON
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Borrower chat error:', error)
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
