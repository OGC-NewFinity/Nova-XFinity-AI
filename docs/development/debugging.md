# Debugging

**Description:** Debug workflow, logging locations, common dev errors, and diagnosis steps (local + Docker).  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

Effective debugging is crucial for maintaining code quality and developer productivity. This guide covers debugging strategies, tools, and workflows for the Nova‑XFinity AI platform. Whether you're debugging locally, in Docker, or in CI/CD, this document provides systematic approaches to identify and resolve issues.

### Debugging Philosophy

- **Reproduce first** - Always reproduce the issue before attempting to fix it
- **Isolate the problem** - Narrow down to the smallest possible scope
- **Use logs strategically** - Add targeted logging, don't log everything
- **Check the obvious** - Environment variables, network connectivity, service status
- **Document solutions** - Update this guide when you find new patterns

### When to Debug

- **During development** - Catch issues early with proper tooling
- **After deployment** - Monitor logs and error tracking
- **When tests fail** - Debug test failures to understand root causes
- **Performance issues** - Profile and trace slow operations
- **User-reported bugs** - Reproduce and trace user-reported issues

---

## Logging Strategy

### Backend Logging

#### Log Levels

The backend uses different log levels based on environment:

**Development:**
- `console.log()` - General information, request/response details
- `console.warn()` - Warnings, deprecated usage, non-critical issues
- `console.error()` - Errors, exceptions, failures

**Production:**
- Only `console.error()` for critical errors
- Structured logging recommended (consider Winston or Pino)

#### Logging Configuration

**Express Backend (Node.js):**

```javascript
// backend/src/index.js
const isDevelopment = process.env.NODE_ENV === 'development';

// Development logging middleware
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}
```

**Prisma Logging:**

```javascript
// backend/src/config/database.js
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});
```

**FastAPI Backend (Python):**

```python
# backend-auth/app.py
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if os.getenv("NODE_ENV") == "development" else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Use in code
logger.debug("Debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred", exc_info=True)
```

#### Structured Logging Example

```javascript
// backend/src/utils/logger.js
export const createLogger = (context) => {
  return {
    info: (message, data = {}) => {
      console.log(`[INFO] [${context}] ${message}`, data);
    },
    warn: (message, data = {}) => {
      console.warn(`[WARN] [${context}] ${message}`, data);
    },
    error: (message, error = {}) => {
      console.error(`[ERROR] [${context}] ${message}`, {
        message: error.message,
        stack: error.stack,
        ...error,
      });
    },
  };
};

// Usage
const logger = createLogger('ArticlesService');
logger.info('Generating article', { topic, userId });
logger.error('Generation failed', error);
```

### Frontend Logging

#### Console Logging

**Development:**
```javascript
// Use console methods appropriately
console.log('Debug info:', data);           // General debugging
console.warn('Warning:', warning);          // Warnings
console.error('Error:', error);             // Errors
console.table(data);                        // Tabular data
console.group('Group name');                // Grouped logs
console.groupEnd();
```

**Production:**
- Remove or conditionally disable console logs
- Use error tracking service (Sentry, LogRocket)
- Log to remote service, not console

#### Frontend Error Tracking

```javascript
// services/errorTracking.js
export const logError = (error, context = {}) => {
  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('Error:', error, context);
  }
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Send to Sentry, LogRocket, etc.
    // errorTrackingService.captureException(error, context);
  }
};

// Usage in components
try {
  await generateArticle();
} catch (error) {
  logError(error, { component: 'Writer', action: 'generateArticle' });
}
```

#### React Error Boundaries

```javascript
// components/common/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error tracking
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Log Locations

#### Local Development

**Backend Logs:**
- Terminal/console where server is running
- Docker logs: `docker-compose logs -f finity-backend-node`
- FastAPI logs: `docker-compose logs -f finity-backend`

**Frontend Logs:**
- Browser DevTools Console
- Network tab for API requests/responses
- React DevTools for component state

**Database Logs:**
- Prisma query logs (if enabled in development)
- PostgreSQL logs: `docker-compose logs -f finity-db`

#### Docker Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Specific service logs
docker-compose logs -f finity-backend-node
docker-compose logs -f finity-backend
docker-compose logs -f finity-frontend
docker-compose logs -f finity-db

# Last 100 lines
docker-compose logs --tail=100 finity-backend-node

# Logs with timestamps
docker-compose logs -t finity-backend-node
```

#### Production Logs

- **Application logs:** Sent to logging service (CloudWatch, Datadog, etc.)
- **Error tracking:** Sentry, LogRocket, or similar
- **Access logs:** Web server logs (Nginx, Apache)
- **Database logs:** Managed database service logs

