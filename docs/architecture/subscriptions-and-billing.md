# Subscriptions and Billing

**Description:** Documents subscription tiers, quota model, billing flows, payment providers, lifecycle (upgrade/cancel), and failure states.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

Nova‑XFinity AI implements a tiered subscription model with three plans: **FREE**, **PRO**, and **ENTERPRISE**. The billing system supports multiple payment providers (Stripe and PayPal) and handles subscription lifecycle events through webhooks. Quota enforcement ensures users stay within their plan limits, with automatic warnings and blocking when limits are exceeded.

### Key Components

- **Subscription Service** (`backend/src/services/subscription.service.js`) - Core subscription management
- **Payment Services** - Stripe (`backend/src/services/payment.service.js`) and PayPal (`backend/src/services/payments/paypalService.js`)
- **Webhook Handlers** - Process payment provider events (`backend/src/routes/webhooks.routes.js`)
- **Quota Middleware** - Enforces usage limits (`backend/src/middleware/quota.middleware.js`)
- **Usage Service** - Tracks and manages usage (`backend/src/services/usage.service.js`)

### Architecture Flow

```
User Action → Frontend Quota Check → API Request → Backend Quota Middleware
    ↓
Payment Provider (Stripe/PayPal) → Webhook → Subscription Update → Role/Entitlement Update
```

---

## Subscription Tiers

Nova‑XFinity offers three subscription tiers with progressively increasing features and limits.

### Plan Comparison

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| **Pricing** | $0/month | $29/month | $99/month |
| **Articles** | 10/month | 100/month | Unlimited |
| **Images** | 25/month | 500/month | Unlimited |
| **Videos** | 0 | 20/month | 100/month |
| **Research Queries** | 20/month | Unlimited | Unlimited |
| **WordPress Publications** | 0 | 50/month | Unlimited |
| **Content Quality** | Standard | High | Highest |
| **API Access** | ❌ | ✅ | ✅ |
| **Advanced SEO** | ❌ | ✅ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ |
| **Custom Integrations** | ❌ | ❌ | ✅ |

### FREE Plan

**Target Audience:** Individual users, hobbyists, content creators testing the platform.

**Features:**
- 10 articles per month
- 25 images per month
- 20 research queries per month
- Standard quality content generation
- Basic SEO features
- No WordPress integration
- No API access
- Community support

**Limitations:**
- Videos not available
- No advanced features
- Limited quota resets monthly

### PRO Plan

**Target Audience:** Professional content creators, marketers, small businesses.

**Features:**
- 100 articles per month
- 500 images per month
- 20 videos per month
- Unlimited research queries
- 50 WordPress publications per month
- High-quality content generation
- Advanced SEO features
- API access
- Priority support

**Pricing:** $29/month (billed monthly)

### ENTERPRISE Plan

**Target Audience:** Agencies, large businesses, high-volume users.

**Features:**
- Unlimited articles
- Unlimited images
- 100 videos per month
- Unlimited research queries
- Unlimited WordPress publications
- Highest quality content generation
- All advanced features
- Full API access
- Custom integrations
- Dedicated support

**Pricing:** $99/month (billed monthly)

---

## Quota Model

The quota system tracks usage per billing period (monthly) and enforces limits based on subscription plan. Usage resets at the start of each billing cycle.

### Quota Tracking

**Database Schema:**
- `Usage` table tracks monthly usage per user
- Fields: `articlesGenerated`, `imagesGenerated`, `videosGenerated`, `researchQueries`, `articlesPublished`
- Period tracking: `periodStart`, `periodEnd` (monthly)

**Usage Service:**
- `getCurrentUsage(userId)` - Retrieves current period usage
- `incrementUsage(userId, feature, amount)` - Increments usage (throws if exceeded)
- `canPerformAction(userId, feature)` - Checks quota before action
- `getUsageStats(userId)` - Returns formatted statistics

### Quota Enforcement

