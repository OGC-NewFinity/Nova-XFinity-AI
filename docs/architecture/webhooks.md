# Webhooks

**Description:** Defines webhook events, signing/authentication, payload schemas, retry strategy, idempotency, and troubleshooting.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

Nova‑XFinity AI uses webhooks to receive real-time notifications from external services, primarily payment providers (Stripe and PayPal). Webhooks enable asynchronous event processing, keeping subscription status synchronized with payment providers without polling.

### Purpose

**Key Use Cases:**
- **Subscription Lifecycle** - Activate, update, cancel subscriptions based on payment events
- **Payment Processing** - Track successful payments and payment failures
- **Status Synchronization** - Keep local database in sync with payment provider state
- **Real-time Updates** - Immediate notification of subscription changes

### Design Principles

1. **Asynchronous Processing** - Always return `200 OK` immediately, process events asynchronously
2. **Security First** - Verify webhook signatures before processing
3. **Idempotency** - Handle duplicate events gracefully
4. **Fail Gracefully** - Log errors but don't break webhook delivery
5. **Provider Agnostic** - Support multiple payment providers with consistent interface

### Architecture

```
Payment Provider (Stripe/PayPal)
    ↓
Webhook Endpoint (/api/webhooks/{provider})
    ↓
Signature Verification
    ↓
Event Router
    ↓
Event Handler
    ↓
Database Update
    ↓
Logging
```

---

## Webhook Endpoint Architecture

### Endpoint Structure

**Base Path:** `/api/webhooks`

**Available Endpoints:**
- `POST /api/webhooks/paypal` - PayPal webhook events
- `POST /api/webhooks/stripe` - Stripe webhook events (planned)
- `POST /api/webhooks/paypal/test` - Test endpoint for PayPal webhooks

### Implementation Location

- **Routes:** `backend/src/routes/webhooks.routes.js`
- **PayPal Handler:** `backend/src/services/payments/paypalWebhookHandler.js`
- **Stripe Handler:** `backend/src/services/payment.service.js` (partial)

### Request Flow

```javascript
// Simplified flow
router.post('/paypal', async (req, res) => {
  // 1. Immediate response (required by PayPal)
  res.status(200).json({ received: true });
  
  // 2. Asynchronous processing
  (async () => {
    // 3. Signature verification
    const isValid = await verifyPayPalWebhookSignature(headers, body);
    if (!isValid) return;
    
    // 4. Event handling
    const result = await handlePayPalWebhookEvent(body);
    
    // 5. Logging
    console.log('[Webhook] Processed:', result);
  })();
});
```

### Response Requirements

**PayPal Requirements:**
- Must return `200 OK` within reasonable timeframe
- Response must be sent before processing completes
- Invalid signatures should be logged but still return `200 OK`

**Stripe Requirements:**
- Must return `200 OK` for successful processing
- Return `400` or `500` for errors (Stripe will retry)
- Process within timeout window

---

## Security Measures

### Signature Verification

Webhook security relies on cryptographic signature verification to ensure events originate from the payment provider and haven't been tampered with.

### PayPal Signature Verification

**Implementation:** `verifyPayPalWebhookSignature(headers, body)`

**Required Headers:**
- `paypal-auth-algo` - Algorithm used (e.g., "SHA256withRSA")
- `paypal-cert-url` - URL to PayPal's certificate
- `paypal-transmission-id` - Unique transmission ID
- `paypal-transmission-sig` - Cryptographic signature
- `paypal-transmission-time` - Timestamp of transmission

**Verification Process:**
1. Extract required headers from request
2. Obtain PayPal access token (OAuth2)
3. Call PayPal verification endpoint: `/v1/notifications/verify-webhook-signature`
4. Verify response status is `SUCCESS`
5. Reject event if verification fails

**Code Example:**
```javascript
async function verifyPayPalWebhookSignature(headers, body) {
  // Get access token
  const accessToken = await getPayPalAccessToken();
  
  // Prepare verification data
  const verificationData = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: body
  };
  
  // Verify with PayPal
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    verificationData,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  
  return response.data.verification_status === 'SUCCESS';
}
```

