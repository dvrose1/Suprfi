# SuprFi Technical Specification

**Version:** v2.0  
**Last Updated:** February 1, 2026  
**Status:** Production  

---

## Executive Summary

SuprFi is a consumer financing platform for home service businesses. This document outlines the technical implementation of the production system.

**Key Facts:**
- **Status:** Production-ready with active pilot customers
- **Tech Stack:** Next.js 15, Prisma, Supabase, Custom Auth, Plaid, Persona
- **Deployment:** Vercel (serverless)
- **Database:** PostgreSQL via Supabase with Prisma ORM

---

## 1. Technology Stack

### 1.1 Core Stack

#### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 3.4
- **Deployment:** Vercel Edge Network

#### Backend
- **Runtime:** Node.js 20+ (Vercel Serverless Functions)
- **Framework:** Next.js API Routes
- **Validation:** Zod 4.1
- **ORM:** Prisma 6.18

#### Database
- **Database:** PostgreSQL 15 (Supabase)
- **Connection Pooling:** Prisma Accelerate
- **Migrations:** Prisma Migrate

#### Authentication
- **Admin (SuprOps):** Custom session-based auth with bcrypt
- **Contractor (SuprClient):** Custom session-based auth with bcrypt
- **Borrower Application:** JWT tokens (24-hour expiry)
- **Borrower Portal:** Magic link authentication

### 1.2 Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| **Plaid** | Bank linking, Identity, Assets, ACH Transfers | Production |
| **Persona** | Document-based KYC | Production |
| **Twilio** | SMS notifications | Production |
| **Resend** | Transactional email | Production |
| **Jobber** | CRM integration (OAuth + GraphQL) | Production |
| **FieldRoutes** | CRM integration (REST API) | Planned |

### 1.3 Removed Dependencies
The following were in the original spec but not implemented:
- ~~Clerk~~ → Custom auth system built
- ~~BullMQ/Redis~~ → Using Vercel Cron instead
- ~~Experian~~ → Using Plaid for credit/cash flow analysis
- ~~Separate microservices~~ → Monolithic Next.js app

---

## 2. System Architecture

### 2.1 Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing pages
│   │   ├── page.tsx              # Homepage
│   │   ├── contractors/          # Contractor landing
│   │   ├── homeowners/           # Homeowner landing
│   │   ├── how-it-works/         # Product explanation
│   │   ├── about/, contact/, rates/, privacy/, terms/
│   │   └── waitlist/             # Waitlist signup
│   │
│   ├── apply/[token]/            # Borrower application flow
│   │   ├── page.tsx              # Multi-step form
│   │   ├── offers/               # View financing offers
│   │   ├── agreement/            # E-sign agreement
│   │   └── success/              # Confirmation
│   │
│   ├── portal/                   # Borrower self-service
│   │   ├── page.tsx              # Dashboard
│   │   ├── payments/             # Payment history
│   │   ├── payoff/               # Early payoff
│   │   └── login/, magic-link/   # Auth
│   │
│   ├── client/                   # Contractor portal (SuprClient)
│   │   ├── page.tsx              # Dashboard
│   │   ├── applications/         # Sent applications
│   │   ├── loans/                # Active loans
│   │   ├── analytics/            # Performance metrics
│   │   ├── team/                 # Team management
│   │   └── settings/             # Account settings
│   │
│   ├── admin/                    # Internal admin (SuprOps)
│   │   ├── page.tsx              # Dashboard
│   │   ├── applications/         # Application management
│   │   ├── manual-review/        # Review queue
│   │   ├── collections/          # Delinquent loans
│   │   ├── payments/             # Payment monitoring
│   │   ├── contractors/          # Contractor management
│   │   ├── users/                # Admin user management
│   │   ├── waitlist/             # Waitlist management
│   │   └── audit/                # Audit logs
│   │
│   └── api/v1/                   # REST API
│       ├── crm/                  # CRM integration endpoints
│       ├── borrower/[token]/     # Borrower flow endpoints
│       ├── portal/               # Borrower portal endpoints
│       ├── client/               # Contractor portal endpoints
│       ├── admin/                # Admin endpoints
│       ├── webhooks/             # Webhook receivers
│       └── cron/                 # Scheduled jobs
│
├── components/                   # React components
│   ├── borrower/                 # Application form components
│   ├── client/                   # Contractor dashboard components
│   ├── marketing/                # Marketing page components
│   └── ui/                       # Shared UI components
│
└── lib/                          # Backend services
    ├── prisma.ts                 # Prisma client singleton
    ├── auth/                     # Auth utilities
    │   ├── session.ts            # Admin sessions
    │   ├── contractor-session.ts # Contractor sessions
    │   ├── borrower-session.ts   # Borrower sessions
    │   ├── roles.ts              # RBAC definitions
    │   └── password.ts           # bcrypt utilities
    ├── services/                 # Business logic
    │   ├── plaid.ts              # Plaid API client
    │   ├── plaid-transfer.ts     # ACH payments
    │   ├── persona.ts            # KYC client
    │   ├── decisioning.ts        # Credit decisioning
    │   ├── sms.ts                # Twilio SMS
    │   ├── payoff-calculator.ts  # Early payoff
    │   └── crm/                  # CRM integrations
    │       ├── jobber.ts         # Jobber OAuth + GraphQL
    │       └── fieldroutes.ts    # FieldRoutes REST
    ├── email/                    # Email service
    │   └── resend.ts             # Resend API
    └── utils/                    # Utilities
        ├── token.ts              # JWT utilities
        └── format.ts             # Formatting helpers