**Frontend:**
- `QuotaGuard` component disables buttons when quota exceeded
- Warning banners at 90% usage threshold
- Real-time quota checks via `useQuota` hook

**Backend:**
- `checkQuota` middleware validates quota before processing requests
- Returns `403 QUOTA_EXCEEDED` error when limit reached
- Usage incremented only after successful generation

**Enforcement Flow:**
1. User initiates action (e.g., "Generate Article")
2. Frontend checks quota via `useQuota` hook
3. If allowed, request sent to backend
4. Backend `checkQuota` middleware validates quota
5. If quota available, action proceeds and usage incremented
6. If quota exceeded, request blocked with error response

### Unlimited Features

Features with `-1` limit (unlimited) always pass quota checks:
- PRO/ENTERPRISE: Research queries
- ENTERPRISE: Articles, images, WordPress publications

---

## Billing Flows

### Initial Subscription Signup

**Flow:**
1. User selects plan (PRO or ENTERPRISE)
2. User chooses payment provider (Stripe or PayPal)
3. Checkout session created
4. User redirected to payment provider
5. Payment completed
6. Webhook received and subscription activated
7. User role updated (if applicable)
8. Quota limits updated

**Stripe Flow:**
```
POST /api/subscription/checkout
  → createCheckoutSession(userId, plan)
  → Redirect to Stripe Checkout
  → Payment success → Webhook: checkout.session.completed
  → updateSubscriptionPlan() → Status: ACTIVE
```

**PayPal Flow:**
```
POST /api/subscription/paypal/checkout
  → createPayPalCheckout(userId, plan)
  → Redirect to PayPal approval
  → User approves → POST /api/subscription/paypal/execute
  → executePayPalSubscription() → updateSubscriptionPlan()
  → Webhook: BILLING.SUBSCRIPTION.ACTIVATED
```

### Upgrade Flow

**Upgrading from FREE to PRO/ENTERPRISE:**
1. User clicks "Upgrade" button
2. Checkout flow initiated (same as signup)
3. Subscription plan updated immediately
4. New quota limits applied
5. Remaining usage from old plan preserved (if applicable)

**Upgrading from PRO to ENTERPRISE:**
1. User initiates upgrade
2. Payment provider handles proration (if supported)
3. Subscription plan updated
4. Quota limits increased immediately
5. Usage statistics recalculated

### Downgrade Flow

**Downgrading from PRO/ENTERPRISE to FREE:**
1. User cancels subscription
2. `cancelSubscription()` sets `cancelAtPeriodEnd: true`
3. Subscription remains active until period end
4. At period end: Status → `EXPIRED`, Plan → `FREE`
5. Quota limits reduced to FREE tier
6. Usage exceeding FREE limits blocked

**Downgrading from ENTERPRISE to PRO:**
1. User changes plan via customer portal
2. Payment provider handles proration
3. Subscription plan updated at next billing cycle
4. Quota limits adjusted accordingly

### Cancellation Flow

**User-Initiated Cancellation:**
1. User clicks "Cancel Subscription"
2. `POST /api/subscription/cancel`
3. `cancelSubscription()` sets `cancelAtPeriodEnd: true`
4. Subscription remains active until `currentPeriodEnd`
5. User retains access until period end
6. At period end: Status → `CANCELLED` or `EXPIRED`
7. Webhook: `BILLING.SUBSCRIPTION.CANCELLED` (PayPal) or `customer.subscription.deleted` (Stripe)

**Payment Provider Cancellation:**
- User cancels directly in Stripe Customer Portal or PayPal account
- Webhook received → Subscription status updated
- Access revoked immediately or at period end (depending on provider)

### Reactivation Flow

**Reactivation Before Period End:**
1. User clicks "Reactivate Subscription"
2. `POST /api/subscription/reactivate`
3. `reactivateSubscription()` sets `cancelAtPeriodEnd: false`
4. Status remains `ACTIVE`
5. Subscription continues normally

**Reactivation After Expiration:**
1. User must create new subscription
2. Follows initial signup flow
3. New subscription created with fresh billing period

