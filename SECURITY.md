# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, please report it privately to:

**Email:** dev@ogcnewfinity.com

Please include:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt of your report within 48 hours and provide a detailed response within 7 days indicating the next steps in handling your report.

## Security Best Practices

### API Key Management

**Never commit API keys or secrets to the repository.**

1. **Use Environment Variables:**
   - Store all API keys in `.env` files (not committed to git)
   - Use `.env.example` as a template
   - Never share `.env` files publicly

2. **Tenant API Key Isolation:**
   - Each tenant's API keys are encrypted and stored separately
   - Keys are never exposed in API responses
   - Use the Settings UI or secure API endpoints to manage keys

3. **Key Rotation:**
   - Regularly rotate API keys
   - Revoke compromised keys immediately
   - Use different keys for development and production

### Provider API Key Security

**CRITICAL: AI Provider API keys (OpenAI, Claude, Gemini, Replicate, etc.) must NEVER be exposed to the frontend.**

#### Environment-Only Storage

1. **Server-Side Only:**
   - All provider API keys MUST be stored in server-side environment variables (`.env` file)
   - Keys are accessed via `process.env.*` in backend code ONLY
   - Never use `VITE_` prefixed variables for API keys (they are exposed to frontend)

2. **Required Environment Variables:**
   ```bash
   # Required
   GEMINI_API_KEY=your_gemini_key_here
   
   # Optional (for additional providers)
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GROQ_API_KEY=gsk_...
   REPLICATE_API_KEY=r8_...
   STABILITY_API_KEY=sk-...
   PINECONE_API_KEY=pcsk_...
   WEAVIATE_API_KEY=...
   ```

3. **Forbidden Practices:**
   - ❌ Never hardcode API keys in config files or services
   - ❌ Never expose keys via `VITE_` environment variables
   - ❌ Never store keys in localStorage or sessionStorage
   - ❌ Never send keys in API request bodies
   - ❌ Never return keys in API responses (even masked)
   - ❌ Never log full keys (only log first few characters for debugging)

#### Backend-Only Access

1. **Service Layer:**
   - API keys are ONLY accessed in backend services:
     - `backend/src/services/ai/*.service.js`
     - `backend/src/features/gemini/services/*.service.js`
   - Keys are injected at runtime via `process.env.*`
   - Keys are NEVER passed from client requests

2. **API Request Handling:**
   - All AI provider API calls are handled server-side
   - Frontend makes requests to backend endpoints (e.g., `/api/ai/generate`)
   - Backend services use environment variables internally
   - Keys are never included in request/response payloads

#### Admin Settings Sanitization

1. **Admin UI Display:**
   - Admin settings page shows masked values only (e.g., `••••••••••••••••`)
   - Shows boolean indicators: `hasOpenAIKey: true/false`
   - Never displays actual key values
   - Input fields are read-only with instructions to configure via `.env`

2. **API Endpoint Security:**
   - `GET /api/admin/settings` returns only:
     - Provider preference
     - Boolean indicators (`hasOpenAIKey`, etc.)
     - Never returns actual keys
   - `PUT /api/admin/settings` REJECTS any key values in request body
   - Logs security warnings if keys are detected in requests

3. **Key Update Process:**
   - Keys CANNOT be updated via API endpoints
   - Admins must update `.env` file directly
   - Restart backend service after updating keys
   - Use secure key management services (AWS Secrets Manager, HashiCorp Vault) in production

#### Frontend Restrictions

1. **No Key Access:**
   - Frontend code NEVER accesses API keys
   - `frontend/src/utils/providerUtils.js` provides metadata only (no keys)
   - Frontend services call backend APIs, not provider APIs directly

