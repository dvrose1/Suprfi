# SuprFi Investor Demo Guide

Complete step-by-step instructions for demonstrating SuprFi's embedded financing platform.

---

## Environment URLs

| Environment | Base URL |
|-------------|----------|
| **Local** | http://localhost:3000 |
| **Staging** | https://suprfi-git-staging-dvrose1s-projects.vercel.app |

> **Note:** All demo flows below work identically on both environments. Replace `localhost:3000` with the staging URL when testing remotely.

---

## Pre-Demo Setup

### Local Development (5 minutes)
```bash
cd /Users/doug/Documents/Dev/Suprfi
npm run dev
```
Server runs at: **http://localhost:3000**

### Reset Demo Accounts (Local or Staging)

**For Local:**
```bash
node prisma/seed-demo.js
node prisma/seed-demo-data.js  # Optional: adds 12 months of realistic data
```

**For Staging:**
```bash
# Set the staging database URL temporarily
DATABASE_URL="your-staging-database-url" node prisma/seed-demo.js
DATABASE_URL="your-staging-database-url" node prisma/seed-demo-data.js
```

Or use the npm scripts:
```bash
npm run seed:demo           # Seeds demo accounts
npm run seed:demo-data      # Seeds 12 months of application data
```

---

## Demo Credentials

### Admin Portal (SuprOps)
| Field | Value |
|-------|-------|
| URL (Local) | http://localhost:3000/admin/login |
| URL (Staging) | https://suprfi-git-staging-dvrose1s-projects.vercel.app/admin/login |
| Email | `doug@suprfi.com` or `demo@suprfi.com` |
| Password | `Demo1234!` |

### Merchant Portal (SuprClient)
| Field | Value |
|-------|-------|
| URL (Local) | http://localhost:3000/client/login |
| URL (Staging) | https://suprfi-git-staging-dvrose1s-projects.vercel.app/client/login |
| Email | `demo@contractor.com` |
| Password | `Demo1234!` |

### Plaid Test Credentials (Bank Linking)
| Field | Value |
|-------|-------|
| Username | `user_good` |
| Password | `pass_good` |

---

## Demo Flow (15-20 minutes)

### Act 1: Merchant Portal Overview (3 min)

**Story:** "Let's start from the contractor's perspective - this is what a home service company sees."

| Step | Action | What to Show |
|------|--------|--------------|
| 1 | Go to http://localhost:3000/client/login | Login page |
| 2 | Login with `demo@contractor.com` / `Demo1234!` | |
| 3 | **Dashboard** | KPIs: Sold, Funded, Avg Loan Size, Approval Rate |
| 4 | Point out **Conversion Funnel** | Shows initiated → submitted → approved → funded |
| 5 | Show **Live Activity Feed** | Real-time updates when customers apply |
| 6 | Click **Applications** in nav | List of all financing requests |
| 7 | Click **Team** in nav | Team member management |
| 8 | Click **Settings** | Settings page with integrations |

**Key Talking Points:**
- "Everything a contractor needs in one dashboard"
- "Real-time visibility into their financing pipeline"
- "No switching between systems"

---

### Act 2: CRM Integration (2 min)

**Story:** "Contractors connect their existing CRM - we start with Jobber, the #1 CRM for home services."

| Step | Action | What to Show |
|------|--------|--------------|
| 9 | On Settings page, show **Integrations** section | Jobber card |
| 10 | Show "Connect Jobber Account" button | OAuth flow ready |
| 11 | (Optional) If Jobber sandbox configured, click to show OAuth | |

**Key Talking Points:**
- "One-click OAuth connection"
- "Financing offers triggered directly from their CRM"
- "ServiceTitan, HouseCall Pro coming soon"

---

### Act 3: Send Financing Link (3 min)

**Story:** "When a technician is on-site and the customer needs financing, they send a link in seconds."

| Step | Action | What to Show |
|------|--------|--------------|
| 12 | Click **"+ New"** or **Send Link** button | Quick send page |
| 13 | Show 3 tabs: **QR Code**, **SMS**, **Email** | Multiple send options |
| 14 | Fill in customer info and amount | Demo the UI |
| 15 | Click **"Send via SMS"** | Show success confirmation |

**IMPORTANT - Local Dev Limitation:** SMS/Email are not actually sent in local dev (no Twilio/Resend configured). The UI will show success, but no message is sent.

**To get the application link, use the demo API:**
```bash
curl -X POST http://localhost:3000/api/v1/demo/create-application \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Sarah","lastName":"Johnson","estimateAmount":7500}'
```

