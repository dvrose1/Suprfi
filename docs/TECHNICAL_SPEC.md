# FlowPay Technical Delivery Specification

**Version:** v1.0  
**Last Updated:** October 29, 2025  
**Status:** Approved  
**Team:** Solo/Duo (Human + AI)

---

## Executive Summary

FlowPay is an embedded consumer financing platform for home service businesses. This document outlines the technical implementation plan for the MVP, covering architecture, technology choices, implementation phases, and delivery timeline.

**Key Facts:**
- **Target Timeline:** 12-16 weeks to production-ready MVP
- **Team Size:** 2 (you + AI pair programming)
- **Tech Stack:** Next.js 14, Prisma, Supabase, Clerk, BullMQ
- **Credit Bureau:** Experian
- **Strategy:** Build decisioning engine early, route to lender partners for funding
- **Pilot Customers:** ProForce, Rack Electric

---

## 1. Technology Stack & Architecture Decisions

### 1.1 Core Stack (Recommended)

#### Frontend
**Choice:** Next.js 14+ (App Router) on Vercel

**Rationale:**
- Server-side token validation for security
- Built-in API routes (reduces complexity vs separate Express server)
- Excellent DX with hot reload, TypeScript support
- Automatic code splitting and optimization
- SEO-ready for future marketing pages
- Vercel deployment is zero-config

**Alternatives Considered:**
- React + Vite: More control, but loses SSR benefits and requires separate backend
- Remix: Great SSR but smaller ecosystem than Next.js

#### Backend
**Choice:** Next.js API Routes + separate Node.js microservices for heavy operations

**Rationale:**
- Unified codebase for simple endpoints (borrower flow, webhooks)
- Separate services for decisioning/CRM sync that need independent scaling
- Can use serverless functions (Vercel Edge) for low-latency endpoints
- Easy to migrate individual services to containers later if needed

**Service Architecture:**
```
Next.js API Routes (Vercel)
├── Borrower API endpoints
├── Webhook receivers
└── Admin API endpoints

Node.js Microservices (separate deployments)
├── Decisioning Service (scoring, offers)
├── CRM Sync Service (FieldRoutes integration)
├── Integrations Service (Plaid, Persona, Experian)
└── Lender Adapter (lender API orchestration)
```

#### Database
**Choice:** Supabase (managed Postgres) with Prisma ORM

**Rationale:**
- Postgres reliability with managed backups
- Built-in Row-Level Security (RLS) for multi-tenant data
- Real-time subscriptions (useful for admin dashboard)
- Supabase Storage for KYC documents (S3-compatible)
- Generous free tier, scales to production
- Prisma gives type-safe queries and excellent migrations

**Schema Design Philosophy:**
- Normalize customer/job data to avoid duplication
- Denormalize decision snapshots (store as JSONB) for audit trail
- Separate `applications` → `decisions` → `offers` → `loans` tables
- Immutable audit log table

#### Authentication
**Choice:** Clerk

**Rationale:**
- Best-in-class developer experience
- Built-in session management and JWT handling
- Magic links for borrower experience (no password friction)
- Webhooks for user lifecycle events
- Multi-organization support (for merchant portals in future)
- Better pricing than Auth0 for startups ($25/mo vs $70/mo)

**Alternatives Considered:**
- Auth0: More enterprise features, but overkill for MVP
- NextAuth.js: Full control, but requires more implementation time

#### Queue/Workers
**Choice:** BullMQ (Redis-backed) on Railway or Render

**Rationale:**
- Job prioritization (urgent vs background tasks)
- Automatic retries with exponential backoff
- Built-in UI dashboard (Bull Board) for monitoring
- Supports delayed jobs (useful for retry logic)
- Can handle 1000s of jobs/sec
- Easier to debug than AWS SQS for MVP

**Alternative:** AWS SQS + Lambda (for fully serverless, but adds complexity)

#### Object Storage
**Choice:** Supabase Storage (S3-compatible)

**Rationale:**
- Unified with database (single vendor, simpler billing)
- Built-in CDN for fast document retrieval
- Row-level security integrates with Postgres policies
- Automatic image optimization

**Alternative:** AWS S3 (for unlimited scale, but overkill for MVP)

#### SMS Provider
**Choice:** Twilio Messaging Service

**Rationale:**
- Industry standard, 99.95% uptime
- Verified sender pools improve deliverability
- Built-in link shortening
- Delivery webhooks for tracking
- Easy to add WhatsApp/voice later

---

### 1.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 14 / Vercel)                  │
│                                                                   │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │  Borrower Portal    │        │  FlowOps Admin      │         │
│  │  - Apply for loan   │        │  - Review queue     │         │
│  │  - Link bank        │        │  - Manage rules     │         │
│  │  - E-sign           │        │  - Analytics        │         │
│  └─────────────────────┘        └─────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              API GATEWAY (Next.js API Routes)                    │
│                                                                   │
│  POST /api/v1/crm/offer-financing        ← FieldRoutes          │
│  GET  /api/v1/borrower/:token            ← Borrower frontend    │
│  POST /api/v1/borrower/:token/submit                            │
│  POST /api/v1/decision/evaluate          ← Internal             │
│  POST /api/v1/webhooks/{provider}        ← External services    │
└──────┬───────────┬───────────┬──────────┬────────────┬──────────┘
       │           │           │          │            │
       ▼           ▼           ▼          ▼            ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│Borrower  │ │CRM Sync  │ │Integra- │ │Decision- │ │Lender    │
