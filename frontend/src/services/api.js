/**
 * API Client Service
 * Centralized Axios instance for making HTTP requests to the backend API
 * 
 * This service provides a configured Axios client with:
 * - Automatic authentication token injection from cookies
 * - Automatic cookie handling for CORS requests
 * - Response error handling with 401 redirect logic
 * - Configurable base URL via environment variables
 * 
 * @module services/api
 * 
 * @description
 * The API client is configured to communicate with the FastAPI authentication backend
 * and Node.js feature backend. It automatically includes authentication tokens from
 * cookies and handles token expiration by redirecting to the login page.
 * 
 * **API Routes:**
 * - Authentication endpoints: `/auth/*` (FastAPI backend)
 * - Article endpoints: `/api/articles/*` (Node.js backend)
 * - Media endpoints: `/api/media/*` (Node.js backend)
 * - Research endpoints: `/api/research/*` (Node.js backend)
 * - SEO endpoints: `/api/seo/*` (Node.js backend)
 * 
 * **Environment Variables:**
 * - `VITE_API_URL` - Base URL for the API backend (default: `http://localhost:8000`)
 * 
 * **Return Format:**
 * Standard Axios response object with the following structure:
 * ```javascript
 * {
 *   data: {
 *     success: boolean,
 *     data: any,
 *     error?: {
 *       code: string,
 *       message: string
 *     }
 *   },
 *   status: number,
 *   headers: object
 * }
 * ```
 * 
 * @example
 * // Import the API client
 * import api from '@/services/api.js';
 * 
 * // Make a GET request
 * const response = await api.get('/api/articles');
 * const articles = response.data.data;
 * 
 * // Make a POST request
 * const result = await api.post('/api/articles/metadata', {
 *   topic: 'React Hooks',
 *   keywords: ['react', 'hooks']
 * });
 * 
 * // Handle errors (automatically handled by interceptor)
 * try {
 *   await api.get('/api/protected-route');
 * } catch (error) {
 *   // 401 errors automatically redirect to login
 *   console.error('Request failed:', error.message);
 * }
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL, // FastAPI Users endpoints don't have /api prefix
  withCredentials: true, // CRITICAL: Enable cookies for CORS requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout to prevent hanging
});

// CRITICAL: Ensure withCredentials is always true
api.defaults.withCredentials = true;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // FastAPI Users JWT doesn't use refresh tokens
    // If we get a 401, the token is invalid/expired - redirect to login
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
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

export default api;