---

## Payment Providers

Nova‑XFinity supports multiple payment providers to offer flexibility to users.

### Stripe Integration

**Configuration:**
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_ENTERPRISE`
- Stripe Customer Portal for subscription management

**Features:**
- Credit/debit card payments
- Automatic recurring billing
- Customer portal for self-service management
- Webhook events for subscription lifecycle

**Implementation:**
- Service: `backend/src/services/payment.service.js`
- Checkout: `createCheckoutSession(userId, plan)`
- Portal: `createPortalSession(customerId)`
- Webhook handler: `handleWebhook(event)`

**Webhook Events:**
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### PayPal Integration

**Configuration:**
- Environment variables: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `PAYPAL_PLAN_ID_PRO`, `PAYPAL_PLAN_ID_ENTERPRISE`, `PAYPAL_WEBHOOK_ID`
- Supports both sandbox and live modes

**Features:**
- PayPal account payments
- Subscription billing agreements
- Automatic recurring payments
- Webhook signature verification

**Implementation:**
- Service: `backend/src/services/payments/paypalService.js`
- Checkout: `createPayPalCheckout(userId, plan)`
- Execution: `executePayPalSubscription(subscriptionId, token)`
- Webhook handler: `backend/src/services/payments/paypalWebhookHandler.js`

**Webhook Events:**
- `BILLING.SUBSCRIPTION.CREATED` - Subscription created (pending)
- `BILLING.SUBSCRIPTION.ACTIVATED` - Subscription activated
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription cancelled
- `BILLING.SUBSCRIPTION.SUSPENDED` - Subscription suspended
- `BILLING.SUBSCRIPTION.EXPIRED` - Subscription expired
- `BILLING.SUBSCRIPTION.UPDATED` - Subscription updated
- `PAYMENT.SALE.COMPLETED` - Payment completed

### Provider Selection

Users can choose their preferred payment provider during checkout. The system stores provider-specific identifiers:
- Stripe: `stripeCustomerId`, `stripeSubscriptionId`
- PayPal: `paypalPayerId`, `paypalSubscriptionId`, `paypalPlanId`

### Future Providers

**Planned:**
- Additional payment methods (bank transfers, cryptocurrency)
- Regional payment providers
- Enterprise invoicing (net terms)

---

## Webhook Events

Webhooks are critical for keeping subscription status synchronized with payment providers. All webhook endpoints return `200 OK` immediately and process events asynchronously.

### Webhook Security

**PayPal:**
- Signature verification via `verifyPayPalWebhookSignature()`
- Required headers: `paypal-auth-algo`, `paypal-cert-url`, `paypal-transmission-id`, `paypal-transmission-sig`, `paypal-transmission-time`
- Verification endpoint: `/v1/notifications/verify-webhook-signature`

**Stripe:**
- Webhook signature verification (to be implemented)
- Uses Stripe webhook signing secret

### Event Processing

**Handler Location:** `backend/src/routes/webhooks.routes.js`

**Processing Flow:**
1. Webhook received → Immediate `200 OK` response
2. Signature verification
3. Event routed to appropriate handler
4. Database updated asynchronously
5. Errors logged (don't affect response)

**Idempotency:**
- Events processed based on subscription ID
- Duplicate events handled gracefully
- Status updates are idempotent

### Key Webhook Handlers

**PayPal:**
- `handleSubscriptionActivated()` - Activates subscription, updates period dates
- `handleSubscriptionCancelled()` - Marks subscription as cancelled
- `handleSubscriptionSuspended()` - Handles suspension (mapped to cancelled)
- `handleSubscriptionExpired()` - Marks subscription as expired
- `handleSubscriptionUpdated()` - Updates status and billing period
- `handlePaymentCompleted()` - Records payment, updates period dates

**Stripe:**
- `checkout.session.completed` - Creates/updates subscription
- `customer.subscription.updated` - Updates subscription details
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_succeeded` - Records successful payment
- `invoice.payment_failed` - Handles payment failure

