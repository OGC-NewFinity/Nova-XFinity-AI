/**
 * Payment Service (Stripe Integration)
 * Handles payment processing and subscription management
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Pricing IDs (set these in your Stripe dashboard)
 */
const PRICING_IDS = {
  PRO: process.env.STRIPE_PRICE_ID_PRO,
  ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE
};

/**
 * Create Stripe customer
 */
export const createCustomer = async (email, name) => {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'finity-ai'
    }
  });
};

/**
 * Create checkout session for subscription
 */
export const createCheckoutSession = async (userId, plan, customerId = null) => {
  const priceId = PRICING_IDS[plan];
  
  if (!priceId) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/account?canceled=true`,
    metadata: {
      userId,
      plan
    }
  });

  return session;
};

/**
 * Create portal session for subscription management
 */
export const createPortalSession = async (customerId) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/account`
  });

  return session;
};

/**
 * Handle Stripe webhook
 */
export const handleWebhook = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful checkout
      // Update subscription in database
      break;
    
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Handle subscription update
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      // Handle subscription cancellation
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Handle successful payment
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Handle failed payment
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

/**
 * Get subscription from Stripe
 */
export const getStripeSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Cancel subscription in Stripe
 */
export const cancelStripeSubscription = async (subscriptionId, immediately = false) => {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
};
