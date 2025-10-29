# FlowPay API Specification

**Version:** v1.0  
**Base URL:** `https://api.flowpay.com/v1`  
**Last Updated:** October 29, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [CRM Integration API](#crm-integration-api)
5. [Borrower API](#borrower-api)
6. [Decisioning API](#decisioning-api)
7. [Admin API](#admin-api)
8. [Webhook Events](#webhook-events)
9. [Postman Collection](#postman-collection)

---

## Authentication

### API Key Authentication (CRM Partners)

```http
POST /api/v1/crm/offer-financing
x-api-key: sk_live_abc123xyz789
Content-Type: application/json
```

**API Key Format:**
- Development: `sk_dev_...`
- Production: `sk_live_...`

**Rotation:** Every 90 days (automatic email notification)

### JWT Authentication (Borrower & Admin)

```http
GET /api/v1/borrower/abc123
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Lifetime:**
- Access Token: 15 minutes
- Refresh Token: 7 days

**Claims:**
```json
{
  "sub": "user_123",
  "role": "borrower",
  "email": "john@example.com",
  "exp": 1698765432
}
```

---

## Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Public (CRM API) | 100 requests | 1 minute |
| Borrower API | 60 requests | 1 minute |
| Admin API | 300 requests | 1 minute |
| Webhooks | 1000 requests | 1 minute |

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

**429 Response:**
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please retry after 60 seconds."
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request body is invalid",
    "details": {
      "field": "customer.email",
      "issue": "Invalid email format"
    },
    "request_id": "req_abc123"
  }
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | Request body validation failed |
| 401 | `unauthorized` | Missing or invalid authentication |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource already exists |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Server error |
| 503 | `service_unavailable` | Temporary outage |

---

## CRM Integration API

### Create Financing Offer

Trigger a financing offer for a customer/job from CRM.

**Endpoint:** `POST /api/v1/crm/offer-financing`

**Authentication:** API Key

**Request:**
```json
{
  "crm_customer_id": "FR12345",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
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
  },
  "metadata": {
    "office_id": "ATX-001",
    "campaign": "fall_promotion"
  }
}
```

**Response (200):**
```json
{
  "application_id": "APP-abc123",
  "token": "eyJhbGc...",
  "link": "https://app.flowpay.com/apply/eyJhbGc...",
  "sms_sent": true,
  "expires_at": "2025-11-01T18:30:00Z"
}
```

**Response (400) - Invalid Request:**
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Phone number is required for SMS delivery",
    "details": {
      "field": "customer.phone",
      "issue": "Field is missing"
    }
  }
}
```

---

### Get Application Status

Retrieve the current status of a financing application.

**Endpoint:** `GET /api/v1/crm/applications/:application_id`

**Authentication:** API Key

**Response (200):**
```json
{
  "application_id": "APP-abc123",
  "crm_customer_id": "FR12345",
  "crm_job_id": "JOB-9876",
  "status": "approved",
  "created_at": "2025-10-29T14:30:00Z",
  "updated_at": "2025-10-29T15:45:00Z",
  "decision": {
    "score": 721,
    "status": "approved",
    "decided_at": "2025-10-29T15:30:00Z"
  },
  "loan": {
    "loan_id": "LOAN-xyz789",
    "funded_amount": 7500.00,
    "funding_date": "2025-10-30T10:00:00Z",
    "status": "funded",
    "term_months": 24,
    "apr": 9.9,
    "monthly_payment": 343.21,
    "next_payment_date": "2025-11-30"
  }
}
```

**Application Status Values:**
- `initiated` - Application created, SMS sent
- `in_progress` - Borrower started application
- `submitted` - Borrower completed all steps
- `under_review` - Manual review required
- `approved` - Approved, awaiting borrower acceptance
- `declined` - Application declined
- `accepted` - Borrower accepted offer
- `funded` - Loan funded

---

### Update Application Callback

Receive updates when application status changes (via webhook).

**Endpoint:** `POST {your_webhook_url}`

**Payload:**
```json
{
  "event": "application.status_changed",
  "timestamp": "2025-10-29T15:45:00Z",
  "data": {
    "application_id": "APP-abc123",
    "crm_customer_id": "FR12345",
    "crm_job_id": "JOB-9876",
    "status": "funded",
    "previous_status": "approved",
    "loan": {
      "loan_id": "LOAN-xyz789",
      "funded_amount": 7500.00,
      "funding_date": "2025-10-30T10:00:00Z"
    }
  }
}
```

**Webhook Signature Verification:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Borrower API

### Get Application

Retrieve prefilled application data using the token from SMS link.

**Endpoint:** `GET /api/v1/borrower/:token`

**Authentication:** JWT (from Clerk session)

**Response (200):**
```json
{
  "application": {
    "id": "APP-abc123",
    "status": "initiated",
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
      "estimate_amount": 7500.00,
      "service_type": "HVAC Installation"
    }
  }
}
```

**Response (404):**
```json
{
  "error": {
    "code": "not_found",
    "message": "Application not found or token expired"
  }
}
```

---

### Link Bank Account (Plaid)

Exchange Plaid public token for access token.

**Endpoint:** `POST /api/v1/borrower/:token/plaid`

**Authentication:** JWT

**Request:**
```json
{
  "public_token": "public-sandbox-abc123",
  "account_id": "acc_xyz789",
  "metadata": {
    "institution": {
      "name": "Chase Bank",
      "institution_id": "ins_3"
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "account_linked": true,
  "account_name": "Chase Checking",
  "account_mask": "1234"
}
```

---

### Submit KYC (Persona)

Submit Persona inquiry ID after identity verification.

**Endpoint:** `POST /api/v1/borrower/:token/kyc`

**Authentication:** JWT

**Request:**
```json
{
  "inquiry_id": "inq_abc123xyz",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "kyc_status": "verified"
}
```

---

### Submit Application

Complete and submit the application for decisioning.

**Endpoint:** `POST /api/v1/borrower/:token/submit`

**Authentication:** JWT

**Request:**
```json
{
  "plaid_token": "access-sandbox-abc123",
  "persona_inquiry_id": "inq_xyz789",
  "consent": {
    "credit_check": true,
    "terms_accepted": true,
    "e_sign": true,
    "sms_notifications": true
  },
  "additional_info": {
    "employment_status": "full_time",
    "monthly_income": 6500.00
  }
}
```

**Response (200):**
```json
{
  "application_id": "APP-abc123",
  "status": "submitted",
  "decision_id": "DEC-def456",
  "next_step": "view_offers"
}
```

**Response (202) - Manual Review:**
```json
{
  "application_id": "APP-abc123",
  "status": "under_review",
  "message": "Your application requires additional review. We'll notify you within 24 hours.",
  "estimated_decision_time": "2025-10-30T15:00:00Z"
}
```

---

### Get Offers

Retrieve available financing offers after approval.

**Endpoint:** `GET /api/v1/borrower/:token/offers`

**Authentication:** JWT

**Response (200):**
```json
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
      "total_amount": 8237.50,
      "recommended": true
    },
    {
      "offer_id": "OFF-002",
      "term_months": 48,
      "apr": 12.9,
      "monthly_payment": 200.15,
      "down_payment": 0,
      "origination_fee": 37.50,
      "total_amount": 9644.70,
      "recommended": false
    },
    {
      "offer_id": "OFF-003",
      "term_months": 60,
      "apr": 14.9,
      "monthly_payment": 176.82,
      "down_payment": 750.00,
      "origination_fee": 0,
      "total_amount": 11359.20,
      "recommended": false
    }
  ]
}
```

---

### Accept Offer

Accept a financing offer and provide e-signature.

**Endpoint:** `POST /api/v1/borrower/:token/accept`

**Authentication:** JWT

**Request:**
```json
{
  "offer_id": "OFF-001",
  "signature": {
    "data_url": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "signed_at": "2025-10-29T16:00:00Z"
  },
  "payment_method": {
    "type": "ach",
    "account_id": "acc_xyz789"
  }
}
```

**Response (200):**
```json
{
  "loan_id": "LOAN-ghi789",
  "status": "pending_funding",
  "message": "Congratulations! Your loan has been approved.",
  "funding_timeline": "1-2 business days",
  "next_steps": [
    "You'll receive a confirmation email shortly",
    "Funds will be disbursed to the merchant",
    "Your first payment is due on 2025-11-30"
  ],
  "loan_details": {
    "funded_amount": 7500.00,
    "term_months": 24,
    "monthly_payment": 343.21,
    "first_payment_date": "2025-11-30",
    "last_payment_date": "2027-10-30"
  }
}
```

---

## Decisioning API

### Evaluate Application

Run decisioning on a submitted application.

**Endpoint:** `POST /api/v1/decision/evaluate`

**Authentication:** Internal service token

**Request:**
```json
{
  "application_id": "APP-abc123"
}
```

**Response (200) - Approved:**
```json
{
  "decision_id": "DEC-def456",
  "application_id": "APP-abc123",
  "status": "approved",
  "score": 721,
  "tier": "B",
  "offers": [
    {
      "offer_id": "OFF-001",
      "term_months": 24,
      "apr": 9.9,
      "monthly_payment": 343.21,
      "down_payment": 0,
      "origination_fee": 37.50,
      "total_amount": 8237.50
    }
  ],
  "metadata": {
    "rule_hits": [
      "no_bankruptcy",
      "income_threshold_pass",
      "bank_health_good"
    ],
    "evaluator_version": "v1.0",
    "credit_snapshot": {
      "score": 721,
      "derogatory_marks": 0,
      "inquiries_last_6_months": 1
    },
    "plaid_snapshot": {
      "monthly_income": 6500,
      "account_balance": 4200,
      "overdrafts_last_12_months": 0
    }
  },
  "decided_at": "2025-10-29T15:30:00Z"
}
```

**Response (200) - Manual Review:**
```json
{
  "decision_id": "DEC-def456",
  "application_id": "APP-abc123",
  "status": "manual_review",
  "reason": "thin_file",
  "priority": 1,
  "manual_review_id": "MR-001",
  "estimated_resolution": "2025-10-30T15:00:00Z"
}
```

**Response (200) - Declined:**
```json
{
  "decision_id": "DEC-def456",
  "application_id": "APP-abc123",
  "status": "declined",
  "reason": "insufficient_income",
  "decided_at": "2025-10-29T15:30:00Z"
}
```

---

### Get Decision

Retrieve decision details.

**Endpoint:** `GET /api/v1/decision/:decision_id`

**Authentication:** Internal service token or Admin JWT

**Response:** Same as Evaluate response

---

## Admin API

### Get Applications

List all applications with filtering.

**Endpoint:** `GET /api/v1/admin/applications`

**Authentication:** Admin JWT

**Query Parameters:**
- `status` (string): Filter by status (approved, declined, etc.)
- `merchant_id` (string): Filter by merchant
- `date_from` (ISO 8601): Start date
- `date_to` (ISO 8601): End date
- `limit` (number): Results per page (default: 20, max: 100)
- `offset` (number): Pagination offset

**Example:**
```http
GET /api/v1/admin/applications?status=approved&limit=50&offset=0
```

**Response (200):**
```json
{
  "applications": [
    {
      "id": "APP-abc123",
      "customer_name": "John Doe",
      "email": "john@example.com",
      "status": "approved",
      "loan_amount": 7500.00,
      "created_at": "2025-10-29T14:30:00Z",
      "updated_at": "2025-10-29T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 1247,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

### Get Application Detail

**Endpoint:** `GET /api/v1/admin/applications/:application_id`

**Authentication:** Admin JWT

**Response (200):**
```json
{
  "application": {
    "id": "APP-abc123",
    "status": "approved",
    "customer": {
      "id": "CUST-001",
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
      "id": "JOB-001",
      "crm_job_id": "JOB-9876",
      "estimate_amount": 7500.00,
      "service_type": "HVAC Installation"
    },
    "decision": {
      "id": "DEC-def456",
      "score": 721,
      "status": "approved",
      "rule_hits": ["no_bankruptcy", "income_threshold_pass"],
      "decided_at": "2025-10-29T15:30:00Z"
    },
    "loan": {
      "id": "LOAN-xyz789",
      "funded_amount": 7500.00,
      "funding_date": "2025-10-30T10:00:00Z",
      "status": "funded"
    },
    "timeline": [
      {
        "event": "application_created",
        "timestamp": "2025-10-29T14:30:00Z"
      },
      {
        "event": "sms_sent",
        "timestamp": "2025-10-29T14:30:05Z"
      },
      {
        "event": "application_opened",
        "timestamp": "2025-10-29T14:35:00Z"
      },
      {
        "event": "bank_linked",
        "timestamp": "2025-10-29T14:40:00Z"
      },
      {
        "event": "kyc_verified",
        "timestamp": "2025-10-29T14:45:00Z"
      },
      {
        "event": "application_submitted",
        "timestamp": "2025-10-29T15:00:00Z"
      },
      {
        "event": "decision_approved",
        "timestamp": "2025-10-29T15:30:00Z"
      },
      {
        "event": "offer_accepted",
        "timestamp": "2025-10-29T16:00:00Z"
      },
      {
        "event": "loan_funded",
        "timestamp": "2025-10-30T10:00:00Z"
      }
    ]
  }
}
```

---

### Manual Review Queue

**Endpoint:** `GET /api/v1/admin/manual-review/queue`

**Authentication:** Admin JWT

**Query Parameters:**
- `status` (string): pending, in_review, resolved
- `priority` (number): 1, 2, 3
- `assigned_to` (string): user_id

**Response (200):**
```json
{
  "queue": [
    {
      "id": "MR-001",
      "application_id": "APP-xyz",
      "customer_name": "Jane Smith",
      "loan_amount": 12000.00,
      "reason": "thin_file",
      "priority": 1,
      "assigned_to": null,
      "status": "pending",
      "created_at": "2025-10-29T14:30:00Z"
    }
  ],
  "summary": {
    "total_pending": 12,
    "high_priority": 3,
    "medium_priority": 6,
    "low_priority": 3
  }
}
```

---

### Resolve Manual Review

**Endpoint:** `POST /api/v1/admin/manual-review/:id/resolve`

**Authentication:** Admin JWT (role: underwriter or admin)

**Request:**
```json
{
  "resolution": "approved",
  "notes": "Verified employment via phone call. Stable income.",
  "selected_offer_id": "OFF-002",
  "conditions": {
    "down_payment_required": 500,
    "proof_of_income_required": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "manual_review_id": "MR-001",
  "application_id": "APP-xyz",
  "decision_id": "DEC-ghi789",
  "loan_id": "LOAN-jkl012",
  "resolved_at": "2025-10-29T17:00:00Z"
}
```

---

### Get Analytics Summary

**Endpoint:** `GET /api/v1/admin/analytics/summary`

**Authentication:** Admin JWT

**Query Parameters:**
- `date_from` (ISO 8601)
- `date_to` (ISO 8601)
- `merchant_id` (string, optional)

**Response (200):**
```json
{
  "period": {
    "from": "2025-10-01T00:00:00Z",
    "to": "2025-10-31T23:59:59Z"
  },
  "metrics": {
    "total_applications": 1247,
    "approval_rate": 0.68,
    "decline_rate": 0.22,
    "manual_review_rate": 0.10,
    "avg_loan_amount": 8350.00,
    "total_funded": 6420000.00,
    "avg_time_to_decision_minutes": 12,
    "conversion_rate": 0.72
  },
  "funnel": {
    "initiated": 1247,
    "opened": 1098,
    "bank_linked": 987,
    "kyc_completed": 945,
    "submitted": 920,
    "approved": 625,
    "accepted": 580,
    "funded": 548
  },
  "by_merchant": [
    {
      "merchant_id": "MERCH-001",
      "merchant_name": "ProForce Pest Control",
      "applications": 623,
      "approval_rate": 0.71,
      "avg_loan_amount": 7800.00
    },
    {
      "merchant_id": "MERCH-002",
      "merchant_name": "Rack Electric",
      "applications": 624,
      "approval_rate": 0.65,
      "avg_loan_amount": 8900.00
    }
  ]
}
```

---

### Pricing Rules

**List Rules:**
```http
GET /api/v1/admin/pricing-rules
```

**Response:**
```json
{
  "rules": [
    {
      "id": "RULE-001",
      "name": "Tier A Pricing (750+)",
      "predicate": {
        "field": "credit_score",
        "operator": ">=",
        "value": 750
      },
      "pricing_adjustments": {
        "apr_base": 6.9,
        "max_term": 36,
        "origination_fee": 0.5
      },
      "active": true,
      "priority": 1
    }
  ]
}
```

**Create Rule:**
```http
POST /api/v1/admin/pricing-rules
```

**Request:**
```json
{
  "name": "Tier B Pricing (700-749)",
  "predicate": {
    "field": "credit_score",
    "operator": "between",
    "value": [700, 749]
  },
  "pricing_adjustments": {
    "apr_base": 9.9,
    "max_term": 48,
    "origination_fee": 0.5
  },
  "priority": 2
}
```

---

## Webhook Events

FlowPay sends webhooks for key events. Configure webhook URLs in admin settings.

### Event Types

**Application Events:**
- `application.created`
- `application.submitted`
- `application.approved`
- `application.declined`

**Loan Events:**
- `loan.created`
- `loan.funded`
- `loan.repaying`
- `loan.paid_off`

**Payment Events:**
- `payment.received`
- `payment.failed`
- `payment.late`

### Webhook Payload Structure

```json
{
  "id": "evt_abc123",
  "event": "loan.funded",
  "timestamp": "2025-10-30T10:00:00Z",
  "api_version": "v1",
  "data": {
    "application_id": "APP-abc123",
    "crm_customer_id": "FR12345",
    "crm_job_id": "JOB-9876",
    "loan_id": "LOAN-xyz789",
    "funded_amount": 7500.00,
    "funding_date": "2025-10-30T10:00:00Z"
  }
}
```

### Webhook Security

**Signature Header:**
```http
X-FlowPay-Signature: t=1698765432,v1=abc123def456...
```

**Verification (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, header, secret) {
  const [timestamp, signature] = header.split(',').map(part => part.split('=')[1]);
  
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Invalid signature');
  }
  
  // Check timestamp to prevent replay attacks (within 5 minutes)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) {
    throw new Error('Timestamp too old');
  }
  
  return true;
}
```

---

## Postman Collection

Download the complete Postman collection: [FlowPay API v1.postman_collection.json](./postman/flowpay_api_v1.json)

**Environment Variables:**
```json
{
  "base_url": "https://api.flowpay.com/v1",
  "api_key": "sk_dev_...",
  "jwt_token": "eyJhbGc...",
  "application_id": "APP-abc123",
  "decision_id": "DEC-def456",
  "loan_id": "LOAN-xyz789"
}
```

---

*End of API Specification*