For detailed webhook documentation, see [Webhooks Documentation](../architecture/webhooks.md).

---

## Role Updates and Entitlements

### Role Assignment

**Default Role:**
- New users: `user` role (FREE plan)
- Stored in `users.role` column (auth service)

**Role on Subscription:**
- FREE plan → `user` role
- PRO/ENTERPRISE plan → `pro` role (planned)
- Admin role → Manual assignment only

**Current Implementation:**
- Subscription plan stored in `subscriptions.plan`
- Role updates on subscription change (to be fully implemented)
- Feature access determined by subscription plan via `PLAN_FEATURES`

### Entitlement Updates

**On Upgrade:**
1. Subscription plan updated
2. Quota limits increased immediately
3. Feature flags updated (via `PLAN_FEATURES`)
4. Role updated to `pro` (planned)
5. User gains access to premium features

**On Downgrade/Cancellation:**
1. Subscription plan updated (at period end)
2. Quota limits reduced
3. Feature flags updated
4. Role remains `pro` until period end (then reverts to `user`)
5. Premium features locked after period end

**Feature Access:**
- Determined by `hasFeatureAccess(userId, feature)`
- Checks `PLAN_FEATURES[plan][feature].enabled`
- Middleware: `subscription.middleware.js` (planned)

---

## Invoicing, Receipts, Taxes, and Refunds

### Invoicing

**Current Implementation:**
- Payment providers handle invoice generation
- Stripe: Automatic invoices via Stripe Dashboard
- PayPal: Invoices via PayPal account

**Planned:**
- Custom invoice generation
- Invoice storage in database
- Email delivery of invoices
- Invoice download from account page

### Receipts

**Current Implementation:**
- Receipts provided by payment providers
- Stripe: Receipt emails sent automatically
- PayPal: Receipt emails from PayPal

**Planned:**
- Receipt storage in database
- Receipt download from account page
- Custom receipt templates

### Taxes

**Current Implementation:**
- Tax calculation handled by payment providers
- Stripe Tax: Automatic tax calculation (if enabled)
- PayPal: Tax handling via PayPal settings

**Planned:**
- Custom tax calculation
- Tax-exempt status support
- Regional tax rules
- Tax reporting

### Refunds

**Current Implementation:**
- Refunds processed manually via payment provider dashboards
- Stripe: Refund via Stripe Dashboard
- PayPal: Refund via PayPal account

**Refund Policy:**
- Refunds processed on a case-by-case basis
- Pro-rated refunds for unused subscription periods
- See [Return & Refund Policy](../../pages/legal/refund-policy.md) (planned)

**Planned:**
- Automated refund processing
- Refund request system
- Refund tracking in database
- Refund webhook handlers

---

## Failure Scenarios

### Payment Failure

**Stripe Payment Failure:**
1. Webhook: `invoice.payment_failed`
2. Stripe retries payment automatically (configurable)
3. After max retries: Subscription status updated
4. User notified via email (Stripe)
5. Grace period: User retains access for configurable period
6. After grace period: Subscription suspended/expired

**PayPal Payment Failure:**
1. Webhook: `PAYMENT.SALE.DENIED` or `BILLING.SUBSCRIPTION.SUSPENDED`
2. PayPal retries payment (per PayPal policy)
3. Subscription status updated to `SUSPENDED` or `CANCELLED`
4. User notified via PayPal
5. Grace period: User retains access (if configured)
6. After grace period: Access revoked

**Retry Logic:**
- Payment providers handle retries automatically
- Retry schedule: Provider-dependent (typically 3-5 attempts over 2 weeks)
- Manual retry: User can update payment method via customer portal

### Grace Periods

**Current Implementation:**
- Grace periods handled by payment providers
- Stripe: Configurable grace period in subscription settings
- PayPal: Grace period per PayPal policy

**Planned:**
- Custom grace period configuration
- Grace period notifications
- Grace period extension for enterprise customers

### Subscription Expiration

