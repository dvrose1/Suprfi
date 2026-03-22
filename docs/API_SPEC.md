# SuprFi API Specification

**Version:** v2.0  
**Base URL:** `https://app.suprfi.com/api/v1`  
**Last Updated:** February 1, 2026

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Error Handling](#2-error-handling)
3. [CRM Integration API](#3-crm-integration-api)
4. [Borrower Application API](#4-borrower-application-api)
5. [Borrower Portal API](#5-borrower-portal-api)
6. [Contractor Portal API](#6-contractor-portal-api)
7. [Admin API](#7-admin-api)
8. [Webhook Events](#8-webhook-events)

---

## 1. Authentication

### 1.1 API Key Authentication (CRM Partners)

Used by CRM integrations to trigger financing offers.

```http
POST /api/v1/crm/offer-financing
x-api-key: {contractor_api_key}
Content-Type: application/json
```

### 1.2 JWT Token Authentication (Borrower Application)

Borrowers access their application via JWT token embedded in the URL.

```http
GET /api/v1/borrower/{token}/decision
```

The token is validated on each request:
- Signature verification
- Expiration check (24 hours)
- Application status validation

### 1.3 Session Cookie Authentication (Portals)

Admin, Contractor, and Borrower portals use HTTP-only session cookies.

```http
Cookie: suprfi_admin_session={session_token}
Cookie: suprfi_contractor_session={session_token}
Cookie: suprfi_borrower_session={session_token}
```

---

## 2. Error Handling

### 2.1 Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "customer.email",
      "message": "Invalid email format"
    }
  ]
}
```

### 2.2 HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Invalid request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---

## 3. CRM Integration API

### 3.1 Create Financing Offer

Trigger a financing offer for a customer/job from CRM.

**Endpoint:** `POST /api/v1/crm/offer-financing`

**Authentication:** API Key (`x-api-key` header)

**Request Body:**
```json
{
  "crm_type": "fieldroutes",
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
  "success": true,
  "application_id": "clxyz123...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "link": "https://app.suprfi.com/apply/eyJhbGciOiJIUzI1NiIs...",
  "sms_sent": true,
  "expires_at": "2026-02-02T18:30:00.000Z"
}
```

**Supported CRM Types:**
- `fieldroutes`
- `jobber`
- `servicetitan`
- `housecall`

---

## 4. Borrower Application API

All borrower endpoints use the JWT token from the application link.

### 4.1 Submit Application

Submit completed application for decisioning.

**Endpoint:** `POST /api/v1/borrower/{token}/submit`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+15551234567",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Austin",
  "state": "TX",
  "postalCode": "78701",
  "dateOfBirth": "1985-03-15",
  "ssn": "123-45-6789",
  "plaidAccessToken": "access-sandbox-abc123",
  "plaidAccountId": "account-xyz789",
  "bankName": "Chase",
  "accountMask": "1234",
  "personaInquiryId": "inq_abc123",
  "kycStatus": "completed",
  "creditCheckConsent": true,
  "termsAccepted": true,
  "eSignConsent": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": "clxyz123...",
  "decision": {
    "id": "cldec456...",
    "status": "approved",
    "score": 721,
    "reason": "Approved with standard terms based on account analysis",
    "positiveFactors": [
      "Strong cash reserves (50%+ of loan amount)",
      "Healthy account balance (>$10k)",
      "Regular income deposits detected"
    ],
    "riskFactors": [],
    "dataUsed": {
      "hasBalance": true,
      "hasAssetReport": false,
      "accountAge": 450,
      "avgBalance": 12500,
      "incomeDetected": 6500
    }
  },
  "offers": [
    {
      "id": "cloff001...",
      "termMonths": 24,
      "apr": 8.9,
      "monthlyPayment": 340.15,
      "downPayment": 0,
      "originationFee": 75,
      "totalAmount": 8228.60
    },
    {
      "id": "cloff002...",
      "termMonths": 48,
      "apr": 11.9,
      "monthlyPayment": 196.50,
      "downPayment": 0,
      "originationFee": 37.50,
      "totalAmount": 9469.50
    },
    {
      "id": "cloff003...",
      "termMonths": 60,
      "apr": 13.9,
      "monthlyPayment": 173.25,
      "downPayment": 750,
      "originationFee": 0,
      "totalAmount": 11145
    }
  ]
}
```

### 4.2 Get Decision and Offers

Fetch decision and available offers.

**Endpoint:** `GET /api/v1/borrower/{token}/decision`

**Response (200):**
```json
{
  "decision": {
    "id": "cldec456...",
    "status": "approved",
    "score": 721,
    "reason": "Approved with standard terms based on account analysis"
  },
  "offers": [
    {
      "id": "cloff001...",
      "termMonths": 24,
      "apr": 8.9,
      "monthlyPayment": 340.15,
      "downPayment": 0,
      "originationFee": 75,
      "totalAmount": 8228.60,
      "selected": false
    }
  ]
}
```

### 4.3 Select Offer

Select a financing offer.

**Endpoint:** `POST /api/v1/borrower/{token}/offers/select`

**Request Body:**
```json
{
  "offerId": "cloff001..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Offer selected successfully",
  "selectedOffer": {
    "id": "cloff001...",
    "termMonths": 24,
    "apr": 8.9,
    "monthlyPayment": 340.15
  }
}
```

### 4.4 Get Loan Details

Fetch loan details after offer selection.

**Endpoint:** `GET /api/v1/borrower/{token}/loan`

**Response (200):**
```json
{
  "loan": {
    "id": "clloan789...",
    "fundedAmount": 7500,
    "status": "funded",
    "fundingDate": "2026-02-01T10:00:00.000Z",
    "lenderName": "SuprFi",
    "selectedOffer": {
      "termMonths": 24,
      "apr": 8.9,
      "monthlyPayment": 340.15,
      "totalAmount": 8228.60
    }
  },
  "payments": [
    {
      "paymentNumber": 1,
      "amount": 340.15,
      "principal": 285.40,
      "interest": 54.75,
      "dueDate": "2026-03-01",
      "status": "scheduled"
    }
  ]
}
```

### 4.5 Get Agreement

Fetch loan agreement for signing.

**Endpoint:** `GET /api/v1/borrower/{token}/agreement`

**Response (200):**
```json
{
  "agreement": {
    "content": "LOAN AGREEMENT...",
    "version": "1.0",
    "generatedAt": "2026-02-01T12:00:00.000Z"
  },
  "terms": {
    "loanAmount": 7500,
    "termMonths": 24,
    "apr": 8.9,
    "monthlyPayment": 340.15,
    "firstPaymentDate": "2026-03-01",
    "lastPaymentDate": "2028-02-01"
  }
}
```

### 4.6 Sign Agreement

Sign the loan agreement.

**Endpoint:** `POST /api/v1/borrower/{token}/agreement/sign`

**Request Body:**
```json
{
  "signature": "John Doe",
  "signedAt": "2026-02-01T12:30:00.000Z",
  "ipAddress": "192.168.1.1"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Agreement signed successfully",
  "loan": {
    "id": "clloan789...",
    "status": "funded",
    "fundingDate": "2026-02-01T12:30:00.000Z"
  }
}
```

### 4.7 Plaid Link Token

Create a Plaid Link token for bank connection.

**Endpoint:** `POST /api/v1/borrower/{token}/plaid/link-token`

**Response (200):**
```json
{
  "linkToken": "link-sandbox-abc123...",
  "expiration": "2026-02-01T13:00:00.000Z"
}
```

### 4.8 Plaid Token Exchange

Exchange Plaid public token for access token.

**Endpoint:** `POST /api/v1/borrower/{token}/plaid/exchange`

**Request Body:**
```json
{
  "publicToken": "public-sandbox-abc123...",
  "accountId": "account-xyz789",
  "institutionId": "ins_3",
  "institutionName": "Chase"
}
```

**Response (200):**
```json
{
  "success": true,
  "bankLinked": true,
  "accountName": "Chase Checking ****1234",
  "balance": {
    "available": 5420.50,
    "current": 5520.50
  }
}
```

### 4.9 Persona Create Inquiry

Create a Persona KYC inquiry.

**Endpoint:** `POST /api/v1/borrower/{token}/persona/create-inquiry`

**Response (200):**
```json
{
  "inquiryId": "inq_abc123...",
  "sessionToken": "session_xyz789...",
  "status": "created"
}
```

### 4.10 Persona Complete

Mark Persona verification as complete.

**Endpoint:** `POST /api/v1/borrower/{token}/persona/complete`

**Request Body:**
```json
{
  "inquiryId": "inq_abc123...",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "kycStatus": "verified"
}
```

### 4.11 Manual Bank Entry

Submit bank details manually (without Plaid).

**Endpoint:** `POST /api/v1/borrower/{token}/bank/manual`

**Request Body:**
```json
{
  "bankName": "Chase",
  "accountNumber": "123456789",
  "routingNumber": "021000021",
  "accountType": "checking"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bank details saved",
  "verificationStatus": "pending"
}
```

---

## 5. Borrower Portal API

### 5.1 Send Magic Link

Request a magic link for portal login.

**Endpoint:** `POST /api/v1/portal/auth/send-magic-link`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Magic link sent to your email"
}
```

### 5.2 Verify Magic Link

Verify magic link and create session.

**Endpoint:** `POST /api/v1/portal/auth/verify-magic-link`

**Request Body:**
```json
{
  "token": "magic-link-token..."
}
```

**Response (200):**
```json
{
  "success": true,
  "customer": {
    "id": "clcust123...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### 5.3 Get Dashboard

Get loan dashboard data.

**Endpoint:** `GET /api/v1/portal/dashboard`

**Response (200):**
```json
{
  "hasLoans": true,
  "summary": {
    "totalLoans": 1,
    "totalBalance": 6850.25,
    "totalOverdue": 0,
    "nextPaymentDue": {
      "date": "2026-03-01",
      "amount": 340.15
    }
  },
  "loans": [
    {
      "id": "clloan789...",
      "lenderName": "SuprFi",
      "fundedAmount": 7500,
      "fundingDate": "2026-02-01",
      "status": "repaying",
      "apr": 8.9,
      "termMonths": 24,
      "monthlyPayment": 340.15,
      "remainingBalance": 6850.25,
      "paymentsMade": 2,
      "paymentsRemaining": 22,
      "overduePayments": 0,
      "nextPayment": {
        "date": "2026-04-01",
        "amount": 340.15
      },
      "progress": 8
    }
  ]
}
```

### 5.4 Get Payments

Get payment history.

**Endpoint:** `GET /api/v1/portal/payments`

**Response (200):**
```json
{
  "payments": [
    {
      "id": "clpay001...",
      "loanId": "clloan789...",
      "paymentNumber": 1,
      "amount": 340.15,
      "principal": 285.40,
      "interest": 54.75,
      "dueDate": "2026-03-01",
      "status": "completed",
      "completedAt": "2026-03-01T11:00:00.000Z"
    },
    {
      "id": "clpay002...",
      "loanId": "clloan789...",
      "paymentNumber": 2,
      "amount": 340.15,
      "principal": 287.50,
      "interest": 52.65,
      "dueDate": "2026-04-01",
      "status": "scheduled",
      "completedAt": null
    }
  ]
}
```

### 5.5 Get Payoff Quote

Get early payoff amount.

**Endpoint:** `GET /api/v1/portal/loan/payoff-quote?loanId={loanId}`

**Response (200):**
```json
{
  "loanId": "clloan789...",
  "remainingPrincipal": 6250.00,
  "accruedInterest": 45.50,
  "fees": 0,
  "totalPayoff": 6295.50,
  "validUntil": "2026-02-11T00:00:00.000Z",
  "breakdown": {
    "originalPrincipal": 7500,
    "principalPaid": 1250,
    "interestPaid": 430.30,
    "paymentsCompleted": 4,
    "paymentsRemaining": 20
  }
}
```

### 5.6 Process Payoff

Process early loan payoff.

**Endpoint:** `POST /api/v1/portal/loan/payoff`

**Request Body:**
```json
{
  "loanId": "clloan789...",
  "payoffAmount": 6295.50
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payoff initiated",
  "paymentId": "clpay999...",
  "status": "processing"
}
```

---

## 6. Contractor Portal API

### 6.1 Login

Contractor login.

**Endpoint:** `POST /api/v1/client/auth/login`

**Request Body:**
```json
{
  "email": "contractor@example.com",
  "password": "secure_password",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cluser123...",
    "email": "contractor@example.com",
    "name": "John Smith",
    "role": "owner",
    "contractor": {
      "id": "clcont123...",
      "businessName": "Smith HVAC",
      "tier": "standard"
    }
  }
}
```

### 6.2 Get Dashboard

Get contractor dashboard stats.

**Endpoint:** `GET /api/v1/client/dashboard`

**Response (200):**
```json
{
  "stats": {
    "totalApplications": 45,
    "pendingApplications": 3,
    "approvedApplications": 38,
    "fundedAmount": 285000,
    "approvalRate": 84.4
  },
  "recentApplications": [
    {
      "id": "clapp123...",
      "customerName": "Jane Doe",
      "amount": 7500,
      "status": "approved",
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

### 6.3 List Applications

Get list of applications.

**Endpoint:** `GET /api/v1/client/applications?status={status}&page={page}&limit={limit}`

**Response (200):**
```json
{
  "applications": [
    {
      "id": "clapp123...",
      "customer": {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com"
      },
      "job": {
        "estimateAmount": 7500,
        "serviceType": "HVAC Installation"
      },
      "status": "approved",
      "decision": {
        "score": 735,
        "status": "approved"
      },
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### 6.4 Send Financing Link

Send financing link to customer.

**Endpoint:** `POST /api/v1/client/send-link`

**Request Body:**
```json
{
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567"
  },
  "job": {
    "estimateAmount": 7500,
    "serviceType": "HVAC Installation"
  },
  "sendMethod": "sms"
}
```

**Response (200):**
```json
{
  "success": true,
  "applicationId": "clapp456...",
  "link": "https://app.suprfi.com/apply/...",
  "smsSent": true,
  "expiresAt": "2026-02-02T18:00:00.000Z"
}
```

### 6.5 Generate QR Code

Generate QR code for financing link.

**Endpoint:** `POST /api/v1/client/generate-qr`

**Request Body:**
```json
{
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567"
  },
  "job": {
    "estimateAmount": 7500,
    "serviceType": "HVAC Installation"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "applicationId": "clapp789...",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "link": "https://app.suprfi.com/apply/...",
  "expiresAt": "2026-02-02T18:00:00.000Z"
}
```

### 6.6 Get Team

Get team members.

**Endpoint:** `GET /api/v1/client/team`

**Response (200):**
```json
{
  "members": [
    {
      "id": "cluser123...",
      "email": "john@example.com",
      "name": "John Smith",
      "role": "owner",
      "isActive": true,
      "lastLoginAt": "2026-02-01T10:00:00.000Z"
    },
    {
      "id": "cluser456...",
      "email": "jane@example.com",
      "name": "Jane Doe",
      "role": "tech",
      "isActive": true,
      "lastLoginAt": "2026-01-31T15:00:00.000Z"
    }
  ],
  "pendingInvites": [
    {
      "id": "clinv001...",
      "email": "bob@example.com",
      "role": "tech",
      "invitedAt": "2026-02-01T09:00:00.000Z"
    }
  ]
}
```

### 6.7 Invite Team Member

Invite new team member.

**Endpoint:** `POST /api/v1/client/team/invite`

**Request Body:**
```json
{
  "email": "newtech@example.com",
  "name": "Bob Johnson",
  "role": "tech"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent",
  "inviteId": "clinv002..."
}
```

**Roles:**
- `owner` - Full access, billing, team management
- `manager` - Applications, loans, team view
- `tech` - Send links, view own applications
- `viewer` - View only

---

## 7. Admin API

### 7.1 Login

Admin login.

**Endpoint:** `POST /api/v1/admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@suprfi.com",
  "password": "secure_password",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cladmin123...",
    "email": "admin@suprfi.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 7.2 Get Dashboard

Get admin dashboard stats.

**Endpoint:** `GET /api/v1/admin/dashboard`

**Response (200):**
```json
{
  "totalApps": 1247,
  "submittedApps": 85,
  "approvedApps": 982,
  "approvalRate": "78.7",
  "totalFunded": 7350000,
  "manualReviews": 12,
  "recentApps": [
    {
      "id": "clapp123...",
      "customer": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "job": {
        "estimateAmount": 7500
      },
      "status": "approved",
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

### 7.3 List Applications

Get applications with filtering.

**Endpoint:** `GET /api/v1/admin/applications`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (initiated, submitted, approved, declined, funded) |
| `search` | string | Search by customer name, email, or ID |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response (200):**
```json
{
  "applications": [
    {
      "id": "clapp123...",
      "customer": {
        "id": "clcust123...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "job": {
        "estimateAmount": 7500,
        "serviceType": "HVAC Installation"
      },
      "status": "approved",
      "decision": {
        "score": 721,
        "status": "approved"
      },
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1247,
    "page": 1,
    "limit": 20,
    "pages": 63
  },
  "stats": {
    "initiated": 150,
    "submitted": 85,
    "approved": 982,
    "declined": 30
  }
}
```

### 7.4 Get Application Detail

Get full application details.

**Endpoint:** `GET /api/v1/admin/applications/{id}`

**Response (200):**
```json
{
  "application": {
    "id": "clapp123...",
    "status": "approved",
    "token": "eyJ...",
    "tokenExpiresAt": "2026-02-02T10:00:00.000Z",
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  },
  "customer": {
    "id": "clcust123...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "addressLine1": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701"
  },
  "job": {
    "id": "cljob123...",
    "estimateAmount": 7500,
    "serviceType": "HVAC Installation",
    "status": "pending"
  },
  "decision": {
    "id": "cldec123...",
    "score": 721,
    "decisionStatus": "approved",
    "decisionReason": "Approved with standard terms",
    "ruleHits": ["income_verified", "balance_adequate"],
    "decidedAt": "2026-02-01T11:00:00.000Z"
  },
  "offers": [
    {
      "id": "cloff001...",
      "termMonths": 24,
      "apr": 8.9,
      "monthlyPayment": 340.15,
      "selected": true
    }
  ],
  "loan": {
    "id": "clloan123...",
    "fundedAmount": 7500,
    "status": "funded",
    "fundingDate": "2026-02-01T12:00:00.000Z"
  },
  "plaidData": {
    "institutionName": "Chase",
    "accountMask": "1234",
    "balance": {
      "current": 15000,
      "available": 14500
    }
  },
  "personaData": {
    "status": "completed",
    "inquiryId": "inq_abc123"
  }
}
```

### 7.5 Approve Application

Manually approve an application.

**Endpoint:** `POST /api/v1/admin/applications/{id}/approve`

**Request Body:**
```json
{
  "notes": "Manual approval - verified employment"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application approved"
}
```

### 7.6 Decline Application

Manually decline an application.

**Endpoint:** `POST /api/v1/admin/applications/{id}/decline`

**Request Body:**
```json
{
  "reason": "Insufficient income verification"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application declined"
}
```

### 7.7 Get Manual Review Queue

Get pending manual reviews.

**Endpoint:** `GET /api/v1/admin/manual-review`

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "clmr001...",
      "decision": {
        "id": "cldec456...",
        "score": 595,
        "application": {
          "id": "clapp456...",
          "customer": {
            "firstName": "Jane",
            "lastName": "Doe"
          },
          "job": {
            "estimateAmount": 12000
          }
        }
      },
      "reason": "borderline_score",
      "priority": 1,
      "status": "pending",
      "assignedTo": null,
      "createdAt": "2026-02-01T14:00:00.000Z"
    }
  ],
  "stats": {
    "pending": 12,
    "inReview": 3,
    "resolvedToday": 8
  }
}
```

### 7.8 Resolve Manual Review

Resolve a manual review.

**Endpoint:** `PUT /api/v1/admin/manual-review/{id}`

**Request Body:**
```json
{
  "resolution": "approved",
  "notes": "Verified employment via phone call"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review resolved"
}
```

### 7.9 Get Payments

Get payment list.

**Endpoint:** `GET /api/v1/admin/payments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200):**
```json
{
  "payments": [
    {
      "id": "clpay001...",
      "loan": {
        "id": "clloan123...",
        "customer": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "paymentNumber": 3,
      "amount": 340.15,
      "dueDate": "2026-04-01",
      "status": "failed",
      "failureReason": "Insufficient funds",
      "retryCount": 1,
      "requiresAction": false
    }
  ],
  "stats": {
    "dueToday": 45,
    "processing": 12,
    "overdue": 8,
    "failedNeedingAction": 3
  }
}
```

### 7.10 Retry Payment

Retry a failed payment.

**Endpoint:** `POST /api/v1/admin/payments/{id}/retry`

**Response (200):**
```json
{
  "success": true,
  "message": "Payment retry initiated",
  "newStatus": "pending"
}
```

### 7.11 Get Collections

Get delinquent loans.

**Endpoint:** `GET /api/v1/admin/collections`

**Response (200):**
```json
{
  "loans": [
    {
      "id": "clloan999...",
      "customer": {
        "firstName": "Bob",
        "lastName": "Smith",
        "email": "bob@example.com",
        "phone": "+15559876543"
      },
      "fundedAmount": 5000,
      "daysOverdue": 45,
      "status": "repaying",
      "overdueAmount": 680.30,
      "lastPaymentDate": "2026-01-15",
      "collectionNotes": [
        {
          "id": "clnote001...",
          "note": "Called customer, no answer",
          "noteType": "contact_attempt",
          "createdAt": "2026-02-01T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 7.12 Add Collection Note

Add a note to a delinquent loan.

**Endpoint:** `POST /api/v1/admin/collections/{id}/notes`

**Request Body:**
```json
{
  "note": "Customer agreed to payment plan",
  "noteType": "payment_plan"
}
```

**Response (200):**
```json
{
  "success": true,
  "noteId": "clnote002..."
}
```

### 7.13 Get Audit Logs

Get audit logs (god role only).

**Endpoint:** `GET /api/v1/admin/audit`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `entityType` | string | Filter by entity type |
| `actor` | string | Filter by actor |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200):**
```json
{
  "logs": [
    {
      "id": "claudit001...",
      "entityType": "application",
      "entityId": "clapp123...",
      "actor": "cladmin123...",
      "action": "approved",
      "payload": {
        "notes": "Manual approval"
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2026-02-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5000,
    "page": 1,
    "limit": 50
  }
}
```

---

## 8. Webhook Events

### 8.1 Plaid Webhooks

**Endpoint:** `POST /api/v1/webhooks/plaid`

**Headers:**
```
plaid-verification: {jwt_signature}
```

**Payload (Transfer Event):**
```json
{
  "webhook_type": "TRANSFER_EVENTS_UPDATE",
  "webhook_code": "TRANSFER_EVENTS_UPDATE",
  "transfer_id": "transfer_abc123",
  "transfer_events": [
    {
      "event_id": "evt_001",
      "transfer_id": "transfer_abc123",
      "event_type": "settled",
      "timestamp": "2026-02-01T12:00:00.000Z"
    }
  ]
}
```

**Event Types:**
- `pending` - Transfer initiated
- `posted` - Transfer posted to bank
- `settled` - Transfer complete
- `failed` - Transfer failed
- `returned` - ACH return received
- `cancelled` - Transfer cancelled

### 8.2 Jobber Webhooks

**Endpoint:** `POST /api/v1/webhooks/jobber`

**Headers:**
```
X-Jobber-Hmac-SHA256: {hmac_signature}
```

**Payload (Quote Create):**
```json
{
  "topic": "QUOTE_CREATE",
  "appId": "app_abc123",
  "accountId": 12345,
  "itemId": "quote_xyz789",
  "occurredAt": "2026-02-01T10:00:00.000Z"
}
```

**Supported Topics:**
- `QUOTE_CREATE` - New quote created (triggers auto-offer)
- `QUOTE_UPDATE` - Quote updated
- `JOB_CREATE` - New job created
- `CLIENT_CREATE` - New client created

---

*End of API Specification*
