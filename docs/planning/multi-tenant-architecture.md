---
description: Multi-tenant architecture for Nova‑XFinity AI, including isolation strategies, data partitioning, tenant provisioning, and scaling considerations.
lastUpdated: 2026-01-07
status: Draft
---

# Multi-Tenant Architecture

## Table of Contents

- [Overview](#overview)
- [Tenancy Models](#tenancy-models)
- [Logical & Data Isolation](#logical--data-isolation)
- [Tenant Provisioning & Lifecycle](#tenant-provisioning--lifecycle)
- [API Keys, Limits, and Quotas](#api-keys-limits-and-quotas)
- [Scaling & Load Management](#scaling--load-management)
- [Security Model](#security-model)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

---

## Overview

Nova‑XFinity AI is designed as a **multi-tenant SaaS platform** where each user account represents an independent tenant with isolated data, configuration, and usage quotas. The system supports thousands of concurrent users while maintaining strict isolation boundaries and predictable performance.

### What is a Tenant?

In Nova‑XFinity, a **tenant** is defined as:

- **Primary Definition:** An individual user account (identified by `userId`)
- **Future Definition:** An organization or team (multiple users under one billing entity)

Each tenant has:
- Isolated data (articles, drafts, media assets, research queries)
- Independent subscription plan and usage quotas
- Separate API keys and provider configurations
- Isolated settings and preferences
- Independent billing and payment history

### Multi-Tenancy Use Cases

**Current Implementation:**
- Individual content creators with separate accounts
- Each user operates independently with their own data and quotas
- No cross-tenant data sharing or visibility

**Future Scenarios:**
- **Team/Organization Tenancy:** Multiple users under one organization account
- **White-Label Deployments:** Separate branded instances for enterprise clients
- **Reseller Model:** Partners managing multiple sub-tenants
- **Workspace Isolation:** Users with multiple isolated workspaces

### Architecture Philosophy

- **Shared Infrastructure, Isolated Data:** All tenants share the same application and database infrastructure, but data is strictly partitioned
- **Row-Level Isolation:** Database queries automatically filter by `userId` to ensure data isolation
- **Quota Enforcement:** Usage limits enforced per tenant at middleware layer
- **Horizontal Scalability:** System designed to scale horizontally as tenant count grows
- **Security by Default:** Isolation enforced at multiple layers (authentication, authorization, database)

---

## Tenancy Models

Nova‑XFinity implements a **hybrid multi-tenant architecture** that balances isolation, performance, and cost-efficiency.

### Model Comparison

| Model | Description | Isolation | Cost | Scalability | Complexity |
|-------|-------------|-----------|------|-------------|------------|
| **Single-Tenant** | Dedicated infrastructure per tenant | Highest | Highest | Limited | Low |
| **Multi-Tenant (Shared DB)** | All tenants share database and schema | Lowest | Lowest | Highest | Medium |
| **Multi-Tenant (Separate Schema)** | Separate schema per tenant in shared DB | Medium | Medium | High | High |
| **Hybrid (Current)** | Shared DB with row-level isolation | Medium-High | Low | High | Medium |

### Nova‑XFinity's Chosen Model: Hybrid Multi-Tenant

**Architecture:**
- **Shared Application Layer:** Single Express.js and FastAPI backend serves all tenants
- **Shared Database:** Single PostgreSQL instance with row-level tenant isolation
- **User-Scoped Data:** All queries filtered by `userId` at ORM level
- **Isolated Subscriptions:** Each user has independent subscription and usage tracking
- **Shared AI Services:** All tenants share AI provider connections (Gemini, OpenAI, etc.)

**Why Hybrid?**

✅ **Advantages:**
- **Cost-Efficient:** Single infrastructure for all tenants reduces operational costs
- **Simple Operations:** One deployment, one database to manage
- **Fast Provisioning:** New tenants created instantly without infrastructure setup
- **Shared Resources:** Efficient use of compute and storage resources
- **Easy Updates:** Deploy once, all tenants updated simultaneously

⚠️ **Trade-offs:**
- **Noisy Neighbor Risk:** One tenant's heavy usage could impact others (mitigated by rate limiting)
- **Data Isolation Complexity:** Requires careful query filtering to prevent data leaks
- **Limited Customization:** Hard to provide tenant-specific infrastructure configurations
- **Scaling Limits:** Single database becomes bottleneck at extreme scale (mitigated by read replicas)

**When to Evolve:**
- **Trigger 1:** Database performance degradation (>10,000 active tenants)
- **Trigger 2:** Enterprise customers require dedicated infrastructure
- **Trigger 3:** Regulatory compliance requires physical data separation
- **Solution:** Introduce database sharding or dedicated tenant clusters

### Alternative Models (Future Consideration)

#### Separate Schema per Tenant
```sql
-- Each tenant gets their own schema
CREATE SCHEMA tenant_user123;
CREATE TABLE tenant_user123.articles (...);
CREATE TABLE tenant_user123.drafts (...);
```

**When to Use:**
- Enterprise customers requiring logical separation
- Compliance requirements (HIPAA, GDPR data residency)
- Custom schema modifications per tenant

**Implementation Complexity:** High (schema routing, migrations, backups)

#### Separate Database per Tenant
```
Database: tenant_user123
Database: tenant_user456
Database: tenant_org789
```

**When to Use:**
- White-label deployments
- Extreme isolation requirements
- Tenant-specific performance tuning

**Implementation Complexity:** Very High (connection pooling, orchestration, monitoring)

---

## Logical & Data Isolation

Nova‑XFinity enforces tenant isolation at multiple architectural layers to prevent data leaks and ensure security.

### Authentication Layer

**User Identity:**
- Each user identified by unique UUID (`userId`)
- JWT tokens contain user identity in `sub` claim
- Tokens validated on every request via `authenticate` middleware

**Token Structure:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "iat": 1704614400,
  "exp": 1704616200
}
```

**Middleware Enforcement:**
```javascript
// backend/src/middleware/auth.middleware.js
export const authenticate = async (req, res, next) => {
  const token = req.cookies?.access_token;
  const decoded = jwt.verify(token, process.env.SECRET);
  
  // Attach user context to request
  req.user = {
    id: decoded.sub,        // userId for data isolation
    email: decoded.email,
    role: decoded.role
  };
  
  next();
};
```

### Authorization Layer (RBAC)

**Role-Based Access Control:**
- Three roles: `user`, `pro`, `admin`
- Role stored in database and JWT token
- Role determines feature access and quota limits

**Role Enforcement:**
```javascript
// Check role before allowing access
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
    next();
  };
};

// Usage
router.get('/admin/users', authenticate, requireRole(['admin']), getUsersHandler);
```

**Subscription-Based Authorization:**
```javascript
// backend/src/middleware/subscription.middleware.js
export const requireFeature = (feature) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const hasAccess = await hasFeatureAccess(userId, feature);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: {
          code: 'FEATURE_NOT_AVAILABLE',
          message: `This feature requires a PRO or ENTERPRISE plan`
        }
      });
    }
    next();
  };
};
```

### Data Isolation Strategy

**Row-Level Tenant Filtering:**

All database queries automatically filter by `userId` to ensure tenants only access their own data.

**Prisma ORM Enforcement:**
```javascript
// ALWAYS include userId in queries
const articles = await prisma.article.findMany({
  where: { userId: req.user.id }  // Tenant isolation
});