**Automatic Expiration:**
1. `currentPeriodEnd` reached
2. Subscription status → `EXPIRED`
3. Plan → `FREE` (if not renewed)
4. Quota limits reduced to FREE tier
5. Premium features locked
6. User notified via email

**Expiration Handling:**
- Checked on subscription retrieval: `getUserSubscription()`
- Automatic status update if `currentPeriodEnd` passed
- User can reactivate by creating new subscription

### Payment Method Updates

**Stripe:**
- User updates payment method via Stripe Customer Portal
- Webhook: `customer.subscription.updated`
- Subscription continues without interruption

**PayPal:**
- User updates payment method via PayPal account
- Webhook: `BILLING.SUBSCRIPTION.UPDATED`
- Subscription continues without interruption

### Subscription Synchronization Issues

**Problem:** Subscription status out of sync with payment provider.

**Detection:**
- Webhook events not received
- Manual status check via payment provider API
- Scheduled sync job (planned)

**Resolution:**
- Manual sync via admin panel (planned)
- Webhook replay (if supported by provider)
- Customer support intervention

---

## Security Considerations

### PCI Compliance

**PCI Scope:**
- Nova‑XFinity does NOT store credit card information
- Payment providers (Stripe, PayPal) handle all card data
- PCI compliance responsibility: Payment providers
- No PCI-DSS requirements for Nova‑XFinity infrastructure

**Tokenization:**
- Payment providers use tokenization
- Only payment tokens stored (if applicable)
- No sensitive payment data in database

### Data Protection

**Stored Payment Data:**
- Payment provider customer IDs
- Subscription IDs
- Payment provider plan IDs
- No card numbers, CVV, or expiration dates

**Encryption:**
- Payment provider credentials encrypted in environment variables
- Database connections encrypted (TLS)
- Webhook endpoints use HTTPS only

### Webhook Security

**Signature Verification:**
- PayPal: Webhook signature verification implemented
- Stripe: Webhook signature verification (to be implemented)
- Invalid signatures: Events rejected, logged

**Endpoint Security:**
- Webhook endpoints do NOT require authentication (by design)
- Security relies on signature verification
- IP allowlisting (planned for production)

### Access Control

**Subscription Data:**
- Users can only access their own subscription data
- Admin access required for viewing all subscriptions
- API endpoints protected by authentication middleware

**Payment Provider Credentials:**
- Stored in environment variables
- Never exposed in client-side code
- Rotated regularly (best practice)

---

## API Endpoints

### Subscription Management

**Get Subscription Status:**
```
GET /api/subscription/status
```
Returns current subscription plan, status, limits, and payment provider info.

**Get Usage Statistics:**
```
GET /api/subscription/usage
```
Returns current usage for all features (articles, images, videos, research, wordpress).

**Get Subscription Limits:**
```
GET /api/subscription/limits
```
Returns plan limits for all features.

### Payment Processing

**Create Stripe Checkout:**
```
POST /api/subscription/checkout
Body: { plan: "PRO" | "ENTERPRISE" }
```
Creates Stripe checkout session and returns checkout URL.

**Create Stripe Portal Session:**
```
POST /api/subscription/portal
```
Creates Stripe Customer Portal session for subscription management.

**Create PayPal Checkout:**
```
POST /api/subscription/paypal/checkout
Body: { plan: "PRO" | "ENTERPRISE" }
```
Creates PayPal subscription and returns approval URL.

**Execute PayPal Subscription:**
```
POST /api/subscription/paypal/execute
Body: { subscriptionId: string, token: string }
```
Executes approved PayPal subscription and activates plan.

### Subscription Lifecycle

**Cancel Subscription:**
```
POST /api/subscription/cancel
```
Cancels subscription at period end (`cancelAtPeriodEnd: true`).

**Reactivate Subscription:**
```
POST /api/subscription/reactivate
```
Reactivates cancelled subscription before period end.

### Webhooks

**PayPal Webhook:**
```
POST /api/webhooks/paypal
```
Receives PayPal webhook events (signature verified).

