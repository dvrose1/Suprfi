# SuprFi - Agent Context Document

**Purpose:** This document provides AI agents with complete context about the SuprFi project, its architecture, implementation status, and technical decisions.

**Last Updated:** November 3, 2025  
**Project Status:** Phase 1 & 2 Complete (MVP Foundation Ready)

---

## 🎯 Project Overview

### What is SuprFi?

**SuprFi** is an embedded consumer financing platform for home service businesses. It allows technicians to offer "Pay Later" options to homeowners directly from their CRM (starting with FieldRoutes), creating a seamless financing experience without leaving their workflow.

**Business Model:**
- Target customers: Home service companies (pest control, HVAC, roofing, electrical)
- Pilot customers: ProForce Pest Control, Rack Electric
- Revenue: Origination fees + interest spread from lender network

### Key Product Features (MVP)
1. **CRM Integration** - Trigger financing offers from FieldRoutes via REST API
2. **SMS-Based Application** - Borrowers receive SMS link to mobile-friendly application
3. **Bank Linking** - Plaid integration for instant verification
4. **KYC/AML** - Persona identity verification
5. **Credit Decisioning** - Built-in underwriting engine with manual review queue
6. **Lender Network** - Route approved loans to funding partners
7. **SuprOps Dashboard** - Internal admin tool for operations and analytics

---

## 📂 Project Structure

```
SuprFi/
├── docs/                           # Documentation
│   ├── README.md                   # Documentation guide
│   ├── PRD.md                      # Product requirements (374 lines)
│   ├── TECHNICAL_SPEC.md           # Implementation plan
│   ├── API_SPEC.md                 # API documentation
│   ├── ARCHITECTURE.md             # System design
│   └── AGENTS.md                   # This file
│
├── prisma/
│   ├── schema.prisma               # 10 database models (360 lines)
│   └── migrations/                 # Database migrations
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Consumer landing page
│   │   ├── layout.tsx             # Root layout with Clerk
│   │   ├── globals.css            # Tailwind styles
│   │   │
│   │   ├── sign-in/               # Clerk authentication
│   │   ├── sign-up/               # Clerk registration
│   │   │
│   │   ├── apply/[token]/         # Borrower application flow
│   │   │   ├── page.tsx           # Landing page (validates token)
│   │   │   └── offers/page.tsx    # Offers display (3 financing options)
│   │   │
│   │   ├── admin/                 # SuprOps dashboard
│   │   │   ├── page.tsx           # Admin home (stats + recent apps)
│   │   │   └── applications/
│   │   │       ├── page.tsx       # Applications list (search, filter, pagination)
│   │   │       └── [id]/page.tsx  # Application detail view
│   │   │
│   │   └── api/v1/                # REST API
│   │       ├── health/route.ts    # Health check
│   │       ├── test-crm/route.ts  # CRM testing endpoint
│   │       │
│   │       ├── crm/
│   │       │   └── offer-financing/route.ts  # Main CRM endpoint
│   │       │
│   │       ├── borrower/[token]/
│   │       │   ├── submit/route.ts    # Submit application
│   │       │   └── decision/route.ts  # Get decision + offers
│   │       │
│   │       └── admin/
│   │           └── applications/
│   │               ├── route.ts              # List applications (GET)
│   │               └── [id]/
│   │                   ├── route.ts          # Get application (GET)
│   │                   ├── approve/route.ts  # Approve (POST)
│   │                   └── decline/route.ts  # Decline (POST)
│   │
│   ├── components/
│   │   └── borrower/
│   │       ├── ApplicationForm.tsx           # Multi-step form container
│   │       └── steps/
│   │           ├── PersonalInfoStep.tsx      # Step 1: Personal info
│   │           ├── BankLinkStep.tsx          # Step 2: Bank linking (mock)
│   │           ├── KYCStep.tsx               # Step 3: Identity verification (mock)
│   │           └── ReviewStep.tsx            # Step 4: Review + consent
│   │
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── utils/
│   │   │   └── token.ts           # JWT token utilities
│   │   └── services/
│   │       └── sms.ts             # Twilio SMS service
│   │
│   ├── middleware.ts              # Clerk authentication middleware
│   └── styles/                    # Global styles
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind config
└── prisma.config.ts               # Prisma config

```

