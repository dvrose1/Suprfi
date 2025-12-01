# Plaid Bank Connection Integration - Setup Guide

**Status:** ✅ IMPLEMENTED  
**Date:** November 8, 2025

---

## Overview

Real Plaid Link integration has been implemented to replace the mock bank connection system. Borrowers can now connect their actual bank accounts securely through Plaid.

## What Was Implemented

### 1. Backend Infrastructure

**New Plaid Service** (`src/lib/services/plaid.ts`):
- Plaid API client initialization
- `createLinkToken()` - Generate link tokens for frontend
- `exchangePublicToken()` - Exchange public tokens for access tokens
- `getAccountInfo()` - Fetch account balances and details
- `getAuthInfo()` - Get account and routing numbers
- `getInstitution()` - Fetch bank/institution information

**New API Endpoints**:
- `POST /api/v1/borrower/[token]/plaid/link-token` - Create link token
- `POST /api/v1/borrower/[token]/plaid/exchange` - Exchange public token and store bank data

### 2. Frontend Integration

**Updated Component** (`src/components/borrower/steps/BankLinkStep.tsx`):
- Integrated `react-plaid-link` hook
- Automatic link token fetching
- Real-time bank connection via Plaid Link modal
- Error handling and loading states
- Auto-advance to next step on success
- Bank connection status display

### 3. Data Storage

**Prisma Schema** (already existed):
- `application.plaidData` (JSON field) stores:
  - Access token (⚠️ should be encrypted in production)
  - Item ID
  - Account ID
  - Institution details
  - Account information (name, mask, type, balance)
  - Connection metadata

---

## Setup Instructions

### Step 1: Sign Up for Plaid

1. Go to https://dashboard.plaid.com/signup
2. Create a free account (Sandbox is free forever)
3. Verify your email

### Step 2: Get API Credentials

1. Log in to https://dashboard.plaid.com
2. Navigate to **Developers** → **Keys**
3. Copy your credentials:
   - **client_id** (same for all environments)
   - **sandbox secret** (for testing)
   - **development secret** (for dev environment with real banks)
   - **production secret** (for live production)

### Step 3: Configure Environment Variables

Update your `.env` or `.env.local`:

```bash
# Plaid Configuration
PLAID_CLIENT_ID="your_client_id_here"
PLAID_SECRET="your_sandbox_secret_here"
PLAID_ENV="sandbox"  # Options: sandbox, development, production
```

**Environment Options**:
- `sandbox` - Test with fake banks (Chase, Wells Fargo, etc.)
- `development` - Real banks but with test credentials
- `production` - Live production environment

### Step 4: Install Dependencies (Already Done)

```bash
npm install plaid react-plaid-link
```

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to an application form (e.g., `/apply/[token]`)

3. Go to the "Bank Link" step

4. Click "Connect Bank Account"

5. **In Sandbox Mode**:
   - Select any test bank (e.g., "First Platypus Bank")
   - Username: `user_good`
   - Password: `pass_good`
   - Select any account
   - Complete the flow

6. Verify the connection is saved in your database

---

## Testing Credentials (Sandbox)

Plaid provides test credentials for sandbox testing:

### Successful Connection
- **Username**: `user_good`
- **Password**: `pass_good`
- **Result**: Successful connection with account data

### Other Test Cases
- **Username**: `user_bad` → Invalid credentials error
- **Username**: `user_mfa` → Requires MFA challenge
- **Username**: `user_locked` → Account locked error

Full list: https://plaid.com/docs/sandbox/test-credentials/

---

## User Flow

1. **Borrower clicks "Connect Bank Account"**
   - Frontend requests link token from backend
   - Backend calls Plaid API to create link token
   - Link token returned to frontend

2. **Plaid Link Modal Opens**
   - Borrower selects their bank
   - Enters credentials (sandbox or real)
   - Selects account to connect
   - Plaid validates and returns public token

3. **Token Exchange**
   - Frontend sends public token to backend
   - Backend exchanges for permanent access token
   - Backend fetches account details
   - Account data saved to application

4. **Auto-Advance**
   - Form updates with bank connection status
   - Automatically proceeds to next step
   - Success message displayed

---

## Security Considerations

### ⚠️ Production Security (TODO)

**Current Implementation** (Development):
```typescript
// Access token stored in plain text
plaidData: {
  accessToken: "access-sandbox-xxx", // ⚠️ NOT ENCRYPTED
  ...
}
```

