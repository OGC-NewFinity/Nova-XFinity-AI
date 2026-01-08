# Testing

**Description:** Testing strategy (unit/integration/e2e), how to run tests, fixtures, mocking, and CI expectations.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

Nova‑XFinity AI uses a comprehensive testing strategy to ensure code quality, reliability, and maintainability. Our testing approach covers multiple layers: unit tests for individual functions and components, integration tests for API endpoints and service interactions, and end-to-end tests for critical user workflows.

Testing is an integral part of our development workflow. All new features and bug fixes should include appropriate tests. We aim for high test coverage while maintaining test quality and avoiding brittle tests that break with minor refactoring.

### Testing Philosophy

- **Test behavior, not implementation** - Focus on what the code does, not how it does it
- **Write maintainable tests** - Tests should be easy to read, understand, and update
- **Test in isolation** - Unit tests should test one thing at a time
- **Use appropriate test types** - Not everything needs unit, integration, and E2E tests
- **Keep tests fast** - Fast feedback loops improve developer productivity

---

## Testing Strategy

Our testing strategy follows a pyramid approach:

```
        /\
       /  \     E2E Tests (Few, Critical Paths)
      /____\
     /      \   Integration Tests (API, Services)
    /________\
   /          \ Unit Tests (Many, Fast, Isolated)
  /____________\
```

### Unit Tests

**Purpose:** Test individual functions, components, and utilities in isolation.

**When to use:**
- Pure functions and utilities
- React components (rendering, user interactions)
- Service functions with mocked dependencies
- Helper functions and utilities

**Characteristics:**
- Fast execution (< 100ms per test)
- No external dependencies (databases, APIs, file system)
- Isolated from other code
- Deterministic results

**Example areas:**
- `utils/inputOptimizer.js` - Input validation and transformation
- `utils/outputOptimizer.js` - Output formatting
- `services/ai/providerManager.js` - Provider selection logic
- React components - Rendering and user interactions

### Integration Tests

**Purpose:** Test how multiple units work together, including external services.

**When to use:**
- API endpoints with database interactions
- Service layer with external API calls
- Middleware chains
- Database queries and transactions

**Characteristics:**
- May use test database or in-memory database
- Mock external services (AI providers, email services)
- Test real interactions between components
- Slower than unit tests but faster than E2E

**Example areas:**
- API routes (`/api/articles`, `/api/research`)
- Authentication flow (register → login → token refresh)
- Quota middleware with usage tracking
- Payment processing with webhook handling

### End-to-End (E2E) Tests

**Purpose:** Test complete user workflows from frontend to backend.

**When to use:**
- Critical user journeys (signup, article generation, publishing)
- Cross-browser compatibility
- Real user scenarios

**Characteristics:**
- Slowest test type (seconds to minutes)
- Use real or production-like environment
- Test full stack integration
- May require test data setup

**Example scenarios:**
- User registration → Email verification → Login → Generate article → Publish to WordPress
- Subscription upgrade flow
- Quota enforcement and blocking

### Manual Testing

While automated tests cover most scenarios, manual testing is still important for:

- UI/UX validation
- Visual regression testing
- Browser-specific issues
- Performance testing
- Accessibility testing

---

## Testing Frameworks Used

### Backend Testing

**Vitest** - Fast, Vite-native unit test framework
- Fast execution with ESM support
- Jest-compatible API
- Built-in code coverage
- Watch mode for development

**Supertest** - HTTP assertion library for API testing
- Test Express.js routes
- Assert HTTP responses
- Test middleware chains

**Example setup:**
```javascript
// backend/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/index.js',
        '**/*.test.js',
      ],
    },
  },
});
```

### Frontend Testing

**Vitest** - Unit test framework (same as backend)
- Fast, Vite-native
- React component testing support

**React Testing Library** - Component testing utilities
- Test components from user perspective
- Query elements by accessibility roles
- Simulate user interactions