│Service   │ │Service   │ │tions    │ │ing Svc   │ │Adapter   │
│          │ │(FR API)  │ │(Plaid,  │ │(Rules,   │ │(Partner  │
│- Token   │ │          │ │Persona, │ │Scoring)  │ │APIs)     │
│- Prefill │ │- Read    │ │Experian)│ │          │ │          │
│- Submit  │ │- Write   │ │         │ │- Offers  │ │- Create  │
│          │ │- Sync    │ │         │ │- Manual  │ │- Disburse│
└────┬─────┘ └────┬─────┘ └────┬────┘ └────┬─────┘ └────┬─────┘
     │            │            │           │            │
     └────────────┴────────────┴───────────┴────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │   POSTGRES     │
                     │   (Supabase)   │
                     │                │
                     │  - customers   │
                     │  - jobs        │
                     │  - applications│
                     │  - decisions   │
                     │  - offers      │
                     │  - loans       │
                     │  - audit_logs  │
                     └────────────────┘
                              │
                     ┌────────┴────────┐
                     │  REDIS (BullMQ) │
                     │  Worker Queue   │
                     │                 │
                     │  - Lender calls │
                     │  - CRM sync     │
                     │  - Webhooks     │
                     └─────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌──────────┐         ┌────────────┐         ┌────────────┐
│  Plaid   │         │  Persona   │         │  Experian  │
│  (Bank)  │         │  (KYC)     │         │  (Credit)  │
└──────────┘         └────────────┘         └────────────┘
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
                     ┌────────────────┐
                     │  FieldRoutes   │
                     │  CRM API       │
                     │  (Mock → Real) │
                     └────────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │  Lender APIs   │
                     │  (Partners)    │
                     └────────────────┘
```

---

### 1.3 Data Model (Prisma Schema)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// CORE ENTITIES
// ============================================

model Customer {
  id             String        @id @default(cuid())
  crmCustomerId  String?       @unique
  firstName      String
  lastName       String
  email          String
  phone          String
  addressLine1   String?
  addressLine2   String?
  city           String?
  state          String?
  postalCode     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  jobs           Job[]
  applications   Application[]
  
  @@index([email])
  @@index([phone])
  @@index([crmCustomerId])
}

model Job {
  id             String        @id @default(cuid())
  crmJobId       String?       @unique
  customerId     String
  customer       Customer      @relation(fields: [customerId], references: [id])
  estimateAmount Decimal       @db.Decimal(10,2)
  status         String        @default("pending")
  technicianId   String?
  serviceType    String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  applications   Application[]
  
  @@index([customerId])
  @@index([crmJobId])
  @@index([status])
}

// ============================================
// FINANCING WORKFLOW
// ============================================

model Application {
  id             String        @id @default(cuid())
  jobId          String
  job            Job           @relation(fields: [jobId], references: [id])
  customerId     String
  customer       Customer      @relation(fields: [customerId], references: [id])
  token          String        @unique
  tokenExpiresAt DateTime
  status         String        @default("initiated") // initiated, submitted, approved, declined, funded
  
  // Snapshot data from integrations (JSONB)
  plaidData      Json?
  personaData    Json?
  creditData     Json?
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  decision       Decision?
  loan           Loan?
  
  @@index([token])
  @@index([status])
  @@index([createdAt])
}

model Decision {
  id                String        @id @default(cuid())
  applicationId     String        @unique
  application       Application   @relation(fields: [applicationId], references: [id])
  
  score             Int?
  decisionStatus    String        // approved, pending, declined, manual_review
  decisionReason    String?
  ruleHits          Json?         // Array of rule IDs that triggered
  evaluatorVersion  String        @default("v1.0")
  decidedAt         DateTime      @default(now())
  decidedBy         String?       // "system" or user_id
  
  offers            Offer[]
  manualReview      ManualReview?
  
  @@index([decisionStatus])
  @@index([decidedAt])
}

model Offer {
  id               String        @id @default(cuid())
  decisionId       String
  decision         Decision      @relation(fields: [decisionId], references: [id])
  
  termMonths       Int
  apr              Decimal       @db.Decimal(5,2)
  monthlyPayment   Decimal       @db.Decimal(10,2)
  downPayment      Decimal       @db.Decimal(10,2) @default(0)
  originationFee   Decimal       @db.Decimal(10,2) @default(0)
  totalAmount      Decimal       @db.Decimal(10,2)
  
  lenderId         String?
  routingType      String        @default("AUTO") // AUTO, MANUAL
  
  selected         Boolean       @default(false)
  selectedAt       DateTime?
  
  createdAt        DateTime      @default(now())
  
  @@index([decisionId])
}

model Loan {
  id               String        @id @default(cuid())
  applicationId    String        @unique
  application      Application   @relation(fields: [applicationId], references: [id])
  
  lenderLoanId     String?
  lenderName       String?
  fundedAmount     Decimal       @db.Decimal(10,2)
  fundingDate      DateTime?
  
  paymentSchedule  Json?         // Array of {date, amount, status}
  
  status           String        @default("pending") // pending, funded, repaying, paid_off, defaulted
  
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  @@index([status])
  @@index([lenderLoanId])
}

// ============================================
// DECISIONING & MANUAL REVIEW
// ============================================

model ManualReview {
  id             String        @id @default(cuid())
  decisionId     String        @unique
  decision       Decision      @relation(fields: [decisionId], references: [id])
  
  reason         String        // "thin_file", "fraud_flag", "borderline_score"
  priority       Int           @default(1) // 1=high, 2=medium, 3=low
  assignedTo     String?       // user_id
  status         String        @default("pending") // pending, in_review, resolved
  
  notes          String?
  resolution     String?       // "approved", "declined", "approved_with_conditions"
  resolvedBy     String?
  resolvedAt     DateTime?
  
  createdAt      DateTime      @default(now())
  
  @@index([status])
  @@index([priority])
  @@index([assignedTo])
}

model PricingRule {
  id                  String    @id @default(cuid())
  name                String
  description         String?
  
  // JSON predicate: {field: "credit_score", operator: ">=", value: 700}
  predicate           Json
  
  // JSON adjustments: {apr_adjustment: 2.0, max_term: 48}
  pricingAdjustments  Json
  
  priority            Int       @default(100)
  active              Boolean   @default(true)
  
  createdBy           String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([active])
  @@index([priority])
}

// ============================================
// AUDIT & COMPLIANCE
// ============================================

model AuditLog {
  id          String    @id @default(cuid())
  entityType  String    // "application", "decision", "loan", "user"
  entityId    String
  
  actor       String    // user_id or "system"
  action      String    // "created", "updated", "approved", "viewed_pii"
  
  // Snapshot of changes
  payload     Json?
  
  ipAddress   String?
  userAgent   String?
  
  timestamp   DateTime  @default(now())
  
  @@index([entityType, entityId])
  @@index([actor])
  @@index([timestamp])
}

// ============================================
// CRM SYNC
// ============================================

model CrmSyncLog {
  id              String    @id @default(cuid())
  crmType         String    @default("fieldroutes")
  direction       String    // "inbound" (CRM → FlowPay) or "outbound" (FlowPay → CRM)
  
  entityType      String    // "customer", "job", "financing_status"
  entityId        String
  crmEntityId     String?
  
  status          String    // "success", "failed", "retrying"
  errorMessage    String?
  
  requestPayload  Json?
  responsePayload Json?
  
  attemptCount    Int       @default(1)
  
  createdAt       DateTime  @default(now())
  
  @@index([status])
  @@index([crmType, entityType])
  @@index([createdAt])
}
```