**Configuration:**
- `PAYPAL_WEBHOOK_ID` - Webhook ID from PayPal dashboard (required)
- `PAYPAL_CLIENT_ID` - PayPal application client ID
- `PAYPAL_CLIENT_SECRET` - PayPal application secret
- `PAYPAL_MODE` - `sandbox` or `live`

### Stripe Signature Verification

**Status:** Planned (not yet implemented)

**Implementation Plan:**
```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function verifyStripeWebhookSignature(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return { valid: true, event };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

**Required Configuration:**
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from Stripe dashboard
- `STRIPE_SECRET_KEY` - Stripe secret key

### Security Best Practices

1. **Always Verify Signatures** - Never process unverified webhooks in production
2. **Use HTTPS Only** - Webhook endpoints must use HTTPS
3. **Store Secrets Securely** - Use environment variables, never commit secrets
4. **Rotate Secrets Regularly** - Update webhook secrets periodically
5. **Log Verification Failures** - Monitor for suspicious activity
6. **IP Allowlisting** (Planned) - Restrict webhook endpoints to provider IPs

### Development vs Production

**Development:**
- Signature verification can be skipped if `PAYPAL_WEBHOOK_ID` not configured
- Test endpoint available: `/api/webhooks/paypal/test`
- Detailed logging enabled

**Production:**
- Signature verification required
- Test endpoint disabled (planned)
- Minimal logging (errors only)

---

## Event Processing Lifecycle

### Processing Flow

```
1. Webhook Received
   ↓
2. Immediate 200 OK Response
   ↓
3. Extract Event Data
   ↓
4. Verify Signature
   ↓
5. Route to Handler
   ↓
6. Process Event
   ↓
7. Update Database
   ↓
8. Log Result
```

### Event Routing

**PayPal Events:**
```javascript
switch (event.event_type) {
  case 'BILLING.SUBSCRIPTION.ACTIVATED':
    return await handleSubscriptionActivated(subscriptionId, resource);
  case 'BILLING.SUBSCRIPTION.CANCELLED':
    return await handleSubscriptionCancelled(subscriptionId, resource);
  case 'BILLING.SUBSCRIPTION.SUSPENDED':
    return await handleSubscriptionSuspended(subscriptionId, resource);
  case 'BILLING.SUBSCRIPTION.EXPIRED':
    return await handleSubscriptionExpired(subscriptionId, resource);
  case 'BILLING.SUBSCRIPTION.UPDATED':
    return await handleSubscriptionUpdated(subscriptionId, resource);
  case 'PAYMENT.SALE.COMPLETED':
    return await handlePaymentCompleted(subscriptionId, resource);
  case 'BILLING.SUBSCRIPTION.CREATED':
    return { processed: true, action: 'logged' };
  default:
    return { processed: false, reason: 'Unhandled event type' };
}
```

**Stripe Events:**
```javascript
switch (event.type) {
  case 'checkout.session.completed':
    // Handle successful checkout
    break;
  case 'customer.subscription.updated':
    // Handle subscription update
    break;
  case 'customer.subscription.deleted':
    // Handle subscription cancellation
    break;
  case 'invoice.payment_succeeded':
    // Handle successful payment
    break;
  case 'invoice.payment_failed':
    // Handle failed payment
    break;
  default:
    console.log(`Unhandled event type: ${event.type}`);
}
```

### Error Handling

**Strategy:**
- Errors are caught and logged
- Errors don't affect HTTP response (already `200 OK`)
- Failed events are logged for manual review
- No retry mechanism (providers handle retries)

**Error Logging:**
```javascript
try {
  const result = await handlePayPalWebhookEvent(body);
  console.log('[Webhook] Processed:', result);
} catch (error) {
  // Log error but don't throw (we already returned 200 OK)
  console.error('[Webhook] Error processing webhook:', error);
}
```

---

## Idempotency and Logging

### Idempotency

Webhook handlers are designed to be idempotent, meaning processing the same event multiple times produces the same result.

**Idempotency Strategy:**
1. **Subscription Lookup** - Find subscription by provider ID
2. **Status Check** - Verify current status before updating
3. **Conditional Updates** - Only update if status differs
4. **No Side Effects** - Repeated processing doesn't cause issues

**Example:**
```javascript
async function handleSubscriptionActivated(subscriptionId, resource) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });
  
  if (!subscription) {
    return { processed: false, reason: 'Subscription not found' };
  }
  
  // Only update if not already active
  if (subscription.status !== 'ACTIVE') {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE', cancelAtPeriodEnd: false }
    });
  }
  
  return { processed: true, action: 'activated' };
}
```

### Logging

**Log Levels:**
- `console.log()` - Event received, processing started
- `console.warn()` - Missing data, unhandled events
- `console.error()` - Errors, signature failures

**Log Format:**
```javascript
console.log('[PayPal Webhook] Received event: BILLING.SUBSCRIPTION.ACTIVATED', {
  subscriptionId: 'I-BW452GLLEP1G',
  eventId: 'WH-2W42625FY50641422-67976317FL053554R',
  summary: 'A billing subscription was activated.'
});