```

### 2.2 Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │ Borrower App │ │Borrower Portal│ │SuprClient   │ │SuprOps  ││
│  │ /apply/[token]│ │ /portal      │ │/client      │ │/admin   ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js API Routes)              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    /api/v1/*                                 ││
│  │  • CRM endpoints (/crm/*)                                   ││
│  │  • Borrower endpoints (/borrower/[token]/*)                 ││
│  │  • Portal endpoints (/portal/*)                             ││
│  │  • Client endpoints (/client/*)                             ││
│  │  • Admin endpoints (/admin/*)                               ││
│  │  • Webhook receivers (/webhooks/*)                          ││
│  │  • Cron jobs (/cron/*)                                      ││
│  └─────────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │Decisioning │ │   Plaid    │ │  Persona   │ │CRM Sync      │ │
│  │ Service    │ │  Service   │ │  Service   │ │(Jobber/FR)   │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │SMS Service │ │Email Svc   │ │Payment Svc │ │Payoff Calc   │ │
│  │ (Twilio)   │ │ (Resend)   │ │(Plaid Xfer)│ │              │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              PostgreSQL (Supabase)                          ││
│  │                                                              ││
│  │  Core: Customer, Job, Application, Decision, Offer, Loan    ││
│  │  Payments: Payment, CollectionNote                          ││
│  │  Admin: AdminUser, AdminSession, AdminAuditLog              ││
│  │  Contractor: Contractor, ContractorUser, ContractorSession  ││
│  │  Borrower: BorrowerSession, BorrowerMagicLink               ││
│  │  Integration: CrmConnection, CrmSyncLog                     ││
│  │  Audit: AuditLog, PricingRule, ManualReview                 ││
│  │  Marketing: Waitlist                                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Model Overview (23 Tables)

#### Core Entities
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Customer` | Borrower PII | firstName, lastName, email, phone, financingOptIn |
| `Job` | Service estimate from CRM | estimateAmount, serviceType, crmJobId |

#### Financing Workflow
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Application` | Financing application | token, status, plaidData, personaData, creditData |
| `Decision` | Credit decision | score, decisionStatus, ruleHits, evaluatorVersion |
| `Offer` | Financing terms | termMonths, apr, monthlyPayment, selected |
| `Loan` | Funded loan | fundedAmount, status, daysOverdue |

#### Payment Tracking
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Payment` | ACH payment record | paymentNumber, amount, status, plaidTransferId |
| `CollectionNote` | Collection activity notes | note, noteType, createdBy |

#### Admin System
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `AdminUser` | Internal admin accounts | email, passwordHash, role |
| `AdminSession` | Admin sessions | token, expiresAt, rememberMe |
| `AdminAuditLog` | Admin action audit | action, targetType, metadata |
| `PasswordReset` | Password reset tokens | token, expiresAt, usedAt |

