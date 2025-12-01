# Persona Identity Verification Integration - Setup Guide

**Status:** ✅ IMPLEMENTED  
**Date:** November 8, 2025

---

## Overview

Real Persona KYC/identity verification has been implemented to replace the mock verification system. Borrowers can now complete identity verification using government-issued ID and selfie verification.

## What Was Implemented

### 1. Backend Infrastructure

**New Persona Service** (`src/lib/services/persona.ts`):
- Persona API client initialization
- `createInquiry()` - Create verification inquiries
- `getInquiry()` - Fetch inquiry status and results
- `getVerification()` - Get verification details (ID, selfie)
- `createInquirySession()` - Generate new session tokens
- Helper functions for status checking and webhook handling

**New API Endpoints**:
- `POST /api/v1/borrower/[token]/persona/create-inquiry` - Create inquiry and get session token
- `POST /api/v1/borrower/[token]/persona/complete` - Handle inquiry completion and verification results

### 2. Frontend Integration

**Updated Component** (`src/components/borrower/steps/KYCStep.tsx`):
- Integrated Persona Embedded Client
- Dynamic Persona SDK loading
- Automatic inquiry creation
- Real-time verification modal
- Error handling and loading states
- Auto-advance on successful verification

**Key Features**:
- ✅ Persona SDK loaded dynamically
- ✅ Inquiry created with pre-filled customer data
- ✅ Embedded verification modal
- ✅ ID document verification
- ✅ Selfie verification
- ✅ Real-time status updates
- ✅ Comprehensive error handling

### 3. Data Storage

**Prisma Schema** (uses existing `application.personaData` JSON field):
```json
{
  "inquiryId": "inq_xxx",
  "sessionToken": "session_token_xxx",
  "status": "completed",
  "verificationStatus": "verified",
  "templateId": "itmpl_xxx",
  "fields": {
    "name-first": "John",
    "name-last": "Doe",
    ...
  },
  "verifications": [
    {
      "id": "ver_xxx",
      "type": "government-id"
    },
    {
      "id": "ver_yyy",
      "type": "selfie"
    }
  ],
  "createdAt": "2025-11-08T...",
  "completedAt": "2025-11-08T..."
}
```

---

## Setup Instructions

### Step 1: Sign Up for Persona

1. Go to https://withpersona.com/dashboard
2. Create a free account (Sandbox is free forever)
3. Verify your email

### Step 2: Create an Inquiry Template

1. Log in to Persona Dashboard
2. Navigate to **Verifications** → **Templates**
3. Click **Create Template**
4. Configure verification flow:
   - **Government ID**: Enable (required)
   - **Selfie**: Enable (recommended)
   - **Database Verification**: Optional
   - **Watchlist Screening**: Optional
5. Customize the flow:
   - Add your logo
   - Customize colors
   - Set acceptance criteria
6. **Save Template** and copy the **Template ID** (starts with `itmpl_`)

### Step 3: Get API Credentials

1. Navigate to **Settings** → **API Keys**
2. Copy your **Sandbox API Key** (starts with `persona_sandbox_`)
3. For production, copy **Live API Key** (starts with `persona_live_`)

### Step 4: Configure Environment Variables

Update your `.env` or `.env.local`:

```bash
# Persona Configuration
PERSONA_API_KEY="persona_sandbox_your_key_here"
PERSONA_TEMPLATE_ID="itmpl_your_template_id_here"
PERSONA_ENV="sandbox"  # Options: sandbox, production
NEXT_PUBLIC_PERSONA_ENV="sandbox"  # Client-side environment
```

**Environment Options**:
- `sandbox` - Test with fake IDs and webcam
- `production` - Real verification with actual IDs

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to an application form (e.g., `/apply/[token]`)

3. Go to the "Identity Verification" step

4. Click "Verify Identity"

