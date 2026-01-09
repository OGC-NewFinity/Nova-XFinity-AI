/**
 * CORS Middleware
 * Secure CORS configuration with origin validation, logging, and security checks
 */

import cors from 'cors';

// Whitelist of allowed origins
const getAllowedOrigins = () => {
  // Get from environment variable (comma-separated)
  const envOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
  
  // Default development origins
  const defaultOrigins = [
    'http://localhost:3000',      // Frontend dev server
    'http://localhost:3001',      // Node backend (if needed)
    'http://localhost:10000',     // WordPress plugin local
    'http://127.0.0.1:3000',
    'http://127.0.0.1:10000',
  ];
  
  // Production origins (only added in production mode)
  const productionOrigins = [
    'https://ogcnewfinity.com',
    'https://www.ogcnewfinity.com',
    'https://api.ogcnewfinity.com',
  ];
  
  // Combine all origins
  const envOriginList = envOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
  
  // Merge: env origins first, then defaults, then production (if in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = [
    ...envOriginList,
    ...defaultOrigins,
    ...(isProduction ? productionOrigins : []),
  ];
  
  // Remove duplicates
  return [...new Set(allowedOrigins)];
};

/**
 * Origin validation function
 * @param {string} origin - Request origin
 * @param {Function} callback - Callback function (err, allow)
 */
const originValidator = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Handle requests with no origin (e.g., mobile apps, Postman, curl, server-to-server)
  // In production, reject requests without origin for security
  // In development, allow for testing flexibility
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[CORS] Request with no origin rejected in production (security policy)');
      return callback(new Error('Origin not allowed'), false);
    }
    // In development, allow requests without origin (for testing tools)
    if (process.env.ENABLE_CORS_LOGS === 'true') {
      console.log('[CORS] ⚠️  Allowing request with no origin (development mode only)');
    }
    return callback(null, true);
  }
  
  // Check if origin is in whitelist
  if (allowedOrigins.includes(origin)) {
    if (process.env.ENABLE_CORS_LOGS === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`[CORS] ✅ Allowed origin: ${origin}`);
    }
    return callback(null, true);
  }
  
  // Origin not in whitelist - deny and log
  console.warn(`[CORS] ❌ Blocked origin: ${origin}`);
  console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
  
  // Log security event (could be sent to security monitoring service)
  if (process.env.NODE_ENV === 'production') {
    // In production, log to security monitoring system
    // Example: sendToSecurityMonitoring({ type: 'CORS_BLOCKED', origin, timestamp: new Date() });
  }
  
  return callback(new Error('Origin not allowed by CORS policy'), false);
};

/**
 * CORS options configuration
 */
export const corsOptions = {
  origin: originValidator,
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Total-Count',
  ],
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

/**
 * CORS middleware with security enhancements
 * Adds custom logging and security headers
 */
export const corsMiddleware = (req, res, next) => {
  // Log preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || 'no-origin';
    if (process.env.ENABLE_CORS_LOGS === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`[CORS] Preflight request from: ${origin}`);
    }
  }
  
  // Apply CORS
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      // CORS error - origin not allowed
      return res.status(403).json({
        success: false,
        error: {
          code: 'CORS_ERROR',
          message: 'Origin not allowed by CORS policy',
          origin: req.headers.origin || 'no-origin',
        },
      });
    }
    
    // Add additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Continue to next middleware
    next();
  });
};

/**
 * Export default CORS middleware (for use as app.use(corsMiddleware))
 */
export default corsMiddleware;
