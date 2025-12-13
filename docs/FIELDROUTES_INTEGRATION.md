# FieldRoutes CRM Integration

## Overview

This document describes the bidirectional integration between SuprFi and FieldRoutes CRM.

## Architecture

### Inbound (FieldRoutes → SuprFi)
- **Trigger Financing**: FieldRoutes calls `/api/v1/crm/offer-financing` to initiate a financing application
- **Webhooks**: FieldRoutes sends real-time updates to `/api/v1/crm/webhook` for appointment changes

### Outbound (SuprFi → FieldRoutes)
- **Status Updates**: SuprFi automatically syncs financing status back to FieldRoutes when applications are approved/declined/funded
- **Payment Updates**: Payment status is synced for reconciliation

## Environment Variables

Add these to your `.env.local` file:

```bash
# FieldRoutes API Configuration
FIELDROUTES_API_URL=https://api.fieldroutes.com/v1
FIELDROUTES_API_KEY=your_api_key_here

# FieldRoutes Webhook Security
FIELDROUTES_WEBHOOK_SECRET=your_webhook_secret_here
```

## API Endpoints

### 1. Trigger Financing Offer

**Endpoint**: `POST /api/v1/crm/offer-financing`

Called by FieldRoutes when a technician clicks "Offer Financing" in their CRM.

**Request Body**:
```json
{
  "crm_customer_id": "CUST-12345",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+15125551234",
    "address": {
      "line1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    }
  },
  "job": {
    "crm_job_id": "JOB-67890",
    "estimate_amount": 5000.00,
    "service_type": "HVAC Repair",
    "technician_id": "TECH-456"
  }
}
```

**Response**:
```json
{
  "success": true,
  "application_id": "app_abc123",
  "token": "tok_xyz789",
  "link": "https://app.suprfi.com/apply/tok_xyz789",
  "sms_sent": true,
  "expires_at": "2024-11-05T23:24:30.000Z"
}
```

### 2. Receive Webhooks

**Endpoint**: `POST /api/v1/crm/webhook`

Called by FieldRoutes to notify SuprFi of changes.

**Supported Events**:
- `appointment.updated` - Job/appointment details changed
- `appointment.cancelled` - Job cancelled (will cancel pending applications)
- `customer.updated` - Customer information changed

**Request Body**:
```json
{
  "event_type": "appointment.updated",
  "timestamp": "2024-11-04T18:30:00Z",
  "data": {
    "appointment_id": "JOB-67890",
    "status": "completed"
  }
}
```

**Headers**:
- `x-fieldroutes-signature`: HMAC signature for webhook verification

### 3. Manual Status Sync

**Endpoint**: `POST /api/v1/crm/sync-status`

Manually trigger a status sync (useful for retry or admin override).

**Request Body**:
```json
{
  "application_id": "app_abc123",
  "force": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Status synced successfully to FieldRoutes",
  "application_id": "app_abc123",
  "status": "approved"
}
```

## Field Mapping

| FieldRoutes Field | SuprFi Field | Direction | Description |
|-------------------|---------------|-----------|-------------|
| `customerId` | `crmCustomerId` | ↔ | Unique customer ID |
| `customer.firstName` | `firstName` | → | Customer first name |
| `customer.lastName` | `lastName` | → | Customer last name |
| `customer.email` | `email` | → | Customer email |
| `customer.phone` | `phone` | → | Phone for SMS |
| `address.street` | `addressLine1` | → | Street address |
| `address.city` | `city` | → | City |
| `address.state` | `state` | → | State |
| `address.zip` | `postalCode` | → | ZIP code |
| `appointment.id` | `crmJobId` | ↔ | Job/appointment ID |
| `appointment.totalCost` | `estimateAmount` | → | Loan amount |
| `appointment.financingStatus` | `application.status` | ← | Financing status |
| `payment.status` | `loan.status` | ← | Payment status |
| `payment.transactionId` | `lenderLoanId` | ← | Funding reference |

## Status Flow

### Application Statuses
1. **initiated** - Application created, SMS sent to borrower
2. **submitted** - Borrower completed application
3. **approved** - Financing approved (synced to FieldRoutes)
4. **declined** - Financing declined (synced to FieldRoutes)
5. **funded** - Loan funded, merchant paid (synced to FieldRoutes)

### Automatic CRM Sync Points
- ✅ Application approved → Sync to FieldRoutes
- ✅ Application declined → Sync to FieldRoutes
- ✅ Loan funded → Sync to FieldRoutes
- ✅ Payment received → Sync to FieldRoutes

## Error Handling & Retry Logic

### Retry Strategy
- **Max Retries**: 3 attempts
- **Backoff**: Exponential (1s, 2s, 4s)
- **Logging**: All sync attempts logged in `CrmSyncLog` table

### Failed Sync Handling
1. Logged in database with error details
2. Can be manually retried via `/api/v1/crm/sync-status`
3. Admin dashboard shows failed syncs for review

## CRM Sync Logs

All CRM sync operations are logged in the `CrmSyncLog` table:

```sql
SELECT * FROM "CrmSyncLog" 
WHERE direction = 'outbound' 
  AND status = 'failed'
ORDER BY "createdAt" DESC;
```

## Testing

### Without FieldRoutes API
If `FIELDROUTES_API_KEY` is not set, the integration runs in **mock mode**:
- Mock customer data returned
- Sync operations simulated (logged but not sent)
- Useful for development and testing

### With FieldRoutes Sandbox
Set environment variables to FieldRoutes sandbox endpoints:
```bash
FIELDROUTES_API_URL=https://sandbox-api.fieldroutes.com/v1
FIELDROUTES_API_KEY=sandbox_key_here
```

## Security

### API Authentication
- Inbound requests from FieldRoutes should include an API key (future implementation)
- Webhook requests verified via HMAC signature

### Webhook Signature Verification
```typescript
// Planned implementation
const signature = request.headers.get('x-fieldroutes-signature')
const computedSignature = crypto
  .createHmac('sha256', FIELDROUTES_WEBHOOK_SECRET)
  .update(requestBody)
  .digest('hex')

if (signature !== computedSignature) {
  throw new Error('Invalid webhook signature')
}
```

## Monitoring

### Key Metrics
- Sync success rate (target: >99%)
- Average sync latency
- Failed sync count
- Retry rate

### Alerts
- Alert when sync failure rate > 5%
- Alert when sync latency > 5s
- Alert when failed syncs not resolved within 24h

## Troubleshooting

### Sync Failed
1. Check `CrmSyncLog` for error details
2. Verify FieldRoutes API credentials
3. Check network connectivity
4. Retry manually via `/api/v1/crm/sync-status`

### Webhook Not Received
1. Verify webhook URL configured in FieldRoutes
2. Check webhook signature secret matches
3. Review webhook delivery logs in FieldRoutes dashboard

### Data Mismatch
1. Check field mapping configuration
2. Verify data transformations
3. Check for race conditions in concurrent updates