console.log('[PayPal Webhook] Subscription I-BW452GLLEP1G activated successfully');
```

**Logging Best Practices:**
1. Include event type and ID
2. Log subscription/provider IDs
3. Log processing results
4. Don't log sensitive data (card numbers, etc.)
5. Use structured logging format

### Event Tracking

**Current Implementation:**
- Events logged to console
- No persistent event storage (planned)

**Planned:**
- Event storage in database
- Event replay capability
- Event analytics dashboard

---

## PayPal Event Schemas

### Event Structure

All PayPal webhook events follow this structure:

```json
{
  "id": "WH-2W42625FY50641422-67976317FL053554R",
  "event_version": "1.0",
  "create_time": "2018-12-10T21:20:49.000Z",
  "resource_type": "subscription",
  "resource_version": "2.0",
  "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
  "summary": "A billing subscription was activated.",
  "resource": {
    "id": "I-BW452GLLEP1G",
    "status": "ACTIVE",
    "status_update_time": "2018-12-10T21:20:49Z",
    "plan_id": "P-5ML4271244454362WXNWU5NQ",
    "billing_info": {
      "outstanding_balance": {
        "value": "0.00",
        "currency_code": "USD"
      },
      "cycle_executions": [
        {
          "tenure_type": "REGULAR",
          "sequence": 1,
          "cycles_completed": 0,
          "cycles_remaining": 0,
          "current_pricing_scheme_version": 1
        }
      ],
      "last_payment": {
        "amount": {
          "value": "29.00",
          "currency_code": "USD"
        },
        "time": "2018-12-10T21:20:49Z"
      },
      "next_billing_time": "2019-01-10T10:00:00Z"
    }
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G",
      "rel": "self",
      "method": "GET"
    }
  ]
}
```

### Supported Events

| Event Type | Description | Handler | Action |
|------------|-------------|---------|--------|
| `BILLING.SUBSCRIPTION.CREATED` | Subscription created (pending) | `handlePayPalWebhookEvent` | Logged only |
| `BILLING.SUBSCRIPTION.ACTIVATED` | Subscription activated | `handleSubscriptionActivated` | Set status to ACTIVE, update period dates |
| `BILLING.SUBSCRIPTION.CANCELLED` | Subscription cancelled | `handleSubscriptionCancelled` | Set status to CANCELLED |
| `BILLING.SUBSCRIPTION.SUSPENDED` | Subscription suspended | `handleSubscriptionSuspended` | Set status to CANCELLED (mapped) |
| `BILLING.SUBSCRIPTION.EXPIRED` | Subscription expired | `handleSubscriptionExpired` | Set status to EXPIRED |
| `BILLING.SUBSCRIPTION.UPDATED` | Subscription updated | `handleSubscriptionUpdated` | Update status and billing period |
| `PAYMENT.SALE.COMPLETED` | Payment completed | `handlePaymentCompleted` | Record payment, update period dates |

### BILLING.SUBSCRIPTION.ACTIVATED

**Trigger:** User approves subscription, payment succeeds

**Payload:**
```json
{
  "id": "WH-2W42625FY50641422-67976317FL053554R",
  "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
  "resource": {
    "id": "I-BW452GLLEP1G",
    "status": "ACTIVE",
    "billing_info": {
      "next_billing_time": "2019-01-10T10:00:00Z",
      "last_payment": {
        "time": "2018-12-10T21:20:49Z"
      }
    }
  }
}
```

**Handler Action:**
- Update subscription status to `ACTIVE`
- Set `cancelAtPeriodEnd` to `false`
- Update `currentPeriodStart` and `currentPeriodEnd` from billing info

### BILLING.SUBSCRIPTION.CANCELLED

**Trigger:** User cancels subscription

**Payload:**
```json
{
  "id": "WH-2W42625FY50641422-67976317FL053554R",
  "event_type": "BILLING.SUBSCRIPTION.CANCELLED",
  "resource": {
    "id": "I-BW452GLLEP1G",
    "status": "CANCELLED"
  }
}
```

**Handler Action:**
- Update subscription status to `CANCELLED`
- Set `cancelAtPeriodEnd` to `true`

### BILLING.SUBSCRIPTION.UPDATED

**Trigger:** Subscription details changed (plan, billing period, etc.)

**Payload:**
```json
{
  "id": "WH-2W42625FY50641422-67976317FL053554R",
  "event_type": "BILLING.SUBSCRIPTION.UPDATED",
  "resource": {
    "id": "I-BW452GLLEP1G",
    "status": "ACTIVE",
    "billing_info": {
      "next_billing_time": "2019-02-10T10:00:00Z",
      "last_payment": {
        "time": "2019-01-10T10:00:00Z"
      }
    }
  }
}
```

**Handler Action:**
- Update subscription status (if changed)
- Update billing period dates (if provided)

### PAYMENT.SALE.COMPLETED

**Trigger:** Payment successfully processed

**Payload:**
```json
{
  "id": "WH-2W42625FY50641422-67976317FL053554R",
  "event_type": "PAYMENT.SALE.COMPLETED",
  "resource": {
    "id": "8XH67135YW406414F",
    "billing_agreement_id": "I-BW452GLLEP1G",
    "update_time": "2019-01-10T10:00:00Z",
    "amount": {
      "value": "29.00",
      "currency_code": "USD"
    }
  }
}
```

**Handler Action:**
- Update `currentPeriodStart` to payment time
- Calculate and set `currentPeriodEnd` (1 month from payment)
- Ensure subscription status is `ACTIVE`

---

## Stripe Event Schemas

### Event Structure

All Stripe webhook events follow this structure:

```json
{
  "id": "evt_1ABC123def456GHI",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1609459200,
  "data": {
    "object": {
      "id": "sub_1ABC123def456GHI",
      "object": "subscription",
      "status": "active",
      "current_period_start": 1609459200,
      "current_period_end": 1612137600,
      "customer": "cus_1ABC123def456GHI"
    },
    "previous_attributes": {}
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_1ABC123def456GHI",
    "idempotency_key": null
  },
  "type": "customer.subscription.updated"
}
```

### Supported Events

| Event Type | Description | Handler | Status |
|------------|-------------|---------|--------|
| `checkout.session.completed` | Checkout completed | `handleWebhook` | Planned |
| `customer.subscription.updated` | Subscription updated | `handleWebhook` | Planned |
| `customer.subscription.deleted` | Subscription cancelled | `handleWebhook` | Planned |
| `invoice.payment_succeeded` | Payment succeeded | `handleWebhook` | Planned |
| `invoice.payment_failed` | Payment failed | `handleWebhook` | Planned |

### checkout.session.completed

**Trigger:** User completes Stripe Checkout

**Payload:**
```json
{
  "id": "evt_1ABC123def456GHI",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_1ABC123def456GHI",
      "object": "checkout.session",
      "customer": "cus_1ABC123def456GHI",
      "subscription": "sub_1ABC123def456GHI",
      "metadata": {
        "userId": "user_123",
        "plan": "PRO"
      }
    }
  }
}
```

**Handler Action (Planned):**
- Create or update subscription in database
- Set subscription status to `ACTIVE`
- Store Stripe customer and subscription IDs

### customer.subscription.updated

**Trigger:** Subscription modified (plan change, billing update, etc.)

**Payload:**
```json
{
  "id": "evt_1ABC123def456GHI",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_1ABC123def456GHI",
      "status": "active",
      "current_period_start": 1609459200,
      "current_period_end": 1612137600,
      "cancel_at_period_end": false
    }
  }
}
```

**Handler Action (Planned):**
- Update subscription status
- Update billing period dates
- Update `cancelAtPeriodEnd` flag

### invoice.payment_succeeded

**Trigger:** Recurring payment successfully processed

**Payload:**
```json
{
  "id": "evt_1ABC123def456GHI",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_1ABC123def456GHI",
      "object": "invoice",
      "subscription": "sub_1ABC123def456GHI",
      "amount_paid": 2900,
      "currency": "usd",
      "status": "paid",
      "period_start": 1609459200,
      "period_end": 1612137600
    }
  }
}
```

**Handler Action (Planned):**
- Update subscription period dates
- Ensure subscription status is `ACTIVE`
- Record payment in database (planned)

### invoice.payment_failed

**Trigger:** Payment attempt failed

**Payload:**
```json
{
  "id": "evt_1ABC123def456GHI",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_1ABC123def456GHI",
      "object": "invoice",
      "subscription": "sub_1ABC123def456GHI",
      "attempt_count": 3,
      "next_payment_attempt": 1612137600
    }
  }
}
```

**Handler Action (Planned):**
- Log payment failure
- Update subscription status if max retries reached
- Notify user (planned)

---

## Retry and Failure Handling

### Provider Retry Logic

**PayPal:**
- PayPal retries failed webhook deliveries automatically
- Retry schedule: Exponential backoff
- Max retries: Configurable in PayPal dashboard
- Retry window: Typically 3 days

**Stripe:**
- Stripe retries failed webhook deliveries
- Retry schedule: Exponential backoff (1 hour, 6 hours, 12 hours, 24 hours)
- Max retries: 3 days
- Retry conditions: Non-200 response, timeout, connection error

### Our Retry Strategy

**Current Implementation:**
- No internal retry mechanism
- Relies on provider retry logic
- Failed events are logged for manual review

**Planned:**
- Event queue for failed processing
- Automatic retry with exponential backoff
- Dead letter queue for permanently failed events
- Manual retry capability

### Failure Scenarios

**Signature Verification Failure:**
- Event rejected, logged
- No database update
- Provider will retry (may fail again if signature issue persists)

**Subscription Not Found:**
- Event logged with warning
- Returns `{ processed: false, reason: 'Subscription not found' }`
- No database update

**Database Error:**
- Error caught and logged
- Event processing fails
- Provider will retry
- May require manual intervention if persistent

**Timeout:**
- Provider may timeout if processing takes too long
- Should process asynchronously (current implementation)
- Keep processing time under 30 seconds

### Best Practices for Failure Handling

1. **Idempotent Handlers** - Safe to retry
2. **Fast Processing** - Return 200 OK quickly
3. **Comprehensive Logging** - Log all failures with context
4. **Error Monitoring** - Alert on repeated failures
5. **Manual Recovery** - Ability to replay events

---

## Best Practices

### Webhook Endpoint Design

1. **Always Return 200 OK Immediately**
   ```javascript
   router.post('/paypal', async (req, res) => {
     res.status(200).json({ received: true });
     // Process asynchronously
   });
   ```

2. **Verify Signatures Always**
   ```javascript
   const isValid = await verifyWebhookSignature(headers, body);
   if (!isValid) {
     console.error('Invalid signature');
     return; // Still return 200 OK
   }
   ```

3. **Process Asynchronously**
   ```javascript
   (async () => {
     // Long-running processing
   })();
   ```

4. **Handle Errors Gracefully**
   ```javascript
   try {
     await processEvent(event);
   } catch (error) {
     console.error('Error:', error);
     // Don't throw, already returned 200 OK
   }
   ```

### Event Handler Design

1. **Idempotent Operations**
   - Check current state before updating
   - Use conditional updates
   - Avoid duplicate side effects

2. **Extract IDs Safely**
   ```javascript
   const subscriptionId = resource.id || resource.billing_agreement_id;
   if (!subscriptionId) {
     return { processed: false, reason: 'No subscription ID' };
   }
   ```

3. **Validate Data**
   ```javascript
   const subscription = await findSubscription(subscriptionId);
   if (!subscription) {
     return { processed: false, reason: 'Subscription not found' };
   }
   ```

4. **Log Processing Results**
   ```javascript
   console.log(`[Webhook] Subscription ${subscriptionId} activated`);
   return { processed: true, action: 'activated' };
   ```

### Security Best Practices

1. **Use HTTPS Only** - Never accept webhooks over HTTP
2. **Verify Signatures** - Always verify in production
3. **Store Secrets Securely** - Use environment variables
4. **Rotate Secrets** - Update webhook secrets periodically
5. **Monitor Failures** - Alert on signature verification failures
6. **IP Allowlisting** (Planned) - Restrict to provider IP ranges

### Testing

1. **Test Endpoint** - Use `/api/webhooks/paypal/test` for testing
2. **Local Testing** - Use ngrok or similar for local webhook testing
3. **Sandbox Mode** - Test with provider sandbox environments
4. **Event Replay** - Test with sample event payloads

---

## Troubleshooting

### Common Issues

#### Webhooks Not Received

**Symptoms:**
- Events not appearing in logs
- Subscription status out of sync

**Debugging:**
1. Check webhook URL configuration in provider dashboard
2. Verify endpoint is accessible (HTTPS required)
3. Check firewall/network rules
4. Verify webhook is enabled in provider dashboard
5. Check provider webhook delivery logs

**Solution:**
- Ensure endpoint URL is correct and accessible
- Verify HTTPS certificate is valid
- Check provider webhook configuration

#### Signature Verification Fails

**Symptoms:**
- `[Webhook] Invalid PayPal webhook signature, ignoring event`
- Events rejected

**Debugging:**
```javascript
// Log headers for debugging
console.log('[Webhook] Headers:', req.headers);
console.log('[Webhook] PAYPAL_WEBHOOK_ID:', process.env.PAYPAL_WEBHOOK_ID);