---

## 2. Implementation Phases

### Timeline Overview: 12-16 Weeks

**Aggressive but achievable with AI pair programming and focus on MVP scope.**

```
Week 1-2:   Phase 0  - Foundation
Week 3-5:   Phase 1  - Borrower Flow MVP
Week 6-7:   Phase 2  - Decisioning Engine
Week 8-9:   Phase 3  - CRM Integration (Mock + Real)
Week 10-11: Phase 4  - Lender Integration
Week 12-13: Phase 5  - FlowOps Admin Tool
Week 14-15: Phase 6  - Security & Hardening
Week 15-16: Phase 7  - Testing & QA
Week 16+:   Phase 8  - Pilot Launch
Pre-launch: Phase 9  - Legal & Compliance
```

---

### Phase 0: Foundation (Week 1-2) - 40-50 hours

**Goal:** Project scaffolding, development environment, core infrastructure

**Tasks:**
- [ ] Initialize Next.js 14 project with App Router
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Prisma with Supabase connection
- [ ] Create database schema and initial migration
- [ ] Configure Clerk authentication
- [ ] Set up environment variable management (.env.local, .env.production)
- [ ] Create GitHub repository and CI/CD (GitHub Actions → Vercel)
- [ ] Set up Sentry for error tracking
- [ ] Create project documentation (README, CONTRIBUTING)
- [ ] Set up local development with Docker Compose (Postgres, Redis)
- [ ] Seed database with test data

**Deliverables:**
- Running Next.js app deployed to Vercel staging
- Database migrations executable
- Auth flow working (sign in/sign out)
- CI/CD pipeline functional

---

### Phase 1: Borrower Flow MVP (Week 3-5) - 60-80 hours

**Goal:** End-to-end borrower application flow with mock integrations

**1.1 Frontend - Borrower Portal**
- [ ] Landing page with token validation (`/apply/:token`)
- [ ] Multi-step form with progress indicator:
  - Step 1: Personal info (prefilled)
  - Step 2: Bank linking (Plaid)
  - Step 3: KYC verification (Persona)
  - Step 4: Offer selection
  - Step 5: E-signature & confirmation
- [ ] Mobile-responsive design (TailwindCSS)
- [ ] Loading states, error handling, validation
- [ ] Accessibility (WCAG 2.1 AA compliance)

**1.2 Backend - Borrower API**
- [ ] `POST /api/v1/crm/offer-financing` - Create application, generate token, send SMS
- [ ] `GET /api/v1/borrower/:token` - Fetch prefilled application data
- [ ] `POST /api/v1/borrower/:token/submit` - Submit application
- [ ] Token generation with expiration (24 hours)
- [ ] Twilio integration for SMS delivery

**1.3 Third-Party Integrations (Sandbox)**
- [ ] **Plaid Link:**
  - Server-side token exchange
  - Account verification
  - Store access_token securely
- [ ] **Persona:**
  - Embed Persona Inquiry flow
  - Webhook handler for verification complete
- [ ] **Experian (Mock):**
  - Mock API returning sample credit scores
  - Design data structure for real integration
  - Soft pull request structure

**1.4 Testing**
- [ ] Unit tests for token generation/validation
- [ ] Integration tests for API endpoints
- [ ] E2E test: Complete borrower flow (Playwright)

**Deliverables:**
- Borrower can complete full flow with mock data
- SMS delivery working
- Plaid Link functional in sandbox
- Persona verification embedded

---

### Phase 2: Decisioning Engine (Week 6-7) - 40-50 hours

**Goal:** Build rule engine, scoring model, and offer generation

**2.1 Decisioning Service (Node.js microservice)**
- [ ] Initialize service with Express + TypeScript
- [ ] Connect to shared Postgres via Prisma
- [ ] Scoring algorithm (weighted model):
  ```typescript
  score = (
    credit_score * 0.4 +
    income_factor * 0.3 +
    bank_health * 0.2 +
    kyc_confidence * 0.1
  )
  ```