5. **In Sandbox Mode**:
   - Persona modal will open
   - Follow the prompts
   - Upload a test ID (any image works)
   - Take a selfie (webcam required)
   - Complete verification

6. Verify data is saved in your database

---

## Testing in Sandbox

### Test ID Documents

In sandbox mode, Persona accepts any image as an ID. You can:
- Upload any photo/image file
- Use the sample IDs provided in Persona dashboard
- Test different scenarios (expired ID, blurry photo, etc.)

### Selfie Verification

Sandbox mode allows:
- Real webcam selfie
- Upload a selfie photo
- Test liveness detection (disabled in sandbox)

### Test Scenarios

You can simulate different outcomes:
- **Successful verification**: Complete all steps normally
- **Failed verification**: Close the modal without completing
- **Expired inquiry**: Wait for inquiry to expire (4 hours by default)

---

## User Flow

1. **Borrower clicks "Verify Identity"**
   - Frontend requests inquiry creation from backend
   - Backend calls Persona API with customer data
   - Persona creates inquiry and returns session token
   - Session token returned to frontend

2. **Persona Modal Opens**
   - Borrower sees Persona verification interface
   - Prompted to upload government ID
   - Asked to take selfie for liveness check
   - Persona validates documents in real-time

3. **Verification Complete**
   - Persona returns inquiry ID and status
   - Frontend sends completion data to backend
   - Backend fetches full inquiry details from Persona
   - Verification results saved to database

4. **Auto-Advance**
   - Form updates with verification status
   - Automatically proceeds to next step
   - Success message displayed

---

## Verification Template Configuration

### Recommended Settings