---

## 🗄️ Database Schema

### Technology
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Connection:** Prisma Accelerate (connection pooling)

### Models (10 tables)

#### Core Entities
1. **Customer** - Borrower information (synced from CRM)
   - Fields: id, crmCustomerId, firstName, lastName, email, phone, address
   - Relations: jobs[], applications[]

2. **Job** - Service job/estimate (synced from CRM)
   - Fields: id, crmJobId, estimateAmount, status, technicianId, serviceType
   - Relations: customer, applications[]

#### Financing Workflow
3. **Application** - Financing application
   - Fields: id, jobId, customerId, token, tokenExpiresAt, status
   - JSONB: plaidData, personaData, creditData
   - Relations: customer, job, decision, loan

4. **Decision** - Credit decision result
   - Fields: id, applicationId, score, decisionStatus, decisionReason, ruleHits
   - Relations: application, offers[], manualReview

5. **Offer** - Financing offer with terms
   - Fields: id, decisionId, termMonths, apr, monthlyPayment, downPayment, totalAmount
   - Relations: decision

6. **Loan** - Funded loan
   - Fields: id, applicationId, lenderLoanId, fundedAmount, fundingDate, status
   - JSONB: paymentSchedule
   - Relations: application

#### Operations
7. **ManualReview** - Manual review queue
   - Fields: id, decisionId, reason, priority, assignedTo, status, notes
   - Relations: decision

8. **PricingRule** - Dynamic pricing rules
   - Fields: id, name, predicate (JSONB), pricingAdjustments (JSONB), priority
   - Used for offer generation

#### Audit & Sync
9. **AuditLog** - Compliance audit trail
   - Fields: id, entityType, entityId, actor, action, payload, timestamp

10. **CrmSyncLog** - CRM integration logs
    - Fields: id, crmType, direction, entityType, status, errorMessage

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Custom components (no UI library yet)
- **Authentication:** Clerk (social + email/password)

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Next.js API Routes (serverless)
- **ORM:** Prisma 6.18
- **Validation:** Zod 4.1
- **Token Management:** JWT (jsonwebtoken 9.0)

### Database & Infrastructure
- **Database:** PostgreSQL (Supabase)
- **Connection Pooling:** Prisma Accelerate
- **File Storage:** Supabase Storage (planned for docs)
- **Hosting:** Vercel (frontend + API routes)
- **Job Queue:** BullMQ + Redis (not yet implemented)

### Third-Party Services
- **SMS:** Twilio (configured, not fully implemented)
- **Bank Linking:** Plaid (mock implementation)
- **Identity Verification:** Persona (mock implementation)
- **Credit Bureau:** Experian (mock implementation)
- **CRM:** FieldRoutes (API defined, not integrated)

---

## 🔑 Environment Variables

### Required (.env.local)
```bash
# Database (Supabase + Prisma Accelerate)
DATABASE_URL="prisma://accelerate.prisma-data.net/..."  # Pooled connection
DIRECT_DATABASE_URL="postgresql://..."                  # Direct for migrations

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+18448212335"

# JWT Token Security
JWT_SECRET="..."  # For application tokens

# External Services (not yet configured)
PLAID_CLIENT_ID=""
PLAID_SECRET=""
PLAID_ENV="sandbox"

PERSONA_API_KEY=""
PERSONA_TEMPLATE_ID=""

EXPERIAN_API_KEY=""
EXPERIAN_API_SECRET=""
EXPERIAN_ENV="sandbox"

FIELDROUTES_CLIENT_ID=""
FIELDROUTES_CLIENT_SECRET=""
FIELDROUTES_API_URL="https://api.fieldroutes.com/v1"
```

---

## 🚀 Implementation Status

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Next.js project initialization
- [x] Prisma database schema (10 models)
- [x] Supabase PostgreSQL setup
- [x] Prisma Accelerate connection pooling
- [x] Clerk authentication integration
- [x] Project structure
- [x] Complete documentation