---

## Debugging Tools and Environment Setup

### IDE Setup

#### VS Code

**Recommended Extensions:**
- JavaScript/TypeScript debugging
- ESLint
- Prettier
- Docker
- REST Client (for API testing)

**Launch Configuration:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

#### Chrome DevTools

**Breakpoints:**
- Line breakpoints
- Conditional breakpoints
- Logpoints (log without breaking)

**Network Tab:**
- Monitor API requests
- Check request/response headers
- View payloads
- Check timing

**Application Tab:**
- Local Storage
- Session Storage
- Cookies
- Service Workers

### Node.js Debugging

#### Using Node Inspector

```bash
# Start with inspector
node --inspect src/index.js

# Or with break on start
node --inspect-brk src/index.js

# Connect Chrome DevTools to chrome://inspect
```

#### Using Nodemon with Debugging

```json
// backend/package.json
{
  "scripts": {
    "dev:debug": "nodemon --inspect src/index.js"
  }
}
```

### React Debugging

#### React DevTools

1. Install React DevTools browser extension
2. Open DevTools → React tab
3. Inspect component tree
4. View props and state
5. Profile component renders

#### Source Maps

Ensure source maps are enabled in Vite:

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
  },
});
```

### Database Debugging

#### Prisma Studio

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

#### Direct Database Access

```bash
# Connect to PostgreSQL container
docker-compose exec finity-db psql -U postgres -d finity_auth

# Or using connection string
psql postgresql://postgres:postgres@localhost:5432/finity_auth
```

#### Query Logging

Enable Prisma query logging:

```javascript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});
```

---

## Error Types and Classification

### Error Categories

#### 1. Syntax Errors

**Symptoms:**
- Code won't run
- Parse errors in console
- Build failures

**Common Causes:**
- Missing brackets, parentheses, quotes
- Incorrect import/export syntax
- TypeScript type errors

**Debugging:**
```bash
# Check for syntax errors
npm run build

# Lint check
npm run lint

# Type check (if TypeScript)
npx tsc --noEmit
```

#### 2. Runtime Errors

**Symptoms:**
- Application crashes
- Uncaught exceptions
- Stack traces in console

**Common Causes:**
- Null/undefined access
- Type mismatches
- Missing environment variables
- Network failures

**Example:**
```javascript
// Common runtime error
const user = await getUser(id);
console.log(user.name); // Error if user is null

// Fix with null checking
if (user) {
  console.log(user.name);
}
```

#### 3. Logic Errors

**Symptoms:**
- Incorrect behavior
- Wrong calculations
- Unexpected results

**Debugging:**
- Add console logs at key points
- Use debugger breakpoints
- Trace data flow
- Write unit tests

#### 4. Async Errors

**Symptoms:**
- Promises not resolving
- Race conditions
- Unhandled promise rejections

**Common Patterns:**
```javascript
// Missing error handling
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json(); // Error if fetch fails
}

// Proper error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

#### 5. Network Errors

**Symptoms:**
- CORS errors
- 404/500 responses
- Timeout errors
- Connection refused

**Debugging:**
```javascript
// Check network requests
// Browser DevTools → Network tab

// Add request logging
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);
```

### Error Classification System

```javascript
// backend/src/utils/errors.js
export class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = 'Quota exceeded') {
    super(message, 'QUOTA_EXCEEDED', 403);
  }
}
```

---

## Handling Common Bugs and Regressions

### Authentication Issues

#### Problem: Login fails silently

**Symptoms:**
- No error message
- Redirect doesn't happen
- Token not set

**Debugging Steps:**

1. **Check network requests:**
   ```javascript
   // Browser DevTools → Network tab
   // Look for /auth/jwt/login request
   // Check status code, response body
   ```

2. **Check backend logs:**
   ```bash
   docker-compose logs -f finity-backend
   # Look for authentication errors
   ```

3. **Verify credentials:**
   ```javascript
   // Check if credentials are being sent
   console.log('Login attempt:', { email, password: '***' });
   ```

4. **Check CORS:**
   ```javascript
   // Verify CORS headers in response
   // Access-Control-Allow-Credentials: true
   // Access-Control-Allow-Origin: http://localhost:3000
   ```

**Common Fixes:**
- Ensure `withCredentials: true` in axios config
- Verify CORS_ORIGIN matches frontend URL
- Check JWT_SECRET is set
- Verify database connection

#### Problem: Token expires unexpectedly

**Symptoms:**
- User logged out after short time
- 401 errors after valid login

**Debugging:**
```javascript
// Check token expiration
const token = Cookies.get('access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
}
```

