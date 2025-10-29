# FlowPay Architecture Document

**Version:** v1.0  
**Last Updated:** October 29, 2025  
**Status:** Approved

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Choices](#technology-choices)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [Database Design](#database-design)
7. [Security Architecture](#security-architecture)
8. [Scalability & Performance](#scalability--performance)
9. [Monitoring & Observability](#monitoring--observability)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

FlowPay is an embedded consumer financing platform designed to seamlessly integrate with home service CRMs. The architecture is built for:

- **Speed**: Sub-2-minute application flow
- **Reliability**: 99.9% uptime SLA
- **Security**: Bank-grade encryption and compliance
- **Scalability**: Handle 10,000+ applications/month
- **Extensibility**: Easy to add new CRM integrations and lenders

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │  Borrower Portal     │        │  FlowOps Admin       │       │
│  │  (Next.js/React)     │        │  (Next.js/React)     │       │
│  │  - Apply for loan    │        │  - Review apps       │       │
│  │  - Link bank         │        │  - Manage rules      │       │
│  │  - E-sign            │        │  - Analytics         │       │
│  └──────────────────────┘        └──────────────────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           API Gateway (Next.js API Routes)           │       │
│  │  - Authentication & Authorization                    │       │
│  │  - Rate Limiting                                     │       │
│  │  - Request Validation                                │       │
│  │  - API Versioning                                    │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌────────────┬────────────┬────────────┬────────────┐         │
│  │  Borrower  │  CRM Sync  │ Decision-  │  Lender    │         │
│  │  Service   │  Service   │ ing Svc    │  Adapter   │         │
│  │            │            │            │            │         │
│  │ - Token    │ - FR OAuth │ - Rules    │ - Loan API │         │
│  │ - Prefill  │ - Read/    │ - Scoring  │ - Disburse │         │
│  │ - Submit   │   Write    │ - Offers   │ - Status   │         │
│  └────────────┴────────────┴────────────┴────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                           │
│  ┌────────────┬────────────┬────────────┬────────────┐         │
│  │   Plaid    │  Persona   │  Experian  │ FieldRoutes│         │
│  │   (Bank)   │   (KYC)    │  (Credit)  │   (CRM)    │         │
│  └────────────┴────────────┴────────────┴────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │    PostgreSQL        │        │   Redis (BullMQ)     │       │
│  │    (Supabase)        │        │   - Job Queue        │       │
│  │  - Customers         │        │   - Cache            │       │
│  │  - Applications      │        │   - Sessions         │       │
│  │  - Decisions         │        └──────────────────────┘       │
│  │  - Loans             │                                        │
│  └──────────────────────┘        ┌──────────────────────┐       │
│                                   │  Supabase Storage    │       │
│                                   │  - KYC Documents     │       │
│                                   │  - Signed Agreements │       │
│                                   └──────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. API-First Design
- All services expose REST APIs
- OpenAPI/Swagger documentation
- Versioned endpoints (`/v1/`, `/v2/`)
- Consistent error handling

### 2. Microservices (Light)
- Monolithic frontend (Next.js)
- Separate services for:
  - Decisioning (independent scaling)
  - CRM Sync (isolated from borrower flow)
  - Lender Adapter (pluggable architecture)
- Shared database (Postgres) for simplicity
- Event-driven via job queue (BullMQ)

### 3. Security by Default
- Zero-trust architecture
- Encrypt everything (at rest and in transit)
- Principle of least privilege
- Audit all PII access
- Rate limiting on all endpoints

### 4. Resilience & Fault Tolerance
- Retry with exponential backoff
- Circuit breakers for external APIs
- Dead letter queues for failed jobs
- Graceful degradation (show cached data if API down)

### 5. Observable Systems
- Structured logging (JSON)
- Distributed tracing (OpenTelemetry)
- Real-time metrics (Datadog)
- Health checks (`/health`, `/ready`)

### 6. Cost-Effective Scalability
- Serverless where possible (Vercel Edge)
- Horizontal scaling for services
- Connection pooling for database
- CDN for static assets

---

## Technology Choices

### Frontend

**Next.js 14 (App Router)**

**Why:**
- React Server Components reduce client-side JS
- Built-in API routes (no separate Express server)
- Excellent SEO (server-side rendering)
- Automatic code splitting
- Vercel deployment = zero config

**Alternatives Considered:**
- React + Vite: More control, but requires separate backend
- Remix: Great SSR, but smaller ecosystem

**UI Stack:**
- TailwindCSS (utility-first styling)
- shadcn/ui (accessible component library)
- Recharts (analytics charts)
- React Hook Form (form validation)
- Zod (schema validation)

---

### Backend

**Node.js 20+ with TypeScript**

**Why:**
- Shared language with frontend (full-stack efficiency)
- Strong async I/O (webhooks, API calls)
- Rich ecosystem (Prisma, BullMQ, etc.)
- TypeScript adds type safety

**Framework Choices:**
- **Next.js API Routes**: For public APIs (borrower, CRM)
- **Express**: For microservices (decisioning, lender adapter)

**Alternatives Considered:**
- Python FastAPI: Great for ML, but adds language complexity
- Go: Extremely fast, but steeper learning curve

---

### Database

**PostgreSQL 15 (Supabase)**

**Why:**
- ACID compliance (critical for financial data)
- JSONB support (flexible for snapshots)
- Row-Level Security (multi-tenant isolation)
- Full-text search (for admin dashboard)
- Managed backups and replication

**ORM: Prisma**

**Why:**
- Type-safe queries
- Automatic migrations
- Introspection (DB → TypeScript types)
- Great DX with VS Code

**Alternatives Considered:**
- MySQL: Less feature-rich than Postgres
- MongoDB: Not ACID, harder to ensure consistency

---

### Authentication

**Clerk**

**Why:**
- Magic links (passwordless = better UX)
- Session management out-of-box
- Webhooks for user lifecycle
- Multi-org support (for merchant portals)
- Better pricing than Auth0

**API Authentication:**
- JWT for session-based (borrower, admin)
- API keys for machine-to-machine (CRM)

**Alternatives Considered:**
- Auth0: More enterprise features, higher cost
- NextAuth.js: Open-source, but more implementation work

---

### Job Queue

**BullMQ (Redis-backed)**

**Why:**
- Job prioritization (critical vs background)
- Retry logic with exponential backoff
- Rate limiting (max X jobs/minute)
- Bull Board UI for monitoring
- Pause/resume queues

**Use Cases:**
- Lender API calls (can be slow)
- CRM sync operations
- Webhook retries
- Email/SMS notifications

**Alternatives Considered:**
- AWS SQS: Serverless, but less control over retries
- RabbitMQ: More complex, overkill for MVP

---

### Object Storage

**Supabase Storage (S3-compatible)**

**Why:**
- Unified with database (simpler architecture)
- Built-in CDN (fast document retrieval)
- Row-level security policies
- Automatic image optimization

**Use Cases:**
- KYC documents (driver's licenses, etc.)
- Signed loan agreements (PDFs)
- Payment receipts

**Alternatives Considered:**
- AWS S3: More scalable, but adds vendor complexity

---

### Third-Party Services

| Service | Purpose | Why |
|---------|---------|-----|
| **Twilio** | SMS | Industry standard, 99.95% uptime |
| **Plaid** | Bank linking | Trusted by 8,000+ fintechs |
| **Persona** | KYC/AML | Better UX than Alloy, faster |
| **Experian** | Credit bureau | Easiest API to integrate |
| **Sentry** | Error tracking | Best-in-class for JS/Node |
| **Datadog** | Monitoring | Unified logs, metrics, traces |

---

## System Components

### 1. API Gateway (Next.js API Routes)

**Responsibilities:**
- Authenticate requests (JWT, API keys)
- Rate limiting (100 req/min per IP)
- Request validation (Zod schemas)
- Response serialization
- Error handling (standardized format)

**Routes:**
```
/api/v1/crm/*          → CRM Integration
/api/v1/borrower/*     → Borrower Flow
/api/v1/decision/*     → Decisioning (internal)
/api/v1/admin/*        → Admin Dashboard
/api/v1/webhooks/*     → Webhook Receivers
```

**Middleware Stack:**
```typescript
Request
  ↓
1. CORS Check
  ↓
2. Rate Limiter
  ↓
3. Authentication
  ↓
4. Authorization (RBAC)
  ↓
5. Request Validation
  ↓
6. Route Handler
  ↓
7. Response Serialization
  ↓
8. Error Handler
  ↓
Response
```

---

### 2. Borrower Service

**Responsibilities:**
- Generate unique tokens for applications
- Send SMS with Twilio
- Prefill application data
- Submit applications
- Fetch offers

**Key Functions:**
```typescript
// Generate token with 24h expiry
generateToken(applicationId: string): Promise<string>

// Send SMS with unique link
sendSMS(phone: string, link: string): Promise<boolean>

// Validate token and return prefilled data
getApplication(token: string): Promise<Application>

// Submit completed application
submitApplication(token: string, data: ApplicationData): Promise<Decision>
```

**Database Tables:**
- `applications`
- `customers`
- `jobs`

---

### 3. Decisioning Service

**Responsibilities:**
- Evaluate applications using rules + scoring model
- Generate 2-3 financing offers
- Flag applications for manual review
- Store decision snapshots

**Scoring Algorithm:**
```typescript
function calculateScore(data: DecisionInputs): number {
  const creditScore = data.credit_score || 0;
  const incomeFactor = Math.min(data.monthly_income / 5000, 1);
  const bankHealth = calculateBankHealth(data.plaid_data);
  const kycConfidence = data.persona_data.confidence;

  return Math.round(
    creditScore * 0.4 +
    incomeFactor * 300 * 0.3 +
    bankHealth * 100 * 0.2 +
    kycConfidence * 100 * 0.1
  );
}
```

**Rule Engine:**
```typescript
interface Rule {
  id: string;
  name: string;
  predicate: {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'includes' | 'not_includes';
    value: any;
  };
  action: 'approve' | 'decline' | 'manual_review';
  reason?: string;
}

// Example: Decline if bankruptcy
{
  id: 'no_bankruptcy',
  predicate: {
    field: 'credit_data.public_records',
    operator: 'not_includes',
    value: 'bankruptcy'
  },
  action: 'decline',
  reason: 'Recent bankruptcy filing'
}
```

**Offer Generation:**
```typescript
function generateOffers(score: number, loanAmount: number): Offer[] {
  const tier = getTier(score); // A, B, or C
  const terms = getTierTerms(tier); // [12, 24, 36] or [24, 36, 48, 60]
  
  return terms.map(term => ({
    term_months: term,
    apr: calculateAPR(tier, term),
    monthly_payment: calculatePayment(loanAmount, apr, term),
    origination_fee: loanAmount * getOriginationFeeRate(tier),
    total_amount: calculateTotalPayment(loanAmount, apr, term)
  }));
}
```

**Database Tables:**
- `decisions`
- `offers`
- `manual_reviews`
- `pricing_rules`

---

### 4. CRM Sync Service

**Responsibilities:**
- Authenticate with FieldRoutes (OAuth 2.0)
- Read customer/job data from CRM
- Write financing status back to CRM
- Handle CRM webhooks
- Log all sync operations

**OAuth Flow:**
```
1. Admin authorizes FlowPay in FieldRoutes settings
2. FieldRoutes redirects to: /api/v1/crm/fieldroutes/callback?code=abc123
3. Exchange code for access_token + refresh_token
4. Store tokens encrypted in database
5. Use access_token for API calls
6. Refresh when expired (7 days)
```

**Field Mapping:**
```typescript
interface FieldMapping {
  fieldRoutes: {
    customerId: string;
    'customer.firstName': string;
    'customer.email': string;
    // ...
  };
  flowPay: {
    crmCustomerId: string;
    firstName: string;
    email: string;
    // ...
  };
}

// Bidirectional sync
function mapToFlowPay(frData: any): Customer;
function mapToFieldRoutes(fpData: Customer): any;
```

**Retry Logic:**
```typescript
async function syncWithRetry(operation: () => Promise<any>, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.min(1000 * 2 ** attempt, 30000); // Exponential backoff
      await sleep(delay);
    }
  }
}
```

**Database Tables:**
- `crm_sync_logs`

---

### 5. Lender Adapter

**Responsibilities:**
- Abstract interface for multiple lenders
- Create loans via lender APIs
- Request disbursement
- Handle funding webhooks
- Retry failed operations

**Adapter Interface:**
```typescript
interface LenderAdapter {
  name: string;
  
  // Create loan with lender
  createLoan(
    application: Application,
    offer: Offer
  ): Promise<{ lender_loan_id: string }>;
  
  // Request disbursement to merchant
  requestDisbursement(
    loanId: string,
    amount: number,
    merchantAccount: string
  ): Promise<{ disbursement_id: string }>;
  
  // Get loan status
  getLoanStatus(lenderLoanId: string): Promise<LoanStatus>;
  
  // Handle webhook
  handleWebhook(payload: any, signature: string): Promise<WebhookEvent>;
}
```

**Mock Lender (for testing):**
```typescript
class MockLenderAdapter implements LenderAdapter {
  async createLoan(app, offer) {
    // Simulate 2-second delay
    await sleep(2000);
    
    return {
      lender_loan_id: `MOCK-${randomUUID()}`,
      status: 'approved'
    };
  }
  
  async requestDisbursement(loanId, amount) {
    await sleep(1000);
    
    return {
      disbursement_id: `DISB-${randomUUID()}`,
      status: 'pending',
      estimated_arrival: addDays(new Date(), 2)
    };
  }
}
```

**Database Tables:**
- `loans`
- `lender_transactions`

---

### 6. Worker Queue (BullMQ)

**Job Types:**

```typescript
// High priority: User-facing operations
queue.add('create-loan', { applicationId, offerId }, { priority: 1 });

// Medium priority: Background sync
queue.add('sync-to-crm', { applicationId, status }, { priority: 2 });

// Low priority: Notifications
queue.add('send-email', { to, template, data }, { priority: 3 });
```

**Worker Configuration:**
```typescript
const worker = new Worker('financing', async (job) => {
  switch (job.name) {
    case 'create-loan':
      return await lenderAdapter.createLoan(job.data);
    
    case 'sync-to-crm':
      return await crmSyncService.updateStatus(job.data);
    
    case 'send-email':
      return await emailService.send(job.data);
  }
}, {
  concurrency: 10, // Process 10 jobs in parallel
  limiter: {
    max: 100, // Max 100 jobs per 1 minute
    duration: 60000
  }
});

// Retry failed jobs
worker.on('failed', (job, error) => {
  if (job.attemptsMade < 5) {
    job.retry();
  } else {
    // Move to dead letter queue
    dlq.add('failed-job', { job, error });
  }
});
```

---

## Data Flow

### End-to-End Borrower Flow

```
1. Technician Triggers Financing (FieldRoutes)
   ↓
   POST /api/v1/crm/offer-financing
   {
     crm_customer_id: "FR12345",
     customer: {...},
     job: {...}
   }
   ↓
2. FlowPay API Gateway
   - Validates API key
   - Creates Application record in Postgres
   - Generates unique token (JWT, 24h expiry)
   - Queues SMS job in BullMQ
   ↓
3. BullMQ Worker sends SMS (Twilio)
   SMS: "John, apply for financing: https://app.flowpay.com/apply/abc123"
   ↓
4. Borrower clicks link → Next.js Frontend
   GET /api/v1/borrower/abc123
   - Validates token
   - Returns prefilled application data
   ↓
5. Borrower completes flow:
   a) Links bank account → Plaid Link
      POST /api/v1/borrower/abc123/plaid
      - Exchange public_token for access_token
      - Fetch account balance, transactions
   
   b) Verifies identity → Persona
      POST /api/v1/borrower/abc123/kyc
      - Embed Persona Inquiry
      - Receive verification webhook
   
   c) Submits application
      POST /api/v1/borrower/abc123/submit
      {
        plaid_token: "...",
        persona_inquiry_id: "...",
        consent: {...}
      }
   ↓
6. Decisioning Service
   POST /api/v1/decision/evaluate
   - Fetch Experian credit report (soft pull)
   - Run scoring algorithm
   - Evaluate rules (approve/decline/manual)
   - Generate 2-3 offers
   - Save Decision record
   ↓
7a. If Approved → Show Offers
    GET /api/v1/borrower/abc123/offers
    [
      { term: 24, apr: 9.9, payment: $343 },
      { term: 48, apr: 12.9, payment: $200 }
    ]
    ↓
    Borrower selects offer + e-signs
    POST /api/v1/borrower/abc123/accept
    ↓
8. Lender Adapter (queued job)
   - Create loan with lender partner
   - Request disbursement
   - Save Loan record (status: pending_funding)
   ↓
9. Lender Webhook (1-2 days later)
   POST /api/v1/webhooks/lender
   {
     event: "loan.funded",
     loan_id: "LOAN-xyz789",
     funded_amount: 7500.00
   }
   - Update Loan status → funded
   - Queue CRM sync job
   ↓
10. CRM Sync Service
    PATCH /fieldroutes/appointments/JOB-9876
    {
      financing_status: "funded",
      funded_amount: 7500.00,
      funded_date: "2025-10-30"
    }
    ↓
11. FieldRoutes receives update
    Technician sees "Funded ✓" in CRM
```

---

### Manual Review Flow

```
1. Decisioning flags application
   - Score < 650
   - Fraud signals from Persona
   - Thin credit file
   ↓
2. Create ManualReview record
   {
     reason: "thin_file",
     priority: 1 (high),
     status: "pending"
   }
   ↓
3. Admin opens FlowOps → Review Queue
   GET /api/v1/admin/manual-review/queue
   ↓
4. Underwriter clicks "Assign to Me"
   PATCH /api/v1/admin/manual-review/MR-001
   { assigned_to: "user_123" }
   ↓
5. Underwriter reviews:
   - Credit report details
   - Plaid transaction history
   - KYC documents
   - Job details
   ↓
6. Underwriter decides:
   POST /api/v1/admin/manual-review/MR-001/resolve
   {
     resolution: "approved",
     notes: "Verified employment via phone call",
     selected_offer_id: "OFF-002",
     conditions: { down_payment_required: 500 }
   }
   ↓
7. Create Loan record → Lender Adapter
   (Same as auto-approval flow)
   ↓
8. Send notification to borrower
   "Your application has been approved!"
```

---

## Database Design

### Entity-Relationship Diagram

```
customers
┌──────────────┐
│ id (PK)      │───┐
│ crm_cust_id  │   │
│ first_name   │   │
│ email        │   │
│ phone        │   │
└──────────────┘   │
                   │
jobs               │ 1:N
┌──────────────┐   │
│ id (PK)      │───┤
│ crm_job_id   │   │
│ customer_id  │───┘
│ estimate     │
└──────────────┘
       │
       │ 1:N
       ↓
applications
┌──────────────┐
│ id (PK)      │───┐
│ job_id (FK)  │   │
│ token        │   │
│ status       │   │
│ plaid_data   │   │
│ credit_data  │   │
└──────────────┘   │
                   │ 1:1
decisions          │
┌──────────────┐   │
│ id (PK)      │───┤
│ app_id (FK)  │───┘
│ score        │
│ status       │
│ rule_hits    │
└──────────────┘
       │
       │ 1:N
       ↓
offers
┌──────────────┐
│ id (PK)      │
│ decision_id  │
│ term_months  │
│ apr          │
│ monthly_pmt  │
│ selected     │
└──────────────┘
       │
       │ (if selected)
       ↓
loans
┌──────────────┐
│ id (PK)      │
│ app_id (FK)  │
│ lender_id    │
│ funded_amt   │
│ status       │
│ payment_sched│
└──────────────┘
```

### Indexes

**customers:**
```sql
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_crm_id ON customers(crm_customer_id);
```

**applications:**
```sql
CREATE INDEX idx_applications_token ON applications(token);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_customer_id ON applications(customer_id);
```

**decisions:**
```sql
CREATE INDEX idx_decisions_status ON decisions(decision_status);
CREATE INDEX idx_decisions_score ON decisions(score);
CREATE INDEX idx_decisions_decided_at ON decisions(decided_at DESC);
```

**audit_logs:**
```sql
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
```

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network
├─ Cloudflare (DDoS protection, WAF)
├─ HTTPS only (TLS 1.3)
└─ CORS (whitelist known domains)

Layer 2: Application
├─ Rate limiting (100 req/min)
├─ Input validation (Zod schemas)
├─ SQL injection protection (Prisma parameterized queries)
├─ XSS protection (React auto-escaping)
└─ CSRF tokens

Layer 3: Authentication
├─ JWT with short TTL (15 min)
├─ API keys with rotation (90 days)
├─ MFA for admin accounts
└─ Session invalidation on logout

Layer 4: Authorization
├─ Role-Based Access Control (RBAC)
├─ Row-Level Security (Supabase RLS)
└─ Principle of least privilege

Layer 5: Data
├─ Encryption at rest (AES-256)
├─ Encryption in transit (TLS 1.3)
├─ Tokenization (SSN → token)
├─ Data masking (show last 4 digits)
└─ Automatic PII redaction in logs

Layer 6: Monitoring
├─ Audit logs (immutable)
├─ Anomaly detection
├─ Security alerts (PagerDuty)
└─ Penetration testing
```

### Sensitive Data Handling

**PII Encryption (Field-Level):**
```typescript
// Prisma middleware for auto-encryption
prisma.$use(async (params, next) => {
  if (params.action === 'create' || params.action === 'update') {
    if (params.model === 'Customer') {
      // Encrypt SSN
      if (params.args.data.ssn) {
        params.args.data.ssn = encrypt(params.args.data.ssn);
      }
    }
  }
  
  const result = await next(params);
  
  if (params.action === 'findMany' || params.action === 'findUnique') {
    if (params.model === 'Customer' && result.ssn) {
      result.ssn = decrypt(result.ssn);
    }
  }
  
  return result;
});
```

**Audit Logging:**
```typescript
async function auditLog(
  entityType: string,
  entityId: string,
  actor: string,
  action: string,
  payload?: any,
  req?: Request
) {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      actor,
      action,
      payload: redactPII(payload), // Remove SSN, full bank account, etc.
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
      timestamp: new Date()
    }
  });
}

// Example usage
await auditLog('application', 'APP-123', 'user_456', 'viewed_pii', null, req);
```

---

## Scalability & Performance

### Horizontal Scaling

**Frontend (Next.js):**
- Deployed to Vercel Edge (auto-scales)
- CDN for static assets (instant global delivery)
- ISR (Incremental Static Regeneration) for marketing pages

**Backend Services:**
- Containerized (Docker)
- Deployed to ECS Fargate or Cloud Run
- Auto-scaling based on CPU/memory (scale out at 70%)

**Database:**
- Supabase Pro: 8GB RAM, 50GB storage
- Read replicas for analytics queries
- Connection pooling (PgBouncer)

**Job Queue:**
- BullMQ with Redis Cluster (3 nodes)
- Separate queues for different priorities
- Multiple workers (scale to 50+ workers)

### Caching Strategy

```
Browser Cache
├─ Static assets (1 year): /static/*
├─ API responses (5 min): /api/v1/admin/analytics
└─ No cache: /api/v1/borrower/* (always fresh)

Redis Cache
├─ Session data (JWT claims) → 15 min TTL
├─ Application state (prefill data) → 24 hr TTL
├─ Pricing rules → 1 hr TTL
└─ CRM customer data → 5 min TTL

Database Query Cache
├─ Materialized views for analytics
└─ Refresh every 5 minutes
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 500ms | Datadog |
| Page Load Time (LCP) | < 2s | Vercel Analytics |
| Time to Interactive (TTI) | < 3s | Lighthouse |
| Borrower Flow Completion | < 5 min | Amplitude |
| Decision Latency | < 5s | Custom metric |

---

## Monitoring & Observability

### Logging Strategy

**Structured JSON Logs:**
```json
{
  "timestamp": "2025-10-29T15:30:00.123Z",
  "level": "info",
  "service": "decisioning-service",
  "trace_id": "abc123def456",
  "span_id": "span_789",
  "event": "decision_evaluated",
  "application_id": "APP-abc123",
  "decision_status": "approved",
  "score": 721,
  "duration_ms": 1234
}
```

**Log Levels:**
- `ERROR`: System failures, exceptions
- `WARN`: Degraded performance, retry attempts
- `INFO`: Normal operations (decision made, loan funded)
- `DEBUG`: Detailed troubleshooting (rule evaluation steps)

**Log Aggregation:**
- Vercel Logs → Datadog
- Service logs → CloudWatch → Datadog
- Single pane of glass for all logs

---

### Distributed Tracing

**OpenTelemetry Instrumentation:**
```typescript
import { trace } from '@opentelemetry/api';

async function evaluateApplication(applicationId: string) {
  const tracer = trace.getTracer('decisioning-service');
  
  return tracer.startActiveSpan('evaluate_application', async (span) => {
    span.setAttribute('application_id', applicationId);
    
    try {
      const creditData = await fetchCreditReport(applicationId);
      span.addEvent('credit_fetched');
      
      const score = calculateScore(creditData);
      span.setAttribute('score', score);
      
      const offers = generateOffers(score);
      span.addEvent('offers_generated', { count: offers.length });
      
      return { score, offers };
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

**Trace Visualization:**
```
evaluate_application (1.2s)
├─ fetch_credit_report (800ms)
│  ├─ http_request → experian.com (750ms)
│  └─ parse_response (50ms)
├─ calculate_score (100ms)
│  ├─ apply_rule: no_bankruptcy (10ms)
│  ├─ apply_rule: income_threshold (10ms)
│  └─ compute_final_score (80ms)
└─ generate_offers (300ms)
   ├─ tier_a_offers (100ms)
   ├─ tier_b_offers (100ms)
   └─ tier_c_offers (100ms)
```

---

### Metrics & Dashboards

**Business Metrics:**
```
applications_created_total (counter)
applications_approved_total (counter)
applications_declined_total (counter)
approval_rate (gauge) = approved / total
avg_loan_amount (gauge)
time_to_decision (histogram)
```

**System Metrics:**
```
http_requests_total (counter) by {method, route, status}
http_request_duration_seconds (histogram)
queue_depth (gauge) by {queue_name}
job_processing_duration_seconds (histogram)
database_connection_pool_size (gauge)
cache_hit_ratio (gauge)
```

**Datadog Dashboard Layout:**
```
┌─────────────────────────────────────────┐
│          FlowPay Overview               │
├─────────────────────────────────────────┤
│ Applications Today: 247                  │
│ Approval Rate: 68% ↑ 2%                 │
│ Avg Loan Amount: $8,350                 │
│ API Error Rate: 0.12% ✓                 │
├─────────────────────────────────────────┤
│   API Response Time (p95)               │
│   [Line chart: last 24h]                │
├─────────────────────────────────────────┤
│   Queue Depth                           │
│   [Stacked area: high/medium/low]       │
├─────────────────────────────────────────┤
│   Top 5 Errors (last 1h)                │
│   1. Plaid timeout (12)                 │
│   2. Experian rate limit (5)            │
│   3. FieldRoutes 500 (3)                │
└─────────────────────────────────────────┘
```

---

### Alerting Rules

**Critical (PagerDuty):**
- API error rate > 5% for 5 min
- Database down
- Queue backlog > 1000 jobs for 10 min
- Any service down

**Warning (Slack):**
- API p95 latency > 1s for 10 min
- Third-party API errors (Plaid, Persona) > 10 in 5 min
- Job retry rate > 20%
- Disk usage > 80%

---

## Deployment Architecture

### Environments

```
Development (Local)
├─ Docker Compose
│  ├─ Postgres (local)
│  ├─ Redis (local)
│  └─ Mock APIs (Plaid, Persona, Experian)
└─ Next.js dev server (localhost:3000)

Staging (Vercel Preview)
├─ Vercel (automatic preview per PR)
├─ Supabase (staging project)
├─ Railway (Redis staging)
└─ Third-party sandboxes

Production (Vercel + AWS)
├─ Vercel (Next.js frontend + API routes)
├─ AWS ECS Fargate (microservices)
│  ├─ Decisioning Service
│  ├─ CRM Sync Service
│  └─ Lender Adapter
├─ Supabase (production DB)
├─ Railway (Redis production)
└─ Third-party production APIs
```

### CI/CD Pipeline

```
1. Developer pushes code → GitHub
   ↓
2. GitHub Actions triggered
   ├─ Run linter (ESLint)
   ├─ Run type check (TypeScript)
   ├─ Run unit tests (Jest)
   └─ Run E2E tests (Playwright)
   ↓
3. If PR → Deploy to Vercel Preview
   - Unique URL: flowpay-pr-123.vercel.app
   - Comment on PR with link
   ↓
4. If merged to main → Deploy to Staging
   - Run integration tests
   - Run smoke tests
   ↓
5. Manual approval (Slack button)
   ↓
6. Deploy to Production
   ├─ Database migration (Prisma migrate deploy)
   ├─ Deploy Next.js to Vercel
   ├─ Deploy services to ECS (rolling update)
   └─ Run health checks
   ↓
7. Post-deploy
   ├─ Smoke tests (critical paths)
   ├─ Monitor error rates (5 min)
   └─ Notify team (Slack)
```

### Rollback Strategy

**Automated Rollback Triggers:**
- Error rate > 10% for 5 min
- API success rate < 90%
- Failed health checks

**Rollback Steps:**
1. Revert to previous Vercel deployment (1 click)
2. Revert ECS task definitions
3. Rollback database migration if needed (rare)
4. Notify team + create postmortem issue

---

## Disaster Recovery

### Backup Strategy

**Database (Postgres):**
- Automatic daily backups (Supabase)
- Point-in-time recovery (7 days)
- Weekly full backup to S3 (30 day retention)

**Object Storage:**
- Versioning enabled (restore deleted files)
- Cross-region replication

**Configuration:**
- Git repository (version controlled)
- Secrets in Vercel + AWS Secrets Manager

### RTO & RPO

| Component | RTO (Recovery Time) | RPO (Recovery Point) |
|-----------|---------------------|----------------------|
| Database | 1 hour | 5 minutes |
| Application | 15 minutes | 0 (stateless) |
| Object Storage | 30 minutes | 1 hour |

### Incident Response

```
1. Alert triggered (PagerDuty)
   ↓
2. On-call engineer investigates
   - Check Datadog dashboards
   - Review recent deployments
   - Check third-party status pages
   ↓
3. Mitigate
   - Rollback deployment
   - Scale up services
   - Failover to backup
   ↓
4. Communicate
   - Update status page
   - Notify affected merchants
   ↓
5. Post-Incident
   - Write postmortem (blameless)
   - Create follow-up tasks
   - Update runbooks
```

---

## Conclusion

This architecture is designed for:
- **Rapid development**: Modern tools, clear boundaries
- **Reliability**: Retry logic, circuit breakers, monitoring
- **Security**: Encryption, audit logs, least privilege
- **Scalability**: Horizontal scaling, caching, CDN
- **Observability**: Logs, metrics, traces, alerts

As we build and learn, we'll iterate on this architecture. This document is a living blueprint—not set in stone.

---

*End of Architecture Document*