const article = await prisma.article.findFirst({
  where: {
    id: articleId,
    userId: req.user.id  // Prevent cross-tenant access
  }
});

// Create operations automatically scope to user
const newArticle = await prisma.article.create({
  data: {
    userId: req.user.id,  // Tenant ownership
    title: 'My Article',
    content: '...'
  }
});
```

**Database Schema Enforcement:**

Foreign key constraints ensure data integrity and prevent orphaned records.

```prisma
// backend/prisma/schema.prisma
model Article {
  id       String @id @default(uuid())
  userId   String @map("user_id")
  title    String
  content  String @db.Text
  
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])  // Fast tenant-scoped queries
  @@map("articles")
}

model Draft {
  id       String @id @default(uuid())
  userId   String @map("user_id")
  title    String
  sections Json
  
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("drafts")
}
```

**Cascade Deletion:**
- When a user is deleted, all associated data is automatically removed
- `onDelete: Cascade` ensures no orphaned tenant data

### Database Partitioning Strategy

**Current: Shared Schema with Row-Level Isolation**

```
┌─────────────────────────────────────┐
│         PostgreSQL Database         │
├─────────────────────────────────────┤
│  users                              │
│  ├─ user_1 (tenant 1)               │
│  ├─ user_2 (tenant 2)               │
│  └─ user_3 (tenant 3)               │
├─────────────────────────────────────┤
│  articles                           │
│  ├─ article_1 (userId: user_1)     │
│  ├─ article_2 (userId: user_1)     │
│  ├─ article_3 (userId: user_2)     │
│  └─ article_4 (userId: user_3)     │
├─────────────────────────────────────┤
│  subscriptions                      │
│  ├─ sub_1 (userId: user_1)         │
│  ├─ sub_2 (userId: user_2)         │
│  └─ sub_3 (userId: user_3)         │
└─────────────────────────────────────┘
```

**Indexing Strategy:**
- All tenant-scoped tables have `userId` index for fast filtering
- Composite indexes for common query patterns: `(userId, createdAt)`, `(userId, status)`

**Query Performance:**
```sql
-- Fast: Uses userId index
SELECT * FROM articles WHERE user_id = 'user_1' ORDER BY created_at DESC LIMIT 10;

