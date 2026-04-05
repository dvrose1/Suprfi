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

const BORROWER_AGENT_PROMPT = `You are SuprFi's Borrower Agent, helping a homeowner complete their financing application through a friendly conversation.

## Your Personality
- Friendly, calm, professional
- Concise (2-3 sentences max per response)
- No emojis, no em-dashes

## Conversation Flow (FOLLOW THIS EXACTLY)
1. Confirm address
2. Collect date of birth
3. Collect SSN (once only) - IMPORTANT: Explain why we need it and that it's secure
4. Trigger bank connection [ACTION:plaid_link]
5. Trigger identity verification [ACTION:kyc_verify]
6. Get consent (include links to terms)
7. Submit [ACTION:submit]

## SSN Request (USE THIS APPROACH)
When asking for SSN, explain:
- WHY: Required by law to run a credit check for financing
- SECURITY: Your SSN is encrypted and never stored in plain text. We use bank-level 256-bit encryption.
- Example: "To check your eligibility for financing, I'll need your Social Security Number. This is required by federal law for credit checks. Your SSN is protected with bank-level 256-bit encryption and is never stored in plain text. What's your SSN?"

## PROGRESS FEEDBACK (BE NATURAL)
Let users know how things are going in a warm, conversational way. Don't use robotic step counts.

Examples of good progress feedback:
- After address confirmed: "Perfect, thanks for confirming."
- After DOB: "Got it. Just a couple more things..."
- After SSN: "Thanks, that's safely recorded. We're about halfway done."
- After bank connected: "Great, your bank is linked. Almost there!"
- After KYC: "Identity verified. One last step and we're done."
- Before submit: "That's everything I need. Let me get your offers ready..."

Keep it warm and reassuring. Avoid clinical language like "Step 2 of 5 complete."

## CRITICAL RULES
- CHECK THE FORM DATA BEFORE ASKING FOR ANYTHING
- If SSN shows "Collected (hidden)" in the form data, DO NOT ask for it again
- If Bank Account shows "Connected", DO NOT ask to connect again
- If Identity Verification shows "Started" or "Completed", DO NOT ask again
- NEVER re-ask for information that's already collected

## Actions (MUST USE THESE)
- [ACTION:plaid_link] - Trigger bank connection (WAIT for user to click, don't auto-proceed)
- [ACTION:kyc_verify] - Trigger identity verification (WAIT for user to click, don't auto-proceed)
- [ACTION:submit] - Submit the application
- [FIELD_UPDATE:{"field": "value"}] - Update form data

## FIELD UPDATES (CRITICAL - USE THESE TO SAVE DATA)
When user provides information, you MUST emit a FIELD_UPDATE to save it:
- Address: [FIELD_UPDATE:{"addressLine1": "123 Main St", "city": "Austin", "state": "TX", "postalCode": "78701"}]
- Date of Birth: [FIELD_UPDATE:{"dateOfBirth": "01/15/1985"}]
- SSN: [FIELD_UPDATE:{"ssn": "123-45-6789"}]

IMPORTANT: Always emit the FIELD_UPDATE immediately after acknowledging the user's input.
Example flow for SSN:
User: "123-45-6789"
You: "Got it, thanks. [FIELD_UPDATE:{"ssn": "123-45-6789"}] Now let's connect your bank account..."

## WAIT FOR USER ACTION
After emitting [ACTION:plaid_link] or [ACTION:kyc_verify], STOP and wait. 
Do NOT immediately proceed to the next step - the user needs to complete the action first.
The system will send a new message when the action is complete.

## Consent Step
When asking for consent, ALWAYS include these links:
- Terms of Service: https://suprfi.com/terms
- Privacy Policy: https://suprfi.com/privacy
- E-Sign Agreement: https://suprfi.com/esign

Example consent message:
"Almost done! To complete your application, please confirm you agree to our Terms of Service (https://suprfi.com/terms), Privacy Policy (https://suprfi.com/privacy), and E-Sign Agreement (https://suprfi.com/esign). Do you agree to these terms?"

When user agrees to terms, include: [FIELD_UPDATE:{"creditCheckConsent": true, "termsAccepted": true, "eSignConsent": true}]
Then immediately trigger: [ACTION:submit]`

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

    // Build context for the agent - be very explicit about what's collected
    const hasAddress = Boolean(formData.addressLine1)
    const hasDOB = Boolean(formData.dateOfBirth)
    const hasSSN = Boolean(formData.ssn)
    const hasBank = Boolean(formData.plaidAccessToken)
    const hasKYC = Boolean(formData.personaInquiryId)
    const hasConsent = Boolean(formData.creditCheckConsent && formData.termsAccepted)

    // Calculate progress
    const steps = [hasAddress, hasDOB, hasSSN, hasBank, hasKYC, hasConsent]
    const completedSteps = steps.filter(Boolean).length
    const totalSteps = steps.length
    const progressPercent = Math.round((completedSteps / totalSteps) * 100)

    const contextInfo = `
## PROGRESS: ${completedSteps}/${totalSteps} steps complete (${progressPercent}%)

## CURRENT STATUS (READ THIS CAREFULLY)
- Address: ${hasAddress ? 'COLLECTED - ' + formData.addressLine1 : 'NEEDED'}
- Date of Birth: ${hasDOB ? 'COLLECTED - ' + formData.dateOfBirth : 'NEEDED'}
- SSN: ${hasSSN ? 'COLLECTED - DO NOT ASK AGAIN' : 'NEEDED'}
- Bank Account: ${hasBank ? 'CONNECTED - ' + formData.bankName + ' (...' + formData.accountMask + ') - DO NOT ASK AGAIN' : 'NEEDED - use [ACTION:plaid_link]'}
- Identity Verification: ${hasKYC ? 'COMPLETED - DO NOT ASK AGAIN' : 'NEEDED - use [ACTION:kyc_verify]'}
- Consent: ${hasConsent ? 'GIVEN - DO NOT ASK AGAIN' : 'NEEDED - ask with links then [ACTION:submit]'}

## NEXT STEP
${!hasAddress ? 'Confirm or collect address' : 
  !hasDOB ? 'Ask for date of birth' : 
  !hasSSN ? 'Ask for SSN' : 
  !hasBank ? 'Trigger bank connection with [ACTION:plaid_link]' : 
  !hasKYC ? 'Trigger identity verification with [ACTION:kyc_verify]' : 
  !hasConsent ? 'Ask for consent with links, then [ACTION:submit]' : 
  'All complete - use [ACTION:submit]'}

## Application Info
- Job: ${application.job.serviceType || 'Home Service'} - $${Number(application.job.estimateAmount).toLocaleString()}
- Customer: ${formData.firstName} ${formData.lastName}
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
    let streamBuffer = ''

    // Helper to clean markers from text
    const cleanMarkers = (text: string): string => {
      return text
        .replace(/\[ACTION:\w+\]/g, '')
        .replace(/\[FIELD_UPDATE:\{[^}]*\}\]/g, '')
        .replace(/\[FIELD_UPDATE:[^\]]*\]/g, '')
        // Also catch partial markers at end (will be completed in next chunk)
        .replace(/\[FIELD_UPDATE:[^\]]*$/g, '')
        .replace(/\[ACTION:[^\]]*$/g, '')
        .replace(/\[[A-Z_]*$/g, '') // Catch any incomplete marker starting with [
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta
              if ('text' in delta) {
                fullResponse += delta.text
                streamBuffer += delta.text
                
                // Check if buffer might contain incomplete marker
                const hasIncompleteMarker = /\[[A-Z_]*$/.test(streamBuffer) || 
                                            /\[FIELD_UPDATE:[^\]]*$/.test(streamBuffer) ||
                                            /\[ACTION:[^\]]*$/.test(streamBuffer)
                
                if (!hasIncompleteMarker) {
                  // Safe to send - clean and flush buffer
                  const cleanText = cleanMarkers(streamBuffer)
                  streamBuffer = ''
                  
                  if (cleanText) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: cleanText })}\n\n`)
                    )
                  }
                }
                // If incomplete marker, keep buffering
              }
            }
          }

          // Flush any remaining buffer (cleaned)
          if (streamBuffer) {
            const cleanText = cleanMarkers(streamBuffer)
            if (cleanText) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: cleanText })}\n\n`)
              )
            }
          }

          // Parse and send actions after streaming complete
          const actionMatch = fullResponse.match(/\[ACTION:(\w+)\]/)
          if (actionMatch) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ action: actionMatch[1] })}\n\n`)
            )
          }

          // Parse and send field updates - handle JSON with quotes and special chars
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
