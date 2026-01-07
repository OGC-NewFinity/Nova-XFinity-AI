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