- [ ] Rule engine (JSON-based predicates):
  ```json
  {
    "rule_id": "no_bankruptcy",
    "predicate": {
      "field": "credit_data.public_records",
      "operator": "not_includes",
      "value": "bankruptcy"
    },
    "action": "decline",
    "reason": "Recent bankruptcy"
  }
  ```

**2.2 Offer Generation**
- [ ] Tier mapping (score → offers):
  - Tier A (750+): 12/24/36 months, APR 6.9-9.9%
  - Tier B (700-749): 24/36/48 months, APR 9.9-12.9%
  - Tier C (650-699): 36/48/60 months, APR 12.9-16.9%
- [ ] Calculate monthly payment (amortization formula)
- [ ] Apply origination fees
- [ ] Store offers in database

**2.3 Manual Review Logic**
- [ ] Flag applications for manual review:
  - Score < 650
  - Fraud signals from Persona
  - Thin credit file (< 3 accounts)
- [ ] Create `ManualReview` record with reason and priority

**2.4 API Endpoints**
- [ ] `POST /api/v1/decision/evaluate` - Run decisioning
- [ ] `GET /api/v1/decision/:id` - Fetch decision details
- [ ] `POST /api/v1/decision/:id/accept` - Borrower accepts offer

**2.5 Testing**
- [ ] Unit tests for scoring algorithm
- [ ] Rule engine test suite (20+ test cases)
- [ ] Offer calculation tests
- [ ] Integration test: Full decisioning flow

**Deliverables:**
- Decisioning service running and callable
- Offers generated based on credit score
- Manual review queue populated for edge cases
- API documentation (Postman collection)

---

### Phase 3: CRM Integration - FieldRoutes (Week 8-9) - 40-50 hours

**Goal:** Integrate with FieldRoutes API (mock first, then real)

**3.1 Mock FieldRoutes API**
- [ ] Create Express mock server with FieldRoutes endpoints:
  - `GET /customers/:id`
  - `GET /appointments/:id`
  - `PATCH /appointments/:id` (update financing status)
- [ ] Seed mock data (5 customers, 10 jobs)
- [ ] Deploy mock to separate Vercel project

**3.2 CRM Sync Service**
- [ ] Initialize service (Node.js + Express)
- [ ] FieldRoutes OAuth 2.0 flow:
  - Authorization code grant
  - Token refresh logic
  - Store tokens in encrypted DB field
- [ ] Read operations:
  - Fetch customer by ID
  - Fetch job/appointment by ID
  - Map FieldRoutes fields → FlowPay schema
- [ ] Write operations:
  - Update job with financing status
  - Write back: `financing_status`, `loan_amount`, `funded_date`, `next_payment_due`
- [ ] Retry logic with exponential backoff (max 5 attempts)
- [ ] Create `CrmSyncLog` for all operations

**3.3 Webhook Receiver**
- [ ] `POST /api/v1/webhooks/fieldroutes`
- [ ] Verify webhook signature
- [ ] Handle events:
  - Job updated (estimate changed)
  - Customer info updated
- [ ] Queue sync job in BullMQ

**3.4 Real FieldRoutes Integration**
- [ ] Request sandbox access from FieldRoutes
- [ ] Update OAuth credentials
- [ ] Test read/write operations
- [ ] Document API quirks/limitations

**3.5 Testing**
- [ ] Unit tests for field mapping
- [ ] Integration tests with mock API
- [ ] E2E test: Trigger financing → CRM writeback
- [ ] Load test: 100 concurrent sync operations

**Deliverables:**
- Mock FieldRoutes API functional
- CRM Sync Service operational
- OAuth flow working
- Successful round-trip: Read job → Process → Write back status

---

### Phase 4: Lender Integration (Week 10-11) - 40-50 hours

**Goal:** Route approved applications to lender partners for funding

**4.1 Lender Adapter Service**
- [ ] Abstract interface for multiple lenders:
  ```typescript
  interface LenderAdapter {
    createLoan(application: Application, offer: Offer): Promise<LoanResponse>
    requestDisbursement(loanId: string): Promise<DisbursementResponse>
    getLoanStatus(loanId: string): Promise<LoanStatus>
  }
  ```
- [ ] Mock lender implementation (for testing)
- [ ] Real lender integration (partner TBD):
  - API authentication
  - Loan creation endpoint
  - Disbursement request
  - Webhook for funding confirmation

**4.2 Async Job Processing**
- [ ] Set up BullMQ with Redis
- [ ] Create job types:
  - `create-loan` (Priority: High)
  - `request-disbursement` (Priority: High)
  - `sync-to-crm` (Priority: Medium)
  - `send-notification` (Priority: Low)
- [ ] Worker processes with concurrency limits
- [ ] Dead Letter Queue (DLQ) for failed jobs
- [ ] Bull Board dashboard for monitoring

**4.3 Webhook Handler**
- [ ] `POST /api/v1/webhooks/lender`
- [ ] Verify webhook signature
- [ ] Handle events:
  - `loan.approved`
  - `loan.funded` → Update loan status, trigger CRM sync
  - `payment.received` → Update payment schedule
- [ ] Idempotency (dedup by event ID)

**4.4 Loan Management**
- [ ] Create `Loan` record after lender confirmation
- [ ] Generate amortization schedule
- [ ] Store payment schedule as JSON
- [ ] Update loan status flow: `pending` → `funded` → `repaying` → `paid_off`

**4.5 Testing**
- [ ] Unit tests for lender adapter
- [ ] Integration tests with mock lender
- [ ] Queue job tests (success, retry, DLQ)
- [ ] Webhook signature validation tests