#### Contractor System
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Contractor` | Contractor business | businessName, apiKey, tier |
| `ContractorUser` | Contractor team | email, role, inviteToken |
| `ContractorSession` | Contractor sessions | token, expiresAt |
| `ContractorAuditLog` | Contractor action audit | action, metadata |
| `ContractorPasswordReset` | Password reset tokens | token, expiresAt |
| `ContractorJob` | Job-contractor link | sendMethod, initiatedBy |

#### Borrower Portal
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `BorrowerSession` | Portal sessions | token, expiresAt |
| `BorrowerMagicLink` | Magic link tokens | token, expiresAt, usedAt |

#### Integration & Audit
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `CrmConnection` | OAuth tokens for CRMs | accessToken, refreshToken, expiresAt |
| `CrmSyncLog` | CRM sync audit trail | direction, status, errorMessage |
| `AuditLog` | General compliance audit | entityType, actor, action, payload |
| `PricingRule` | Dynamic pricing rules | predicate, pricingAdjustments |
| `ManualReview` | Manual review queue | reason, priority, resolution |
| `Waitlist` | Waitlist signups | type, email, status |

### 3.2 Key Relationships

```
Customer ─┬─→ Job ─┬─→ Application ─→ Decision ─┬─→ Offer
          │        │                            │
          │        └─→ ContractorJob            └─→ ManualReview
          │
          └─→ BorrowerSession
          └─→ BorrowerMagicLink

Application ─→ Loan ─┬─→ Payment
                     └─→ CollectionNote

Contractor ─→ ContractorUser ─→ ContractorSession
                             └─→ ContractorAuditLog

AdminUser ─→ AdminSession
          └─→ AdminAuditLog
```

---

## 4. Authentication Architecture

### 4.1 Three Auth Systems

| Portal | Auth Method | Session Storage | TTL |
|--------|-------------|-----------------|-----|
| SuprOps (Admin) | Email/password | `AdminSession` | 24h (30 days if "remember me") |
| SuprClient (Contractor) | Email/password | `ContractorSession` | 24h (30 days if "remember me") |
| Borrower Portal | Magic link | `BorrowerSession` | 7 days |
| Borrower Application | JWT in URL | Stateless | 24 hours |

### 4.2 Admin RBAC

```
Role Hierarchy: god > admin > ops > viewer

Permissions by Role:
─────────────────────────────────────────────────
god:    Full access, audit logs, user management
admin:  Manage ops/viewers, contractor management
ops:    Approve/decline applications, update records
viewer: Read-only access to dashboards
```

### 4.3 Session Management

- **Inactivity Timeout:** 30 minutes (non-remember-me sessions)
- **Token Storage:** HTTP-only secure cookies
- **Password Hashing:** bcrypt with auto-generated salts

---

## 5. Decisioning Engine

### 5.1 Score Factors

| Factor | Score Impact |
|--------|--------------|
| Strong cash reserves (50%+ loan) | +30 |
| Moderate cash reserves | +15 |
| Low reserves (<10%) | -20 |
| Healthy balance (>$10k) | +20 |
| Adequate balance (>$5k) | +10 |
| Low balance (<$1k) | -15 |
| Combined balances cover loan | +15 |
| Consistent historical balance | +25 |
| Stable balance variance | +10 |
| Regular income deposits | +20 |
| Good DTI ratio | +15 |
| Established account (1+ years) | +15 |
| Account 6+ months | +5 |
| New account (<90 days) | -10 |
| Major bank | +5 |
| ACH verified | +10 |
| Manual bank entry (no Plaid) | -50 |
| Loan exceeds repayment capacity | -30 |

**Base Score:** 650  
**Final Score Range:** 300-850

### 5.2 Decision Thresholds

- **Auto-Approve:** Score ≥ 580 AND risk factors ≤ 3
- **Manual Review Triggers:**
  - Borderline score (550-620)
  - High loan amount (>$15,000)
  - Manual bank entry with >$3,000 loan
  - Multiple risk factors (≥3) but still approved
  - No balance data but approved

### 5.3 Offer Generation (APR by Score)

| Score Range | 24mo APR | 48mo APR | 60mo APR |
|-------------|----------|----------|----------|
| 800+ | 6.9% | 9.9% | 11.9% |
| 750-799 | 7.9% | 10.9% | 12.9% |
| 700-749 | 8.9% | 11.9% | 13.9% |
| 650-699 | 10.9% | 13.9% | 15.9% |
| <650 | 12.9% | 15.9% | 17.9% |

**Down Payment:** Required for scores <700 on 60-month terms (10%)

---

## 6. Payment Processing

### 6.1 Payment States

```
scheduled → pending → processing → completed
                ↓           ↓
             failed ← ─ ─ ─ ┘
                ↓
          (retry logic)
                ↓
         requiresAction=true
                ↓
           overdue → collections