-- Slow: Full table scan (admin-only query)
SELECT COUNT(*) FROM articles GROUP BY user_id;
```

### Future: Database Sharding

**When to Implement:** >10,000 active tenants or >1TB database size

**Sharding Strategy:**
- **Shard Key:** `userId` (ensures tenant data co-located)
- **Shard Count:** Start with 4 shards, expand as needed
- **Routing:** Application-level routing based on userId hash

```javascript
// Pseudo-code for sharding
const getShardForUser = (userId) => {
  const hash = hashCode(userId);
  const shardIndex = hash % SHARD_COUNT;
  return shards[shardIndex];
};

const db = getShardForUser(req.user.id);
const articles = await db.article.findMany({ where: { userId: req.user.id } });
```

---

## Tenant Provisioning & Lifecycle

### Tenant Creation (User Registration)

**Registration Flow:**

```
1. User submits registration form (email, password)
   ↓
2. FastAPI Auth Backend validates input
   ↓
3. User record created in database (role: 'user')
   ↓
4. Verification email sent (if SMTP configured)
   ↓
5. FREE subscription automatically created
   ↓
6. Usage tracking record initialized
   ↓
7. JWT tokens issued, user redirected to dashboard
```

**Database Operations:**

```sql
-- 1. Create user
INSERT INTO users (id, email, password_hash, role, email_verified, created_at)
VALUES (uuid_generate_v4(), 'user@example.com', '$2b$...', 'user', false, NOW());

-- 2. Create subscription (automatic)
INSERT INTO subscriptions (id, user_id, plan, status, current_period_start, current_period_end)
VALUES (uuid_generate_v4(), 'user_id', 'FREE', 'ACTIVE', NOW(), NOW() + INTERVAL '1 month');

-- 3. Create usage tracking (automatic)
INSERT INTO usage (id, user_id, subscription_id, period, period_start, period_end)
VALUES (uuid_generate_v4(), 'user_id', 'subscription_id', 'MONTHLY', NOW(), NOW() + INTERVAL '1 month');
```

**Implementation:**

```javascript
// backend/src/services/subscription.service.js
export const getUserSubscription = async (userId) => {
  let subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription) {
    // Auto-provision FREE subscription for new users
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      }
    });
  }

  return subscription;
};
```

### Tenant Upgrade/Downgrade

**Upgrade Flow (FREE → PRO):**

```
1. User clicks "Upgrade to PRO" in dashboard
   ↓
2. Frontend redirects to payment page (Stripe/PayPal)
   ↓
3. User completes payment with provider
   ↓