**Stripe Webhook:**
```
POST /api/webhooks/stripe
```
Receives Stripe webhook events (to be implemented).

---

## Database Schema

### Subscription Model

```prisma
model Subscription {
  id                  String             @id @default(uuid())
  userId              String             @unique
  plan                SubscriptionPlan   @default(FREE)
  status              SubscriptionStatus @default(ACTIVE)
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelAtPeriodEnd   Boolean            @default(false)
  stripeSubscriptionId String?           @unique
  stripeCustomerId    String?
  paypalSubscriptionId String?           @unique
  paypalPayerId       String?
  paypalPlanId        String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  user                User
  usage               Usage[]
}

enum SubscriptionPlan {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  TRIAL
}
```

### Usage Model

```prisma
model Usage {
  id                  String   @id @default(uuid())
  userId              String
  subscriptionId      String
  period              UsagePeriod @default(MONTHLY)
  periodStart         DateTime
  periodEnd           DateTime
  articlesGenerated   Int      @default(0)
  imagesGenerated     Int      @default(0)
  videosGenerated     Int      @default(0)
  researchQueries     Int      @default(0)
  articlesPublished   Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  subscription        Subscription
}
```

---

## TODO / Planned Enhancements

### Short-Term (Q1 2026)

- [ ] **Stripe Webhook Implementation**
  - Complete Stripe webhook signature verification
  - Implement all Stripe webhook event handlers
  - Test webhook processing

- [ ] **Role Updates on Subscription**
  - Automatically update user role when subscription changes
  - Sync role with subscription plan
  - Handle role downgrade on cancellation

- [ ] **Invoice Management**
  - Store invoices in database
  - Generate custom invoices
  - Email invoice delivery
  - Invoice download from account page

- [ ] **Receipt Management**
  - Store receipts in database
  - Custom receipt templates
  - Receipt download from account page

### Medium-Term (Q2 2026)

- [ ] **Tax Management**
  - Custom tax calculation engine
  - Tax-exempt status support
  - Regional tax rules
  - Tax reporting

- [ ] **Refund System**
  - Automated refund processing
  - Refund request system
  - Refund tracking
  - Refund webhook handlers

- [ ] **Grace Period Management**
  - Custom grace period configuration
  - Grace period notifications
  - Grace period extension for enterprise

- [ ] **Subscription Synchronization**
  - Scheduled sync job with payment providers
  - Manual sync via admin panel
  - Sync status monitoring

### Long-Term (Q3-Q4 2026)

- [ ] **Additional Payment Providers**
  - Bank transfer support
  - Cryptocurrency payments
  - Regional payment providers (e.g., Alipay, WeChat Pay)

- [ ] **Enterprise Invoicing**
  - Net terms support
  - Purchase order support
  - Custom billing cycles

- [ ] **Subscription Analytics**
  - Revenue tracking
  - Churn analysis
  - Upgrade/downgrade trends
  - Usage analytics

- [ ] **Trial Periods**
  - Free trial implementation
  - Trial expiration handling
  - Trial-to-paid conversion tracking

- [ ] **Promotional Codes**
  - Discount code system
  - Percentage and fixed discounts
  - Usage limits per code
  - Expiration dates

- [ ] **Annual Billing**
  - Annual subscription option
  - Proration for upgrades/downgrades
  - Annual discount support

---

## Related Documentation

- [Quota Limits Implementation](./quota-limits.md) - Detailed quota system documentation
- [Webhooks](./webhooks.md) - Webhook event documentation
- [Database Schema](./database-schema.md) - Database structure for subscriptions
- [Security Model](./security-model.md) - Security and PCI compliance details
- [API Routing Map](./api-routing-map.md) - API endpoint documentation
- [RBAC](./rbac.md) - Role-based access control and permissions

---

## Changelog

**2026-01-07:**
- Initial documentation created
- Documented subscription tiers, billing flows, and payment providers
- Added webhook event documentation
- Documented failure scenarios and security considerations
