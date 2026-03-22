# SuprFi Architecture Document

**Version:** v2.0  
**Last Updated:** February 1, 2026  
**Status:** Production

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Technology Choices](#3-technology-choices)
4. [System Components](#4-system-components)
5. [Data Flow](#5-data-flow)
6. [Database Design](#6-database-design)
7. [Authentication Architecture](#7-authentication-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Integration Architecture](#9-integration-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Monitoring & Observability](#11-monitoring--observability)

---

## 1. System Overview

SuprFi is a consumer financing platform designed to seamlessly integrate with home service CRMs. The system enables contractors to offer financing to their customers with minimal friction.

### Design Goals

- **Speed**: Sub-5-minute application flow
- **Security**: Bank-grade encryption and compliance
- **Simplicity**: Monolithic architecture for fast iteration
- **Extensibility**: Easy to add new CRM integrations

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Borrower App   │  │ Borrower Portal │  │   SuprClient    │             │
│  │  /apply/[token] │  │    /portal      │  │    /client      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Multi-step    │  │ • Dashboard     │  │ • Dashboard     │             │
│  │   application   │  │ • Payments      │  │ • Applications  │             │
│  │ • Bank linking  │  │ • Payoff        │  │ • Loans         │             │
│  │ • Offers        │  │ • Magic link    │  │ • Analytics     │             │
│  │ • E-sign        │  │   auth          │  │ • Team mgmt     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │    SuprOps      │  │   Marketing     │                                   │
│  │    /admin       │  │    Site         │                                   │
│  │                 │  │                 │                                   │
│  │ • Applications  │  │ • Landing pages │                                   │
│  │ • Manual review │  │ • Waitlist      │                                   │
│  │ • Collections   │  │ • SEO pages     │                                   │
│  │ • Payments      │  │                 │                                   │
│  │ • User mgmt     │  │                 │                                   │
│  │ • Audit logs    │  │                 │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                         │
│                     Next.js API Routes (/api/v1/*)                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Route Categories                               │  │
│  │                                                                       │  │
│  │  /crm/*           CRM integration (offer-financing, webhook, sync)   │  │
│  │  /borrower/*      Application flow (submit, decision, offers, sign)  │  │
│  │  /portal/*        Borrower portal (dashboard, payments, payoff)      │  │
│  │  /client/*        Contractor portal (apps, loans, team, analytics)   │  │
│  │  /admin/*         Admin operations (apps, review, payments, users)   │  │
│  │  /webhooks/*      External webhooks (Plaid, Jobber)                  │  │
│  │  /cron/*          Scheduled jobs (payments, notifications)           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                                       │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Decisioning   │  │   Plaid Service │  │  Persona Service│             │
│  │                 │  │                 │  │                 │             │
│  │ • Score calc    │  │ • Link tokens   │  │ • Create inquiry│             │
│  │ • Rule engine   │  │ • Token exchange│  │ • Get status    │             │
│  │ • Offer gen     │  │ • Asset reports │  │ • Webhook parse │             │
│  │ • Manual review │  │ • ACH transfers │  │                 │             │
│  │   triggers      │  │ • Balances      │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  SMS Service    │  │  Email Service  │  │  CRM Services   │             │
│  │   (Twilio)      │  │   (Resend)      │  │                 │             │
│  │                 │  │                 │  │ • Jobber        │             │
│  │ • Send SMS      │  │ • Send email    │  │   (OAuth+GQL)   │             │
│  │ • App links     │  │ • Templates     │  │ • FieldRoutes   │             │
│  │                 │  │                 │  │   (REST)        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │ Payment Service │  │ Payoff Service  │                                   │
│  │                 │  │                 │                                   │
│  │ • Initiate ACH  │  │ • Quote calc    │                                   │
│  │ • Track status  │  │ • Process payoff│                                   │
│  │ • Retry logic   │  │                 │                                   │
│  │ • Sync transfers│  │                 │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL (Supabase)                              │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Core Models                                                      │ │  │
│  │  │ Customer, Job, Application, Decision, Offer, Loan, Payment      │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Auth Models                                                      │ │  │
│  │  │ AdminUser, AdminSession, ContractorUser, ContractorSession,     │ │  │
│  │  │ BorrowerSession, BorrowerMagicLink                              │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Audit Models                                                     │ │  │
│  │  │ AuditLog, AdminAuditLog, ContractorAuditLog, CrmSyncLog         │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                                   │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │      Plaid      │  │     Persona     │  │     Twilio      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Bank linking  │  │ • ID verify     │  │ • SMS           │             │
│  │ • ACH payments  │  │ • Document scan │  │ • App links     │             │
│  │ • Asset reports │  │ • Watchlist     │  │                 │             │
│  │ • Identity      │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │     Resend      │  │   CRM Systems   │                                   │
│  │                 │  │                 │                                   │
│  │ • Transactional │  │ • Jobber        │                                   │
│  │   emails        │  │ • FieldRoutes   │                                   │
│  │ • React         │  │ • ServiceTitan  │                                   │
│  │   templates     │  │   (planned)     │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Monolithic Simplicity
- Single Next.js application for all functionality
- No separate microservices or message queues
- Easier to develop, debug, and deploy

### 2.2 API-First Design
- All services expose REST APIs
- Consistent error handling and response formats
- Versioned endpoints (`/api/v1/`)
- Zod validation on all endpoints

### 2.3 Security by Default
- HTTPS only (TLS 1.3)
- HTTP-only secure cookies for sessions
- Audit logging for all sensitive actions
- RBAC for admin operations

### 2.4 Database as Source of Truth
- All state stored in PostgreSQL
- JSONB for flexible data (Plaid snapshots, rule hits)
- Audit trail for compliance

### 2.5 Graceful Integration
- Webhooks for real-time updates from external services
- Retry logic with exponential backoff
- Mock implementations for development

---

## 3. Technology Choices

### 3.1 Framework & Runtime

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Framework | Next.js 15 | SSR, API routes, App Router, Vercel deployment |
| Runtime | Node.js 20+ | TypeScript support, async/await, Vercel functions |
| Language | TypeScript 5 | Type safety, better DX, fewer runtime errors |
| Styling | TailwindCSS 3.4 | Utility-first, responsive, fast iteration |

### 3.2 Database & ORM

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Database | PostgreSQL 15 | ACID compliance, JSONB, mature ecosystem |
| Hosting | Supabase | Managed Postgres, auto-backups, connection pooling |
| ORM | Prisma 6 | Type-safe queries, migrations, great DX |
| Pooling | Prisma Accelerate | Connection pooling for serverless |

### 3.3 Authentication

| Portal | Technology | Rationale |
|--------|------------|-----------|
| Admin | Custom sessions | Full control, RBAC, audit logging |
| Contractor | Custom sessions | Same as admin, different role hierarchy |
| Borrower App | JWT tokens | Stateless, URL-embeddable |
| Borrower Portal | Magic links | Passwordless, better UX |

### 3.4 External Services

| Service | Provider | Rationale |
|---------|----------|-----------|
| Bank Linking | Plaid | Industry standard, comprehensive API |
| ACH Payments | Plaid Transfer | Integrated with bank linking |
| KYC | Persona | Document verification, good UX |
| SMS | Twilio | Reliable, global coverage |
| Email | Resend | Modern API, React templates |
| CRM | Jobber, FieldRoutes | Target market integration |

---

## 4. System Components

### 4.1 Frontend Portals

#### Borrower Application (`/apply/[token]`)
- Multi-step form with progress indicator
- Plaid Link for bank account connection
- Persona embedded flow for KYC
- Offer comparison and selection
- E-signature collection

#### Borrower Portal (`/portal`)
- Loan dashboard with balance and next payment
- Payment history and schedule
- Early payoff calculator
- Magic link authentication

#### SuprClient (`/client`)
- Contractor dashboard with stats
- Application list and details
- Active loans overview
- Team management with role-based access
- Analytics and reporting
- QR code generation for financing links

#### SuprOps (`/admin`)
- Application management with filters
- Manual review queue with priority
- Collections dashboard for delinquent loans
- Payment monitoring and retry
- Contractor management
- Admin user management
- Audit log viewer

### 4.2 API Layer

#### CRM Integration (`/api/v1/crm/*`)
```
POST /offer-financing     Create application, send SMS
POST /webhook             Receive CRM callbacks
GET  /sync-status         Check sync status
```

#### Borrower Flow (`/api/v1/borrower/[token]/*`)
```
POST /submit              Submit application for decisioning
GET  /decision            Fetch decision and offers
POST /offers/select       Select an offer
GET  /loan                Get loan details
GET  /agreement           Fetch loan agreement
POST /agreement/sign      Sign agreement
POST /plaid/link-token    Create Plaid Link token
POST /plaid/exchange      Exchange public token
POST /plaid/asset-report  Request asset report
POST /persona/create-inquiry  Start KYC
POST /persona/complete    Complete KYC
POST /bank/manual         Manual bank entry
```

#### Borrower Portal (`/api/v1/portal/*`)
```
POST /auth/send-magic-link  Send magic link
POST /auth/verify-magic-link  Verify and create session
GET  /auth/me             Get current user
POST /auth/logout         End session
GET  /dashboard           Loan summary
GET  /payments            Payment history
GET  /loan/payoff-quote   Get payoff amount
POST /loan/payoff         Process early payoff
```

#### Contractor Portal (`/api/v1/client/*`)
```
POST /auth/login          Login
POST /auth/signup         Signup
POST /auth/forgot-password  Reset password
GET  /auth/me             Get current user
GET  /dashboard           Stats
GET  /applications        List applications
GET  /applications/[id]   Application detail
POST /send-link           Send financing link
POST /generate-qr         Generate QR code
GET  /loans               Active loans
GET  /team                Team members
POST /team/invite         Invite team member
GET  /analytics           Analytics data
```

#### Admin Operations (`/api/v1/admin/*`)
```
POST /auth/login          Login
POST /auth/logout         Logout
GET  /auth/me             Get current user
GET  /dashboard           Dashboard stats
GET  /applications        List applications
GET  /applications/[id]   Application detail
POST /applications/[id]/approve   Approve
POST /applications/[id]/decline   Decline
GET  /manual-review       Review queue
PUT  /manual-review/[id]  Resolve review
GET  /payments            Payment list
POST /payments/[id]/retry Retry payment
POST /payments/[id]/mark-paid  Mark as paid
GET  /collections         Delinquent loans
GET  /collections/stats   Collection stats
POST /collections/[id]/notes  Add note
GET  /contractors         Contractor list
GET  /users               Admin user list
GET  /audit               Audit logs
GET  /waitlist            Waitlist entries
```

#### Webhooks (`/api/v1/webhooks/*`)
```
POST /plaid               Plaid transfer status updates
POST /jobber              Jobber quote/job events
```

#### Cron Jobs (`/api/v1/cron/*`)
```
POST /process-payments    Daily ACH processing
POST /send-notifications  Daily reminders
```

### 4.3 Service Layer

#### Decisioning Service
- **Input:** Application with Plaid data
- **Process:** Score calculation, rule evaluation, manual review triggers
- **Output:** Decision (approved/declined/manual_review) + offers

#### Plaid Service
- **Link tokens:** Create for bank linking
- **Token exchange:** Convert public → access token
- **Account info:** Balance, transactions
- **Asset reports:** 90-day bank statements
- **Identity verification:** KYC via Plaid IDV
- **ACH transfers:** Debit payments from linked accounts

#### Persona Service
- **Create inquiry:** Start KYC verification
- **Get inquiry:** Poll for completion
- **Webhook parsing:** Handle status updates

#### Payment Service
- **Authorization:** Pre-check if transfer will succeed
- **Initiation:** Create ACH debit transfer
- **Status sync:** Poll pending transfers
- **Retry logic:** Schedule retries with backoff

#### CRM Services
- **Jobber:** OAuth flow, GraphQL queries, webhook handling
- **FieldRoutes:** REST API, status sync

---

## 5. Data Flow

### 5.1 Borrower Application Flow

```
1. CRM TRIGGER
   ┌─────────────────────────────────────────────────────────┐
   │ Contractor triggers financing in CRM                    │
   │                    OR                                   │
   │ Contractor sends link via SuprClient                    │
   │                    OR                                   │
   │ Jobber webhook on QUOTE_CREATE                          │
   └────────────────────────┬────────────────────────────────┘
                            ▼
2. APPLICATION CREATION
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/crm/offer-financing                        │
   │ • Create Customer record (or update)                    │
   │ • Create Job record                                     │
   │ • Create Application with JWT token                     │
   │ • Send SMS with link via Twilio                         │
   │ • Create AuditLog entry                                 │
   └────────────────────────┬────────────────────────────────┘
                            ▼
3. BORROWER OPENS LINK
   ┌─────────────────────────────────────────────────────────┐
   │ GET /apply/{token}                                      │
   │ • Validate JWT token (check expiry)                     │
   │ • Fetch Application with Customer, Job                  │
   │ • Render multi-step form with prefilled data            │
   └────────────────────────┬────────────────────────────────┘
                            ▼
4. BANK LINKING (Plaid)
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/borrower/{token}/plaid/link-token          │
   │ • Create Plaid Link token                               │
   │                                                         │
   │ [Borrower completes Plaid Link UI]                      │
   │                                                         │
   │ POST /api/v1/borrower/{token}/plaid/exchange            │
   │ • Exchange public_token for access_token                │
   │ • Fetch account info, balances                          │
   │ • Store in Application.plaidData                        │
   │                                                         │
   │ POST /api/v1/borrower/{token}/plaid/asset-report        │
   │ • Request 90-day asset report (optional)                │
   └────────────────────────┬────────────────────────────────┘
                            ▼
5. KYC VERIFICATION (Persona)
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/borrower/{token}/persona/create-inquiry    │
   │ • Create Persona inquiry                                │
   │ • Return session token for embedded flow                │
   │                                                         │
   │ [Borrower completes ID verification in Persona UI]      │
   │                                                         │
   │ POST /api/v1/borrower/{token}/persona/complete          │
   │ • Mark KYC complete                                     │
   │ • Store result in Application.personaData               │
   └────────────────────────┬────────────────────────────────┘
                            ▼
6. APPLICATION SUBMISSION
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/borrower/{token}/submit                    │
   │ • Validate all consents                                 │
   │ • Update Customer with complete info                    │
   │ • Run Decisioning Engine:                               │
   │   - Calculate score from Plaid data                     │
   │   - Evaluate risk factors                               │
   │   - Check for manual review triggers                    │
   │ • Create Decision record                                │
   │ • Generate Offers (if approved)                         │
   │ • Create ManualReview (if needed)                       │
   │ • Create AuditLog entry                                 │
   └────────────────────────┬────────────────────────────────┘
                            ▼
7. OFFER SELECTION
   ┌─────────────────────────────────────────────────────────┐
   │ GET /api/v1/borrower/{token}/decision                   │
   │ • Fetch Decision with Offers                            │
   │                                                         │
   │ [Borrower reviews and selects offer]                    │
   │                                                         │
   │ POST /api/v1/borrower/{token}/offers/select             │
   │ • Mark selected offer                                   │
   │ • Update Application status                             │
   └────────────────────────┬────────────────────────────────┘
                            ▼
8. AGREEMENT SIGNING
   ┌─────────────────────────────────────────────────────────┐
   │ GET /api/v1/borrower/{token}/agreement                  │
   │ • Generate loan agreement with terms                    │
   │                                                         │
   │ POST /api/v1/borrower/{token}/agreement/sign            │
   │ • Capture e-signature                                   │
   │ • Create Loan record                                    │
   │ • Generate payment schedule                             │
   │ • Create Payment records                                │
   │ • Update Application status to 'funded'                 │
   │ • Update Loan status to 'funded'                        │
   └────────────────────────┬────────────────────────────────┘
                            ▼
9. POST-FUNDING
   ┌─────────────────────────────────────────────────────────┐
   │ • Send confirmation SMS/email                           │
   │ • Sync status to CRM (if applicable)                    │
   │ • Borrower can access portal at /portal                 │
   └─────────────────────────────────────────────────────────┘
```

### 5.2 Payment Processing Flow

```
1. DAILY CRON JOB (11:00 UTC)
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/cron/process-payments                      │
   │ • Verify CRON_SECRET                                    │
   │ • Sync pending transfers with Plaid                     │
   └────────────────────────┬────────────────────────────────┘
                            ▼
2. FIND DUE PAYMENTS
   ┌─────────────────────────────────────────────────────────┐
   │ Query: Payments due today or overdue                    │
   │ • status = 'scheduled'                                  │
   │ • dueDate <= today                                      │
   │ • loan.status in ['funded', 'repaying']                 │
   └────────────────────────┬────────────────────────────────┘
                            ▼
3. PROCESS EACH PAYMENT
   ┌─────────────────────────────────────────────────────────┐
   │ For each payment:                                       │
   │ • Get Plaid credentials from loan.application.plaidData │
   │ • Update status to 'pending'                            │
   │                                                         │
   │ Authorize transfer:                                     │
   │ • Check if transfer will likely succeed                 │
   │                                                         │
   │ If authorized:                                          │
   │ • Create ACH debit transfer                             │
   │ • Store plaidTransferId                                 │
   │ • Update status to 'processing'                         │
   │                                                         │
   │ If failed:                                              │
   │ • Update status to 'failed'                             │
   │ • Store failureReason, failureCode                      │
   │ • Schedule retry if retryable                           │
   └────────────────────────┬────────────────────────────────┘
                            ▼
4. WEBHOOK UPDATES
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/v1/webhooks/plaid                             │
   │ • Receive TRANSFER_EVENTS_UPDATE                        │
   │ • Find payment by plaidTransferId                       │
   │                                                         │
   │ If settled:                                             │
   │ • Update payment status to 'completed'                  │
   │ • Update loan status (repaying → paid_off if all done)  │
   │ • Reset loan.daysOverdue to 0                           │
   │                                                         │
   │ If failed/returned:                                     │
   │ • Update payment status to 'failed'                     │
   │ • Store failure reason and code                         │
   │ • Schedule retry or mark requiresAction                 │
   │ • Update loan.daysOverdue                               │
   │ • If 60+ days overdue: loan.status = 'defaulted'        │
   └─────────────────────────────────────────────────────────┘
```

### 5.3 Manual Review Flow

```
1. APPLICATION FLAGGED
   ┌─────────────────────────────────────────────────────────┐
   │ During decisioning, check triggers:                     │
   │ • Borderline score (550-620)                            │
   │ • Manual bank entry with >$3k loan                      │
   │ • High loan amount (>$15k)                              │
   │ • Multiple risk factors but approved                    │
   │ • No balance data                                       │
   │                                                         │
   │ Create ManualReview record with:                        │
   │ • reason (thin_file, borderline_score, etc.)            │
   │ • priority (1=high, 2=medium, 3=low)                    │
   │ • status = 'pending'                                    │
   └────────────────────────┬────────────────────────────────┘
                            ▼
2. ADMIN REVIEWS
   ┌─────────────────────────────────────────────────────────┐
   │ GET /api/v1/admin/manual-review                         │
   │ • Fetch pending reviews sorted by priority              │
   │                                                         │
   │ Admin reviews:                                          │
   │ • Customer information                                  │
   │ • Plaid data (balances, transactions)                   │
   │ • Persona KYC results                                   │
   │ • Risk factors and score breakdown                      │
   └────────────────────────┬────────────────────────────────┘
                            ▼
3. RESOLUTION
   ┌─────────────────────────────────────────────────────────┐
   │ PUT /api/v1/admin/manual-review/{id}                    │
   │                                                         │
   │ Options:                                                │
   │ • resolution = 'approved'                               │
   │   - Generate offers                                     │
   │   - Update decision status                              │
   │   - Notify borrower                                     │
   │                                                         │
   │ • resolution = 'declined'                               │
   │   - Update decision status                              │
   │   - Notify borrower                                     │
   │                                                         │
   │ • resolution = 'approved_with_conditions'               │
   │   - Add conditions (e.g., down payment)                 │
   │   - Generate modified offers                            │
   │                                                         │
   │ Update ManualReview:                                    │
   │ • status = 'resolved'                                   │
   │ • resolvedBy, resolvedAt, notes                         │
   └─────────────────────────────────────────────────────────┘
```

---

## 6. Database Design

### 6.1 Entity Relationships

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CORE FINANCING FLOW                              │
│                                                                          │
│  Customer ────┬──── Job ────┬──── Application ──── Decision ────┬── Offer│
│      │        │             │          │               │         │       │
│      │        │             │          │               │         │       │
│      │        └─ Contractor │          └── Loan ───────┤         │       │
│      │             Job      │               │          │         │       │
│      │                      │               │          └─ Manual │       │
│      │                      │               │             Review │       │
│      │                      │               │                    │       │
│      │                      │               ├── Payment          │       │
│      │                      │               │                    │       │
│      │                      │               └── Collection       │       │
│      │                      │                    Note            │       │
│      │                      │                                    │       │
│      ├── BorrowerSession    │                                    │       │
│      │                      │                                    │       │
│      └── BorrowerMagicLink  │                                    │       │
│                             │                                    │       │
└─────────────────────────────┴────────────────────────────────────┴───────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         ADMIN SYSTEM                                     │
│                                                                          │
│  AdminUser ────┬──── AdminSession                                        │
│                │                                                         │
│                └──── AdminAuditLog                                       │
│                                                                          │
│  PasswordReset                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                       CONTRACTOR SYSTEM                                  │
│                                                                          │
│  Contractor ────┬──── ContractorUser ────┬──── ContractorSession         │
│                 │                        │                               │
│                 │                        └──── ContractorAuditLog        │
│                 │                                                        │
│                 └──── ContractorJob                                      │
│                                                                          │
│  ContractorPasswordReset                                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                       INTEGRATION & AUDIT                                │
│                                                                          │
│  CrmConnection        CrmSyncLog        AuditLog        PricingRule      │
│                                                                          │
│  Waitlist                                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Key Indexes

```sql
-- Customer lookups
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_crm_id ON customers(crm_customer_id);

-- Application queries
CREATE INDEX idx_applications_token ON applications(token);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Decision queries
CREATE INDEX idx_decisions_status ON decisions(decision_status);
CREATE INDEX idx_decisions_decided_at ON decisions(decided_at);

-- Payment processing
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_next_retry ON payments(next_retry_date);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);

-- Loan queries
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_days_overdue ON loans(days_overdue);

-- Manual review queue
CREATE INDEX idx_manual_review_status ON manual_reviews(status);
CREATE INDEX idx_manual_review_priority ON manual_reviews(priority);

-- Audit trails
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 7. Authentication Architecture

### 7.1 Session-Based Auth (Admin & Contractor)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SESSION FLOW                                      │
│                                                                          │
│  1. LOGIN                                                                │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ POST /api/v1/admin/auth/login                                   │ │
│     │ • Verify email/password (bcrypt)                                │ │
│     │ • Generate secure token (nanoid)                                │ │
│     │ • Create Session record with expiry                             │ │
│     │ • Set HTTP-only cookie                                          │ │
│     │ • Log to AdminAuditLog                                          │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  2. REQUEST VALIDATION                                                   │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ Middleware checks:                                              │ │
│     │ • Cookie present?                                               │ │
│     │ • Session exists and not expired?                               │ │
│     │ • User still active?                                            │ │
│     │ • Inactivity timeout not exceeded? (30 min)                     │ │
│     │ • Update lastActiveAt                                           │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  3. LOGOUT                                                               │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ POST /api/v1/admin/auth/logout                                  │ │
│     │ • Delete session from database                                  │ │
│     │ • Clear cookie                                                  │ │
│     │ • Log to AdminAuditLog                                          │ │
│     └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 RBAC (Admin Roles)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY                                    │
│                                                                          │
│  god (level 4)                                                           │
│   │                                                                      │
│   ├── Full access to everything                                          │
│   ├── Audit log viewer                                                   │
│   ├── User management (all roles)                                        │
│   └── Force logout users                                                 │
│                                                                          │
│  admin (level 3)                                                         │
│   │                                                                      │
│   ├── Manage ops and viewers                                             │
│   ├── Contractor management                                              │
│   ├── User creation (ops/viewer only)                                    │
│   └── All ops permissions                                                │
│                                                                          │
│  ops (level 2)                                                           │
│   │                                                                      │
│   ├── Approve/decline applications                                       │
│   ├── Update records                                                     │
│   ├── Resolve manual reviews                                             │
│   └── All viewer permissions                                             │
│                                                                          │
│  viewer (level 1)                                                        │
│   │                                                                      │
│   ├── View applications                                                  │
│   ├── View manual review queue                                           │
│   ├── View waitlist                                                      │
│   └── View contractors                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 JWT Token Auth (Borrower Application)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JWT FLOW                                          │
│                                                                          │
│  1. TOKEN GENERATION                                                     │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ When application created:                                       │ │
│     │ • Generate JWT with claims:                                     │ │
│     │   - applicationId                                               │ │
│     │   - customerId                                                  │ │
│     │   - jobId                                                       │ │
│     │   - exp (24 hours)                                              │ │
│     │ • Store token in Application record                             │ │
│     │ • Send via SMS link                                             │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  2. TOKEN VALIDATION                                                     │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ On each borrower API request:                                   │ │
│     │ • Extract token from URL param                                  │ │
│     │ • Verify JWT signature                                          │ │
│     │ • Check expiration                                              │ │
│     │ • Fetch application and verify status                           │ │
│     └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Magic Link Auth (Borrower Portal)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MAGIC LINK FLOW                                   │
│                                                                          │
│  1. REQUEST MAGIC LINK                                                   │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ POST /api/v1/portal/auth/send-magic-link                        │ │
│     │ • Find customer by email/phone                                  │ │
│     │ • Generate secure token                                         │ │
│     │ • Create BorrowerMagicLink (15 min expiry)                      │ │
│     │ • Send via email/SMS                                            │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  2. VERIFY MAGIC LINK                                                    │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │ POST /api/v1/portal/auth/verify-magic-link                      │ │
│     │ • Find magic link by token                                      │ │
│     │ • Check not expired and not used                                │ │
│     │ • Mark magic link as used                                       │ │
│     │ • Create BorrowerSession (7 day expiry)                         │ │
│     │ • Set HTTP-only cookie                                          │ │
│     └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Architecture

### 8.1 Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 1: NETWORK                                                         │
│ • HTTPS only (TLS 1.3)                                                   │
│ • Vercel Edge Network (DDoS protection)                                  │
│ • CORS configured for known domains                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 2: APPLICATION                                                     │
│ • Rate limiting per endpoint                                             │
│ • Input validation (Zod schemas)                                         │
│ • SQL injection protection (Prisma parameterized queries)                │
│ • XSS protection (React auto-escaping)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 3: AUTHENTICATION                                                  │
│ • Password hashing (bcrypt)                                              │
│ • Secure session tokens (nanoid)                                         │
│ • HTTP-only, Secure, SameSite cookies                                    │
│ • Session expiration and inactivity timeout                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 4: AUTHORIZATION                                                   │
│ • Role-Based Access Control (RBAC)                                       │
│ • Principle of least privilege                                           │
│ • Resource ownership validation                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 5: DATA                                                            │
│ • Encryption at rest (Supabase)                                          │
│ • Encryption in transit (TLS)                                            │
│ • Sensitive data in JSONB (plaidData, creditData)                        │
│ • PII access audit logging                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 6: MONITORING                                                      │
│ • Comprehensive audit logs                                               │
│ • CRM sync logs                                                          │
│ • Admin action logs                                                      │
│ • Webhook signature verification                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Webhook Security

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLAID WEBHOOK                                     │
│                                                                          │
│  POST /api/v1/webhooks/plaid                                             │
│  Headers: plaid-verification: {jwt}                                      │
│                                                                          │
│  Verification:                                                           │
│  • Verify JWT signature using Plaid's public key                         │
│  • Check timestamp to prevent replay attacks                             │
│  • Validate webhook type and transfer_id                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        JOBBER WEBHOOK                                    │
│                                                                          │
│  POST /api/v1/webhooks/jobber                                            │
│  Headers: X-Jobber-Hmac-SHA256: {signature}                              │
│                                                                          │
│  Verification:                                                           │
│  • Compute HMAC-SHA256 of payload with client secret                     │
│  • Compare with header signature (timing-safe)                           │
│  • Verify account has active CRM connection                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Integration Architecture

### 9.1 Plaid Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLAID PRODUCTS USED                               │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │      Auth       │  │   Transactions  │  │     Assets      │         │
│  │                 │  │                 │  │                 │         │
│  │ • Account/      │  │ • Transaction   │  │ • 90-day bank   │         │
│  │   routing #s    │  │   history       │  │   statements    │         │
│  │ • For ACH       │  │ • Income        │  │ • Historical    │         │
│  │   payments      │  │   detection     │  │   balances      │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │    Transfer     │  │ Identity Verify │                               │
│  │                 │  │                 │                               │
│  │ • ACH debits    │  │ • KYC/AML       │                               │
│  │ • Payment       │  │ • Document-     │                               │
│  │   processing    │  │   free verify   │                               │
│  │ • Status        │  │ • Optional      │                               │
│  │   webhooks      │  │                 │                               │
│  └─────────────────┘  └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 CRM Integration Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRM INTEGRATION FLOW                              │
│                                                                          │
│  INBOUND (CRM → SuprFi)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 1. Webhook received (e.g., QUOTE_CREATE)                            ││
│  │ 2. Verify signature                                                 ││
│  │ 3. Find CRM connection by accountId                                 ││
│  │ 4. Fetch additional data via API (GraphQL/REST)                     ││
│  │ 5. Create/update local records (Customer, Job, Application)         ││
│  │ 6. Log to CrmSyncLog                                                ││
│  │ 7. Send SMS to customer                                             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  OUTBOUND (SuprFi → CRM)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 1. Event occurs (application approved, loan funded)                 ││
│  │ 2. Get CRM connection and valid access token                        ││
│  │ 3. Refresh token if expired                                         ││
│  │ 4. Make API call to update CRM                                      ││
│  │ 5. Retry with exponential backoff on failure                        ││
│  │ 6. Log to CrmSyncLog                                                ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Deployment Architecture

### 10.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VERCEL                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Edge Network (CDN)                              │  │
│  │  • Static assets                                                   │  │
│  │  • Server-rendered pages                                           │  │
│  │  • Global distribution                                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   Serverless Functions                             │  │
│  │  • API Routes (/api/v1/*)                                          │  │
│  │  • Auto-scaling                                                    │  │
│  │  • Cold start optimization                                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Cron Jobs                                     │  │
│  │  • process-payments (11:00 UTC)                                    │  │
│  │  • send-notifications (14:00 UTC)                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                             │  │
│  │  • 23 tables                                                       │  │
│  │  • Automatic backups                                               │  │
│  │  • Encryption at rest                                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Prisma Accelerate                               │  │
│  │  • Connection pooling                                              │  │
│  │  • Query caching                                                   │  │
│  │  • Serverless-optimized                                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT FLOW                                   │
│                                                                          │
│  1. Push to Branch                                                       │
│     └─→ PR created                                                       │
│                                                                          │
│  2. Preview Deployment                                                   │
│     └─→ Vercel builds preview                                            │
│     └─→ Unique URL for testing                                           │
│                                                                          │
│  3. Merge to Main                                                        │
│     └─→ Production deployment triggered                                  │
│     └─→ Database migrations run (prisma generate)                        │
│     └─→ Build and deploy                                                 │
│                                                                          │
│  4. Post-Deploy                                                          │
│     └─→ Automatic health checks                                          │
│     └─→ Instant rollback if needed                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOG CATEGORIES                                    │
│                                                                          │
│  Application Logs                                                        │
│  • API request/response                                                  │
│  • Service operations                                                    │
│  • Error details                                                         │
│                                                                          │
│  Audit Logs (Database)                                                   │
│  • AuditLog: General compliance (applications, decisions)                │
│  • AdminAuditLog: Admin actions (login, approve, user mgmt)              │
│  • ContractorAuditLog: Contractor actions (send link, view app)          │
│  • CrmSyncLog: CRM integration operations                                │
│                                                                          │
│  Webhook Logs                                                            │
│  • Plaid webhook events                                                  │
│  • Jobber webhook events                                                 │
│  • Signature verification results                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Key Metrics

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS METRICS                                  │
│                                                                          │
│  Applications                                                            │
│  • Total applications (daily, weekly, monthly)                           │
│  • Approval rate                                                         │
│  • Average loan amount                                                   │
│  • Average time to decision                                              │
│  • Conversion rate (initiated → funded)                                  │
│                                                                          │
│  Loans                                                                   │
│  • Active loans                                                          │
│  • Total funded amount                                                   │
│  • Delinquency rate                                                      │
│  • Days overdue distribution                                             │
│                                                                          │
│  Payments                                                                │
│  • Success rate                                                          │
│  • Failure rate by reason                                                │
│  • Retry success rate                                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM METRICS                                    │
│                                                                          │
│  Performance                                                             │
│  • API response times                                                    │
│  • Database query times                                                  │
│  • External API latency (Plaid, Persona)                                 │
│                                                                          │
│  Reliability                                                             │
│  • Error rates by endpoint                                               │
│  • Webhook delivery success                                              │
│  • Cron job completion                                                   │
│                                                                          │
│  Integration Health                                                      │
│  • Plaid API availability                                                │
│  • Persona API availability                                              │
│  • CRM sync success rate                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*End of Architecture Document*
