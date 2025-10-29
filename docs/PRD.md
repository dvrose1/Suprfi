# FlowPay Product Requirements Document (PRD)

**Version:** v1.0  
**Last Updated:** October 28, 2025  
**Status:** Approved

---

## 1. Overview

### 1.1 Product Name
**FlowPay** (by Flow Finance / FlowFi)

### 1.2 Summary
FlowPay is an embedded consumer financing platform for home service businesses. It allows technicians to offer "Pay Later" options to homeowners for large service costs (e.g., pest control, HVAC, generators, etc.) without leaving their CRM.

Phase 1 MVP connects with existing CRMs like FieldRoutes via API, allowing technicians to trigger financing offers via SMS and automatically synchronize key data between FlowPay and the CRM.

### 1.3 Problem Statement
- Home service providers lack seamless financing options integrated into their workflow
- Technicians must leave their CRM (e.g., FieldRoutes) to log into external systems like Wisestack
- Payments require manual reconciliation
- Consumers have limited, clunky access to financing — often needing to apply separately
- This creates friction, lost sales, and poor customer experiences

### 1.4 Vision
To become the default embedded financing layer for home service CRMs — enabling instant, fair, and transparent financing at the point of sale.

### 1.5 Mission
Empower home service professionals to close more sales while giving homeowners flexible, trusted payment options — all without ever leaving their workflow.

### 1.6 Goals & Success Metrics

| Goal | KPI / Metric | Target |
|------|--------------|--------|
| Simplify technician financing process | Avg time from quote → financing offer | < 2 minutes |
| Increase financing adoption | % of eligible transactions financed | 30% of transactions |
| Reduce reconciliation work | Time to reconcile financing payments | 90% reduction |
| Deliver seamless borrower experience | Avg borrower NPS | ≥ 60 |

---

## 2. Core MVP Features

### 2.1 Borrower Experience
1. Technician triggers pre-qualification link via API → SMS
2. Borrower receives text with a unique prefilled link
3. FlowPay web app (React + Node.js on Vercel) guides borrower through:
   - KYC (Persona)
   - Bank linking (Plaid)
   - Credit soft pull (Experian API)
   - Decisioning either in-house or through lender network
   - Offer acceptance and agreement e-sign
4. Confirmation sent to technician and CRM automatically

### 2.2 Merchant / CRM Integration
- CRM integration (initially FieldRoutes) via REST API
- Automatically:
  - Read customer & job details from CRM
  - Write back financing status, offer details, and funding confirmation
  - Sync payments and reconciliation data

### 2.3 Third-Party Integrations

| Provider | Purpose | Notes |
|----------|---------|-------|
| Plaid | Bank connection & verification | Used for underwriting + repayments |
| Persona | KYC / AML | Used for borrower verification |
| Experian | Credit score & soft pull | For pre-qualification |
| Lending Partner API | Loan underwriting & disbursement | Route to partners initially |

### 2.4 Admin / Partner Dashboard
- View financing applications, statuses, and repayment metrics
- Manage CRM partners and API credentials

---

## 3. FieldRoutes API Mapping

| FieldRoutes Object | FlowPay Field | Direction | Description |
|-------------------|---------------|-----------|-------------|
| customerId | crmCustomerId | ↔ | Unique customer ID |
| customer.firstName | firstName | → | Borrower prefill |
| customer.lastName | lastName | → | Borrower prefill |
| customer.email | email | → | Borrower prefill |
| customer.phone | phone | → | Used for SMS link |
| address.street | addressLine1 | → | Address |
| address.city | city | → | City |
| address.zip | postalCode | → | ZIP |
| appointment.id | jobId | ↔ | Job link |
| appointment.totalCost | loanAmount | → | Pre-filled loan request |
| appointment.status | financingStatus | ← | Updates from FlowPay |
| payment.status | paymentStatus | ← | Used for reconciliation |
| payment.transactionId | fundingId | ← | Funding reference |

---

## 4. Technical Architecture Overview

### 4.1 Stack
- **Frontend:** Next.js 14+ (Vercel)
- **Backend:** Next.js API Routes + Node.js microservices
- **Database:** Postgres (Supabase)
- **Authentication:** Clerk
- **API Layer:** REST + Webhooks
- **CRM Integration:** FieldRoutes API + Webhooks
- **Third-party APIs:** Plaid, Persona, Experian, lender network

### 4.2 High-Level Flow
1. Technician triggers financing in FieldRoutes (click "Offer Financing")
2. FR calls our endpoint: `POST /api/v1/crm/offer-financing` with job/customer payload
3. FlowPay generates a secure tokenized link and sends SMS (Twilio) to customer
4. Customer opens React web app using token:
   - Token validated
   - Page prefilled with job/customer data