```

### 6.2 ACH via Plaid Transfer

1. **Authorization:** Check if transfer will succeed
2. **Creation:** Initiate ACH debit from borrower's account
3. **Tracking:** Poll or receive webhooks for status updates
4. **Completion:** Update payment and loan status

### 6.3 Retry Logic

- **Retry Schedule:** Day 3, Day 5, Day 7
- **Non-Retryable Codes:**
  - `ACCOUNT_CLOSED`
  - `ACCOUNT_FROZEN`
  - `INVALID_ACCOUNT_NUMBER`
  - `UNAUTHORIZED_TRANSACTION`
  - `CUSTOMER_ADVISED_UNAUTHORIZED`
- **After Max Retries:** Flag as `requiresAction=true`

### 6.4 Collections Workflow

- **60+ days overdue:** Loan status → `defaulted`
- **Collection Notes:** Track contact attempts, payment plans, escalations
- **Send to Agency:** Manual action via admin interface

---

## 7. CRM Integrations

### 7.1 Jobber Integration

- **Auth:** OAuth 2.0 authorization code flow
- **API:** GraphQL
- **Webhook:** `QUOTE_CREATE` triggers auto-offer
- **Auto-Offer Flow:**
  1. Jobber sends webhook on quote creation
  2. Fetch quote details via GraphQL
  3. Check minimum amount ($500)
  4. Create customer/job/application records
  5. Send SMS with financing link

### 7.2 FieldRoutes Integration (Planned)

- **Auth:** OAuth 2.0 or API key
- **API:** REST
- **Operations:**
  - Read: customers, appointments/jobs
  - Write: financing status updates

---

## 8. Scheduled Jobs (Vercel Cron)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `process-payments` | 11:00 UTC daily | Process due ACH payments |
| `send-notifications` | 14:00 UTC daily | Send payment reminders |

---

## 9. Security Measures

### 9.1 Data Protection

- **Transport:** HTTPS (TLS 1.3) for all connections
- **Session Cookies:** HTTP-only, Secure, SameSite=Lax
- **Password Storage:** bcrypt with auto-generated salts
- **PII in Database:** Stored in PostgreSQL (encryption at rest via Supabase)

### 9.2 API Security

- **Rate Limiting:** Implemented per-endpoint
- **Input Validation:** Zod schemas for all endpoints
- **CORS:** Configured for known domains
- **Webhook Verification:** HMAC-SHA256 signatures (Plaid, Jobber)

### 9.3 Audit Logging

- **Scope:** All sensitive actions logged
- **Data:** Actor, action, timestamp, payload, IP, user agent
- **Tables:** `AuditLog`, `AdminAuditLog`, `ContractorAuditLog`, `CrmSyncLog`

---

## 10. Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="prisma://..."          # Prisma Accelerate connection
DIRECT_DATABASE_URL="postgresql://..." # Direct connection for migrations

# Plaid
PLAID_CLIENT_ID="..."
PLAID_SECRET="..."
PLAID_ENV="sandbox|production"
PLAID_WEBHOOK_SECRET="..."

# Persona
PERSONA_API_KEY="..."
PERSONA_TEMPLATE_ID="..."

# Twilio
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Resend
RESEND_API_KEY="..."
EMAIL_FROM="SuprFi <noreply@suprfi.com>"

# Jobber
JOBBER_CLIENT_ID="..."
JOBBER_CLIENT_SECRET="..."
JOBBER_REDIRECT_URI="..."

# Application
NEXT_PUBLIC_APP_URL="https://..."
JWT_SECRET="..."
CRON_SECRET="..."
```

---

## 11. Development Workflow

### Local Development

```bash
npm run dev          # Start Next.js dev server (port 3000)
npx prisma studio    # Open Prisma Studio (port 5555)
npx prisma generate  # Generate Prisma client after schema changes
npx prisma migrate dev --name description  # Create migration
```

### Testing

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run test:all     # All checks
```

### Deployment

- **Staging:** Automatic preview deployments on PR
- **Production:** Deploy on merge to `main`
- **Database Migrations:** Run automatically via `postinstall`

---

## 12. Key Metrics

### Business Metrics
- Total applications
- Approval rate
- Average loan amount
- Funding success rate
- Days overdue distribution

### System Metrics
- API response times
- Error rates
- Payment processing success rate
- Webhook delivery success rate

---

*End of Technical Specification*
