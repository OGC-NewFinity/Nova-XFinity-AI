/**
 * Subscription Routes
 * API endpoints for subscription management
 */

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getSubscriptionStatus,
  getSubscriptionLimits,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription
} from '../services/subscription.service.js';
import { getUsageStats } from '../services/usage.service.js';
import {
  createCheckoutSession,
  createPortalSession
} from '../services/payment.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/subscription/status
 * Get current subscription status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user.id);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/subscription/usage
 * Get current usage statistics
 */
router.get('/usage', async (req, res) => {
  try {
    const stats = await getUsageStats(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/subscription/limits
 * Get subscription limits
 */
router.get('/limits', async (req, res) => {
  try {
    const limits = await getSubscriptionLimits(req.user.id);
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/subscription/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['PRO', 'ENTERPRISE'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid plan. Must be PRO or ENTERPRISE.'
        }
      });
    }

    const status = await getSubscriptionStatus(req.user.id);
    const customerId = status.stripeCustomerId;

    const session = await createCheckoutSession(
      req.user.id,
      plan,
      customerId
    );

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/subscription/portal
 * Create Stripe customer portal session
 */
router.post('/portal', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user.id);
    
    if (!status.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_CUSTOMER',
          message: 'No Stripe customer found. Please create a subscription first.'
        }
      });
    }

    const session = await createPortalSession(status.stripeCustomerId);

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancel subscription
 */
router.post('/cancel', async (req, res) => {
  try {
    await cancelSubscription(req.user.id);
    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/subscription/reactivate
 * Reactivate cancelled subscription
 */
router.post('/reactivate', async (req, res) => {
  try {
    await reactivateSubscription(req.user.id);
    res.json({
      success: true,
      message: 'Subscription reactivated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

export default router;