5. Borrower flow:
   - Bank linking (Plaid)
   - KYC (Persona)
   - Soft credit pull (Experian)
   - Internal Decision Logic → present offers
6. Decision & e-sign:
   - If approved, present offer, collect e-sign
   - Save signed agreement
7. Funding:
   - Call lender API to create loan and request disbursement
   - Lender calls back via webhook with funding status
8. CRM writeback:
   - Update FieldRoutes with financing status, loanId, fundedAmount, etc.
9. Reconciliation:
   - Payment webhooks from lender → FlowPay → CRM updates

---

## 5. User Stories & MVP Tasks

### 5.1 Borrower Experience
**Epic:** As a homeowner, I want to apply for financing quickly and securely so I can pay over time.

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| BX1 | As a borrower, I can open a unique link from an SMS | P1 | Link pre-fills my info |
| BX2 | As a borrower, I can connect my bank via Plaid | P1 | Connection successful and verified |
| BX3 | As a borrower, I can complete KYC | P1 | Verified or flagged via Persona |
| BX4 | As a borrower, I can receive instant prequalification | P1 | Displays offer and payment schedule |
| BX5 | As a borrower, I can e-sign and confirm loan | P2 | E-sign API integrated |
| BX6 | As a borrower, I can view repayment terms | P2 | Confirmation summary page |

### 5.2 Technician / Merchant Integration
**Epic:** As a technician, I want to trigger financing offers from within my CRM without leaving my workflow.

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| MX1 | As a technician, I can click "Offer Financing" in CRM | P1 | Opens FlowPay API link |
| MX2 | As a merchant, I see financing status synced | P1 | CRM updates when loan is approved |
| MX3 | As a merchant, I can reconcile financing payments | P2 | Payment updates sync automatically |

### 5.3 API & Platform

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| API1 | As a system, I can pull customer/job data from CRM | P1 | Data retrieved via FieldRoutes API |
| API2 | As a system, I can send financing updates back | P1 | CRM receives webhook updates |
| API3 | As a system, I can connect to Plaid | P1 | Bank account verified |
| API4 | As a system, I can connect to Persona | P1 | KYC check completed |
| API5 | As a system, I can perform credit pull | P2 | Credit data received successfully |

### 5.4 Admin / Internal

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| ADM1 | As an admin, I can view financing applications | P2 | Dashboard with basic filters |
| ADM2 | As an admin, I can run analytics on approval rates by merchant | P3 | Merchant-level stats dashboard |
| ADM3 | As an ops user, I can view payment schedules for any loan | P0 | Payment schedule viewer |
| ADM4 | As an ops user, I can reconcile an incoming funding payment to a loan | P0 | Manual reconciliation interface |

---

## 6. Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| CRM API limitations | High | Start with mock integration, request sandbox access early |
| Credit bureau integration complexity | Medium | Start with Experian, use sandbox initially |
| SMS deliverability | Medium | Use Twilio verified numbers |
| Loan disbursement partner delays | High | Start with mock partner sandbox, design for multiple lenders |

---

## 7. Launch Plan

### Phase 1: Build MVP
1. Build borrower web flow & backend
2. Internal tool for customer management
3. Integrate with Plaid + Persona sandbox
4. Implement mock FieldRoutes integration
5. Build decisioning engine

### Phase 2: Real Integrations
1. Connect real FieldRoutes API (when sandbox ready)
2. Integrate Experian credit bureau
3. Connect lender partner APIs

### Phase 3: Pilot Launch
1. Launch pilot with 1-2 merchants (ProForce and Rack Electric)
2. Gather feedback, iterate on API experience

---

## 8. Future Roadmap

- **Phase 2:** Full embedded financing module inside CRMs
- **Phase 3:** Consumer-facing prequalification marketplace
- **Phase 4:** Real-time partner analytics dashboard

---

## Appendix A: Decisioning Engine Requirements

### A.1 Where It Fits
New microservice: **Decisioning Service** (Underwriting Engine)
- Sits between Integrations Service and Lender Adapter
- Invoked after Plaid/KYC/credit data available

### A.2 Financing Options & Pricing Model

Example offers for $10,000 job:

**Option A — Short Term (Lower APR)**
- Term: 12 months
- APR: 6.9%
- Monthly: $862.07
- Down payment: 0%
- Fees: Origination fee 1% ($100)

**Option B — Balanced**
- Term: 24 months
- APR: 9.9%
- Monthly: $460.85
- Down payment: 0%
- Fees: Origination fee 0.5% ($50)