**Production Requirements**:
1. **Encrypt access tokens** at rest using AES-256
2. **Use separate KMS** (Key Management Service) for encryption keys
3. **Never log** access tokens or account numbers
4. **Implement token rotation** (Plaid supports this)
5. **Audit all access** to Plaid data

### Recommended Production Pattern

```typescript
import { encrypt, decrypt } from '@/lib/crypto'

// When storing
const encryptedToken = encrypt(accessToken)
await prisma.application.update({
  data: {
    plaidData: {
      ...plaidData,
      accessToken: encryptedToken,
    }
  }
})

// When using
const decryptedToken = decrypt(application.plaidData.accessToken)
await plaidClient.accountsGet({ access_token: decryptedToken })
```

---

## API Documentation

### Create Link Token

**Endpoint**: `POST /api/v1/borrower/[token]/plaid/link-token`

**Purpose**: Generate a link token for Plaid Link initialization

**Response**:
```json
{
  "linkToken": "link-sandbox-xxxxx",
  "expiration": "2025-11-08T20:00:00Z"
}
```

**Usage**: Called automatically by BankLinkStep component

---

### Exchange Public Token

**Endpoint**: `POST /api/v1/borrower/[token]/plaid/exchange`

**Purpose**: Exchange public token for access token and store account data

**Request Body**:
```json
{
  "publicToken": "public-sandbox-xxxxx",
  "metadata": {
    "institution": {
      "institution_id": "ins_3",
      "name": "Chase"
    },
    "account_id": "xxxxx"
  }
}
```

**Response**:
```json
{
  "success": true,
  "bankName": "Chase",
  "accountMask": "1234",
  "accountName": "Chase Checking",
  "balance": {
    "current": 5000.00,
    "available": 4800.00,
    "currency": "USD"
  }
}
```

---

## Webhook Integration (Future)

Plaid sends webhooks for various events:

- Account balance updates
- Item errors (invalid credentials)
- Transactions updates

**Setup** (when ready):
1. Create webhook endpoint: `/api/v1/webhooks/plaid`
2. Verify webhook signatures
3. Handle events (update balance, flag errors, etc.)
4. Configure webhook URL in Plaid dashboard

---

## Troubleshooting

### Error: "Invalid client_id or secret"
- **Fix**: Double-check your credentials in `.env`
- Ensure `PLAID_CLIENT_ID` and `PLAID_SECRET` match your dashboard

### Error: "Failed to create link token"
- **Fix**: Check your Plaid environment setting
- Ensure `PLAID_ENV` is set to `sandbox`, `development`, or `production`

### Error: "Link token expired"
- **Explanation**: Link tokens expire after 4 hours
- **Fix**: Refresh the page to generate a new token

### Plaid Link doesn't open
- **Fix**: Check browser console for errors
- Ensure `react-plaid-link` is installed correctly
- Verify link token is being fetched successfully

### Bank connection saved but balance is null
- **Explanation**: Some sandbox accounts may not return balances
- **Fix**: Use a different test account or check Plaid dashboard

---

## Production Checklist

Before going live with real bank connections:

- [ ] Upgrade to Plaid Production environment
- [ ] Implement access token encryption
- [ ] Set up webhook endpoint
- [ ] Configure production secrets
- [ ] Test with real bank accounts in development environment
- [ ] Review Plaid's production readiness checklist
- [ ] Implement error logging and monitoring
- [ ] Set up alerts for Plaid API errors
- [ ] Document incident response procedures
- [ ] Train support team on Plaid error codes

---

## Next Steps

**Immediate**:
1. Test the integration in sandbox mode
2. Verify data is being saved correctly
3. Test error handling (invalid credentials, etc.)

**Short-term**:
1. Implement access token encryption
2. Add webhook handling for account updates
3. Display account balance in admin dashboard

**Long-term**:
1. Implement transaction fetching for income verification
2. Add support for re-linking expired accounts
3. Build account aggregation for multiple accounts
4. Implement automatic balance refresh

---

## Resources

- **Plaid Docs**: https://plaid.com/docs/
- **Quickstart Guide**: https://plaid.com/docs/quickstart/
- **API Reference**: https://plaid.com/docs/api/
- **React Integration**: https://plaid.com/docs/link/react/
- **Sandbox Testing**: https://plaid.com/docs/sandbox/
- **Dashboard**: https://dashboard.plaid.com/

---

## Support

For Plaid-related issues:
- **Email**: support@plaid.com
- **Dashboard**: https://dashboard.plaid.com/support
- **Status**: https://status.plaid.com/

---

*Last updated: November 8, 2025*