**Fix:**
- Implement token refresh
- Check token expiration settings
- Verify refresh token is being used

### API Integration Issues

#### Problem: CORS errors

**Symptoms:**
```
Access to fetch at 'http://localhost:8000/api/articles' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Debugging:**
```javascript
// Check CORS configuration
// Backend should allow frontend origin
// Check preflight OPTIONS request
```

**Fix:**
```javascript
// backend/src/index.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, // Important for cookies
}));
```

#### Problem: 404 on API routes

**Symptoms:**
- API calls return 404
- Routes not found

**Debugging:**
```bash
# Check if route is registered
# backend/src/index.js - verify app.use() calls

# Check route paths match
# Frontend: /api/articles
# Backend: app.use('/api/articles', articlesRoutes)
```

### Database Issues

#### Problem: Prisma connection errors

**Symptoms:**
```
Error: Can't reach database server
```

**Debugging:**
```bash
# Check database is running
docker-compose ps finity-db

# Check connection string
echo $DATABASE_URL

# Test connection
docker-compose exec finity-db psql -U postgres -d finity_auth -c "SELECT 1;"
```

**Fix:**
- Verify DATABASE_URL format
- Check database container is healthy
- Ensure network connectivity

#### Problem: Migration errors

**Symptoms:**
```
Migration failed
Table already exists
```

**Debugging:**
```bash
# Check migration status
cd backend
npx prisma migrate status

# View migration history
npx prisma migrate list
```

**Fix:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix_schema
```

### Frontend State Issues

#### Problem: State not updating

**Symptoms:**
- UI doesn't reflect data changes
- Stale data displayed

**Debugging:**
```javascript
// Add state logging
const [data, setData] = useState(null);

useEffect(() => {
  console.log('State changed:', data);
}, [data]);

// Check React DevTools
// Components tab → Select component → View state
```

**Common Causes:**
- Missing dependency in useEffect
- State update not triggering re-render
- Closure capturing old state

**Fix:**
```javascript
// Use functional updates
setData(prevData => ({ ...prevData, newField: value }));

// Check useEffect dependencies
useEffect(() => {
  fetchData();
}, [dependency]); // Include all dependencies
```

---

## Using Stack Traces and Logs Effectively

### Reading Stack Traces

#### Node.js Stack Trace

```
Error: Cannot read property 'name' of undefined
    at getUserName (/app/src/services/user.service.js:45:15)
    at processRequest (/app/src/routes/user.routes.js:23:8)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
```

**How to read:**
1. **Error message:** "Cannot read property 'name' of undefined"
2. **Top of stack:** Most recent call (user.service.js:45)
3. **Bottom of stack:** Entry point (express router)
4. **Line numbers:** Exact location of error

**Debugging:**
```javascript
// Add logging before error location
console.log('User object:', user);
console.log('User type:', typeof user);
// Error occurs at line 45, check line 44
```

#### Browser Stack Trace

```
Uncaught TypeError: Cannot read property 'map' of undefined
    at ArticleList (ArticleList.js:12:15)
    at renderWithHooks (react-dom.development.js:16305:13)
```

**How to read:**
1. **Error type:** TypeError
2. **Component:** ArticleList
3. **Line:** 12, column 15
4. **React internals:** Can be ignored (renderWithHooks)

**Debugging:**
```javascript
// Check data before map
console.log('Articles:', articles);
console.log('Is array:', Array.isArray(articles));

// Add null check
{articles && articles.map(...)}
```

### Log Analysis Techniques

#### 1. Timestamp Correlation

```javascript
// Add timestamps to logs
const logWithTime = (message, data) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
};

// Correlate frontend and backend logs
// Frontend: [2026-01-07T10:30:15.123Z] Request sent
// Backend: [2026-01-07T10:30:15.125Z] Request received
```

#### 2. Request ID Tracking

```javascript
// Generate request ID
const requestId = crypto.randomUUID();

// Add to all logs for a request
logger.info('Request started', { requestId, path, method });
logger.info('Database query', { requestId, query });
logger.info('Response sent', { requestId, statusCode });

// Search logs by requestId
```

#### 3. Log Levels for Filtering

```bash
# Filter by log level
docker-compose logs finity-backend-node | grep ERROR
docker-compose logs finity-backend-node | grep WARN

# Filter by component
docker-compose logs finity-backend-node | grep "[ArticlesService]"
```

#### 4. Structured Logging

```javascript
// Use structured format
logger.info({
  event: 'article_generated',
  userId: user.id,
  articleId: article.id,
  duration: Date.now() - startTime,
  provider: 'gemini',
});

// Easier to search and filter
// grep "event:article_generated" logs.txt
```