**Deliverables:**
- Lender Adapter service operational
- Job queue processing loans
- Webhook handler receiving funding confirmations
- Mock lender fully functional

---

### Phase 5: FlowOps Admin Tool (Week 12-13) - 50-60 hours

**Goal:** Internal dashboard for operations, manual review, and analytics

**5.1 Admin Dashboard Frontend**
- [ ] Layout with navigation (Applications, Review Queue, Loans, Settings)
- [ ] Role-based access control (Admin, Underwriter, Support)

**5.2 Applications Page**
- [ ] List view with filters:
  - Status (initiated, submitted, approved, declined, funded)
  - Date range
  - Merchant
  - Loan amount range
- [ ] Search by customer name, email, phone
- [ ] Quick stats: Total applications, approval rate, avg loan amount
- [ ] Click row → Application detail page

**5.3 Application Detail Page**
- [ ] Customer info panel
- [ ] Job details
- [ ] Decision summary (score, rule_hits, offers)
- [ ] Timeline of events (submitted, KYC verified, credit pulled, decided)
- [ ] Action buttons (if manual review):
  - Approve (with selected offer)
  - Decline (with reason)
  - Request more info

**5.4 Manual Review Queue**
- [ ] Prioritized list (high → low)
- [ ] Show: Application ID, customer name, reason, assigned to
- [ ] Assign to self button
- [ ] Inline notes
- [ ] Resolution form (approve/decline/conditions)

**5.5 Loan Management**
- [ ] Loans list (funded, repaying, paid_off)
- [ ] Loan detail page:
  - Payment schedule table
  - Outstanding balance
  - Next payment due
  - Payment history
- [ ] Manual payment entry (for reconciliation)

**5.6 Pricing Rules Management**
- [ ] List active rules
- [ ] Create/edit rule form (JSON editor with validation)
- [ ] Activate/deactivate toggle
- [ ] Simulation tool: Input test data → see which rules trigger

**5.7 Analytics Dashboard**
- [ ] KPIs:
  - Applications this month
  - Approval rate
  - Avg loan amount
  - Avg time to decision
  - Funding success rate
- [ ] Charts (Recharts):
  - Applications over time (line chart)
  - Approval rate by merchant (bar chart)
  - Loan status distribution (pie chart)

**5.8 Reconciliation Console**
- [ ] Show funded loans vs received payments
- [ ] Flag discrepancies
- [ ] Manual reconcile button

**5.9 API Endpoints**
- [ ] `GET /api/v1/admin/applications` (with filters)
- [ ] `GET /api/v1/admin/applications/:id`
- [ ] `GET /api/v1/admin/manual-review/queue`
- [ ] `POST /api/v1/admin/manual-review/:id/resolve`
- [ ] `GET /api/v1/admin/loans`
- [ ] `GET /api/v1/admin/analytics/summary`
- [ ] `GET /api/v1/admin/pricing-rules`
- [ ] `POST /api/v1/admin/pricing-rules`

**5.10 Testing**
- [ ] Unit tests for admin API endpoints
- [ ] E2E tests for manual review flow
- [ ] Permission tests (role-based access)

**Deliverables:**
- Fully functional admin dashboard
- Manual review queue operational
- Analytics showing real-time data
- Pricing rules CRUD working

---

### Phase 6: Security & Hardening (Week 14-15) - 40-50 hours

**Goal:** Ensure production-grade security and compliance

**6.1 Data Encryption**
- [ ] Enable encryption at rest (Supabase default)
- [ ] Encrypt sensitive fields (SSN, bank account numbers) using AES-256
- [ ] Use Prisma middleware for automatic encryption/decryption
- [ ] Store encryption keys in AWS Secrets Manager or Supabase Vault

**6.2 Authentication & Authorization**
- [ ] Enforce HTTPS only (HSTS headers)
- [ ] JWT validation on all protected endpoints
- [ ] API key rotation policy (90-day expiry)
- [ ] Rate limiting (100 req/min per IP for public endpoints)
- [ ] CORS policy (whitelist only known domains)

**6.3 Audit Logging**
- [ ] Log all PII access (who, what, when)
- [ ] Immutable audit log (append-only)
- [ ] Retention policy (7 years for compliance)
- [ ] Automated alerts for suspicious activity:
  - Failed login attempts (5+ in 10 min)
  - Bulk PII exports
  - Manual review overrides

**6.4 Input Validation**
- [ ] Server-side validation for all inputs (Zod schemas)
- [ ] Sanitize user inputs (prevent XSS)
- [ ] Parameterized queries (Prisma protects against SQL injection)

**6.5 Secrets Management**
- [ ] Move all secrets to Vercel env vars (production)
- [ ] Never commit .env files
- [ ] Rotate API keys for third parties
- [ ] Use OAuth tokens with short TTL

**6.6 Security Testing**
- [ ] OWASP Top 10 checklist
- [ ] Penetration testing (automated with tools like ZAP)
- [ ] Dependency vulnerability scan (npm audit, Snyk)
- [ ] Third-party security audit (optional but recommended)

**6.7 Compliance Documentation**
- [ ] Privacy policy (GLBA requirements)
- [ ] Terms of service
- [ ] Data retention policy
- [ ] Incident response plan

**Deliverables:**
- All PII encrypted at rest
- Audit log capturing all sensitive actions
- Security headers configured (CSP, HSTS, X-Frame-Options)
- Vulnerability scan passed
- Compliance docs drafted

---

### Phase 7: Testing & QA (Week 15-16) - 40-50 hours

**Goal:** Comprehensive testing to ensure production readiness