4. Payment provider sends webhook to backend
   ↓
5. Webhook handler verifies signature
   ↓
6. Subscription updated: plan = 'PRO', status = 'ACTIVE'
   ↓
7. User role updated: role = 'pro'
   ↓
8. Usage limits updated to PRO tier
   ↓
9. Frontend refreshes subscription status
```

**Implementation:**

```javascript
// backend/src/services/subscription.service.js
export const updateSubscriptionPlan = async (
  userId, 
  plan, 
  stripeSubscriptionId = null,
  paypalSubscriptionId = null
) => {
  const subscription = await getUserSubscription(userId);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      plan,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
      ...(paypalSubscriptionId && { paypalSubscriptionId })
    }
  });
};
```

**Downgrade Flow (PRO → FREE):**

```
1. User cancels subscription in dashboard
   ↓
2. Subscription marked: cancelAtPeriodEnd = true
   ↓
3. User retains PRO access until period end
   ↓
4. At period end, webhook triggers downgrade
   ↓
5. Subscription updated: plan = 'FREE', status = 'ACTIVE'
   ↓
6. User role updated: role = 'user'
   ↓
7. Usage limits reset to FREE tier
```

### Tenant Suspension

**Suspension Triggers:**
- Payment failure (subscription expired)
- Terms of service violation
- Abuse detection (excessive API usage)
- Manual admin action

**Suspension Flow:**

```javascript
// Suspend tenant
export const suspendTenant = async (userId, reason) => {
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'EXPIRED',
      cancelAtPeriodEnd: true
    }
  });
  
  // Log suspension event
  await auditLog.create({
    userId,
    action: 'TENANT_SUSPENDED',
    reason,
    timestamp: new Date()
  });
};
```

**Suspended Tenant Behavior:**
- User can log in but cannot generate content
- All API requests return 403 Forbidden with suspension message
- User prompted to resolve payment or contact support
- Data remains intact (not deleted)

### Tenant Deletion

**Deletion Triggers:**
- User requests account deletion
- GDPR data deletion request
- Admin action (spam, abuse)

**Deletion Flow:**

```
1. User requests account deletion
   ↓
2. Confirmation email sent (prevent accidental deletion)
   ↓
3. User confirms deletion within 7 days
   ↓
4. Cascade deletion triggered:
   - Articles deleted
   - Drafts deleted
   - Media assets deleted
   - Research queries deleted
   - API keys deleted
   - Subscription deleted
   - Usage records deleted
   - User record deleted
   ↓
5. Deletion confirmation email sent
```

**Implementation:**

```javascript
// Cascade deletion via Prisma
await prisma.user.delete({
  where: { id: userId }
  // onDelete: Cascade ensures all related data deleted
});
```

**Data Retention:**
- Billing records retained for 7 years (legal requirement)
- Audit logs retained for 1 year
- Anonymized usage statistics retained indefinitely

---

## API Keys, Limits, and Quotas

### API Key Management

**Current Implementation:**

Nova‑XFinity stores user-provided AI provider API keys (Gemini, OpenAI, Anthropic, Llama) in the database, scoped per user.

**Schema:**

```prisma
model ApiKey {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  provider     Provider
  encryptedKey String   @map("encrypted_key") @db.Text
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, provider])  // One key per provider per user
  @@index([userId])
  @@map("api_keys")
}