### ✅ Phase 1: Borrower Flow (COMPLETE)
- [x] CRM API endpoint (`POST /api/v1/crm/offer-financing`)
  - Creates customer, job, application
  - Generates JWT token with 24hr expiry
  - Sends SMS with application link (mock)
  
- [x] Application landing page (`/apply/[token]`)
  - Token validation
  - Customer/job information display
  - Security notices
  
- [x] Multi-step application form
  - Step 1: Personal information (pre-filled, validated)
  - Step 2: Bank account linking (mock Plaid)
  - Step 3: Identity verification (mock Persona)
  - Step 4: Review & consent (3 required consents)
  - Progress indicator
  - Form validation with error messages
  - SSN auto-formatting
  
- [x] Application submission (`POST /api/v1/borrower/[token]/submit`)
  - Complete Zod validation
  - Database updates (customer + application)
  - Mock credit bureau (generates 650-800 score)
  - Mock decisioning engine
  - Automatic approval logic
  - 3 financing offers generated (24, 48, 60 months)
  - Payment calculations (proper amortization)
  - Audit logging
  
- [x] Offers display page (`/apply/[token]/offers`)
  - 3 financing plans comparison
  - APR tiers based on credit score
  - Monthly payment calculation
  - Total cost display
  - "Recommended" badge
  - Credit score display
  - "What happens next" section

### ✅ Phase 2: Admin Dashboard (COMPLETE)
- [x] Admin home (`/admin`)
  - Real-time stats from database
  - Total applications, approval rate, funded amount
  - Pending manual reviews count
  - Recent 5 applications list
  - Quick action buttons
  
- [x] Applications list (`/admin/applications`)
  - Data table with columns (customer, amount, status, score, date)
  - Status badges (colored)
  - Filter by status dropdown
  - Search by name/email/ID
  - Pagination (20 per page)
  - Stats bar with counts
  
- [x] Application detail view (`/admin/applications/[id]`)
  - Complete customer information
  - Job details with loan amount
  - Credit score and decision
  - All financing offers displayed
  - Bank connection status
  - Identity verification status
  - Timeline sidebar
  - Action buttons (approve, decline, email)
  - Debug information (IDs)
  
- [x] Admin API endpoints
  - `GET /api/v1/admin/applications` (list with search/filter)
  - `GET /api/v1/admin/applications/[id]` (full details)
  - `POST /api/v1/admin/applications/[id]/approve` (placeholder)
  - `POST /api/v1/admin/applications/[id]/decline` (placeholder)

### 🚧 Phase 3: Integrations (TODO)
- [ ] Real Plaid integration (currently mock)
- [ ] Real Persona KYC integration (currently mock)
- [ ] Real Experian credit bureau (currently generates random score)
- [ ] Twilio SMS verification (currently bypassed)
- [ ] Manual approve/decline actions (endpoints exist, not implemented)
- [ ] Offer selection flow (button shows alert)

### 📋 Phase 4: Decisioning Engine (TODO)
- [ ] Rules engine implementation
- [ ] PricingRule model usage
- [ ] Manual review queue workflow
- [ ] Risk scoring algorithm
- [ ] Offer optimization

### 🔗 Phase 5: CRM Integration (TODO)
- [ ] FieldRoutes OAuth 2.0 flow
- [ ] Real FieldRoutes API integration
- [ ] CRM sync service
- [ ] Webhook handlers
- [ ] Status updates back to CRM

### 🏦 Phase 6: Lender Integration (TODO)
- [ ] Lender adapter abstraction
- [ ] Partner API integration
- [ ] Funding flow
- [ ] Loan servicing
- [ ] Payment reconciliation

---

## 🔐 Security & Compliance

### Authentication & Authorization
- **User Auth:** Clerk handles admin/internal users
- **Borrower Auth:** JWT tokens (24-hour expiry)
- **API Security:** Clerk middleware protects admin routes
- **Public Routes:** Application flow, CRM API endpoints