**7.1 Unit Tests**
- [ ] Target: 80% code coverage
- [ ] Focus areas:
  - Business logic (decisioning, offers)
  - Data validation
  - Utility functions
- [ ] Use Jest/Vitest
- [ ] Mock external APIs

**7.2 Integration Tests**
- [ ] API endpoint tests (all routes)
- [ ] Database operations (CRUD)
- [ ] Queue job processing
- [ ] Webhook handlers

**7.3 End-to-End Tests (Playwright)**
- [ ] Borrower flow:
  - Receive SMS → Open link → Submit application → See offer → Accept
- [ ] Admin flow:
  - View manual review queue → Approve application → Verify loan created
- [ ] CRM integration:
  - FieldRoutes triggers financing → Borrower completes → Status written back

**7.4 Load Testing (k6)**
- [ ] Simulate 1000 concurrent borrowers
- [ ] Target: P95 response time < 2s
- [ ] Test queue scalability (10k jobs)
- [ ] Database connection pool under load

**7.5 Security Testing**
- [ ] Automated scan (OWASP ZAP)
- [ ] Manual testing:
  - Attempt SQL injection
  - Attempt XSS
  - Token tampering
  - Replay attack

**7.6 User Acceptance Testing (UAT)**
- [ ] Internal team walkthrough
- [ ] Pilot merchant demo (ProForce)
- [ ] Collect feedback

**Deliverables:**
- Test suite with 80%+ coverage
- E2E tests passing
- Load test results documented
- Security vulnerabilities addressed
- UAT feedback incorporated

---

### Phase 8: Pilot Launch (Week 16+) - Ongoing

**Goal:** Deploy to production and onboard pilot customers

**8.1 Production Deployment**
- [ ] Deploy to Vercel production
- [ ] Run database migrations
- [ ] Configure production secrets
- [ ] Set up custom domain (app.flowpay.com)
- [ ] Enable SSL certificate

**8.2 Monitoring & Observability**
- [ ] Set up Datadog/Grafana dashboards:
  - API latency (p50, p95, p99)
  - Error rates
  - Queue depth
  - Third-party API uptime
- [ ] Configure alerts (PagerDuty):
  - API error rate > 5%
  - Queue backlog > 1000
  - Database connection failures
- [ ] Uptime monitoring (UptimeRobot)

**8.3 Merchant Onboarding**
- [ ] ProForce:
  - Configure FieldRoutes OAuth
  - Train technicians on "Offer Financing" flow
  - Set loan limits and approval thresholds
- [ ] Rack Electric:
  - Same as above
- [ ] Provide merchant dashboard (future: self-serve portal)

**8.4 Customer Support Runbook**
- [ ] Common issues and resolutions:
  - SMS not received
  - Plaid link failed
  - Application stuck in pending
  - Loan not funded
- [ ] Escalation procedures
- [ ] Admin tool access for support team

**8.5 Feedback Collection**
- [ ] Post-application survey (borrowers)
- [ ] Weekly sync with pilot merchants
- [ ] Track metrics:
  - Application completion rate
  - Approval rate
  - Funding success rate
  - NPS

**Deliverables:**
- Production environment live
- 2 pilot merchants onboarded
- Monitoring and alerts operational
- Support runbook documented

---

### Phase 9: Legal & Compliance (Pre-Pilot) - 20-30 hours

**Goal:** Ensure legal compliance before processing real loans

**9.1 Loan Agreements**
- [ ] Engage legal counsel to draft:
  - Borrower loan agreement (terms, APR, payment schedule)
  - Merchant services agreement
  - Lender partner agreement
- [ ] E-signature compliance (ESIGN Act)

**9.2 Privacy & Data Protection**
- [ ] Privacy policy (GLBA, state laws)
- [ ] Cookie policy
- [ ] Data processing agreement (with Supabase, Clerk)
- [ ] TCPA compliance (SMS consent)

**9.3 Credit Reporting Compliance**
- [ ] FCRA compliance (Fair Credit Reporting Act):
  - Adverse action notices
  - Credit dispute process
- [ ] ECOA compliance (Equal Credit Opportunity Act):
  - No discriminatory practices
  - Collect only permitted data

**9.4 State Licensing**
- [ ] Check if consumer lending license required (varies by state)
- [ ] Register as lender or broker (depends on business model)

**9.5 Internal Policies**
- [ ] Responsible lending policy
  - Max DTI ratio
  - Income verification requirements
- [ ] Collections policy (if applicable)
- [ ] Fraud prevention policy

**Deliverables:**
- Legal agreements signed
- Privacy policy published
- Compliance checklist completed
- State licenses obtained (if required)

---

## 3. API Specifications

### 3.1 Authentication

All API requests require authentication:
- **Borrower endpoints:** JWT token from Clerk (short-lived, 15 min)
- **CRM endpoints:** API key in `x-api-key` header
- **Admin endpoints:** JWT token with role claim (`admin`, `underwriter`, `support`)

### 3.2 Core Endpoints

#### CRM Integration

```http
POST /api/v1/crm/offer-financing
Content-Type: application/json
x-api-key: {merchant_api_key}

Request Body:
{
  "crm_customer_id": "FR12345",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "address": {
      "line1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    }
  },
  "job": {
    "crm_job_id": "JOB-9876",
    "estimate_amount": 7500.00,
    "service_type": "HVAC Installation",
    "technician_id": "TECH-001"
  }
}

Response (200):
{
  "application_id": "APP-abc123",
  "token": "eyJhbGc...",
  "sms_sent": true,
  "link": "https://app.flowpay.com/apply/eyJhbGc...",
  "expires_at": "2025-11-01T18:30:00Z"
}
```