2. **Validation Functions:**
   - `validateApiKeyFormat()` is for validation only (doesn't access keys)
   - Used for client-side input validation before sending to backend
   - Actual keys are validated server-side

3. **Error Handling:**
   - Error messages reference "API key" but never expose actual keys
   - Error codes: `API_KEY_MISSING`, `API_KEY_INVALID`, `API_KEY_QUOTA_EXCEEDED`
   - Error messages guide users to configure keys via `.env`

#### Security Monitoring

1. **Detection:**
   - Security logger (`backend/src/utils/securityLogger.js`) detects key exposure
   - Checks API responses for API key patterns
   - Logs warnings if keys detected in responses
   - Sanitizes responses before sending

2. **Logging:**
   - Logs security warnings when:
     - Keys are detected in API responses
     - Keys are provided in request bodies
     - Keys are accessed from frontend code
   - Includes context (endpoint, user, IP) for audit trail

3. **Audit Trail:**
   - All key access attempts are logged
   - Failed key update attempts are logged with user info
   - Regular security audits should review logs

#### Best Practices Summary

✅ **DO:**
- Store keys in `.env` file (server-side only)
- Access keys via `process.env.*` in backend services
- Mask keys in admin UI (show `••••••••` or boolean indicators)
- Reject key updates via API endpoints
- Log security warnings for key exposure attempts
- Use secure key management services in production

❌ **DON'T:**
- Expose keys via `VITE_` environment variables
- Store keys in localStorage or sessionStorage
- Send keys in API request/response bodies
- Return keys in API responses (even masked)
- Access keys from frontend code
- Hardcode keys in source files
- Log full keys (only log first few characters)

### Authentication & Authorization

1. **JWT Tokens:**
   - Tokens are signed with secure secrets
   - Use HTTPS in production
   - Implement proper token expiration
   - Store refresh tokens securely

2. **Password Security:**
   - Passwords are hashed using bcrypt
   - Enforce strong password policies
   - Implement rate limiting on authentication endpoints

3. **Role-Based Access Control:**
   - Verify user roles before granting access
   - Implement proper middleware checks
   - Audit admin actions

#### 🆕 OAuth Security Issues (2026-01-07)

**Critical Security Flaws Identified:**

1. **Missing CSRF Protection (HIGH):**
   - OAuth callbacks do not validate `state` parameter
   - No state token generation or verification
   - Vulnerable to CSRF attacks on OAuth flows
   - **Location:** `backend-auth/app.py:123-322`
   - **Fix Required:** Generate and validate state tokens for all OAuth providers

2. **Token in URL Query Parameter (HIGH):**
   - JWT tokens passed in URL: `?token=...`
   - Tokens logged in server logs, browser history, referrer headers
   - **Location:** `backend-auth/app.py:240, 302`
   - **Fix Required:** Use HTTP-only cookies or POST request with token in body

3. **Missing Redirect URI Validation (MEDIUM):**
   - Redirect URIs constructed dynamically without whitelist validation
   - Potential open redirect vulnerability
   - **Location:** `backend-auth/app.py:97, 156`
   - **Fix Required:** Validate redirect URIs against whitelist

4. **Missing Scope Validation (MEDIUM):**
   - Google OAuth doesn't explicitly request email scope
   - No validation that required scopes were granted
   - **Location:** `backend-auth/oauth.py:21-24`
   - **Fix Required:** Explicitly request and validate required scopes

5. **Missing Rate Limiting (MEDIUM):**
   - No rate limiting on OAuth authorization or callback endpoints
   - Vulnerable to brute force attacks
   - **Fix Required:** Implement rate limiting (10 attempts per IP per hour)

#### 🆕 Payment Security Issues (2026-01-07)

**Critical Security Flaws Identified:**

1. **Missing Webhook Idempotency (HIGH):**
   - No idempotency protection for Stripe webhook events
   - Same event could be processed multiple times
   - Risk of duplicate subscription activations and billing issues
   - **Location:** `backend/src/services/payments/stripeWebhookHandler.js`
   - **Fix Required:** Store processed event IDs and reject duplicates

2. **Webhook Signature Verification Bypass (MEDIUM):**
   - Webhook verification bypassed in non-production environments
   - Could accidentally deploy with verification disabled
   - **Location:** `backend/src/features/webhooks/routes/webhooks.routes.js:206-210`
   - **Fix Required:** Always require webhook secret in production, fail hard if missing

3. **Missing Input Validation (MEDIUM):**
   - User ID and customer ID not validated in checkout session creation
   - Metadata could contain invalid characters or exceed limits
   - **Location:** `backend/src/services/payment.service.js:48-98`
   - **Fix Required:** Validate all inputs, sanitize metadata values

4. **Silent Webhook Processing Failures (MEDIUM):**
   - Webhook errors logged but not alerted
   - Failed webhooks won't be retried (already returned 200 OK)
   - Users may pay but not receive subscription benefits
   - **Location:** `backend/src/features/webhooks/routes/webhooks.routes.js:260-268`
   - **Fix Required:** Implement error alerting and failed webhook retry mechanism

### Database Security

1. **Connection Security:**
   - Use encrypted database connections
   - Never expose database credentials
   - Use connection pooling with limits

2. **SQL Injection Prevention:**
   - Use Prisma ORM (parameterized queries)
   - Never construct raw SQL with user input
   - Validate and sanitize all inputs

### API Security

1. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before processing
   - Use type checking and schemas

2. **Rate Limiting:**
   - Implement rate limiting on all endpoints
   - Prevent abuse and DoS attacks
   - Use Redis for distributed rate limiting

3. **CORS Configuration:**
   - Configure CORS properly
   - Only allow trusted origins
   - Don't use wildcard (`*`) in production

### Docker & Infrastructure

1. **Container Security:**
   - Use official base images
   - Keep images updated
   - Run containers with non-root users
   - Scan images for vulnerabilities

2. **Secrets Management:**
   - Use Docker secrets or environment variables
   - Never hardcode secrets in Dockerfiles
   - Rotate secrets regularly

### Frontend Security

1. **XSS Prevention:**
   - Sanitize user-generated content
   - Use React's built-in XSS protection
   - Avoid `dangerouslySetInnerHTML` when possible

2. **CSRF Protection:**
   - Use CSRF tokens for state-changing operations
   - Implement SameSite cookies
   - Verify origin headers

3. **Content Security Policy:**
   - Implement CSP headers
   - Restrict resource loading
   - Prevent inline script execution

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No API keys or secrets are committed
- [ ] All user inputs are validated
- [ ] Authentication/authorization is properly implemented
- [ ] Database queries use parameterized statements
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date
- [ ] Security headers are configured
- [ ] Rate limiting is in place (if applicable)
- [ ] OAuth state parameter is generated and validated
- [ ] Webhook events are idempotent (check for duplicates)
- [ ] Payment webhooks verify signatures in all environments
- [ ] Tokens are not passed in URL query parameters

## Dependency Security

We regularly update dependencies to patch security vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the issue and determine affected versions
2. Develop a fix for the latest version
3. Prepare a security advisory
4. Release the fix and advisory
5. Credit the reporter (if desired)

## Security Updates

Security updates will be released as:
- Patch versions for critical fixes
- Security advisories in GitHub
- Release notes with security information

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#security)

---

**Last Updated:** 2026-01-07
