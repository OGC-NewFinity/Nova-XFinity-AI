# Plan Upgrade Flow Diagnostic Report

**Date:** 2026-01-07  
**Scope:** Analysis of subscription plan upgrade/downgrade flow, token purchase, and billing logic  
**Status:** Analysis Only - No Code Modifications

---

## Executive Summary

The plan upgrade flow is **partially implemented** with basic checkout functionality for Stripe and PayPal. However, several **critical gaps** exist:

- ✅ Checkout session creation works
- ✅ Webhook handling for subscription activation
- ❌ **Token purchase functionality completely missing**
- ❌ No proration logic for upgrades/downgrades
- ❌ No downgrade scheduling
- ⚠️ Incomplete upgrade flow validation
- ⚠️ Missing token allocation on upgrade

**Overall Assessment:** Functional for basic upgrades but missing critical features for production use.

---

## Current Implementation Flow

### Upgrade Flow (Stripe)

```
1. User clicks "Upgrade" → UpgradeModal.js
2. User selects plan (PRO/ENTERPRISE)
3. Frontend calls: POST /api/subscription/checkout
4. Backend creates Stripe checkout session
5. User redirected to Stripe checkout
6. User completes payment
7. Stripe webhook: checkout.session.completed
8. Backend updates subscription in database
9. User redirected to /account?success=true
```

### Upgrade Flow (PayPal)

```
1. User clicks "Upgrade" → UpgradeModal.js
2. User selects plan (PRO/ENTERPRISE)
3. Frontend calls: POST /api/subscription/paypal/checkout
4. Backend creates PayPal subscription
5. User redirected to PayPal approval
6. User approves subscription
7. Frontend calls: POST /api/subscription/paypal/execute
8. Backend updates subscription in database
9. User sees success message
```

---

## Critical Issues

### Issue 1: Token Purchase Functionality Missing

**Location:** Entire codebase  
**Severity:** HIGH  
**Status:** Not Implemented

**Problem:**
- Token purchase functionality is **completely absent** from codebase
- Documentation exists (`docs/planning/token-economy.md`) describing:
  - Small pack: $5 (100 tokens)
  - Medium pack: $20 (500 tokens + 50 bonus)
  - Large pack: $50 (1,500 tokens + 200 bonus)
  - Extra Large pack: $100 (3,500 tokens + 500 bonus)
- No implementation exists for:
  - Token purchase checkout endpoints
  - Token pack product/price configuration
  - Webhook handling for token purchases
  - Token credit logic after payment

**Evidence:**
- No routes: `/api/tokens/purchase`, `/api/tokens/packs`, etc.
- No service files for token purchases
- No Stripe product IDs for token packs in env.example
- No frontend UI for token purchase
- Token economy documentation exists but no code

**Impact:**
- **Critical revenue loss** - users cannot purchase additional tokens
- Users blocked when monthly allocation exhausted
- Incomplete monetization strategy
- Poor user experience (no way to continue using service)

**Suggested Fix:**
1. Create token purchase service: `backend/src/services/tokenPurchase.service.js`
2. Add routes: `backend/src/features/tokens/routes/tokenPurchase.routes.js`
3. Create Stripe products for each token pack size
4. Add webhook handler for `checkout.session.completed` with token purchase metadata
5. Implement token credit logic after successful payment
6. Add frontend UI: `frontend/src/features/account/TokenPurchase.js`
7. Add environment variables for token pack price IDs

---

### Issue 2: No Token Allocation on Plan Upgrade

**Location:** `backend/src/services/payments/stripeWebhookHandler.js:58-96`  
**Severity:** HIGH  
**Line:** 80-88

**Problem:**
- When subscription is upgraded via webhook, subscription plan is updated
- **No token allocation happens** - user gets new plan but no tokens credited
- Token allocation should happen on:
  - Initial subscription activation
  - Plan upgrade (prorated tokens)
  - Monthly renewal

**Evidence:**
```javascript
await updateSubscriptionPlan(
  userId,
  tier,
  subscriptionId,
  customerId,
  null, // paypalSubscriptionId
  null, // paypalPayerId
  null  // paypalPlanId
);
// No token allocation call here
```