#### Borrower Flow

```http
GET /api/v1/borrower/{token}
Authorization: Bearer {jwt_token}

Response (200):
{
  "application": {
    "id": "APP-abc123",
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+15551234567"
    },
    "job": {
      "estimate_amount": 7500.00,
      "service_type": "HVAC Installation"
    },
    "status": "initiated"
  }
}
```

```http
POST /api/v1/borrower/{token}/submit
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "plaid_token": "access-sandbox-abc123",
  "persona_inquiry_id": "inq_xyz789",
  "consent": {
    "credit_check": true,
    "terms_accepted": true,
    "e_sign": true
  }
}

Response (200):
{
  "application_id": "APP-abc123",
  "status": "submitted",
  "decision_id": "DEC-def456",
  "next_step": "review" // or "select_offer"
}
```

#### Decisioning

```http
POST /api/v1/decision/evaluate
Authorization: Bearer {internal_service_token}
Content-Type: application/json

Request Body:
{
  "application_id": "APP-abc123"
}

Response (200):
{
  "decision_id": "DEC-def456",
  "status": "approved",
  "score": 721,
  "offers": [
    {
      "offer_id": "OFF-001",
      "term_months": 24,
      "apr": 9.9,
      "monthly_payment": 343.21,
      "down_payment": 0,
      "origination_fee": 37.50,
      "total_amount": 8237.50
    },
    {
      "offer_id": "OFF-002",
      "term_months": 48,
      "apr": 12.9,
      "monthly_payment": 200.15,
      "down_payment": 0,
      "origination_fee": 37.50,
      "total_amount": 9644.70
    }
  ]
}
```

```http
POST /api/v1/decision/{decision_id}/accept
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "offer_id": "OFF-001",
  "signature": "data:image/png;base64,iVBORw0KG..."
}

Response (200):
{
  "loan_id": "LOAN-ghi789",
  "status": "pending_funding",
  "message": "Your application has been approved! Funding will be processed within 1-2 business days."
}
```

#### Admin - Manual Review

```http
GET /api/v1/admin/manual-review/queue
Authorization: Bearer {admin_jwt}

Response (200):
{
  "queue": [
    {
      "id": "MR-001",
      "application_id": "APP-xyz",
      "customer_name": "Jane Smith",
      "reason": "thin_file",
      "priority": 1,
      "assigned_to": null,
      "created_at": "2025-10-29T14:30:00Z"
    }
  ],
  "total": 12
}
```

```http
POST /api/v1/admin/manual-review/{id}/resolve
Authorization: Bearer {admin_jwt}
Content-Type: application/json

Request Body:
{
  "resolution": "approved",
  "notes": "Verified employment manually",
  "selected_offer_id": "OFF-002",
  "conditions": {
    "down_payment_required": 500
  }
}

Response (200):
{
  "success": true,
  "loan_id": "LOAN-abc123"
}
```

---

## 4. Security & Compliance

### 4.1 Security Measures

**Transport Security:**
- TLS 1.3 for all connections
- HSTS headers (max-age=31536000)
- Certificate pinning for mobile apps (future)

**Authentication:**
- OAuth 2.0 for CRM integrations
- JWT with short TTL (15 min access, 7 day refresh)
- API keys with rotation every 90 days
- MFA for admin accounts

**Data Protection:**
- AES-256 encryption at rest for PII
- Tokenization for SSNs (never store plaintext)
- Encrypted database backups
- S3 server-side encryption (SSE) for documents

**Audit Trail:**
- Immutable audit logs for all PII access
- Borrower consent timestamps
- Admin action tracking with IP and user agent
- Retention: 7 years

**Network Security:**
- Rate limiting (100 req/min for public endpoints)
- DDoS protection (Cloudflare)
- IP whitelisting for admin endpoints
- WAF rules (OWASP Core Rule Set)

### 4.2 Compliance

**GLBA (Gramm-Leach-Bliley Act):**
- Privacy policy disclosing data sharing
- Opt-out mechanism for marketing
- Annual privacy notice

**FCRA (Fair Credit Reporting Act):**
- Adverse action notices (if declined due to credit)
- Credit dispute process
- Permissible purpose for credit pulls

**ECOA (Equal Credit Opportunity Act):**
- No discriminatory practices (protected classes)
- Collect only permitted data (no race/religion)

**TCPA (Telephone Consumer Protection Act):**
- Express written consent for SMS
- Opt-out mechanism ("Reply STOP")

**State Licensing:**
- Check requirements per state
- May need consumer lending license or money transmitter license

---

## 5. Monitoring & Observability

### 5.1 Metrics to Track

**Application Metrics:**
- Total applications (today, week, month)
- Completion rate (% who finish flow)
- Approval rate
- Average loan amount
- Average time to decision
- Funding success rate

**System Metrics:**
- API response time (p50, p95, p99)
- Error rate by endpoint
- Third-party API latency (Plaid, Persona, Experian)
- Queue depth (BullMQ)
- Job processing time
- Database connection pool usage

**Business Metrics:**
- Revenue (origination fees)
- Customer NPS
- Merchant satisfaction
- Default rate (future)

### 5.2 Tooling

**Logging:**
- Structured JSON logs
- Vercel Logs for Next.js
- CloudWatch/Datadog for microservices

**Metrics & Dashboards:**
- Vercel Analytics (Web Vitals)
- Datadog or Grafana
- Custom dashboard for business KPIs

**Tracing:**
- OpenTelemetry
- Honeycomb or Jaeger

**Alerts:**
- PagerDuty for critical alerts:
  - API error rate > 5%
  - Queue backlog > 1000
  - Database down
  - Third-party API failures