// Check signature verification
const isValid = await verifyPayPalWebhookSignature(headers, body);
console.log('[Webhook] Signature valid:', isValid);
```

**Common Causes:**
- Missing or incorrect `PAYPAL_WEBHOOK_ID`
- Webhook secret mismatch
- Header case sensitivity issues
- Timestamp validation failures

**Solution:**
- Verify `PAYPAL_WEBHOOK_ID` matches dashboard
- Check webhook secret in provider dashboard
- Ensure headers are extracted correctly (case-insensitive)

#### Subscription Not Found

**Symptoms:**
- `[PayPal Webhook] Subscription {id} not found in database`
- Event processed but no database update

**Debugging:**
```javascript
// Check subscription lookup
const subscription = await prisma.subscription.findFirst({
  where: { paypalSubscriptionId: subscriptionId }
});
console.log('[Webhook] Subscription found:', subscription);
```

**Common Causes:**
- Subscription created but not linked to PayPal ID
- PayPal subscription ID mismatch
- Subscription deleted from database

**Solution:**
- Verify subscription exists in database
- Check `paypalSubscriptionId` matches PayPal subscription ID
- Ensure subscription is created with correct provider ID

#### Events Processed Multiple Times

**Symptoms:**
- Duplicate database updates
- Same event logged multiple times

**Debugging:**
- Check idempotency logic
- Verify event ID tracking (planned)
- Check provider retry behavior

**Solution:**
- Implement idempotency checks
- Track processed event IDs (planned)
- Use database constraints to prevent duplicates

### Debugging Tools

#### Test Endpoint

**PayPal Test Endpoint:**
```bash
POST /api/webhooks/paypal/test
Content-Type: application/json