**Identity Verification**:
- ✅ Government ID (Driver's License, Passport, ID Card)
- ✅ Selfie with liveness detection
- ⚠️ Address verification (optional)
- ⚠️ Social Security Number (optional, requires additional approval)

**Acceptance Criteria**:
- Document must be valid (not expired)
- Document must be government-issued
- Selfie must match ID photo
- Face detection confidence > 85%

**Customization**:
- Upload your company logo
- Match brand colors
- Customize text and messaging
- Add privacy policy link

---

## Security Considerations

### Data Protection

**What Persona Stores**:
- Government ID images (encrypted)
- Selfie photos (encrypted)
- Extracted data (name, DOB, address)
- Verification results

**What SuprFi Stores**:
- Inquiry ID and status
- Verification results (pass/fail)
- Extracted fields (name, DOB)
- **NOT stored**: Actual ID images, raw photos

### GDPR & Privacy Compliance

- ✅ Persona is GDPR compliant
- ✅ Data deletion available via API
- ✅ User consent collected during verification
- ✅ Data retention policies configurable

### Production Security

**Before going live**:
1. Switch to production API keys
2. Configure data retention policies
3. Set up webhook verification
4. Enable audit logging
5. Review Persona's compliance documentation

---

## API Documentation

### Create Inquiry

**Endpoint**: `POST /api/v1/borrower/[token]/persona/create-inquiry`

**Purpose**: Create a Persona inquiry for identity verification

**Response**:
```json
{
  "inquiryId": "inq_xxx",
  "sessionToken": "sess_xxx",
  "status": "created"
}
```

**Usage**: Called automatically by KYCStep component

---

### Complete Verification

**Endpoint**: `POST /api/v1/borrower/[token]/persona/complete`

**Purpose**: Handle inquiry completion and fetch verification results

**Request Body**:
```json
{
  "inquiryId": "inq_xxx",
  "status": "completed"
}
```

**Response**:
```json
{
  "success": true,
  "inquiryId": "inq_xxx",
  "status": "completed",
  "verificationStatus": "verified",
  "verified": true
}
```

---

## Webhook Integration (Future)

Persona sends webhooks for various events:

- `inquiry.created` - New inquiry started
- `inquiry.completed` - Verification finished
- `inquiry.expired` - Inquiry timed out
- `inquiry.failed` - Verification failed
- `verification.passed` - Specific verification passed
- `verification.failed` - Specific verification failed

**Setup** (when ready):
1. Create webhook endpoint: `/api/v1/webhooks/persona`
2. Verify webhook signatures
3. Handle events asynchronously
4. Update application status
5. Configure webhook URL in Persona dashboard

---

## Troubleshooting

### Error: "Failed to create inquiry"
- **Fix**: Check your API key and template ID
- Verify `PERSONA_API_KEY` and `PERSONA_TEMPLATE_ID` are set correctly
- Ensure template exists and is active

### Error: "Persona is still loading"
- **Fix**: Wait a moment for the SDK to load
- Check browser console for JavaScript errors
- Ensure CDN is accessible (not blocked by firewall)

### Verification modal doesn't open
- **Fix**: Check browser console for errors
- Verify session token was generated
- Try refreshing the page

### Verification gets stuck
- **Fix**: Check browser permissions (camera, microphone)
- Ensure webcam is functional
- Try using a different browser

### Data not saving after verification
- **Fix**: Check backend logs for errors
- Verify database connection
- Check Persona API status

---

## Production Checklist

Before going live with real identity verification:

- [ ] Switch to production API keys
- [ ] Create production inquiry template
- [ ] Configure template with strict criteria
- [ ] Test with real IDs in sandbox first
- [ ] Set up webhook endpoint
- [ ] Configure data retention policies
- [ ] Review Persona's compliance docs
- [ ] Train support team on verification process
- [ ] Set up monitoring and alerts
- [ ] Document incident response procedures
- [ ] Add legal disclaimers about data usage
- [ ] Review with legal counsel

---

## Verification Statuses

### Inquiry Statuses
- `created` - Inquiry initiated, not started
- `pending` - Verification in progress
- `completed` - Successfully completed
- `failed` - Verification failed
- `expired` - Inquiry expired (default: 4 hours)
- `approved` - Manually approved by admin
- `declined` - Manually declined by admin

### Verification Statuses
- `initiated` - Verification started
- `submitted` - Documents submitted
- `passed` - Verification successful
- `failed` - Verification failed
- `requires_retry` - Needs to be retried
- `canceled` - User canceled
- `confirmed` - Admin confirmed

---

## Next Steps

**Immediate**:
1. Sign up for Persona account
2. Create inquiry template
3. Configure environment variables
4. Test in sandbox mode

**Short-term**:
1. Customize verification template with branding
2. Configure acceptance criteria
3. Add webhook handling
4. Test edge cases (failed verification, expired inquiry)

**Long-term**:
1. Implement automated decision rules based on verification
2. Add manual review queue for failed verifications
3. Build re-verification workflow for expired verifications
4. Implement fraud detection rules
5. Add watchlist screening for enhanced due diligence

---

## Resources

- **Persona Docs**: https://docs.withpersona.com
- **Dashboard**: https://withpersona.com/dashboard
- **API Reference**: https://docs.withpersona.com/reference
- **Embedded Client**: https://docs.withpersona.com/docs/embedded-client
- **Templates Guide**: https://docs.withpersona.com/docs/inquiry-templates
- **Status**: https://status.withpersona.com

---

## Support

For Persona-related issues:
- **Email**: support@withpersona.com
- **Dashboard**: Help button in dashboard
- **Documentation**: https://docs.withpersona.com

---

## Compliance & Legal

### What Persona Verifies
- Government-issued ID authenticity
- Document validity (not expired)
- Photo match (selfie vs ID)
- Liveness detection (real person, not photo)
- Watchlist screening (optional)
- Database verification (optional)

### Regulations Supported
- ✅ KYC (Know Your Customer)
- ✅ AML (Anti-Money Laundering)
- ✅ OFAC screening
- ✅ Identity verification requirements
- ✅ Age verification
- ✅ GDPR compliance
- ✅ CCPA compliance

---

*Last updated: November 8, 2025*
