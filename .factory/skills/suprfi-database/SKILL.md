---
name: suprfi-database
description: Work with Prisma and PostgreSQL following SuprFi conventions for schemas, queries, migrations, and data access patterns. Use when modifying database schema, writing queries, or creating migrations.
---

# Skill: SuprFi Database (Prisma)

## Purpose

Implement database operations following established patterns for schema design, queries, and migrations.

## When to use this skill

- Creating or modifying Prisma schema
- Writing database queries
- Creating migrations
- Working with JSON fields
- Implementing transactions

## Schema Location
```
prisma/
  schema.prisma           # Main schema file
  migrations/             # Migration history
```

## Core Models
```
Customer      - CRM customer data (firstName, lastName, email, phone, address)
Job           - Service job/estimate (estimateAmount, status, serviceType)
Application   - Financing application (token, status, plaidData, personaData, creditData)
Decision      - Underwriting decision (score, decisionStatus, ruleHits)
Offer         - Financing offer (termMonths, apr, monthlyPayment)
Loan          - Funded loan (amount, status, paymentSchedule)
ManualReview  - Pending reviews (reason, priority, status)
AuditLog      - All mutations (entityType, entityId, actor, action, payload)
AdminUser     - Dashboard users (email, passwordHash, role)
Contractor    - Contractor accounts (companyName, status, apiKey)
WaitlistEntry - Waitlist signups (email, companyName)
```

## Schema Conventions
```prisma
model EntityName {
  // Always use cuid for IDs
  id        String   @id @default(cuid())
  
  // Required fields first
  name      String
  email     String   @unique
  status    String   @default("active")
  
  // Optional fields
  notes     String?
  
  // JSON fields for flexible data
  metadata  Json?
  
  // Always include timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations at the end
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // Indexes for common queries
  @@index([status])
  @@index([userId])
  @@index([createdAt])
}
```

## Prisma Client Pattern
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Query Patterns

### Find with Relations
```typescript
const application = await prisma.application.findUnique({
  where: { id },
  include: {
    customer: true,
    job: true,
    decision: {
      include: {
        offers: true,
      },
    },
  },
})
```

### Find Many with Filters
```typescript
const applications = await prisma.application.findMany({
  where: {
    status: { in: ['submitted', 'approved'] },
    createdAt: { gte: startDate },
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
  skip: page * 50,
  include: {
    customer: { select: { firstName: true, lastName: true, email: true } },
    job: { select: { estimateAmount: true } },
  },
})
```

### Update with Audit Log (Transaction)
```typescript
await prisma.$transaction([
  prisma.application.update({
    where: { id },
    data: { status: 'approved' },
  }),
  prisma.auditLog.create({
    data: {
      entityType: 'application',
      entityId: id,
      actor: userId,
      action: 'approved',
      payload: {
        previousStatus: application.status,
        reason: approvalReason,
      },
    },
  }),
])
```

### Upsert Pattern
```typescript
const customer = await prisma.customer.upsert({
  where: { crmCustomerId: crmId },
  update: {
    firstName,
    lastName,
    email,
    phone,
  },
  create: {
    crmCustomerId: crmId,
    firstName,
    lastName,
    email,
    phone,
  },
})
```

## JSON Field Patterns

### Reading JSON
```typescript
// Type assertion for JSON fields
const creditData = application.creditData as Record<string, unknown> | null
const selectedOffer = creditData?.selectedOffer as OfferData | undefined

// Safe access
const score = (application.creditData as any)?.score ?? 0
```

### Updating JSON (Merge)
```typescript
await prisma.application.update({
  where: { id },
  data: {
    creditData: {
      ...(application.creditData as object || {}),
      selectedOffer: offerData,
      selectedAt: new Date().toISOString(),
    },
  },
})
```

## Migration Commands
```bash
# Create migration (development)
npx prisma migrate dev --name add_field_to_model

# Generate Prisma Client
npx prisma generate

# Push schema without migration (prototyping)
npx prisma db push

# Reset database (development only!)
npx prisma migrate reset

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate
```

## Verification

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
```

## Checklist

- [ ] Use cuid() for IDs
- [ ] Include createdAt/updatedAt on all models
- [ ] Add indexes on frequently queried fields
- [ ] Define relations with proper foreign keys
- [ ] Type JSON fields with `as Record<string, unknown>`
- [ ] Use transactions for multi-step operations
- [ ] Create audit logs for all mutations