{
  "eventType": "BILLING.SUBSCRIPTION.ACTIVATED",
  "resource": {
    "id": "I-BW452GLLEP1G",
    "status": "ACTIVE",
    "billing_info": {
      "next_billing_time": "2019-01-10T10:00:00Z"
    }
  }
}
```

#### Logging

**Enable Detailed Logging:**
```javascript
// Log all webhook events
console.log('[Webhook] Received:', {
  eventType: body.event_type,
  eventId: body.id,
  subscriptionId: resource.id,
  headers: Object.keys(req.headers)
});
```

#### Provider Dashboards

- **PayPal:** Webhook event logs in PayPal dashboard
- **Stripe:** Webhook delivery logs in Stripe dashboard

### Getting Help

1. **Check Logs** - Review application logs for errors
2. **Provider Logs** - Check provider webhook delivery logs
3. **Test Endpoint** - Use test endpoint to verify handler logic
4. **Documentation** - Review provider webhook documentation
5. **Support** - Contact provider support if issue persists

---

## API Endpoints

### Webhook Endpoints

**PayPal Webhook:**
```
POST /api/webhooks/paypal
Content-Type: application/json
Headers: paypal-* (signature headers)

Response: 200 OK
Body: { received: true }
```

**PayPal Test Endpoint:**
```
POST /api/webhooks/paypal/test
Content-Type: application/json
Body: { eventType: string, resource: object }