**Impact:**
- Users upgrade but don't receive tokens
- Users may be confused why they can't use features
- Potential support issues
- Revenue loss (users pay but don't get value)

**Suggested Fix:**
- Add token allocation service call after subscription update
- Allocate tokens based on plan tier:
  - FREE: 200 tokens/month
  - PRO: 3,000 tokens/month
  - ENTERPRISE: 15,000 tokens/month
- For upgrades, calculate prorated tokens for remaining period
- For renewals, allocate full monthly amount

---

### Issue 3: Missing Proration Logic for Upgrades

**Location:** `backend/src/features/subscription/services/subscription.service.js:53-104`  
**Severity:** MEDIUM  
**Line:** 69-80

**Problem:**
- `updateSubscriptionPlan` always sets new period start/end dates
- No calculation of prorated amount for upgrade
- User loses remaining time on current subscription
- No refund calculation for unused time

**Evidence:**
```javascript
const now = new Date();
const periodEnd = new Date(now);
periodEnd.setMonth(periodEnd.getMonth() + 1);

const updateData = {
  plan: tier,
  status: 'ACTIVE',
  currentPeriodStart: now, // Always starts now, ignores existing period
  currentPeriodEnd: periodEnd, // Always 1 month from now
  cancelAtPeriodEnd: false
};
```

**Impact:**
- Users lose remaining subscription time on upgrade
- No fair billing for partial periods
- Potential billing disputes
- Poor user experience

**Suggested Fix:**
- Calculate remaining days in current period
- Calculate prorated upgrade cost
- Use Stripe's subscription update API with proration enabled
- Update period dates to preserve remaining time
- Allocate prorated tokens based on remaining days

---

### Issue 4: No Downgrade Scheduling

**Location:** `backend/src/features/subscription/services/subscription.service.js:109-118`  
**Severity:** MEDIUM  
**Line:** 109-118

**Problem:**
- `cancelSubscription` only sets `cancelAtPeriodEnd: true`
- No downgrade functionality (e.g., ENTERPRISE → PRO)
- No scheduling of plan downgrades
- Users must cancel and re-subscribe to downgrade

**Evidence:**
```javascript
export const cancelSubscription = async (userId) => {
  const subscription = await getUserSubscription(userId);
  
  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true // Only cancellation, no downgrade
    }
  });
};
```

**Impact:**
- Users cannot downgrade plans
- Must cancel and lose subscription
- Poor user experience
- Potential churn

**Suggested Fix:**
- Add `downgradeSubscription(userId, newPlan)` function
- Schedule downgrade for period end
- Update Stripe subscription with new plan at period end
- Handle downgrade in webhook: `customer.subscription.updated`
- Allocate tokens based on new plan on downgrade date

---

### Issue 5: Missing Upgrade Validation

**Location:** `backend/src/features/subscription/routes/subscription.routes.js:101-141`  
**Severity:** LOW  
**Line:** 106-114

**Problem:**
- Plan validation only checks if plan is PRO or ENTERPRISE
- No validation that user can upgrade to selected plan
- FREE user can attempt to upgrade to ENTERPRISE (valid)
- PRO user can attempt to upgrade to PRO again (invalid but not caught)
- No validation that upgrade is actually an upgrade

**Evidence:**
```javascript
if (!isValidTier(plan) || plan === 'FREE') {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid plan. Must be PRO or ENTERPRISE.'
    }
  });
}
// No check if user already has this plan or higher
```

**Impact:**
- Users can attempt invalid upgrades
- Wasted API calls
- Confusing error messages
- Potential for duplicate subscriptions

**Suggested Fix:**
- Get current subscription before checkout
- Validate that selected plan is higher than current plan
- Reject if user already has selected plan or higher
- Provide clear error message: "You already have this plan or higher"

---

### Issue 6: Incomplete Upgrade Success Handling

**Location:** `frontend/src/features/account/UpgradeModal.js:79-110`  
**Severity:** LOW  
**Line:** 98-100

**Problem:**
- After Stripe checkout, user is redirected to `/account?success=true`
- No handling of success parameter in BillingPage
- No confirmation message shown to user
- User may not know upgrade was successful

**Evidence:**
```javascript
// Backend redirects to:
success_url: `${process.env.FRONTEND_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`

// Frontend BillingPage doesn't check for success parameter
```

**Impact:**
- Poor user experience
- Users may not know upgrade succeeded
- Potential confusion

**Suggested Fix:**
- Check for `success` parameter in BillingPage
- Show success message/notification
- Refresh subscription data
- Display updated plan information

---

## Integration Gaps

### Issue 7: Missing Token Balance Integration

**Location:** Subscription upgrade flow  
**Severity:** MEDIUM

**Problem:**
- Plan upgrades don't interact with token balance system
- Token allocation should happen but doesn't
- No integration with `tokenUsage` service
- Token balance not updated on upgrade

**Impact:**
- Tokens not allocated on upgrade
- Token balance may be incorrect
- Users can't use upgraded features

**Suggested Fix:**
- Integrate with token balance service
- Allocate tokens after successful upgrade
- Update token balance in database
- Create token transaction record

---

### Issue 8: No Upgrade Email Notifications

**Location:** Webhook handlers  
**Severity:** LOW

**Problem:**
- No email sent when subscription is upgraded
- Users may not be aware of upgrade success
- No receipt or confirmation email

**Impact:**
- Poor user experience
- Users may not know upgrade completed
- No paper trail for upgrades

**Suggested Fix:**
- Send email notification on upgrade
- Include upgrade details (plan, price, tokens allocated)
- Send receipt/confirmation email

---

## Frontend Issues

### Issue 9: Upgrade Modal Plan Selection Logic

**Location:** `frontend/src/features/account/UpgradeModal.js:112-125`  
**Severity:** LOW  
**Line:** 112-125

**Problem:**
- `getAvailablePlans()` correctly filters available upgrades
- But no validation that selected plan is actually an upgrade
- User could theoretically select same plan (though UI prevents it)

**Evidence:**
```javascript
const getAvailablePlans = () => {
  const currentTier = currentPlan?.toUpperCase() || 'FREE';
  switch (currentTier) {
    case 'FREE':
      return ['PRO', 'ENTERPRISE'];
    case 'PRO':
      return ['ENTERPRISE'];
    case 'ENTERPRISE':
      return [];
    default:
      return ['PRO', 'ENTERPRISE'];
  }
};
```

**Impact:**
- Minor - UI prevents invalid selections
- But backend should also validate

**Suggested Fix:**
- Already handled by UI, but add backend validation as well
- Ensure consistency between frontend and backend

---

### Issue 10: Missing Loading States

**Location:** `frontend/src/features/account/UpgradeModal.js`  
**Severity:** LOW

**Problem:**
- Loading state exists but could be improved
- No indication of which payment provider is processing
- No progress indication during checkout redirect

**Impact:**
- Minor UX issue
- Users may not know what's happening

**Suggested Fix:**
- Add specific loading messages
- Show which provider is processing
- Add progress indicators

---

## Data Flow Issues

### Issue 11: Race Condition in Upgrade Flow

**Location:** Webhook processing  
**Severity:** MEDIUM

**Problem:**
- User completes checkout
- Stripe sends webhook
- User redirected to success page
- If webhook processing is slow, user may see old plan
- Race condition between redirect and webhook processing

**Impact:**
- User may see incorrect plan status
- Confusion about upgrade success
- Potential support issues

**Suggested Fix:**
- Poll subscription status after redirect
- Show loading state while waiting for webhook
- Refresh subscription data after delay
- Use WebSocket or polling to update UI when webhook completes

---

## Missing Features Summary

1. ❌ **Token purchase functionality** (Critical)
2. ❌ Token allocation on upgrade
3. ❌ Proration logic for upgrades
4. ❌ Downgrade scheduling
5. ❌ Upgrade validation
6. ❌ Success message handling
7. ❌ Email notifications
8. ❌ Token balance integration

---

## Recommendations

### High Priority
1. ✅ **Implement token purchase functionality** (critical missing feature)
2. ✅ Add token allocation on subscription upgrade
3. ✅ Implement proration logic for upgrades
4. ✅ Add upgrade validation (prevent invalid upgrades)

### Medium Priority
5. ✅ Implement downgrade scheduling
6. ✅ Fix race condition in upgrade flow
7. ✅ Add success message handling
8. ✅ Integrate with token balance system

### Low Priority
9. ✅ Add email notifications for upgrades
10. ✅ Improve loading states in UI
11. ✅ Add upgrade progress indicators

---

## Files Analyzed

- `backend/src/services/payment.service.js`
- `backend/src/services/payments/stripeWebhookHandler.js`
- `backend/src/features/subscription/routes/subscription.routes.js`
- `backend/src/features/subscription/services/subscription.service.js`
- `frontend/src/features/account/UpgradeModal.js`
- `frontend/src/features/account/pages/BillingPage.js`
- `frontend/src/features/account/Subscription.js`
- `backend/src/utils/unifiedPlans.js`
- `docs/planning/token-economy.md`

---

**Report Generated:** 2026-01-07  
**Analysis Type:** Static Code Analysis  
**No Code Modifications Made**