---

## Troubleshooting Async Issues

### Promise Debugging

#### Unhandled Promise Rejections

**Symptoms:**
```
UnhandledPromiseRejectionWarning: Error: ...
```

**Debugging:**
```javascript
// Add catch to all promises
promise
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Promise rejected:', error);
    // Handle error
  });

// Or use async/await with try/catch
try {
  const result = await promise;
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error);
}
```

#### Race Conditions

**Symptoms:**
- Inconsistent results
- Last request wins
- State updates out of order

**Debugging:**
```javascript
// Add request tracking
let requestId = 0;
const makeRequest = async () => {
  const currentId = ++requestId;
  console.log(`Request ${currentId} started`);
  
  const result = await fetch('/api/data');
  
  console.log(`Request ${currentId} completed`);
  return result;
};

// Cancel previous requests
const abortController = new AbortController();
fetch('/api/data', { signal: abortController.signal });
// Cancel: abortController.abort();
```

**Fix:**
```javascript
// Use request cancellation
useEffect(() => {
  const abortController = new AbortController();
  
  fetchData({ signal: abortController.signal })
    .then(setData)
    .catch(console.error);
  
  return () => abortController.abort();
}, [dependency]);
```

### Async/Await Debugging

#### Missing Await

**Symptoms:**
- Promises not awaited
- "Promise { <pending> }" in logs
- Undefined values

**Debugging:**
```javascript
// Check if function returns promise
const result = fetchData(); // Missing await
console.log('Result:', result); // Promise { <pending> }

// Fix
const result = await fetchData();
console.log('Result:', result); // Actual data
```

#### Parallel vs Sequential

**Debugging:**
```javascript
// Sequential (slow)
for (const item of items) {
  await processItem(item); // Waits for each
}

// Parallel (fast)
await Promise.all(
  items.map(item => processItem(item))
);

// With error handling
await Promise.allSettled(
  items.map(item => processItem(item))
);
```

---

## Troubleshooting External APIs

### AI Provider Issues

#### Problem: API timeout

**Symptoms:**
- Requests hang
- Timeout errors
- No response

**Debugging:**
```javascript
// Add timeout to requests
const response = await fetch('/api/generate', {
  signal: AbortSignal.timeout(30000), // 30 second timeout
});

// Log request timing
const startTime = Date.now();
try {
  const result = await generateArticle();
  console.log(`Generation took ${Date.now() - startTime}ms`);
} catch (error) {
  console.error('Generation failed after', Date.now() - startTime, 'ms');
}
```

#### Problem: Rate limiting

**Symptoms:**
- 429 Too Many Requests
- Quota exceeded errors

**Debugging:**
```javascript
// Check rate limit headers
const response = await fetch('/api/data');
console.log('Rate limit:', {
  remaining: response.headers.get('X-RateLimit-Remaining'),
  reset: response.headers.get('X-RateLimit-Reset'),
});

// Implement retry with backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

### Payment Provider Issues

#### PayPal Webhook Debugging

**Symptoms:**
- Webhooks not received
- Signature verification fails

**Debugging:**
```javascript
// Log webhook events
app.post('/api/webhooks/paypal', (req, res) => {
  console.log('[Webhook] Headers:', req.headers);
  console.log('[Webhook] Body:', req.body);
  console.log('[Webhook] Signature:', req.headers['paypal-transmission-sig']);
  
  // Verify signature
  const isValid = verifyPayPalSignature(req);
  console.log('[Webhook] Signature valid:', isValid);
});
```

**Common Issues:**
- Missing PAYPAL_WEBHOOK_ID
- Incorrect signature algorithm
- Timestamp validation failures

---

## CI Debugging Workflows and Logs

### GitHub Actions Debugging

#### Viewing CI Logs

1. **GitHub UI:**
   - Go to Actions tab
   - Select workflow run
   - Click on job
   - View step logs

2. **Download logs:**
   ```bash
   # Use GitHub CLI
   gh run view <run-id> --log
   ```

#### Common CI Issues

**Problem: Tests fail in CI but pass locally**

**Debugging:**
```yaml
# Add debug output
- name: Debug environment
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Environment: ${{ env.NODE_ENV }}"
    echo "Database URL: ${{ secrets.DATABASE_URL }}"
```

**Problem: Environment variables missing**

**Debugging:**
```yaml
# Verify secrets are set (don't print values)
- name: Check secrets
  run: |
    if [ -z "${{ secrets.DATABASE_URL }}" ]; then
      echo "ERROR: DATABASE_URL not set"
      exit 1
    fi
    echo "Secrets configured"
