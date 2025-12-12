---
name: suprfi-integrations
description: Work with third-party service integrations including Plaid (banking), Persona (KYC), Twilio (SMS), and Resend (email). Use when implementing or modifying integration code.
---

# Skill: SuprFi Integrations

## Purpose

Implement third-party integrations following established patterns for error handling, environment configuration, and data flow.

## When to use this skill

- Working with Plaid Link or bank data
- Implementing Persona KYC flows
- Sending SMS via Twilio
- Sending emails via Resend
- Adding new third-party integrations

## Directory Structure
```
src/lib/services/
  plaid.ts            # Plaid client and utilities
  persona.ts          # Persona KYC client
  sms.ts              # Twilio SMS service
  decisioning.ts      # Credit decisioning logic
  crm/
    fieldroutes.ts    # FieldRoutes CRM integration

src/lib/email/
  index.ts            # Email send function
  resend.ts           # Resend client
  templates/          # React email templates
```

## Environment Variables (NEVER HARDCODE)
```bash
# Plaid
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox  # sandbox | development | production

# Persona
PERSONA_API_KEY=
PERSONA_TEMPLATE_ID=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend
RESEND_API_KEY=
EMAIL_FROM=SuprFi <noreply@suprfi.com>
```

## Plaid Integration

### Client Setup
```typescript
// lib/services/plaid.ts
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)
```

### Create Link Token
```typescript
export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'SuprFi',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    })
    return { linkToken: response.data.link_token }
  } catch (error) {
    console.error('Error creating Plaid link token:', error)
    throw new Error('Failed to create link token')
  }
}
```

## SMS Integration (Twilio)

### Client Setup
```typescript
// lib/services/sms.ts
import twilio from 'twilio'

const client = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!client) {
    console.log('[SMS] Skipping - no Twilio credentials')
    return true  // Dev mode success
  }

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return true
  } catch (error) {
    console.error('[SMS] Error sending:', error)
    return false
  }
}
```

## Email Integration (Resend)

### Client Setup
```typescript
// lib/email/resend.ts
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'SuprFi <noreply@suprfi.com>'

export async function sendEmail(options: {
  to: string | string[]
  subject: string
  react: React.ReactElement
}): Promise<{ success: boolean; id?: string }> {
  if (!resend) {
    console.log('[Email] Skipping - no RESEND_API_KEY')
    return { success: true, id: 'dev-mode' }
  }

  try {
    const { render } = await import('@react-email/render')
    const html = await render(options.react)
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html,
    })

    if (error) {
      console.error('[Email] Error:', error)
      return { success: false }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false }
  }
}
```

### Email Template Pattern
```tsx
// lib/email/templates/ApplicationLink.tsx
import { Html, Head, Body, Container, Text, Button, Preview } from '@react-email/components'

interface Props {
  customerName: string
  applicationUrl: string
  amount: string
}

export function ApplicationLinkEmail({ customerName, applicationUrl, amount }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your SuprFi financing application is ready</Preview>
      <Body style={{ backgroundColor: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#0F2D4A' }}>Supr</span>
            <span style={{ color: '#2A9D8F' }}>Fi</span>
          </Text>
          
          <Text>Hi {customerName},</Text>
          <Text>Your financing application for {amount} is ready to complete.</Text>
          
          <Button
            href={applicationUrl}
            style={{
              backgroundColor: '#2A9D8F',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
            }}
          >
            Complete Application
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

## Integration Checklist

- [ ] API keys from environment variables only
- [ ] Graceful fallback when credentials missing (dev mode)
- [ ] Try/catch with meaningful error logging
- [ ] No PII in logs (mask phone, email, SSN)
- [ ] Webhook signature verification where applicable
- [ ] Audit log for significant integration calls

## Verification

```bash
npm run lint
npx tsc --noEmit
```