**Option C — Lower Monthly**
- Term: 60 months
- APR: 14.9%
- Monthly: $229.95
- Down payment: 10% ($1,000) optional
- Fees: Minimal

### A.3 Decisioning Signals (Inputs)
- **Credit bureau:** FICO score, derogatory flags, recent inquiries, public records
- **Plaid-derived:** Income estimate, cash flow, account age, transaction patterns, overdrafts
- **KYC signals:** Identity match, device fingerprint, geolocation vs address
- **Behavioral/fraud:** Rapid form completion, mismatched info, fraud flags
- **Job context:** Loan amount, merchant risk tier, technician score
- **Portfolio exposure:** Internal exposure to similar loans

### A.4 Decisioning Approach
**Hybrid design:**
1. **Rule-based layer:** Hard accept/decline rules (bankruptcies, SSN mismatch, fraud)
2. **Scoring model:** Risk score combining bureau, Plaid signals, historical performance
3. **Policy & pricing layer:** Map score buckets to offers (APR spread, max term, down payment)
4. **Waterfall lender routing:** Route to best-fit lender based on score

### A.5 Score Buckets & Mapping
- Score ≥ 750 → Tier A (12/24/36 months; APR base + 2%)
- Score 700–749 → Tier B (12/24/36/48 months; APR base + 4%)
- Score 650–699 → Tier C (24/36/48/60 months; APR base + 7%)
- Score < 650 → Soft-decline or manual review; require down payment

### A.6 Decision Response Example
```json
{
  "application_id": "APP-001",
  "decision": "approved",
  "score": 721,
  "offers": [
    {
      "offer_id": "O-1001",
      "term_months": 24,
      "apr": 9.9,
      "monthly_payment": 460.85,
      "down_payment": 0,
      "origination_fee": 50,
      "lender": "LENDER_A",
      "routing": "AUTO"
    }
  ],
  "decision_metadata": {
    "rule_hits": ["no_bank_overdraft", "income_threshold_pass"],
    "credit_snapshot": {},
    "plaid_snapshot": {}
  }
}
```

### A.7 Manual Review
Some cases flagged for manual review:
- Fraud flags
- Thin credit file
- Borderline score

Admin tool allows ops users to:
- Approve with offered pricing
- Approve with altered terms (require down payment)
- Decline with coded reason
- Route to specific lender

---

## Appendix B: FlowOps (Admin Tool Requirements)

### B.1 Roles & Permissions
- **Admin (Super):** Full access, manage lenders, rules, users
- **Underwriter / Ops:** Manual decisioning, overrides, queue handling
- **Merchant Support:** View application status, customer support (no underwriting)
- **Auditor / Compliance:** Read-only access to logs and KYC/decision artifacts

### B.2 Core Features

#### Applications Dashboard
- Filter/search (status, date, merchant, loan amount, score)
- Quick view (customer info, job, amount, top risk signals)
- Link to full application detail

#### Application Detail Page
- Full applicant data, Plaid snapshot, credit snapshot, KYC docs
- Decision summary: score, rule_hits, offers generated
- Action buttons: Approve, Decline, Send back to borrower, Request more info
- Activity timeline & audit (who did what and when)

#### Manual Review Queue
- Prioritized list, reason for flag, assign to user, SLA tracking
- Inline notes and escalation path

#### Rules & Pricing Management UI
- Visual rules editor (JSON or simple UI)
- Set thresholds and pricing adjustments
- Versioning & testing (simulate rules against historical apps)
- Activate/deactivate rules, schedule changes

#### Lender Routing & Configuration
- Configure lender credentials, endpoints, allowed terms
- Set routing rules and priority per score bucket
- Sandbox toggle

#### Loan Management & Payment Schedule Viewer
- View payment schedule (amortization), next payment due, outstanding balance
- Ability to reschedule payments, issue refunds, apply manual payments
- Exportable statements (PDF)

#### Reconciliation Console
- Show merchant settlements, funded loans vs posted payments
- Flag mismatches
- Manual reconcile (mark external funding as received)
- DLQ for failed webhook events and retry UI

#### Compliance & Audit
- Download KYC docs, signed agreements, decision snapshots
- Audit log viewer with filters (by actor, action, date)
- Retention policy controls

#### Reporting & Analytics
- Approvals by cohort, default rates, time-to-fund, merchant performance
- Export custom reports (CSV/PDF)
- KPI dashboards (NPS, approval rate by merchant, conversion by step)

#### Testing & Simulation
- Replay historic application into staging decision engine
- Sandbox endpoints for Lender/Plaid/Persona

---

*End of Product Requirements Document*