enum Provider {
  GEMINI
  OPENAI
  ANTHROPIC
  LLAMA
}
```

**Key Storage:**
- Keys stored as plaintext (⚠️ security risk, encryption planned)
- Each user can have one key per provider
- Keys scoped to user (tenant isolation)
- Keys deleted when user deleted (cascade)

**Key Usage:**

```javascript
// services/ai/providerManager.js
export const getProviderConfig = () => {
  const settings = getSavedSettings();  // From localStorage
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: process.env.API_KEY,  // Shared platform key
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      key: settings.openaiKey,  // User-provided key
      model: 'gpt-4o' 
    },
    anthropic: { 
      key: settings.claudeKey,  // User-provided key
      model: 'claude-3-5-sonnet-latest' 
    }
  };
  
  return configs[provider];
};
```

**Future: Platform API Keys**

For users without their own provider keys, Nova‑XFinity will provide shared platform keys with usage tracking.

```javascript
// Pseudo-code for platform key usage
const getApiKey = async (userId, provider) => {
  // Check if user has their own key
  const userKey = await prisma.apiKey.findUnique({
    where: { userId_provider: { userId, provider } }
  });
  
  if (userKey && userKey.isActive) {
    return userKey.encryptedKey;  // Use user's key
  }
  
  // Fall back to platform key
  return getPlatformKey(provider);  // Shared key with rate limiting
};
```

### Usage Limits and Quotas

**Quota Enforcement:**

Quotas are enforced at two levels:
1. **Middleware Level:** Pre-request validation before AI generation
2. **Service Level:** Post-request increment after successful generation

**Quota Configuration:**

```javascript
// backend/src/utils/featureFlags.js
export const PLAN_FEATURES = {
  FREE: {
    articles: { enabled: true, limit: 10 },
    images: { enabled: true, limit: 25 },
    videos: { enabled: false, limit: 0 },
    research: { enabled: true, limit: 20 },
    wordpress: { enabled: false, limit: 0 }
  },
  PRO: {
    articles: { enabled: true, limit: 100 },
    images: { enabled: true, limit: 500 },
    videos: { enabled: true, limit: 20 },
    research: { enabled: true, limit: -1 },  // -1 = unlimited
    wordpress: { enabled: true, limit: 50 }
  },
  ENTERPRISE: {
    articles: { enabled: true, limit: -1 },
    images: { enabled: true, limit: -1 },
    videos: { enabled: true, limit: 100 },
    research: { enabled: true, limit: -1 },
    wordpress: { enabled: true, limit: -1 }
  }
};
```

**Quota Middleware:**

```javascript
// backend/src/middleware/quota.middleware.js
export const checkUsageLimit = (feature) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const check = await canPerformAction(userId, feature);
    
    if (!check.allowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `You have reached your monthly limit for ${feature}`,
          currentUsage: check.currentUsage,
          limit: check.limit,
          plan: check.plan
        }
      });
    }
    
    req.usageInfo = check;
    next();
  };
};

// Usage
router.post('/api/articles/generate', 
  authenticate, 
  checkUsageLimit('articles'), 
  generateArticleHandler
);
```

**Usage Tracking:**

```javascript
// backend/src/services/usage.service.js
export const incrementUsage = async (userId, feature, amount = 1) => {
  const usage = await getCurrentUsage(userId);
  const plan = usage.subscription.plan;

  // Check limit
  if (!isWithinLimit(plan, feature, usage[`${feature}Generated`])) {
    throw new Error(`Usage limit exceeded for ${feature}`);
  }

  // Increment
  return await prisma.usage.update({
    where: { id: usage.id },
    data: {
      [`${feature}Generated`]: { increment: amount }
    }
  });
};
```

**Usage Reset:**

Monthly quotas reset automatically at the start of each billing period.

```javascript
// Cron job: Run at 00:00 on 1st of each month
export const resetMonthlyUsage = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Find expired usage records
  const expiredUsage = await prisma.usage.findMany({
    where: { periodEnd: { lt: monthStart } }
  });

  // Create new usage records for current period
  for (const usage of expiredUsage) {
    await prisma.usage.create({
      data: {
        userId: usage.userId,
        subscriptionId: usage.subscriptionId,
        period: 'MONTHLY',
        periodStart: monthStart,
        periodEnd: monthEnd,
        articlesGenerated: 0,
        imagesGenerated: 0,
        videosGenerated: 0,
        researchQueries: 0,
        articlesPublished: 0
      }
    });
  }
};
```

### Rate Limiting

**Purpose:** Prevent abuse and ensure fair resource allocation across tenants.

**Current Implementation:** Basic rate limiting planned (not yet implemented)

**Recommended Limits:**

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/api/articles/generate` | 10 requests | 1 minute | Per user |
| `/api/images/generate` | 20 requests | 1 minute | Per user |
| `/api/research` | 5 requests | 1 minute | Per user |
| `/auth/login` | 5 requests | 15 minutes | Per IP |
| `/api/*` (global) | 100 requests | 1 minute | Per user |

