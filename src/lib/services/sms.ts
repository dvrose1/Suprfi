import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneNumber = process.env.TWILIO_PHONE_NUMBER

let twilioClient: twilio.Twilio | null = null

/**
 * Initialize Twilio client (lazy loading)
 */
function getTwilioClient(): twilio.Twilio {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local')
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken)
  }

  return twilioClient
}

export interface SendSMSOptions {
  to: string
  message: string
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS({ to, message }: SendSMSOptions): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  // TODO: Re-enable SMS after phone number verification in Twilio
  // For now, just log the message for testing
  console.log('📱 [SMS BYPASSED FOR TESTING] Would send to:', to)
  console.log('📄 Message:', message)
  
  return {
    success: true,
    messageId: 'MOCK-' + Date.now(),
  }

  /* Uncomment this when phone is verified:
  try {
    if (!phoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER not configured')
    }

    const client = getTwilioClient()

    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: to,
    })

    console.log('SMS sent successfully:', {
      to,
      messageId: result.sid,
      status: result.status,
    })

    return {
      success: true,
      messageId: result.sid,
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
  */
}

/**
 * Send application link via SMS to borrower
 */
export async function sendApplicationLink(
  phone: string,
  token: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  const link = `${appUrl}/apply/${token}`

  const message = `Hi ${customerName}! Apply for financing with SuprFi: ${link}\n\nThis link expires in 24 hours.`

  return await sendSMS({ to: phone, message })
}