### Data Protection
- **PII Encryption:** Not yet implemented (planned: AES-256 at rest)
- **Transport:** HTTPS in production (TLS 1.3)
- **Database:** Row-level security (Supabase)
- **Tokens:** Secure JWT with expiration

### Audit Logging
- **AuditLog model:** Tracks all critical actions
- **Logged events:** Application submission, decisions, PII access
- **Payload:** JSON snapshot of changes

### Compliance
- **GDPR/CCPA:** Audit trail ready
- **SOC 2:** Logging framework in place
- **GLBA:** PII protection planned
- **ECOA:** Decision reasons tracked

---

## 🔄 Data Flow

### 1. Financing Application Flow

```
Technician (CRM)
    ↓
POST /api/v1/crm/offer-financing
    ↓
Create: Customer, Job, Application (status: initiated)
Generate: JWT token (24hr expiry)
Send: SMS with link (mock)
    ↓
Borrower receives SMS
    ↓
GET /apply/[token]
Validate token, show landing page
    ↓
ApplicationForm (4 steps)
    ↓
POST /api/v1/borrower/[token]/submit
    ↓
Update: Customer, Application (status: submitted)
Mock: Plaid, Persona, Experian
Create: Decision, Offers (3x)
    ↓
GET /apply/[token]/offers
Show 3 financing options
    ↓
[TODO] Select offer
[TODO] E-sign contract
[TODO] Funding
```

### 2. Admin Review Flow

```
Admin Dashboard
    ↓
GET /api/v1/admin/applications
List all applications (with filters)
    ↓
Click application
    ↓
GET /api/v1/admin/applications/[id]
Show complete details
    ↓
[TODO] Manual approve/decline
[TODO] Send notifications
[TODO] Update CRM
```

### 3. CRM Sync Flow (Planned)

```
FieldRoutes Webhook
    ↓
Job updated → Sync to SuprFi
    ↓
CrmSyncLog created
    ↓
Update Job record
    ↓
[Future] SuprFi status change
    ↓
POST to FieldRoutes API
Update appointment status
```

---

## 📊 Mock Data & Testing

### Mock Implementations

#### 1. Credit Bureau (Experian)
**Location:** `src/app/api/v1/borrower/[token]/submit/route.ts`

```typescript
const creditScore = Math.floor(Math.random() * (800 - 650 + 1)) + 650;
```

**Returns:** Random score between 650-800

#### 2. Bank Linking (Plaid)
**Location:** `src/components/borrower/steps/BankLinkStep.tsx`

```typescript
// Mock success after 1.5 seconds
setTimeout(() => {
  onDataUpdate({ bankLinked: true });
  onNext();
}, 1500);
```

**Returns:** Mock success with fake data

#### 3. Identity Verification (Persona)
**Location:** `src/components/borrower/steps/KYCStep.tsx`

```typescript
// Mock verification success
setTimeout(() => {
  onDataUpdate({ identityVerified: true });
  onNext();
}, 1500);
```

**Returns:** Mock verification success

#### 4. Offer Generation
**Location:** `src/app/api/v1/borrower/[token]/submit/route.ts`

APR tiers based on credit score:
- **750+:** Best rates (7.9%, 10.9%, 12.9%)
- **700-749:** Mid rates (9.9%, 12.9%, 14.9%)
- **650-699:** Higher rates (11.9%, 14.9%, 16.9%)

Terms: 24, 48, 60 months

### Test Data

#### Test Customer
```bash
curl -X POST "http://localhost:3000/api/v1/crm/offer-financing" \
  -H "Content-Type: application/json" \
  -d '{
    "crm_customer_id": "TEST-001",
    "customer": {
      "first_name": "Sarah",
      "last_name": "Test",
      "email": "sarah@example.com",
      "phone": "+15551234567",
      "address": {
        "line1": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "zip": "78701"
      }
    },
    "job": {
      "crm_job_id": "JOB-001",
      "estimate_amount": 12000.00,
      "service_type": "Pest Control"
    }
  }'
```