**@testing-library/jest-dom** - Custom Jest matchers
- DOM-specific assertions
- Better error messages

**Example setup:**
```javascript
// vitest.config.js (root)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
```

### E2E Testing

**Playwright** (Recommended) - Modern E2E testing framework
- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-waiting and retries
- Screenshot and video capture
- Network interception

**Alternative: Cypress** - Popular E2E framework
- Time-travel debugging
- Real browser testing
- Good developer experience

---

## Folder Structure and Conventions

### Backend Test Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── articles.routes.js
│   ├── services/
│   │   └── usage.service.js
│   └── utils/
│       └── quotaChecker.js
└── tests/
    ├── unit/
    │   ├── services/
    │   │   └── usage.service.test.js
    │   └── utils/
    │       └── quotaChecker.test.js
    ├── integration/
    │   ├── routes/
    │   │   └── articles.routes.test.js
    │   └── middleware/
    │       └── quota.middleware.test.js
    └── fixtures/
        ├── users.js
        ├── articles.js
        └── subscriptions.js
```

### Frontend Test Structure

```
src/
├── components/
│   └── writer/
│       ├── Writer.js
│       └── Writer.test.js
├── hooks/
│   ├── useQuota.js
│   └── useQuota.test.js
├── services/
│   ├── api.js
│   └── api.test.js
└── test/
    ├── setup.js
    └── utils/
        ├── render.js
        └── mocks.js
```

### Naming Conventions

- Test files: `*.test.js` or `*.spec.js` (prefer `.test.js`)
- Test files next to source: `Component.test.js` next to `Component.js`
- Test files in separate directory: `tests/` folder
- Describe blocks: Use descriptive names matching the file/function
- Test cases: Use `it()` or `test()` with clear descriptions

**Example:**
```javascript
// usage.service.test.js
import { describe, it, expect } from 'vitest';
import { getCurrentUsage } from '../src/services/usage.service.js';

describe('UsageService', () => {
  describe('getCurrentUsage', () => {
    it('should return current usage for a user', async () => {
      // Test implementation
    });

    it('should return zero usage for new user', async () => {
      // Test implementation
    });
  });
});
```

---

## Writing Tests

### Backend Unit Tests

**Example: Testing a service function**

```javascript
// tests/unit/services/usage.service.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentUsage, incrementUsage } from '../../../src/services/usage.service.js';
import { prisma } from '../../../src/config/database.js';