```

**Problem: Docker build fails**

**Debugging:**
```yaml
# Enable buildkit for better errors
- name: Build Docker image
  run: |
    DOCKER_BUILDKIT=1 docker build -t app .
    
# Or use docker-compose
- name: Build with compose
  run: |
    docker-compose build --progress=plain
```

### CI Log Analysis

#### Filtering Logs

```bash
# Filter by keyword
gh run view --log | grep "ERROR"

# Filter by step
gh run view --log | grep -A 20 "Run tests"

# Save logs to file
gh run view --log > ci-logs.txt
```

#### Adding Debug Output

```yaml
# Add verbose logging
- name: Run tests
  run: |
    npm test -- --verbose
    npm test -- --reporter=json > test-results.json

# Upload test results
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: test-results
    path: test-results.json
```

---

## Diagnosis Steps

### Systematic Debugging Process

#### 1. Reproduce the Issue

```javascript
// Document reproduction steps
// 1. Navigate to /writer
// 2. Enter topic "AI in Healthcare"
// 3. Click Generate
// 4. Error occurs after 5 seconds
```

#### 2. Isolate the Problem

```javascript
// Test in isolation
// Remove unrelated code
// Test with minimal data
// Check if issue occurs in different environment
```

#### 3. Check Logs

```bash
# Check all relevant logs
docker-compose logs --tail=100 finity-backend-node
docker-compose logs --tail=100 finity-frontend
docker-compose logs --tail=100 finity-db

# Search for errors
docker-compose logs | grep -i error
```

#### 4. Verify Environment

```bash
# Check environment variables
docker-compose exec finity-backend-node env | grep -E "(DATABASE|JWT|CORS)"

# Check service health
docker-compose ps
curl http://localhost:3001/health
```

#### 5. Test Components Individually

```javascript
// Test API endpoint directly
curl -X POST http://localhost:3001/api/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test"}'

// Test database connection
docker-compose exec finity-db psql -U postgres -d finity_auth -c "SELECT 1;"
```

#### 6. Add Targeted Logging

```javascript
// Add logs at key points
console.log('[DEBUG] Entry point:', { userId, topic });
console.log('[DEBUG] Before API call');
const result = await apiCall();
console.log('[DEBUG] After API call:', result);
```

#### 7. Use Debugger

```javascript
// Add breakpoint
debugger; // Execution will pause here

// Or use conditional breakpoint
if (userId === 'problem-user-id') {
  debugger;
}
```

#### 8. Document Solution

```markdown
## Issue: [Description]

**Symptoms:**
- ...

**Root Cause:**
- ...

**Solution:**
- ...

**Prevention:**
- ...
```

### Debugging Checklist

- [ ] Issue reproduced consistently
- [ ] Logs reviewed for errors
- [ ] Environment variables verified
- [ ] Services are running and healthy
- [ ] Network connectivity checked
- [ ] Database connection verified
- [ ] Dependencies up to date
- [ ] Cache cleared (browser, Docker volumes)
- [ ] Error occurs in isolation
- [ ] Solution tested and verified

---

## TODO / Known Issues

### Short-term Improvements

- [ ] Implement structured logging (Winston/Pino)
- [ ] Add request ID tracking across services
- [ ] Set up centralized log aggregation
- [ ] Create error tracking dashboard
- [ ] Improve error messages for users
- [ ] Add performance monitoring

### Medium-term Improvements

- [ ] Implement distributed tracing
- [ ] Add APM (Application Performance Monitoring)
- [ ] Create debugging playbook for common issues
- [ ] Set up log retention policies
- [ ] Implement log rotation
- [ ] Add alerting for critical errors

### Known Issues

#### Issue: Prisma query logs too verbose

**Status:** Known issue in development
**Workaround:** Disable query logging in production
**Future Fix:** Use conditional logging based on DEBUG flag

#### Issue: Frontend errors not tracked in production

**Status:** In progress
**Workaround:** Manual error reporting
**Future Fix:** Integrate Sentry or similar service

#### Issue: Docker logs not persistent

**Status:** Known limitation
**Workaround:** Use docker-compose logs or volume mounts
**Future Fix:** Set up centralized logging

---

## Related Documentation

- [Testing Guide](testing.md) - Testing strategies and debugging test failures
- [Setup Guide](setup.md) - Environment setup and troubleshooting
- [Common Issues](../troubleshooting/common-issues.md) - Frequently encountered problems
- [OAuth Fixes Log](../troubleshooting/OAUTH_FIXES_MASTER_LOG.md) - Authentication debugging reference
- [Backend Architecture](../architecture/backend-architecture.md) - Backend system structure
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend system structure
