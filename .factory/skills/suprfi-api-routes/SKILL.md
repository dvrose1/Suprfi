---
name: suprfi-api-routes
description: Build or modify Next.js API routes following SuprFi conventions including validation, error handling, authentication, and audit logging. Use when creating or modifying any /api/* routes.
---

# Skill: SuprFi API Routes

## Purpose

Implement API endpoints following established patterns for validation, error handling, authentication, and audit logging.

## When to use this skill

- Creating new API endpoints
- Modifying existing routes
- Adding validation to endpoints
- Implementing authentication checks
- Creating audit log entries

## Directory Structure
```
src/app/api/v1/
  admin/                    # Admin-only routes (session auth)
    auth/
      login/route.ts
      logout/route.ts
      me/route.ts
    applications/
      route.ts              # GET list, POST create
      [id]/
        route.ts            # GET detail, PATCH update
        approve/route.ts    # POST action
        decline/route.ts    # POST action
    contractors/route.ts
    users/route.ts
    audit/route.ts
    
  borrower/                 # Token-authenticated routes
    [token]/
      submit/route.ts
      decision/route.ts
      offers/
        select/route.ts
      agreement/
        route.ts
        sign/route.ts
      plaid/
        link-token/route.ts
        exchange/route.ts
        
  crm/                      # Webhook endpoints
    webhook/route.ts
    offer-financing/route.ts
    
  waitlist/route.ts         # Public endpoint
```

## Route Handler Pattern (Next.js 15)
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// IMPORTANT: In Next.js 15, params is a Promise
interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params  // Must await params!
    
    const item = await prisma.application.findUnique({
      where: { id },
      include: { customer: true, job: true },
    })
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: item })
    
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Zod Validation Pattern
```tsx
const CreateApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  amount: z.number().positive('Amount must be positive'),
  ssn: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = CreateApplicationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: result.error.issues 
        },
        { status: 400 }
      )
    }
    
    const data = result.data
    // ... proceed with validated data
    
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      )
    }
    throw error
  }
}
```

## Admin Auth Pattern
```tsx
import { getCurrentUser, hasRoleLevel } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Check authorization (role level)
    if (!hasRoleLevel(user.role, 'operator')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // 3. Proceed with operation...
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Borrower Token Auth Pattern
```tsx
import { verifyApplicationToken } from '@/lib/utils/token'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    
    // 1. Verify token
    const decoded = verifyApplicationToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // 2. Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      )
    }
    
    // 3. Fetch application
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
    })
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // 4. Proceed...
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Audit Logging Pattern
```tsx
// Always log mutations with context
await prisma.$transaction([
  // The mutation
  prisma.application.update({
    where: { id },
    data: { status: 'approved' },
  }),
  // The audit log
  prisma.auditLog.create({
    data: {
      entityType: 'application',
      entityId: id,
      actor: user.id,          // Who did it
      action: 'approved',       // What they did
      payload: {                // Context
        previousStatus: application.status,
        reason: body.reason,
        amount: body.amount,
      },
    },
  }),
])
```

## Response Format Standard
```tsx
// Success response
return NextResponse.json({
  success: true,
  data: { ... },
  message: 'Optional success message',
})

// Error response
return NextResponse.json({
  success: false,
  error: 'Human readable error message',
  details: [...],  // Optional: validation errors or additional info
}, { status: 400 })

// HTTP Status Codes:
// 200 - Success
// 201 - Created
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (not logged in)
// 403 - Forbidden (wrong permissions)
// 404 - Not Found
// 500 - Internal Server Error
```

## Security Checklist

- [ ] Never return sensitive data (SSN, full tokens, passwords)
- [ ] Always validate input with Zod
- [ ] Check authentication before any operation
- [ ] Check authorization (role level) for admin routes
- [ ] Use transactions for multi-step operations
- [ ] Log all mutations to audit log
- [ ] Sanitize error messages (don't leak internals)

## Verification

```bash
npm run lint
npx tsc --noEmit
```
