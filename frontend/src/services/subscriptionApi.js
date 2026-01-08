/**
 * Subscription API Client Service
 * Specialized Axios instance for subscription and billing-related API requests
 * 
 * This service provides a configured Axios client specifically for subscription
 * management operations including:
 * - Subscription status retrieval
 * - Usage statistics and quota information
 * - Plan upgrades and downgrades
 * - Payment processing integration
 * - PayPal subscription management
 * 
 * @module services/subscriptionApi
 * 
 * @description
 * The subscription API client is configured to communicate with the Node.js backend
 * subscription service. It handles authentication via cookies (same as the main API client)
 * and provides specialized error handling for subscription-related operations.
 * 
 * **API Routes:**
 * - `/api/subscription/status` - Get current subscription status
 * - `/api/subscription/usage` - Get usage statistics and quota information
 * - `/api/subscription/upgrade` - Upgrade to a higher tier plan
 * - `/api/subscription/downgrade` - Downgrade to a lower tier plan
 * - `/api/subscription/cancel` - Cancel current subscription
 * - `/api/subscription/paypal/execute` - Execute PayPal subscription after approval
 * 
 * **Environment Variables:**
 * - `VITE_SUBSCRIPTION_API_URL` - Base URL for subscription API (default: `http://localhost:8000`)
 * 
 * **Return Format:**
 * Standard Axios response object with the following structure:
 * ```javascript
 * {
 *   data: {
 *     success: boolean,
 *     data: {
 *       subscription?: {
 *         plan: string,
 *         status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE',
 *         currentPeriodEnd: string (ISO date)
 *       },
 *       usage?: {
 *         plan: string,
 *         articles: { used: number, limit: number, remaining: number },
 *         images: { used: number, limit: number, remaining: number },
 *         videos: { used: number, limit: number, remaining: number },
 *         research: { used: number, limit: number, remaining: number },
 *         wordpress: { used: number, limit: number, remaining: number }
 *       },
 *       quota?: {
 *         remaining: number,
 *         limit: number
 *       }
 *     },
 *     error?: {
 *       code: string,
 *       message: string
 *     }
 *   }
 * }
 * ```
 * 
 * @example
 * // Import the subscription API client
 * import subscriptionApi from '@/services/subscriptionApi.js';
 * 
 * // Get subscription status
 * const statusResponse = await subscriptionApi.get('/api/subscription/status');
 * const subscription = statusResponse.data.data.subscription;
 * 
 * // Get usage statistics
 * const usageResponse = await subscriptionApi.get('/api/subscription/usage');
 * const usage = usageResponse.data.data.usage;
 * 
 * // Upgrade subscription
 * const upgradeResponse = await subscriptionApi.post('/api/subscription/upgrade', {
 *   planId: 'PRO'
 * });
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// Subscription backend URL
// Task specifies port 8000, but Node.js backend runs on 3001
// Default to 8000 as per task requirements, override via env var if needed
const SUBSCRIPTION_API_URL = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'http://localhost:8000';

const subscriptionApi = axios.create({
  baseURL: SUBSCRIPTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to ensure cookies are sent
subscriptionApi.interceptors.request.use(
  (config) => {
    // withCredentials: true ensures cookies are sent automatically
    // The access_token cookie set by the FastAPI auth backend will be sent
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
subscriptionApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      Cookies.remove('access_token');
      // Only redirect if not already on login/register page or landing page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default subscriptionApi;