**Implementation (Planned):**

```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';

// Per-user rate limiter
const createUserLimiter = (max, windowMs) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:user:',
    }),
    windowMs,
    max,
    keyGenerator: (req) => req.user.id,  // Rate limit per userId
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Apply to routes
router.post('/api/articles/generate', 
  authenticate,
  createUserLimiter(10, 60 * 1000),  // 10 req/min per user
  checkUsageLimit('articles'),
  generateArticleHandler
);
```

---

## Scaling & Load Management

### Horizontal Scaling

**Application Layer:**

Nova‑XFinity's stateless architecture enables horizontal scaling of API servers.

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐┌────────┐┌────────┐
│ API 1  ││ API 2  ││ API 3  │  (Express.js)
└────┬───┘└────┬───┘└────┬───┘
     │         │         │
     └─────────┼─────────┘
               ▼
       ┌───────────────┐
       │  PostgreSQL   │
       │   (Primary)   │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       ▼               ▼
   ┌────────┐     ┌────────┐
   │ Read   │     │ Read   │
   │Replica │     │Replica │
   └────────┘     └────────┘
```

**Stateless Design:**
- No session state stored in application servers
- All state in database or Redis cache
- JWT tokens enable stateless authentication
- Any API server can handle any request

**Load Balancing Strategy:**
- Round-robin distribution
- Health checks on `/health` endpoint
- Sticky sessions not required (stateless)

**Scaling Triggers:**
- CPU usage >70% sustained for 5 minutes
- Request latency p95 >500ms
- Active connections >80% of capacity

### Vertical Scaling

**Database Scaling:**

PostgreSQL is the primary scaling bottleneck in the current architecture.

**Optimization Strategies:**
1. **Connection Pooling:** Limit connections per API server
2. **Query Optimization:** Ensure all queries use indexes
3. **Read Replicas:** Route read queries to replicas
4. **Caching:** Cache frequently accessed data in Redis

**Connection Pooling:**

```javascript
// backend/src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
  // Connection pool configuration
  connectionLimit: 10,  // Max connections per API instance
});

export default prisma;
```

**Read Replica Configuration:**

```javascript
// Pseudo-code for read replica routing
const prismaRead = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READ_URL } }
});

// Route read queries to replica
export const getArticles = async (userId) => {
  return await prismaRead.article.findMany({
    where: { userId }
  });
};

// Write queries to primary
export const createArticle = async (userId, data) => {
  return await prisma.article.create({
    data: { userId, ...data }
  });
};
```

### Caching Strategy

**Redis Caching:**

Cache frequently accessed data to reduce database load.

**Cache Layers:**

| Data Type | TTL | Invalidation Strategy |
|-----------|-----|----------------------|
| User subscription | 5 minutes | On subscription update |
| Usage stats | 1 minute | On usage increment |
| Article drafts | 5 minutes | On draft save |
| Research results | 1 hour | Manual invalidation |
| Settings | 10 minutes | On settings update |

**Implementation:**

```javascript
// backend/src/services/subscription.service.js
import redis from '../config/redis.js';