The response includes a `link` field - copy and paste that URL into your browser (or a new tab to simulate the customer's phone).

**Key Talking Points:**
- "30 seconds to offer financing"
- "QR code for in-person, SMS for remote"
- "Customer gets a secure link instantly"

---

### Act 4: Customer Application (5 min)

**Story:** "Now let's see what the homeowner experiences - a 5-minute mobile-first application."

| Step | Action | What to Show |
|------|--------|--------------|
| 18 | Open the SMS link (or paste from API response) | Landing page with amount |
| 19 | Show: Amount, contractor name, security notice | Trust indicators |
| 20 | **Step 1: Personal Info** | Pre-filled name, enter SSN |
| | - SSN: `123-45-6789` (any format, auto-formats) | |
| | - Date of Birth: Any past date | |
| | - Address: Pre-filled or enter any | |
| 21 | Click **Continue** | |
| 22 | **Step 2: Link Bank Account** | Plaid integration |
| | - (Mock) Just click continue - auto-links | |
| | - In real Plaid: use `user_good` / `pass_good` | |
| 23 | **Step 3: Identity Verification** | Persona KYC |
| | - (Mock) Auto-verifies after 1.5 seconds | |
| 24 | **Step 4: Review & Consent** | 3 checkboxes |
| | - Check all 3 consent boxes | |
| | - Click **Submit Application** | |
| 25 | **Offers Page** appears! | 3 financing options |

**Key Talking Points:**
- "Mobile-first, takes 5 minutes or less"
- "Bank-level security, encrypted data"
- "Instant verification - no manual underwriting"

---

### Act 5: Choose Payment Plan (2 min)

**Story:** "The customer sees their approval and chooses how to pay."

| Step | Action | What to Show |
|------|--------|--------------|
| 26 | Show **"You're Approved!"** banner | Celebration moment |
| 27 | Compare 3 payment options: | |
| | - **Pay in 4** (6 weeks, 0% APR) - RECOMMENDED | |
| | - **Pay in 4 Monthly** (3 months, 0% APR) | |
| | - **6 Month Plan** (14.99% APR) | |
| 28 | Click **"Select This Plan"** on recommended | |
| 29 | **Agreement Page** | Legal terms, payment summary |
| 30 | Check 3 consent boxes | |
| 31 | Type signature (e.g., `Sarah Johnson`) | Electronic signature |
| 32 | Click **"Sign & Accept Agreement"** | |
| 33 | **Success Page** | Confirmation with next steps |

**Key Talking Points:**
- "0% APR options for qualified borrowers"
- "Clear, simple terms - no hidden fees"
- "Legally binding e-signature"

---

### Act 6: Back to Merchant Portal (2 min)

**Story:** "The contractor sees the application instantly in their dashboard."

| Step | Action | What to Show |
|------|--------|--------------|
| 34 | Go back to http://localhost:3000/client | Merchant dashboard |
| 35 | Show **Live Activity Feed** | New application appears! |
| 36 | Show updated **KPIs** | Numbers updated |
| 37 | Click into the application | Full detail view |
| 38 | Show: Customer info, credit score, selected plan | All data visible |

**Key Talking Points:**
- "Real-time updates - no refreshing"
- "Full visibility into every application"
- "Contractor knows when to schedule the work"

---

### Act 7: Admin Dashboard - SuprOps (3 min)

**Story:** "Behind the scenes, our operations team has full control."

| Step | Action | What to Show |
|------|--------|--------------|
| 39 | Go to http://localhost:3000/admin/login | Admin login |
| 40 | Login with `doug@suprfi.com` / `Demo1234!` | |
| 41 | **Dashboard** | Global stats across all contractors |
| 42 | Click **Applications** | All applications, search & filter |
| 43 | Click into an application | Full detail + actions |
| 44 | Show **Manual Review Queue** | Applications needing human review |
| 45 | Show **Contractor Partners** | Onboarded contractors |
| 46 | Show **Waitlist** | Lead pipeline |
| 47 | Show **Audit Log** (god role) | Complete activity trail |

**Key Talking Points:**
- "Complete visibility and control"
- "Manual review for edge cases"
- "Audit trail for compliance"

---

## Quick Demo (5 min version)

If short on time, show just these steps:

1. **Merchant Login** → Dashboard overview (30 sec)
2. **Send Link** → Quick send via SMS (1 min)
3. **Customer Application** → Walk through 4 steps (2 min)
4. **Offers + Agreement** → Select plan, sign (1 min)
5. **Admin Dashboard** → Global operations view (30 sec)

---

## Demo API Endpoints

### Create Demo Application (no SMS)
```bash
curl -X POST http://localhost:3000/api/v1/demo/create-application \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Demo",
    "lastName": "User",
    "email": "demo@example.com",
    "phone": "5551234567",
    "estimateAmount": 5000
  }'
```

Returns:
```json
{
  "success": true,
  "link": "http://localhost:3000/apply/[TOKEN]",
  "applicationId": "...",
  ...
}
```

### Trigger CRM Test (sends real SMS)
```
GET http://localhost:3000/api/v1/test-crm
```
Uses phone: +15162432868 (Doug's number)

---

## Troubleshooting

### "Invalid or Expired Link"
Application tokens expire after 24 hours. Create a new one:
```bash
curl -X POST http://localhost:3000/api/v1/demo/create-application
```

### "Login Failed"
Reset demo passwords:
```bash
node prisma/seed-demo.js
```

### Database Issues
Open Prisma Studio to inspect data:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### SMS Not Received
- Check Twilio is configured in `.env.local`
- Use the demo API endpoint instead (doesn't require SMS)

---

## Key Stats to Mention

- **5 minutes** - Average application time
- **Instant** - Credit decision (no manual underwriting for most)
- **0% APR** - Available for qualified borrowers
- **30 seconds** - Time for technician to send financing offer
- **$500-$25,000** - Loan range

---

## Competitive Advantages

1. **Embedded in CRM** - No new software to learn
2. **Mobile-first** - Customers apply on their phone
3. **Instant decisions** - No waiting for approval
4. **Multiple options** - BNPL and installment loans
5. **Full visibility** - Contractors track every application

---

*Last Updated: January 2026*