Response: 200 OK
Body: { success: true, message: string, result: object }
```

**Stripe Webhook (Planned):**
```
POST /api/webhooks/stripe
Content-Type: application/json
Headers: stripe-signature

Response: 200 OK
```

---

## TODO / Planned Improvements

### Short-Term

- [ ] **Stripe Webhook Implementation**
  - Complete Stripe webhook signature verification
  - Implement all Stripe webhook event handlers
  - Test Stripe webhook processing
  - Add Stripe webhook endpoint

- [ ] **Event Storage**
  - Store webhook events in database
  - Track event processing status
  - Enable event replay

- [ ] **Enhanced Logging**
  - Structured logging (JSON format)
  - Log aggregation service integration
  - Error tracking (Sentry, etc.)

### Medium-Term

- [ ] **Idempotency Tracking**
  - Store processed event IDs
  - Prevent duplicate processing
  - Event deduplication logic

- [ ] **Retry Mechanism**
  - Internal retry queue for failed events
  - Exponential backoff implementation
  - Dead letter queue for permanent failures

- [ ] **Webhook Monitoring**
  - Dashboard for webhook health
  - Success/failure rate tracking
  - Alerting for repeated failures

- [ ] **IP Allowlisting**
  - Restrict webhook endpoints to provider IPs
  - IP whitelist configuration
  - Enhanced security

### Long-Term

- [ ] **Additional Providers**
  - Support for other payment providers
  - Generic webhook handler framework
  - Provider-agnostic event processing

- [ ] **Event Replay**
  - Manual event replay capability
  - Bulk event replay
  - Event history viewer

- [ ] **Webhook Analytics**
  - Event volume tracking
  - Processing time metrics
  - Failure rate analysis
  - Provider comparison

- [ ] **Webhook Testing Framework**
  - Automated webhook testing
  - Mock provider endpoints
  - Integration test suite

---

## Related Documentation

- [Subscriptions and Billing](./subscriptions-and-billing.md) - Subscription system and billing flows
- [Security Model](./security-model.md) - Security and authentication details
- [API Routing Map](./api-routing-map.md) - API endpoint documentation
- [Database Schema](./database-schema.md) - Database structure for subscriptions
- [Development: Debugging](../development/debugging.md) - Debugging webhook issues

---

## Changelog

**2026-01-07:**
- Initial documentation created
- Documented PayPal webhook implementation
- Added event schemas and payload examples
- Documented security measures and best practices
- Added troubleshooting guide