export const getUserSubscription = async (userId) => {
  // Check cache first
  const cacheKey = `subscription:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { user: true }
  });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(subscription));
  
  return subscription;
};

// Invalidate cache on update
export const updateSubscriptionPlan = async (userId, plan) => {
  const subscription = await prisma.subscription.update({
    where: { userId },
    data: { plan }
  });
  
  // Invalidate cache
  await redis.del(`subscription:${userId}`);
  
  return subscription;
};
```

### Service Boundaries

**Current Monolithic Architecture:**

```
┌─────────────────────────────────────────┐
│         Express.js Backend              │
│  ┌────────────────────────────────────┐ │
│  │ Articles Service                   │ │
│  │ Media Service                      │ │
│  │ Research Service                   │ │
│  │ Subscription Service               │ │
│  │ Usage Service                      │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Future Microservices Architecture:**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Articles   │  │    Media     │  │   Research   │
│   Service    │  │   Service    │  │   Service    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                 ┌───────────────┐
                 │  API Gateway  │
                 └───────┬───────┘
                         │
                 ┌───────┴───────┐
                 ▼               ▼
         ┌──────────────┐ ┌──────────────┐
         │ Subscription │ │    Usage     │
         │   Service    │ │   Service    │
         └──────────────┘ └──────────────┘
```

**Migration Triggers:**
- Team size >10 developers
- Deployment conflicts increase
- Services have different scaling requirements
- Need independent technology stacks

---

## Security Model

Multi-tenant security ensures tenants cannot access each other's data or resources.

### Cross-Tenant Protection

**Query-Level Isolation:**

Every database query must include `userId` filter.

```javascript
// ✅ SAFE: Tenant-scoped query
const articles = await prisma.article.findMany({
  where: { userId: req.user.id }
});

// ❌ UNSAFE: No tenant filter (admin-only)
const allArticles = await prisma.article.findMany();
```

**Middleware Enforcement:**

```javascript
// Ensure userId in request context
export const authenticate = async (req, res, next) => {
  const token = req.cookies?.access_token;
  const decoded = jwt.verify(token, process.env.SECRET);
  
  req.user = { id: decoded.sub };  // Always present
  next();
};

// Validate resource ownership
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    const resource = await prisma[resourceType].findUnique({
      where: { id: resourceId }
    });
    
    if (!resource || resource.userId !== userId) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Resource not found' }
      });
    }
    
    next();
  };
};

// Usage
router.delete('/api/articles/:id', 
  authenticate, 
  requireOwnership('article'), 
  deleteArticleHandler
);
```

### Secret Separation

**Per-Tenant Secrets:**

- API keys stored per user (tenant-scoped)
- Subscription credentials (Stripe/PayPal) scoped to user
- Settings and preferences isolated per user

**Platform Secrets:**

- JWT signing key (shared across all tenants)
- Database credentials (shared)
- Payment provider credentials (shared platform account)

**Secret Storage:**

```
Environment Variables (Platform Secrets):
- SECRET (JWT signing key)
- DATABASE_URL
- STRIPE_SECRET_KEY
- PAYPAL_CLIENT_SECRET

Database (Tenant Secrets):
- api_keys.encrypted_key (user API keys)
- subscriptions.stripe_customer_id (user payment ID)
```

### Scoped Access Control

**Role-Based Access Control (RBAC):**

```javascript
// User can only access their own resources
const canAccessResource = (user, resource) => {
  return user.id === resource.userId;
};

// Admin can access all resources
const canAccessResource = (user, resource) => {
  return user.role === 'admin' || user.id === resource.userId;
};
```

**Subscription-Based Access Control:**

```javascript
// Feature access based on subscription plan
const hasFeatureAccess = async (userId, feature) => {
  const subscription = await getUserSubscription(userId);
  const plan = subscription.plan;
  const features = PLAN_FEATURES[plan];
  
  return features[feature]?.enabled ?? false;
};
```

**Audit Logging:**

Log all access to sensitive resources for security monitoring.

```javascript
// Log resource access
export const auditLog = async (userId, action, resourceType, resourceId) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
};

// Usage
await auditLog(req.user.id, 'DELETE_ARTICLE', 'article', articleId);
```

---

## Future Enhancements

### Organization/Team Tenancy

**Goal:** Support multiple users under one organization account.

**Schema Changes:**

```prisma
model Organization {
  id          String   @id @default(uuid())
  name        String
  ownerId     String   @map("owner_id")
  createdAt   DateTime @default(now())
  
  owner       User     @relation("OrgOwner", fields: [ownerId], references: [id])
  members     OrganizationMember[]
  subscription Subscription?
  
  @@map("organizations")
}

model OrganizationMember {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  userId         String       @map("user_id")
  role           OrgRole      @default(MEMBER)
  createdAt      DateTime     @default(now())
  
  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
  
  @@unique([organizationId, userId])
  @@map("organization_members")
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
}
```

**Tenancy Model:**
- Subscription at organization level (not user level)
- Usage quotas shared across organization
- Data ownership: organization (not individual users)

### Database Sharding

**Goal:** Distribute tenant data across multiple database instances.

**Sharding Strategy:**
- **Shard Key:** `userId` or `organizationId`
- **Shard Count:** Start with 4, expand to 16+
- **Routing:** Application-level routing based on hash

**Implementation:**

```javascript
// Shard routing
const SHARD_COUNT = 4;
const shards = [
  new PrismaClient({ datasources: { db: { url: SHARD_1_URL } } }),
  new PrismaClient({ datasources: { db: { url: SHARD_2_URL } } }),
  new PrismaClient({ datasources: { db: { url: SHARD_3_URL } } }),
  new PrismaClient({ datasources: { db: { url: SHARD_4_URL } } }),
];

const getShardForUser = (userId) => {
  const hash = hashCode(userId);
  return shards[hash % SHARD_COUNT];
};

// Query routing
export const getArticles = async (userId) => {
  const shard = getShardForUser(userId);
  return await shard.article.findMany({
    where: { userId }
  });
};
```

**Challenges:**
- Cross-shard queries (analytics, admin dashboard)
- Shard rebalancing (add/remove shards)
- Backup and restore complexity

### Federated Services

**Goal:** Allow tenants to use their own infrastructure for certain services.

**Use Cases:**
- Enterprise customers with their own AI provider accounts
- Custom model deployments (fine-tuned models)
- Data residency requirements (EU, US, Asia)

**Architecture:**

```
┌─────────────────────────────────────────┐
│         Nova‑XFinity Platform           │
│  ┌────────────────────────────────────┐ │
│  │  Tenant A (Standard)               │ │
│  │  Uses platform AI services         │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Tenant B (Federated)              │ │
│  │  Uses own AI infrastructure        │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │ Custom AI Endpoint           │  │ │
│  │  │ https://ai.tenantb.com       │  │ │
│  │  └──────────────────────────────┘  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Zero-Downtime Tenant Migration

**Goal:** Move tenants between shards/databases without downtime.

**Migration Process:**

```
1. Enable dual-write mode (write to both old and new shard)
   ↓
2. Backfill data from old shard to new shard
   ↓
3. Verify data consistency
   ↓
4. Switch reads to new shard
   ↓
5. Disable writes to old shard
   ↓
6. Delete data from old shard
```

**Implementation:**

```javascript
// Dual-write mode
export const createArticle = async (userId, data) => {
  const oldShard = getShardForUser(userId);
  const newShard = getNewShardForUser(userId);
  
  // Write to both shards
  const [article1, article2] = await Promise.all([
    oldShard.article.create({ data: { userId, ...data } }),
    newShard.article.create({ data: { userId, ...data } })
  ]);
  
  return article1;  // Return from old shard during migration
};
```

### Multi-Region Deployment

**Goal:** Deploy Nova‑XFinity in multiple geographic regions for low latency.

**Architecture:**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   US East   │  │  EU West    │  │  Asia Pac   │
│   Region    │  │  Region     │  │  Region     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                ┌───────────────┐
                │ Global Router │
                │  (DNS/CDN)    │
                └───────────────┘
```

**Tenant Routing:**
- Route users to nearest region based on IP geolocation
- Replicate user data to home region
- Cross-region data sync for global features

---

## Related Documentation

- [Backend Architecture](../architecture/backend-architecture.md) - Backend system structure and services
- [Security Model](../architecture/security-model.md) - Authentication, authorization, and security practices
- [Subscriptions and Billing](../architecture/subscriptions-and-billing.md) - Subscription tiers, quotas, and payment flows
- [AI Agent Extension](ai-agent-extension.md) - AI provider routing and extensibility
- [Database Schema](../architecture/database-schema.md) - Database structure and relationships (if exists)
- [Scaling Guide](../development/scaling.md) - Performance optimization and scaling strategies (planned)

---

**Last Updated:** 2026-01-07  
**Status:** Draft  
**Next Review:** Q2 2026 (after reaching 1,000 active tenants)
