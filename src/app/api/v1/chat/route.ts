// ABOUTME: Chat API endpoint powered by Claude for investor/contractor inquiries
// ABOUTME: Streams responses and can collect emails for waitlist

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const SYSTEM_PROMPT = `You are SuprFi's AI assistant on the company website. Your role is to answer questions about SuprFi for potential investors, partners, and contractors.

## About SuprFi

SuprFi is building agent-powered consumer lending infrastructure for the $650 billion home services market. We originate unsecured loans at the point of need, when a homeowner needs HVAC, plumbing, roofing, or electrical work and can't pay upfront.

### The Problem
- Home services jobs are unplanned, expensive, and urgent
- Homeowners rarely have cash on hand
- Contractors who offer financing close 49% of jobs vs 38% without
- But 63% of contractors only sometimes mention financing because current tools don't fit fieldwork
- Existing solutions require technicians to log into portals, enter data manually, and hope customers complete applications

### Our Solution
SuprFi replaces clunky portals with autonomous AI agents that handle the entire lending workflow:
- **Before the visit**: Pre-qualify homeowners so they know their budget before seeing the quote
- **During the visit**: Generate personalized payment options the homeowner reviews on their phone
- **After the visit**: Follow up automatically with financing options for the specific job quoted

### Our Agent Architecture
- **Technician Assistant**: Lives in SMS/WhatsApp, receives job details, generates offers, syncs to CRM
- **Borrower Agent**: Guides homeowners through applications via text or chat, collects documents, answers questions 24/7
- **Underwriting Agent**: Real-time credit decisioning, document verification, approvals in minutes
- **Operations Agent**: Monitors pipeline, flags stalled applications, generates reporting

### Merchant Portal
Contractors also get a full portal for:
- Application pipeline tracking
- Loan management and payment history
- Deep analytics (conversion rates, approval rates, trends)
- Team access with role-based permissions

### Integrations
We integrate bidirectionally with: ServiceTitan, Housecall Pro, Jobber, FieldEdge, and custom APIs.
Plus bank verification providers and credit bureaus for real-time decisioning.

### Verticals
HVAC, Plumbing, Roofing, Electrical, Remodeling, General Contracting. Any job under $25K.

### Current Status
SuprFi is in pilot with select contractors. We're seeking early access partners (contractors) and talking to investors.

## Your Behavior

1. Be helpful, concise, and professional. Match the tone of a Series A fintech.
2. Answer questions about SuprFi's product, market, technology, and business model.
3. If someone expresses interest in early access, partnership, or investment, offer to collect their email.
4. When collecting an email, ask for it naturally in conversation. Once provided, confirm you've added them to the list.
5. Don't make up information. If asked something you don't know (specific rates, terms, financials), say we're in pilot and details are being finalized.
6. Don't discuss specific APRs, interest rates, or guaranteed approval rates (regulatory reasons).
7. Keep responses concise, typically 2-4 sentences unless more detail is requested.

## Email Collection

When a user provides their email address, respond with a special marker so the system can save it:
[COLLECT_EMAIL: user@example.com | TYPE: investor/contractor]

Only use this marker when someone explicitly provides their email. Infer the type from context (investor/partner = investor, contractor/business owner = contractor).`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chat not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if ('text' in delta) {
                fullResponse += delta.text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`));
              }
            }
          }

          // Check for email collection marker in final response
          const emailMatch = fullResponse.match(/\[COLLECT_EMAIL:\s*([^\s|]+)\s*\|\s*TYPE:\s*(\w+)\]/i);
          if (emailMatch) {
            const [, email, type] = emailMatch;
            try {
              await prisma.waitlist.create({
                data: {
                  email: email.toLowerCase(),
                  type: type.toLowerCase() === 'contractor' ? 'contractor' : 'investor',
                  source: 'chat_widget',
                },
              });
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ emailCollected: true })}\n\n`));
            } catch (err) {
              // Email might already exist, that's ok
              console.log('Email collection note:', err);
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