// Mock Prisma
vi.mock('../../../src/config/database.js', () => ({
  prisma: {
    usage: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('UsageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUsage', () => {
    it('should return current usage for existing user', async () => {
      const mockUsage = {
        userId: '123',
        articlesGenerated: 5,
        imagesGenerated: 2,
        periodStart: new Date('2026-01-01'),
      };

      prisma.usage.findFirst.mockResolvedValue(mockUsage);

      const result = await getCurrentUsage('123');

      expect(result).toEqual(mockUsage);
      expect(prisma.usage.findFirst).toHaveBeenCalledWith({
        where: { userId: '123' },
      });
    });

    it('should return zero usage for new user', async () => {
      prisma.usage.findFirst.mockResolvedValue(null);

      const result = await getCurrentUsage('456');

      expect(result).toEqual({
        articlesGenerated: 0,
        imagesGenerated: 0,
        researchQueries: 0,
      });
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage and throw if quota exceeded', async () => {
      const mockUsage = {
        userId: '123',
        articlesGenerated: 99,
        quotaLimit: 100,
      };

      prisma.usage.findFirst.mockResolvedValue(mockUsage);

      await expect(
        incrementUsage('123', 'articlesGenerated', 2)
      ).rejects.toThrow('QUOTA_EXCEEDED');
    });
  });
});
```

### Backend Integration Tests

**Example: Testing an API endpoint**

```javascript
// tests/integration/routes/articles.routes.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/index.js';
import { prisma } from '../../../src/config/database.js';

describe('POST /api/articles', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user and get auth token
    testUser = await createTestUser();
    authToken = await getAuthToken(testUser);
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  it('should create an article successfully', async () => {
    const articleData = {
      topic: 'AI in Healthcare',
      focusKeyword: 'AI healthcare',
      tone: 'professional',
    };

    const response = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(articleData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.topic).toBe(articleData.topic);
  });

  it('should enforce quota limits', async () => {
    // Set user at quota limit
    await setUserQuota(testUser.id, { articlesGenerated: 100, quotaLimit: 100 });

    const response = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ topic: 'Test' })
      .expect(403);

    expect(response.body.error.code).toBe('QUOTA_EXCEEDED');
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/articles')
      .send({ topic: 'Test' })
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
```

### Frontend Component Tests

**Example: Testing a React component**

```javascript
// components/writer/Writer.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Writer from './Writer';
import * as api from '../../services/api';

// Mock API service
vi.mock('../../services/api', () => ({
  generateArticle: vi.fn(),
}));

describe('Writer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render writer form with all inputs', () => {
    render(<Writer />);

    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/focus keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('should call generateArticle on form submit', async () => {
    const mockArticle = { id: '123', content: 'Generated article...' };
    api.generateArticle.mockResolvedValue(mockArticle);

    render(<Writer />);

    const topicInput = screen.getByLabelText(/topic/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    fireEvent.change(topicInput, { target: { value: 'AI in Healthcare' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(api.generateArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'AI in Healthcare',
        })
      );
    });

    expect(screen.getByText(/generated article/i)).toBeInTheDocument();
  });

  it('should display error message on API failure', async () => {
    api.generateArticle.mockRejectedValue(new Error('API Error'));

    render(<Writer />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Frontend Hook Tests

**Example: Testing a custom React hook**

```javascript
// hooks/useQuota.test.js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuota } from './useQuota';
import * as api from '../services/api';

vi.mock('../services/api');

describe('useQuota Hook', () => {
  it('should fetch and return quota data', async () => {
    const mockQuota = {
      articlesGenerated: 5,
      quotaLimit: 100,
      percentage: 5,
    };

    api.getQuota.mockResolvedValue(mockQuota);

    const { result } = renderHook(() => useQuota());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quota).toEqual(mockQuota);
    expect(result.current.percentage).toBe(5);
  });

  it('should handle quota exceeded state', async () => {
    const mockQuota = {
      articlesGenerated: 100,
      quotaLimit: 100,
      percentage: 100,
    };

    api.getQuota.mockResolvedValue(mockQuota);

    const { result } = renderHook(() => useQuota());

    await waitFor(() => {
      expect(result.current.isExceeded).toBe(true);
    });
  });
});
```

---

## Running Tests

### Local Development

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test -- --watch

# Run specific test file
npm test -- usage.service.test.js

# Run tests matching pattern
npm test -- --grep "UsageService"

# Run with coverage report
npm test -- --coverage

# Run in UI mode (interactive)
npm test -- --ui
```

#### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- Writer.test.js

# Run with coverage
npm test -- --coverage

# Run in UI mode
npm test -- --ui
```

#### E2E Tests

```bash
# Install Playwright (first time)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- auth.spec.js

# Run in debug mode
npm run test:e2e -- --debug
```

### Test Environments

**Development:**
- Uses test database (separate from dev database)
- Mock external services (AI providers, email)
- Fast execution, no cleanup required

**CI/CD:**
- Fresh database for each test run
- Isolated test environment
- Parallel test execution
- Coverage reporting

### Test Scripts (package.json)

**Backend:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Frontend:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## Test Fixtures

Test fixtures provide reusable test data and setup/teardown utilities.

### Backend Fixtures

```javascript
// tests/fixtures/users.js
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: 'hashedPassword123',
      verified: true,
      subscriptionTier: 'free',
      ...overrides,
    },
  });
};

export const createTestUserWithSubscription = async (tier = 'pro') => {
  const user = await createTestUser();
  await prisma.subscription.create({
    data: {
      userId: user.id,
      tier,
      status: 'active',
    },
  });
  return user;
};

// tests/fixtures/articles.js
export const createTestArticle = async (userId, overrides = {}) => {
  return await prisma.article.create({
    data: {
      userId,
      topic: 'Test Article',
      content: 'Test content...',
      status: 'draft',
      ...overrides,
    },
  });
};
```

### Frontend Fixtures

```javascript
// src/test/fixtures/articles.js
export const mockArticle = {
  id: '123',
  topic: 'AI in Healthcare',
  content: '<p>Article content...</p>',
  focusKeyword: 'AI healthcare',
  status: 'draft',
  createdAt: '2026-01-07T00:00:00Z',
};

export const mockArticleList = [
  mockArticle,
  { ...mockArticle, id: '124', topic: 'Machine Learning Basics' },
];

// src/test/fixtures/users.js
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  subscriptionTier: 'pro',
  quota: {
    articlesGenerated: 5,
    quotaLimit: 100,
  },
};
```

### Using Fixtures in Tests

```javascript
import { createTestUser, createTestArticle } from '../fixtures/users.js';

describe('Articles API', () => {
  it('should list user articles', async () => {
    const user = await createTestUser();
    await createTestArticle(user.id);
    await createTestArticle(user.id);

    const response = await request(app)
      .get('/api/articles')
      .set('Authorization', `Bearer ${getToken(user)}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
```

---

## Mocking

### Mocking External Services

**AI Provider Mocking:**

```javascript
// tests/mocks/aiProvider.js
import { vi } from 'vitest';

export const mockGeminiService = {
  generateArticle: vi.fn().mockResolvedValue({
    content: 'Generated article content...',
    metadata: { wordCount: 500 },
  }),
  generateImage: vi.fn().mockResolvedValue({
    url: 'https://example.com/image.png',
  }),
};

// In test file
import { mockGeminiService } from '../mocks/aiProvider.js';
import { geminiService } from '../../src/services/geminiService.js';

vi.mock('../../src/services/geminiService.js', () => ({
  geminiService: mockGeminiService,
}));
```

**Email Service Mocking:**

```javascript
// tests/mocks/emailService.js
export const mockEmailService = {
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
};
```

### Mocking Database

**Prisma Mock:**

```javascript
import { vi } from 'vitest';
import { prisma } from '../../src/config/database.js';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    article: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));
```

### Mocking HTTP Requests

**Axios Mock:**

```javascript
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('API Service', () => {
  it('should fetch articles', async () => {
    const mockArticles = [{ id: '1', topic: 'Test' }];
    axios.get.mockResolvedValue({ data: mockArticles });

    const articles = await fetchArticles();

    expect(articles).toEqual(mockArticles);
    expect(axios.get).toHaveBeenCalledWith('/api/articles');
  });
});
```

### Mocking React Context

```javascript
// src/test/utils/render.js
import { render } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';

export const renderWithAuth = (component, authValue = {}) => {
  const defaultAuth = {
    user: { id: '123', email: 'test@example.com' },
    token: 'mock-token',
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      {component}
    </AuthContext.Provider>
  );
};
```

---

## Test Coverage and Thresholds

### Coverage Goals

We aim for the following coverage thresholds:

- **Statements:** 80% minimum
- **Branches:** 75% minimum
- **Functions:** 80% minimum
- **Lines:** 80% minimum

### Coverage Configuration

**Backend (vitest.config.js):**

```javascript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/index.js',
        '**/*.config.js',
        '**/migrations/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### Viewing Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
open coverage/index.html
```

### Coverage Exclusions

Some files are intentionally excluded from coverage:

- Configuration files
- Migration files
- Test utilities and fixtures
- Entry points (index.js)
- Type definitions

---

## CI Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db
      
      - name: Run tests
        run: |
          cd backend
          npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/coverage-final.json

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### CI Test Requirements

- All tests must pass before merging PRs
- Coverage must meet minimum thresholds
- E2E tests run on all PRs (may be allowed to fail for draft PRs)
- Tests run in parallel for faster feedback

---

## Best Practices and Pitfalls

### Best Practices

1. **Arrange-Act-Assert (AAA) Pattern**
   ```javascript
   it('should calculate total correctly', () => {
     // Arrange
     const items = [{ price: 10 }, { price: 20 }];
     
     // Act
     const total = calculateTotal(items);
     
     // Assert
     expect(total).toBe(30);
   });
   ```

2. **Use Descriptive Test Names**
   ```javascript
   // Good
   it('should return 403 when user exceeds article quota', () => {});
   
   // Bad
   it('should work', () => {});
   ```

3. **Test One Thing Per Test**
   ```javascript
   // Good - separate tests
   it('should validate email format', () => {});
   it('should validate password strength', () => {});
   
   // Bad - multiple assertions in one test
   it('should validate form', () => {
     expect(validateEmail('test')).toBe(false);
     expect(validatePassword('123')).toBe(false);
   });
   ```

4. **Use Test Data Builders**
   ```javascript
   const createArticle = (overrides = {}) => ({
     id: '123',
     topic: 'Test',
     content: 'Content...',
     ...overrides,
   });
   ```

5. **Clean Up After Tests**
   ```javascript
   afterEach(async () => {
     await cleanupTestData();
   });
   ```

### Common Pitfalls

1. **Testing Implementation Details**
   ```javascript
   // Bad - testing internal state
   expect(component.state.isLoading).toBe(true);
   
   // Good - testing user-visible behavior
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   ```

2. **Over-Mocking**
   ```javascript
   // Bad - mocking everything
   vi.mock('./utils');
   vi.mock('./services');
   vi.mock('./components');
   
   // Good - only mock external dependencies
   vi.mock('./services/api');
   ```

3. **Brittle Tests**
   ```javascript
   // Bad - depends on exact HTML structure
   expect(element.innerHTML).toBe('<div><span>Text</span></div>');
   
   // Good - tests behavior, not structure
   expect(screen.getByText('Text')).toBeInTheDocument();
   ```

4. **Not Testing Error Cases**
   ```javascript
   // Always test both success and failure paths
   it('should handle API errors gracefully', () => {
     api.fetchData.mockRejectedValue(new Error('Network error'));
     // Test error handling
   });
   ```

5. **Slow Tests**
   ```javascript
   // Bad - real network calls in unit tests
   const data = await fetch('https://api.example.com/data');
   
   // Good - mock network calls
   fetch.mockResolvedValue({ json: () => mockData });
   ```

---

## TODO / Planned Improvements

### Short-term

- [ ] Set up Vitest for frontend testing
- [ ] Add React Testing Library configuration
- [ ] Create test utilities and helpers
- [ ] Write tests for critical components (Writer, Dashboard)
- [ ] Set up Playwright for E2E testing
- [ ] Add CI/CD test workflows

### Medium-term

- [ ] Achieve 80% test coverage for backend
- [ ] Achieve 70% test coverage for frontend
- [ ] Add visual regression testing
- [ ] Set up test data management system
- [ ] Add performance testing
- [ ] Create testing documentation for contributors

### Long-term

- [ ] Implement mutation testing
- [ ] Add contract testing for API
- [ ] Set up automated accessibility testing
- [ ] Add load testing for critical endpoints
- [ ] Implement test result analytics dashboard

---

## Related Documentation

- [Contributing Guidelines](contributing.md) - Testing requirements for contributions
- [Setup Guide](setup.md) - Testing setup instructions
- [Code Organization](code-organization.md) - Project structure and test file organization
- [Backend Architecture](../architecture/backend-architecture.md) - Backend system architecture
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend system architecture
- [API Documentation](../architecture/api.md) - API endpoints for integration testing