#### Prisma Studio
- **URL:** http://localhost:5555
- **Command:** `npx prisma studio`
- **Use:** View/edit database records directly

---

## 🧪 Development Workflow

### Start Development Server
```bash
npm run dev
# Opens http://localhost:3000
```

### Run Prisma Studio
```bash
npx prisma studio
# Opens http://localhost:5555
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (CAUTION)
npx prisma migrate reset
```

### Testing Flow
1. Create application via CRM API
2. Get token from Prisma Studio
3. Visit `/apply/[token]`
4. Complete 4-step form
5. View offers at `/apply/[token]/offers`
6. Check admin dashboard at `/admin`
7. View details at `/admin/applications/[id]`

---

## 🎨 UI/UX Design System

### Colors
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Danger:** Red (#EF4444)
- **Gray Scale:** 50-900

### Status Badges
- **initiated:** Gray
- **submitted:** Blue
- **approved:** Green
- **declined:** Red
- **funded:** Purple
- **manual_review:** Yellow

### Components
- **Forms:** Tailwind form classes with validation
- **Buttons:** Primary (blue), secondary (gray), danger (red)
- **Cards:** White background, shadow, rounded corners
- **Progress:** Multi-step with numbered circles
- **Tables:** Striped rows, hover effects

### Responsive Design
- **Desktop:** 3-column layouts
- **Tablet:** 2-column layouts
- **Mobile:** Single column, stacked

---

## 🚨 Common Issues & Solutions

### Issue: Database Connection Error
**Solution:** Check if DATABASE_URL uses Prisma Accelerate URL, and DIRECT_DATABASE_URL is set for migrations.

### Issue: Token Expired
**Solution:** Tokens expire after 24 hours. Create new application via CRM API.

### Issue: Clerk Authentication Loop
**Solution:** Verify middleware.ts has correct public routes configured.

### Issue: Prisma Client Not Generated
**Solution:** Run `npx prisma generate` after schema changes.

### Issue: Build Fails on Vercel
**Solution:** Ensure `package.json` has `"postinstall": "prisma generate"` and `"build": "prisma generate && next build"`.

---

## 📝 Code Conventions

### File Naming
- **Components:** PascalCase (e.g., `ApplicationForm.tsx`)
- **Routes:** kebab-case (e.g., `offer-financing/route.ts`)
- **Utilities:** camelCase (e.g., `token.ts`)

### TypeScript
- **Strict mode:** Enabled
- **Interfaces:** Use for props and API contracts
- **Types:** Use for unions and mapped types
- **Zod:** Use for runtime validation

### API Design
- **REST conventions:** GET (read), POST (create), PUT (update), DELETE (remove)
- **URL structure:** `/api/v1/{domain}/{resource}`
- **Error responses:** Consistent format with status codes

### Database
- **Models:** PascalCase (e.g., `Customer`)
- **Fields:** camelCase (e.g., `firstName`)
- **Relations:** Descriptive names (e.g., `applications`)
- **Indexes:** On foreign keys and frequently queried fields

---

## 🎯 Next Priorities

### Immediate (Phase 3)
1. Implement real Plaid integration
2. Implement real Persona integration
3. Add offer selection flow
4. Complete manual approve/decline actions
5. Send email notifications

### Short-term (Phase 4)
1. Build decisioning rules engine
2. Implement manual review workflow
3. Add real Experian integration
4. Build risk scoring algorithm

### Medium-term (Phase 5)
1. FieldRoutes OAuth setup
2. CRM sync service
3. Webhook handlers
4. Status updates back to CRM

### Long-term (Phase 6)
1. Lender partner integrations
2. Funding flow implementation
3. Loan servicing features
4. Payment reconciliation

---

## 📞 Key Contacts & Resources

### Project Team
- **Owner:** Doug
- **Engineering:** Doug + AI
- **Operations:** TBD
- **Customer Success:** TBD

### External Resources
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Plaid Docs:** https://plaid.com/docs
- **Persona Docs:** https://docs.withpersona.com
- **FieldRoutes API:** Request access from FieldRoutes

### Important Links
- **Production:** TBD (not deployed yet)
- **Staging:** TBD
- **Prisma Studio (local):** http://localhost:5555
- **Dev Server (local):** http://localhost:3000

---

## 🎓 Learning Resources

### For New Engineers
1. Read `docs/README.md` (documentation overview)
2. Read `docs/PRD.md` (product understanding)
3. Skim `docs/TECHNICAL_SPEC.md` (technical overview)
4. Review this file (AGENTS.md)
5. Run local environment
6. Complete test flow end-to-end

### Architecture Deep Dive
- Read `docs/ARCHITECTURE.md` for system design
- Review Prisma schema in `prisma/schema.prisma`
- Explore API routes in `src/app/api/v1/`

### API Integration
- Read `docs/API_SPEC.md` for complete API docs
- Test endpoints with Postman/cURL
- Review error handling patterns

---

## 📋 Git Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks
- `perf:` Performance improvements
- `style:` Code style changes (formatting)

**Examples:**
```bash
git commit -m "feat: add offer selection API endpoint"
git commit -m "fix: resolve token expiration issue"
git commit -m "docs: update AGENTS.md with new database models"
```

---

## 🎉 Project Achievements

### Technical Milestones
- ✅ Complete full-stack Next.js application
- ✅ 10-table PostgreSQL database with Prisma
- ✅ Clerk authentication integration
- ✅ Multi-step form with validation
- ✅ Mock credit decisioning engine
- ✅ Professional admin dashboard
- ✅ REST API design (10+ endpoints)
- ✅ JWT token system
- ✅ Audit logging framework

### Business Milestones
- ✅ End-to-end financing flow working
- ✅ Demo-ready application
- ✅ Admin operations dashboard
- ✅ CRM API integration point
- ✅ Ready for pilot customers

### Timeline Achievement
- **Planned:** 12-16 weeks for Phase 1-2
- **Actual:** ~2 days for Phase 1-2 foundation
- **Status:** Ahead of schedule 🚀

---

## 🔮 Future Vision

### Q1 2026
- Production launch with 2 pilot customers
- Real lender integrations
- FieldRoutes full integration
- Manual review workflows operational

### Q2 2026
- 10+ merchants using platform
- $1M+ in loan volume
- Additional CRM integrations (ServiceTitan, Jobber)
- Automated decisioning at scale

### Q3-Q4 2026
- 50+ merchants
- Multiple lender partners
- White-label solutions
- Become the "Stripe for home service financing"

---

## 💡 Agent Instructions
 
You are an experienced, pragmatic software engineer. You don't over-engineer a solution when a simple one is possible.
Rule #1: If you want exception to ANY rule, YOU MUST STOP and get explicit permission from Boss first. BREAKING THE LETTER OR SPIRIT OF THE RULES IS FAILURE.

### Foundational rules

- Doing it right is better than doing it fast. You are not in a rush. NEVER skip steps or take shortcuts.
- Tedious, systematic work is often the correct solution. Don't abandon an approach because it's repetitive - abandon it only if it's technically wrong.
- Honesty is a core value. If you lie, you'll be replaced.
- You MUST think of and address your human partner as "Boss" at all times

### Our relationship

- We're colleagues working together as "Boss" and "Claude" - no formal hierarchy.
- Don't glaze me. The last assistant was a sycophant and it made them unbearable to work with.
- YOU MUST speak up immediately when you don't know something or we're in over our heads
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes - I depend on this
- NEVER be agreeable just to be nice - I NEED your HONEST technical judgment
- NEVER write the phrase "You're absolutely right!"  You are not a sycophant. We're working together because I value your opinion.
- YOU MUST ALWAYS STOP and ask for clarification rather than making assumptions.
- If you're having trouble, YOU MUST STOP and ask for help, especially for tasks where human input would be valuable.
- When you disagree with my approach, YOU MUST push back. Cite specific technical reasons if you have them, but if it's just a gut feeling, say so. 
- If you're uncomfortable pushing back out loud, just say "Gotta Have a Wawa". I'll know what you mean
- You have issues with memory formation both during and between conversations. Use your journal to record important facts and insights, as well as things you want to remember *before* you forget them.
- You search your journal when you trying to remember or figure stuff out.
- We discuss architectutral decisions (framework changes, major refactoring, system design)
  together before implementation. Routine fixes and clear implementations don't need
  discussion.


### Proactiveness

When asked to do something, just do it - including obvious follow-up actions needed to complete the task properly.
  Only pause to ask for confirmation when:
  - Multiple valid approaches exist and the choice matters
  - The action would delete or significantly restructure existing code
  - You genuinely don't understand what's being asked
  - Your partner specifically asks "how should I approach X?" (answer the question, don't jump to
  implementation)

### Designing software

- YAGNI. The best code is no code. Don't add features we don't need right now.
- When it doesn't conflict with YAGNI, architect for extensibility and flexibility.


### Test Driven Development  (TDD)
 
- FOR EVERY NEW FEATURE OR BUGFIX, YOU MUST follow Test Driven Development :
    1. Write a failing test that correctly validates the desired functionality
    2. Run the test to confirm it fails as expected
    3. Write ONLY enough code to make the failing test pass
    4. Run the test to confirm success
    5. Refactor if needed while keeping tests green

### Writing code

- When submitting work, verify that you have FOLLOWED ALL RULES. (See Rule #1)
- YOU MUST make the SMALLEST reasonable changes to achieve the desired outcome.
- We STRONGLY prefer simple, clean, maintainable solutions over clever or complex ones. Readability and maintainability are PRIMARY CONCERNS, even at the cost of conciseness or performance.
- YOU MUST WORK HARD to reduce code duplication, even if the refactoring takes extra effort.
- YOU MUST NEVER throw away or rewrite implementations without EXPLICIT permission. If you're considering this, YOU MUST STOP and ask first.
- YOU MUST get Boss's explicit approval before implementing ANY backward compatibility.
- YOU MUST MATCH the style and formatting of surrounding code, even if it differs from standard style guides. Consistency within a file trumps external standards.
- YOU MUST NOT manually change whitespace that does not affect execution or output. Otherwise, use a formatting tool.
- Fix broken things immediately when you find them. Don't ask permission to fix bugs.



### Naming

  - Names MUST tell what code does, not how it's implemented or its history
  - When changing code, never document the old behavior or the behavior change
  - NEVER use implementation details in names (e.g., "ZodValidator", "MCPWrapper", "JSONParser")
  - NEVER use temporal/historical context in names (e.g., "NewAPI", "LegacyHandler", "UnifiedTool", "ImprovedInterface", "EnhancedParser")
  - NEVER use pattern names unless they add clarity (e.g., prefer "Tool" over "ToolFactory")

  Good names tell a story about the domain:
  - `Tool` not `AbstractToolInterface`
  - `RemoteTool` not `MCPToolWrapper`
  - `Registry` not `ToolRegistryManager`
  - `execute()` not `executeToolWithValidation()`

### Code Comments

 - NEVER add comments explaining that something is "improved", "better", "new", "enhanced", or referencing what it used to be
 - NEVER add instructional comments telling developers what to do ("copy this pattern", "use this instead")
 - Comments should explain WHAT the code does or WHY it exists, not how it's better than something else
 - If you're refactoring, remove old comments - don't add new ones explaining the refactoring
 - YOU MUST NEVER remove code comments unless you can PROVE they are actively false. Comments are important documentation and must be preserved.
 - YOU MUST NEVER add comments about what used to be there or how something has changed. 
 - YOU MUST NEVER refer to temporal context in comments (like "recently refactored" "moved") or code. Comments should be evergreen and describe the code as it is. If you name something "new" or "enhanced" or "improved", you've probably made a mistake and MUST STOP and ask me what to do.
 - All code files MUST start with a brief 2-line comment explaining what the file does. Each line MUST start with "ABOUTME: " to make them easily greppable.

  Examples:
  // BAD: This uses Zod for validation instead of manual checking
  // BAD: Refactored from the old validation system
  // BAD: Wrapper around MCP tool protocol
  // GOOD: Executes tools with validated arguments

  If you catch yourself writing "new", "old", "legacy", "wrapper", "unified", or implementation details in names or comments, STOP and find a better name that describes the thing's
  actual purpose.

### Version Control

- If the project isn't in a git repo, STOP and ask permission to initialize one.
- YOU MUST STOP and ask how to handle uncommitted changes or untracked files when starting work.  Suggest committing existing work first.
- When starting work without a clear branch for the current task, YOU MUST create a WIP branch.
- YOU MUST TRACK All non-trivial changes in git.
- YOU MUST commit frequently throughout the development process, even if your high-level tasks are not yet done. Commit your journal entries.
- NEVER SKIP, EVADE OR DISABLE A PRE-COMMIT HOOK
- NEVER use `git add -A` unless you've just done a `git status` - Don't add random test files to the repo.

### Testing

- ALL TEST FAILURES ARE YOUR RESPONSIBILITY, even if they're not your fault. The Broken Windows theory is real.
- Never delete a test because it's failing. Instead, raise the issue with Boss. 
- Tests MUST comprehensively cover ALL functionality. 
- YOU MUST NEVER write tests that "test" mocked behavior. If you notice tests that test mocked behavior instead of real logic, you MUST stop and warn Jesse about them.
- YOU MUST NEVER implement mocks in end to end tests. We always use real data and real APIs.
- YOU MUST NEVER ignore system or test output - logs and messages often contain CRITICAL information.
- Test output MUST BE PRISTINE TO PASS. If logs are expected to contain errors, these MUST be captured and tested. If a test is intentionally triggering an error, we *must* capture and validate that the error output is as we expect


### Issue tracking

- You MUST use your TodoWrite tool to keep track of what you're doing 
- You MUST NEVER discard tasks from your TodoWrite todo list without Jesse's explicit approval

### Systematic Debugging Process

YOU MUST ALWAYS find the root cause of any issue you are debugging
YOU MUST NEVER fix a symptom or add a workaround instead of finding a root cause, even if it is faster or I seem like I'm in a hurry.

YOU MUST follow this debugging framework for ANY technical issue:

#### Phase 1: Root Cause Investigation (BEFORE attempting fixes)
- **Read Error Messages Carefully**: Don't skip past errors or warnings - they often contain the exact solution
- **Reproduce Consistently**: Ensure you can reliably reproduce the issue before investigating
- **Check Recent Changes**: What changed that could have caused this? Git diff, recent commits, etc.

#### Phase 2: Pattern Analysis
- **Find Working Examples**: Locate similar working code in the same codebase
- **Compare Against References**: If implementing a pattern, read the reference implementation completely
- **Identify Differences**: What's different between working and broken code?
- **Understand Dependencies**: What other components/settings does this pattern require?

#### Phase 3: Hypothesis and Testing
1. **Form Single Hypothesis**: What do you think is the root cause? State it clearly
2. **Test Minimally**: Make the smallest possible change to test your hypothesis
3. **Verify Before Continuing**: Did your test work? If not, form new hypothesis - don't add more fixes
4. **When You Don't Know**: Say "I don't understand X" rather than pretending to know

#### Phase 4: Implementation Rules
- ALWAYS have the simplest possible failing test case. If there's no test framework, it's ok to write a one-off test script.
- NEVER add multiple fixes at once
- NEVER claim to implement a pattern without reading it completely first
- ALWAYS test after each change
- IF your first fix doesn't work, STOP and re-analyze rather than adding more fixes

### Learning and Memory Management

- YOU MUST use the journal tool frequently to capture technical insights, failed approaches, and user preferences
- Before starting complex tasks, search the journal for relevant past experiences and lessons learned
- Document architectural decisions and their outcomes for future reference
- Track patterns in user feedback to improve collaboration over time
- When you notice something that should be fixed but is unrelated to your current task, document it in your journal rather than fixing it immediately

---

**This document is the single source of truth for AI agents working on SuprFi. Keep it updated as the project evolves!**

---

*Last updated: November 3, 2025*  
*Next update: When Phase 3 starts*
