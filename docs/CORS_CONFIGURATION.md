# CORS Configuration Guide

This document describes the CORS (Cross-Origin Resource Sharing) configuration for the Nova‑XFinity AI platform, including frontend, backend, and WordPress plugin.

## Overview

CORS is configured to allow secure communication between:
- Frontend (React/Vite) - `http://localhost:3000` (dev) or `https://ogcnewfinity.com` (prod)
- Backend (Node.js/Express) - `http://localhost:3001` (dev) or `https://api.ogcnewfinity.com` (prod)
- WordPress Plugin - `http://localhost:10000` (dev) or WordPress site (prod)

## Configuration Files

### Backend CORS Middleware
**File:** `backend/src/middleware/cors.middleware.js`

- Whitelist-based origin validation
- Logs all CORS requests (when `ENABLE_CORS_LOGS=true`)
- Blocks unauthorized origins with security logging
- Adds security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### Frontend Proxy Configuration
**File:** `vite.config.ts`

- Proxies `/api` requests to backend during development
- Proxies `/plugin` requests to WordPress plugin
- Handles credentials forwarding

### WordPress Plugin CORS
**File:** `wordpress-plugin/nova-xfinity-ai.php`

- Allows backend API origins via `allowed_http_origins` filter
- Adds CORS headers to REST API responses
- Handles preflight OPTIONS requests

## Allowed Origins

### Development
- `http://localhost:3000` - Frontend dev server
- `http://localhost:3001` - Node backend
- `http://localhost:10000` - WordPress plugin local
- `http://127.0.0.1:3000` - Alternative localhost
- `http://127.0.0.1:10000` - Alternative localhost for plugin

### Production
- `https://ogcnewfinity.com`
- `https://www.ogcnewfinity.com`
- `https://api.ogcnewfinity.com`

## Environment Variables

### Backend (.env)
```bash
# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:10000,https://ogcnewfinity.com

# Enable CORS logging (for debugging)
ENABLE_CORS_LOGS=false

# Node environment
NODE_ENV=production  # or development
```

### Frontend (.env)
```bash
# Backend API URL (used by proxy)
VITE_API_URL=http://localhost:3001  # dev
# VITE_API_URL=https://api.ogcnewfinity.com  # prod
```

## Security Features

### 1. Origin Validation
- All origins are validated against a whitelist
- Unknown origins are blocked and logged
- Production mode rejects requests without origin

### 2. Credentials Handling
- Cookies and authentication headers are properly forwarded
- `credentials: true` is set in CORS configuration
- JWT tokens are transmitted securely

### 3. Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 4. Request Logging
- CORS violations are logged for security monitoring
- Blocked origins are tracked
- Preflight requests are logged (optional)

## Testing Checklist

### ✅ Frontend to Backend Communication
- [ ] Frontend can make API calls to backend in development
- [ ] Frontend can make API calls to backend in production
- [ ] Credentials (cookies) are forwarded correctly
- [ ] CORS errors appear in console for blocked origins

### ✅ WordPress Plugin to Backend
- [ ] Plugin can make `wp_remote_*` requests to backend
- [ ] REST API endpoints return proper CORS headers
- [ ] Preflight OPTIONS requests are handled correctly
- [ ] Only allowed origins can access plugin REST endpoints

### ✅ Security Validation
- [ ] Unauthorized origins are blocked
- [ ] Blocked requests are logged
- [ ] Production mode rejects requests without origin
- [ ] Security headers are present in responses

### ✅ Preflight Requests
- [ ] OPTIONS requests return 200 status
- [ ] Preflight response includes all required headers
- [ ] Cache-Control header is set (maxAge: 86400)

## Manual Testing

### Test 1: Frontend API Call (Development)
```javascript
// In browser console on http://localhost:3000
fetch('http://localhost:3001/api/health', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(r => r.json())
.then(console.log);
```

### Test 2: Blocked Origin (Should Fail)
```javascript
// From an unauthorized origin (e.g., http://localhost:9999)
fetch('http://localhost:3001/api/health', {
  credentials: 'include'
})
.catch(err => console.log('Expected CORS error:', err));
```

### Test 3: WordPress Plugin REST API
```bash
# Test plugin REST endpoint with CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:10000/wp-json/nova-xfinity-ai/v1/generate
```

### Test 4: Preflight Request
```bash
# Check preflight response
curl -X OPTIONS \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -v \
     http://localhost:3001/api/articles
```

## Troubleshooting

### CORS Error: "Origin not allowed"
**Solution:** Check that the origin is in `CORS_ORIGINS` environment variable or default whitelist.

### Credentials Not Sent
**Solution:** Ensure `credentials: 'include'` in fetch requests and `credentials: true` in CORS config.

### Preflight Request Fails
**Solution:** Verify OPTIONS method is allowed and preflight handler returns proper headers.

### WordPress Plugin Cannot Connect
**Solution:** Check `allowed_http_origins` filter and verify backend URL is in whitelist.

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure `CORS_ORIGINS` with production URLs only
- [ ] Set `ENABLE_CORS_LOGS=false` (or configure log aggregation)
- [ ] Verify production origins are in whitelist
- [ ] Test credentials forwarding in production
- [ ] Monitor CORS violation logs
- [ ] Configure security monitoring for blocked origins

## Security Best Practices

1. **Never use wildcard origins** (`*`) in production
2. **Always validate origins** against whitelist
3. **Log CORS violations** for security monitoring
4. **Use HTTPS** in production
5. **Set appropriate maxAge** for preflight cache (24 hours)
6. **Restrict allowed methods** to only what's needed
7. **Sanitize all request headers** before processing

## References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [WordPress HTTP API](https://developer.wordpress.org/plugins/http-api/)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