- Slack for non-critical alerts

**Uptime Monitoring:**
- UptimeRobot (external ping every 5 min)
- Status page (status.flowpay.com)

---

## 6. Risk Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| FieldRoutes API limitations | High | High | Start with mock API; request sandbox access early; have backup CRM (ServiceTitan) |
| Experian integration delay | Medium | Medium | Use mock credit bureau initially; parallel track real integration |
| Lender partner not ready | High | Critical | Build with lender adapter abstraction; design for multiple lenders; have backup lender |
| SMS deliverability issues | Low | Medium | Use Twilio verified numbers; implement email fallback; monitor delivery rates |
| Plaid downtime | Low | High | Queue failed requests; show user-friendly error; retry via worker; SLA monitoring |
| Data breach | Low | Critical | Penetration testing; bug bounty program; encryption everywhere; incident response plan |
| Compliance violations | Low | Critical | Legal review before launch; audit trail for all PII access; annual compliance audit |
| Low borrower conversion | Medium | High | A/B testing for UX; simplify flow; reduce friction; improve mobile experience |

---

## 7. Cost Estimates

### 7.1 Development Tools (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Clerk | Starter | $25 |
| Twilio | Pay-as-go | $50 (500 SMS) |
| Plaid | Development | $0 (free sandbox) |
| Persona | Pay-as-go | $100 (100 verifications) |
| Sentry | Team | $26 |
| Datadog | Pro | $31 (1 host) |
| GitHub | Team | $4 |
| Railway (Redis) | Starter | $5 |
| **Total** | | **~$286/month** |

### 7.2 Production Scale (1000 loans/month)

| Service | Est. Cost |
|---------|-----------|
| Vercel | $60 (higher traffic) |
| Supabase | $100 (more storage) |
| Clerk | $100 (more users) |
| Twilio | $500 (5000 SMS) |
| Plaid | $300 ($0.30 per link) |
| Persona | $500 ($0.50 per verification) |
| Experian | $500 (credit pulls) |
| Sentry | $26 |
| Datadog | $100 (more metrics) |
| **Total** | **~$2,186/month** |

**Revenue Potential:**
- 1000 loans/month * $7,500 avg * 1% origination fee = $75,000/month
- Gross margin: 97%

---

## 8. Open Questions & Next Steps

### 8.1 Decisions Needed Before Development

1. **FieldRoutes Sandbox Access:**
   - When can we get sandbox credentials?
   - Any API limitations we should know about?

2. **Lender Partner:**
   - Which lender(s) are we partnering with initially?
   - Do they have sandbox/test environments?
   - What's their API documentation?

3. **Experian Integration:**
   - Do we have Experian API access?
   - What's the pricing model (per-pull)?

4. **E-Signature:**
   - Build custom e-sign or use DocuSign?
   - Custom is cheaper but takes more time

5. **Loan Servicing:**
   - Will lender handle all payment collection?
   - Do we need to build payment processing?

### 8.2 Immediate Next Steps (Post-Approval)

1. **Week 1:**
   - Initialize Next.js project
   - Set up Supabase and Clerk accounts
   - Create GitHub repository
   - Begin Phase 0 (Foundation)

2. **Week 2:**
   - Complete database schema
   - Set up CI/CD pipeline
   - Deploy staging environment
   - Start Phase 1 (Borrower Flow)

3. **Ongoing:**
   - Weekly progress reviews
   - Update documentation as we learn
   - Iterate based on findings

---

## 9. Success Criteria

**Phase 0 (Foundation):**
- ✅ Next.js app deployed to Vercel staging
- ✅ Database migrations running
- ✅ Auth flow functional

**Phase 1 (Borrower Flow):**
- ✅ Borrower can complete full flow end-to-end
- ✅ SMS delivery working
- ✅ Plaid Link functional
- ✅ Persona verification embedded

**Phase 2 (Decisioning):**
- ✅ Offers generated based on credit score
- ✅ Manual review queue populated for edge cases
- ✅ Decision API callable from borrower flow

**Phase 3 (CRM Integration):**
- ✅ Mock FieldRoutes API functional
- ✅ Successful round-trip: Read job → Process → Write back status

**Phase 4 (Lender Integration):**
- ✅ Loan creation working with mock lender
- ✅ Webhook handler receiving funding confirmations
- ✅ Job queue processing successfully

**Phase 5 (FlowOps Admin):**
- ✅ Admin can view applications and loans
- ✅ Manual review queue functional
- ✅ Analytics dashboard showing real-time data

**Phase 6 (Security):**
- ✅ All PII encrypted at rest
- ✅ Audit log capturing all sensitive actions
- ✅ Vulnerability scan passed

**Phase 7 (Testing):**
- ✅ 80%+ test coverage
- ✅ E2E tests passing
- ✅ Load test: Handle 1000 concurrent users

**Phase 8 (Pilot Launch):**
- ✅ Production environment live
- ✅ 2 pilot merchants onboarded
- ✅ First 10 loans funded successfully

---

## 10. Conclusion

This technical specification outlines an aggressive but achievable 12-16 week timeline to build FlowPay MVP. The architecture is designed for rapid iteration with a clear path to scale. By leveraging modern tools (Next.js, Supabase, Clerk) and AI pair programming, we can move fast while maintaining high quality.

**Key Success Factors:**
1. **Start simple:** Mock integrations first, real APIs second
2. **Build decisioning early:** It's the core differentiator
3. **Focus on UX:** Borrower conversion is everything
4. **Don't skip security:** Financial data is high-risk
5. **Iterate based on feedback:** Pilot merchants will guide priorities

Let's build something great! 🚀

---

*End of Technical Specification*
