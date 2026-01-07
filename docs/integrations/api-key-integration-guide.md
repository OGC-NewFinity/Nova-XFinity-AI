---
description: Explains how Nova‑XFinity securely manages 3rd-party API keys for AI providers and routes them through the AI Agent system.
lastUpdated: 2026-01-07
status: Draft
---

# API Key Integration Guide

## Overview

Nova‑XFinity provides a secure, multi-provider API key management system that enables users to integrate their own AI provider API keys while maintaining robust security, automatic routing, and graceful fallback mechanisms. The system supports both platform-provided keys (for default Gemini access) and user-supplied keys (for OpenAI, Anthropic, and other providers).

**Key Handling Philosophy:**
- **Scoped:** Keys are isolated per user and per provider
- **Isolated:** Keys stored encrypted in database, never exposed in logs or frontend
- **Ephemeral:** Keys decrypted only when needed, in-memory only
- **Fallback-Ready:** System gracefully handles missing or invalid keys with automatic fallback

---

## Provider Coverage

Nova‑XFinity supports the following AI providers with API key integration:

### Currently Supported

| Provider | Service Types | Key Source | Status |
|----------|--------------|------------|--------|
| **Google Gemini** | Text, Image, Video, Audio, Research | Environment (`GEMINI_API_KEY`) | ✅ Active |
| **OpenAI** | Text Generation | User Storage (Database) | ✅ Active |
| **Anthropic Claude** | Text Generation | User Storage (Database) | ✅ Active |
| **Groq/Llama** | Text Generation | User Storage (Database) | ✅ Active |

### Planned Providers

| Provider | Service Types | Implementation Status |
|----------|--------------|----------------------|
| **Stability AI** | Image Generation | 🚧 Planned |
| **Replicate** | Image/Video Generation | 🚧 Planned |
| **Suno** | Audio/Music Generation | 🚧 Planned |
| **Runway** | Video Generation | 🚧 Planned |
| **Luma** | Video Generation | 🚧 Planned |
| **Pinecone** | Vector Search/Embeddings | 🚧 Planned |
| **Weaviate** | Vector Search/Embeddings | 🚧 Planned |

---

## Integration Strategy

### Token Storage Locations

Nova‑XFinity uses a multi-tiered key storage strategy:

#### 1. Environment Variables (Platform Keys)

**Use Case:** Default Gemini API key for platform-wide access

**Location:** `.env` file on server
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Access Pattern:**
```javascript
// services/ai/providerManager.js
const getApiKey = () => {
  return process.env.API_KEY; // or process.env.GEMINI_API_KEY
};
```

**Security:** 
- Never committed to version control
- Accessible only to backend services
- Used as fallback when user keys unavailable

#### 2. Database Storage (User Keys)

**Use Case:** User-provided API keys for OpenAI, Anthropic, Llama, etc.

**Database Schema:**
```prisma
model ApiKey {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  provider    Provider
  encryptedKey String  @map("encrypted_key") @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, provider])
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

**Storage Process:**
1. User submits API key via settings interface
2. Key encrypted server-side before storage
3. Encrypted value stored in `encrypted_key` field
4. Original key never stored in plaintext

#### 3. Frontend Local Storage (User Preferences)

**Use Case:** User provider selection and key references (not actual keys)

**Location:** Browser `localStorage` key `finity_settings`
```javascript
{
  provider: 'gemini',
  openaiKey: null, // Not stored, only provider selection
  claudeKey: null,
  llamaKey: null
}
```

**Security Note:** Actual API keys are **never** stored in localStorage. Only provider preferences and settings.

#### 4. Secure Vaults (Planned)

**Future Implementation:**
- Integration with HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- GCP Secret Manager

For enterprise customers requiring enhanced key management.

---

## API Key Injection Flow

### Frontend Request → Backend Agent → Provider Manager

The complete flow from user action to provider API call:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER TRIGGERS ACTION                         │
│  (Generate Article, Image, Video, Research, etc.)               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   FRONTEND COMPONENT         │
         │  - Writer.js                 │
         │  - MediaHub.js               │
         │  - Research.js               │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   PROVIDER CONFIG RESOLVER   │
         │  - getProviderConfig()       │
         │  - Checks localStorage       │
         │  - Determines provider       │
         └──────────────┬───────────────┘
                        │
         ┌──────────────┴───────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  CLIENT-SIDE    │          │  SERVER-SIDE    │
│  (Direct API)   │          │  (Backend Route)│
└────────┬────────┘          └────────┬────────┘
         │                            │
         │                            ▼
         │              ┌──────────────────────────┐
         │              │   BACKEND API ROUTE      │
         │              │  - /api/articles         │
         │              │  - /api/media/images     │
         │              │  - /api/research         │
         │              └──────────────┬───────────┘
         │                            │
         │                            ▼
         │              ┌──────────────────────────┐
         │              │   AUTHENTICATION         │
         │              │  - JWT Validation        │
         │              │  - User Context          │
         │              └──────────────┬───────────┘
         │                            │
         │                            ▼
         │              ┌──────────────────────────┐
         │              │   KEY RESOLUTION         │
         │              │  - Check user keys       │
         │              │  - Decrypt if needed     │
         │              │  - Fallback to env       │
         │              └──────────────┬───────────┘
         │                            │
         └────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   PROVIDER MANAGER           │
         │  - providerManager.js        │
         │  - Routes to provider        │
         │  - Handles fallbacks         │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   PROVIDER API CALL          │
         │  - OpenAI API                │
         │  - Anthropic API             │
         │  - Gemini API                │
         │  - Groq API                  │
         └──────────────────────────────┘
```

### Client-Side Flow (Direct Frontend → Provider)

**Current Implementation:** Some services call providers directly from frontend

**Code Example:**
```javascript
// services/ai/providerManager.js
export const getProviderConfig = () => {
  const settings = getSavedSettings(); // From localStorage
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: process.env.API_KEY, // From environment (build-time)
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      key: settings.openaiKey, // From user settings (frontend only)
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      key: settings.claudeKey, 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      key: settings.llamaKey, 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};
```

**Flow Steps:**
1. User selects provider in settings
2. Provider preference saved to `localStorage`
3. User enters API key in settings (temporary, session-only)
4. `getProviderConfig()` reads settings and key
5. Service calls provider API directly with key
6. Response returned to component

**Security Considerations:**
- Keys exist in memory during request only
- Not persisted in localStorage (only preferences)
- Direct exposure to frontend (acceptable for user-owned keys)

### Server-Side Flow (Frontend → Backend → Provider)

**Recommended Flow:** Backend mediates all provider calls for enhanced security

**Code Example:**
```javascript
// backend/src/routes/articles.routes.js
router.post('/generate', authenticateUser, async (req, res) => {
  const { prompt, provider } = req.body;
  const userId = req.user.id;
  
  // Resolve API key from database
  const apiKey = await getDecryptedApiKey(userId, provider);
  
  // Call provider service
  const result = await providerService.generate({
    provider,
    apiKey,
    prompt
  });
  
  res.json({ success: true, data: result });
});
```

**Flow Steps:**
1. Frontend sends request to backend API
2. Backend authenticates user (JWT validation)
3. Backend resolves API key from database
4. Key decrypted server-side (never sent to frontend)
5. Backend calls provider API with decrypted key
6. Response returned to frontend

**Advantages:**
- Keys never exposed to frontend
- Centralized key management
- Enhanced security and auditability
- Easier rate limiting and usage tracking

---

## Client vs Server Key Separation

### Client Keys (Frontend-Managed)

**Purpose:** User-owned API keys for direct provider access

**Characteristics:**
- Stored temporarily in component state during session
- Never persisted to database or localStorage
- Used directly from frontend to provider API
- User responsible for key security

**Use Cases:**
- Quick testing and prototyping
- User preferences for specific providers
- Development mode

**Example:**
```javascript
// User enters key in settings modal
const [openaiKey, setOpenaiKey] = useState('');

// Key used directly in API call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${openaiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ model: 'gpt-4o', messages: [...] })
});
```

### Server Keys (Backend-Managed)

**Purpose:** Platform keys and user keys stored securely

**Characteristics:**
- Encrypted at rest in database
- Decrypted only when needed (server-side)
- Never exposed to frontend
- Managed by backend services

**Storage:**
```javascript
// backend/src/services/key.service.js
export const encryptApiKey = (key) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

export const decryptApiKey = (encryptedKey) => {
  // Decrypt using stored iv and authTag
  // Implementation details...
};
```

**Usage:**
```javascript
// Backend resolves and decrypts key
const userApiKey = await prisma.apiKey.findUnique({
  where: { userId_provider: { userId, provider: 'OPENAI' } }
});

if (userApiKey) {
  const decryptedKey = decryptApiKey(userApiKey.encryptedKey);
  // Use decrypted key for API call
  // Key exists only in memory during request
}
```

---

## Dynamic Routing

### User-Level Key Assignment

**Implementation:**
```javascript
// backend/src/services/provider.service.js
export const resolveProviderKey = async (userId, provider) => {
  // 1. Check for user-specific key in database
  const userKey = await prisma.apiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase()
      }
    }
  });
  
  if (userKey && userKey.isActive) {
    return decryptApiKey(userKey.encryptedKey);
  }
  
  // 2. Fallback to platform key (Gemini only)
  if (provider === 'GEMINI') {
    return process.env.GEMINI_API_KEY;
  }
  
  // 3. No key available
  throw new Error(`API key not configured for provider: ${provider}`);
};
```

**Key Resolution Priority:**
1. User-specific key (database, encrypted)
2. Platform key (environment variable, Gemini only)
3. Error/fallback

### Tenant-Level Key Assignment (Multi-Tenant)

**Planned Implementation:**
```javascript
// Future: Tenant-level key assignment
export const resolveTenantKey = async (tenantId, provider) => {
  // 1. Check tenant-specific key
  const tenantKey = await prisma.tenantApiKey.findUnique({
    where: { tenantId_provider: { tenantId, provider } }
  });
  
  // 2. Fallback to user key
  // 3. Fallback to platform key
};
```

### Routing Logic via providerManager.js

**Current Implementation:**
```javascript
// services/ai/providerManager.js
const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  // Route based on user preference
  const configs = {
    gemini: { 
      key: process.env.API_KEY, 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    // ... other providers
  };
  
  return { id: provider, ...configs[provider] };
};
```

**Backend Routing (Planned):**
```javascript
// backend/src/services/routing.service.js
export const routeToProvider = async (userId, serviceType, preferences = {}) => {
  // 1. Determine provider based on service type
  let provider = preferences.provider;
  
  if (!provider) {
    provider = getDefaultProviderForService(serviceType);
  }
  
  // 2. Check provider availability (key exists)
  const hasKey = await hasProviderKey(userId, provider);
  
  if (!hasKey && provider !== 'GEMINI') {
    // 3. Fallback chain
    provider = getFallbackProvider(provider);
  }
  
  // 4. Load provider config
  const config = await loadProviderConfig(userId, provider);
  
  return config;
};
```

### Fallbacks

**Automatic Fallback Chain:**
```javascript
// services/geminiService.js
const callAI = async (prompt, systemPrompt, jsonMode = false) => {
  const config = getProviderConfig();
  
  try {
    // Attempt primary provider
    if (config.id === 'gemini') {
      // Gemini implementation
    } else if (['openai', 'llama'].includes(config.id)) {
      // OpenAI-compatible implementation
    } else if (config.id === 'anthropic') {
      // Anthropic implementation
    }
  } catch (error) {
    console.warn("Primary provider failed, attempting fallback to Gemini...", error);
    
    // Silent Fallback to Gemini if it's not the primary
    if (config.id !== 'gemini') {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `[FALLBACK MODE] ${prompt}`,
        config: { systemInstruction: systemPrompt }
      });
      return response.text;
    }
    throw error;
  }
};
```

**Fallback Chains by Provider:**
- **OpenAI** → Gemini → Claude → Llama
- **Gemini** → OpenAI → Claude
- **Anthropic** → Gemini → OpenAI
- **Llama** → OpenAI → Gemini

### Usage Metering

**Token Tracking:**
```javascript
// backend/src/services/usage.service.js
export const trackProviderUsage = async (userId, provider, tokens) => {
  await prisma.usageLog.create({
    data: {
      userId,
      provider,
      tokens,
      timestamp: new Date(),
      metadata: {
        model: config.model,
        operation: 'text_generation'
      }
    }
  });
};
```

**Cost Attribution:**
- User keys: Costs attributed to user (for billing)
- Platform keys: Costs tracked per user for quota enforcement

### Load Balancing

**Planned Implementation:**
```javascript
// Future: Load balancing across multiple keys
export const getProviderKeyWithLoadBalance = async (provider) => {
  const keys = await getAvailableKeys(provider);
  
  // Round-robin selection
  const selectedKey = keys[currentIndex % keys.length];
  currentIndex++;
  
  return selectedKey;
};
```

**Key Rotation:**
- Rotate keys when usage limits approached
- Distribute load across multiple keys
- Automatic failover on rate limit errors

---

## Security Practices

### Encryption

**At-Rest Encryption:**
```javascript
// backend/src/utils/encryption.js
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

export const decrypt = (encryptedData) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

**In-Transit Encryption:**
- All API calls use HTTPS/TLS
- Keys transmitted only in encrypted form
- Never logged in plaintext

### Rotation Policies

**Key Rotation Strategy:**
```javascript
// backend/src/services/key-rotation.service.js
export const rotateUserApiKey = async (userId, provider, newKey) => {
  // 1. Encrypt new key
  const encrypted = encrypt(newKey);
  
  // 2. Update database (atomic operation)
  await prisma.apiKey.update({
    where: {
      userId_provider: { userId, provider }
    },
    data: {
      encryptedKey: JSON.stringify(encrypted),
      updatedAt: new Date()
    }
  });
  
  // 3. Invalidate old key cache
  await invalidateKeyCache(userId, provider);
  
  // 4. Log rotation event
  await logKeyRotation(userId, provider);
};
```

**Rotation Triggers:**
- Manual user request
- Scheduled rotation (90 days recommended)
- Security incident response
- Key expiration detected

**Rotation Best Practices:**
- Maintain old key for 24 hours after rotation (for in-flight requests)
- Automatic cleanup of expired keys
- Notification to user on rotation

### Audit Logs

**Key Access Logging:**
```javascript
// backend/src/middleware/key-audit.middleware.js
export const logKeyAccess = async (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'API_KEY_ACCESS',
        provider: req.provider,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration: Date.now() - startTime,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          // No key values logged
          keyId: req.apiKeyId, // Opaque identifier only
          operation: req.operation
        }
      }
    });
  });
  
  next();
};
```

**Logged Events:**
- Key creation
- Key updates
- Key deletion
- Key access (with timestamp and IP)
- Key rotation
- Failed authentication attempts

**Retention Policy:**
- Access logs: 90 days
- Security events: 1 year
- Compliance logs: 7 years (if applicable)

### Token Access Scope

**Scope Definitions:**
```javascript
// Key scopes (per provider)
const KEY_SCOPES = {
  OPENAI: {
    read: ['models.list', 'files.read'],
    write: ['chat.completions', 'images.generate'],
    admin: ['keys.manage', 'usage.view']
  },
  ANTHROPIC: {
    read: ['messages.create'],
    write: ['messages.create', 'files.upload'],
    admin: ['keys.manage']
  },
  GEMINI: {
    read: ['models.generateContent'],
    write: ['models.generateContent', 'models.generateImages'],
    admin: ['keys.manage']
  }
};
```

**Scope Enforcement:**
```javascript
export const validateKeyScope = (provider, scope, operation) => {
  const requiredScope = getRequiredScope(operation);
  
  if (!hasScope(scope, requiredScope)) {
    throw new Error(`Insufficient key scope for operation: ${operation}`);
  }
};
```

**Current Implementation:**
- Most keys have full access (read + write)
- Scope limitations planned for future releases
- Enterprise customers may request restricted keys

### Revocation Flow

**Immediate Revocation:**
```javascript
// backend/src/services/key.service.js
export const revokeApiKey = async (userId, provider, reason) => {
  // 1. Mark key as inactive
  await prisma.apiKey.update({
    where: {
      userId_provider: { userId, provider }
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revocationReason: reason
    }
  });
  
  // 2. Invalidate cache
  await invalidateKeyCache(userId, provider);
  
  // 3. Notify user
  await sendRevocationEmail(userId, provider, reason);
  
  // 4. Log revocation
  await logSecurityEvent({
    type: 'KEY_REVOKED',
    userId,
    provider,
    reason
  });
};
```

**Revocation Triggers:**
- User request
- Security incident
- Suspicious activity detected
- Account suspension
- Key expiration

**Revocation Effects:**
- Immediate: Key marked inactive
- Within 1 minute: Cache invalidated
- Within 5 minutes: All in-flight requests fail gracefully
- User notified via email

---

## API Key Validation

### Syntax/Format Checks

**Provider-Specific Format Validation:**
```javascript
// backend/src/utils/key-validation.js
export const validateApiKeyFormat = (provider, key) => {
  const validators = {
    OPENAI: (k) => /^sk-[a-zA-Z0-9]{32,}$/.test(k),
    ANTHROPIC: (k) => /^sk-ant-[a-zA-Z0-9-]{95,}$/.test(k),
    GEMINI: (k) => /^[A-Za-z0-9_-]{39}$/.test(k),
    LLAMA: (k) => /^gsk_[a-zA-Z0-9]{32,}$/.test(k)
  };
  
  const validator = validators[provider.toUpperCase()];
  if (!validator) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  if (!validator(key)) {
    throw new Error(`Invalid ${provider} API key format`);
  }
  
  return true;
};
```

**Format Patterns:**
- **OpenAI:** `sk-[alphanumeric]` (32+ characters)
- **Anthropic:** `sk-ant-[alphanumeric-dash]` (95+ characters)
- **Gemini:** `[alphanumeric-underscore-dash]` (39 characters)
- **Groq/Llama:** `gsk_[alphanumeric]` (32+ characters)

### Provider-Specific Ping Endpoints

**Health Check Implementation:**
```javascript
// backend/src/services/key-validation.service.js
export const validateApiKey = async (provider, key) => {
  try {
    switch (provider.toUpperCase()) {
      case 'OPENAI':
        // Use models.list endpoint (lightweight)
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`
          }
        });
        return response.ok;
        
      case 'ANTHROPIC':
        // Use minimal message endpoint
        const anthResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return anthResponse.status !== 401;
        
      case 'GEMINI':
        // Use generateContent with minimal request
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }]
            })
          }
        );
        return geminiResponse.ok;
        
      default:
        return true; // Assume valid for unknown providers
    }
  } catch (error) {
    console.error(`Key validation error for ${provider}:`, error);
    return false;
  }
};
```

**Validation Flow:**
1. Format validation (syntax check)
2. Provider ping (live validation)
3. Store result (cache for 24 hours)
4. Return validation status

### Error Handling & Retries

**Error Categories:**
```javascript
// backend/src/utils/provider-errors.js
export const ProviderError = {
  INVALID_KEY: 'INVALID_API_KEY',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  KEY_REVOKED: 'KEY_REVOKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export const handleProviderError = (error, provider) => {
  // Map HTTP status codes to error types
  if (error.status === 401 || error.status === 403) {
    return {
      type: ProviderError.INVALID_KEY,
      message: 'API key is invalid or expired',
      shouldRetry: false,
      shouldRevoke: true
    };
  }
  
  if (error.status === 429) {
    return {
      type: ProviderError.RATE_LIMIT,
      message: 'Rate limit exceeded. Please try again later.',
      shouldRetry: true,
      retryAfter: error.headers['retry-after'] || 60
    };
  }
  
  if (error.status >= 500) {
    return {
      type: ProviderError.NETWORK_ERROR,
      message: 'Provider service unavailable',
      shouldRetry: true,
      maxRetries: 3
    };
  }
  
  return {
    type: ProviderError.UNKNOWN,
    message: error.message || 'Unknown error occurred',
    shouldRetry: false
  };
};
```

**Retry Logic:**
```javascript
// backend/src/utils/retry.js
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    exponentialBase = 2
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(exponentialBase, attempt),
        maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const finalDelay = delay + jitter;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, finalDelay));
      }
    }
  }
  
  throw lastError;
};
```

**Error Response Format:**
```javascript
// Standardized error response
{
  success: false,
  error: {
    code: 'INVALID_API_KEY',
    message: 'The provided API key is invalid or has been revoked',
    provider: 'OPENAI',
    timestamp: '2026-01-07T10:30:00Z',
    details: {
      userId: 'user_123',
      keyId: 'key_456', // Opaque identifier
      action: 'text_generation'
    },
    suggestions: [
      'Verify the API key is correct',
      'Check if the key has been revoked',
      'Ensure the key has sufficient permissions'
    ]
  }
}
```

---

## Code Examples

### Frontend: Provider Configuration

```javascript
// services/ai/providerManager.js
const getSavedSettings = () => {
  const saved = localStorage.getItem('finity_settings');
  return saved ? JSON.parse(saved) : { provider: 'gemini' };
};

export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: process.env.API_KEY, 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      key: settings.openaiKey, 
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      key: settings.claudeKey, 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      key: settings.llamaKey, 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};
```

### Backend: Key Resolution

```javascript
// backend/src/services/key.service.js
export const getDecryptedApiKey = async (userId, provider) => {
  // 1. Check database for user key
  const userKey = await prisma.apiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase()
      }
    }
  });
  
  if (userKey && userKey.isActive) {
    // 2. Decrypt key
    const encryptedData = JSON.parse(userKey.encryptedKey);
    const decrypted = decrypt(encryptedData);
    
    // 3. Validate key format
    validateApiKeyFormat(provider, decrypted);
    
    return decrypted;
  }
  
  // 4. Fallback to platform key (Gemini only)
  if (provider === 'GEMINI') {
    return process.env.GEMINI_API_KEY;
  }
  
  throw new Error(`API key not configured for provider: ${provider}`);
};
```

### Backend: Key Storage

```javascript
// backend/src/routes/settings.routes.js
router.post('/api-keys', authenticateUser, async (req, res) => {
  const { provider, apiKey } = req.body;
  const userId = req.user.id;
  
  try {
    // 1. Validate format
    validateApiKeyFormat(provider, apiKey);
    
    // 2. Validate with provider (optional but recommended)
    const isValid = await validateApiKey(provider, apiKey);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_API_KEY', message: 'API key validation failed' }
      });
    }
    
    // 3. Encrypt key
    const encrypted = encrypt(apiKey);
    
    // 4. Store in database
    await prisma.apiKey.upsert({
      where: {
        userId_provider: { userId, provider: provider.toUpperCase() }
      },
      create: {
        userId,
        provider: provider.toUpperCase(),
        encryptedKey: JSON.stringify(encrypted),
        isActive: true
      },
      update: {
        encryptedKey: JSON.stringify(encrypted),
        isActive: true,
        updatedAt: new Date()
      }
    });
    
    // 5. Log key update
    await logSecurityEvent({
      type: 'API_KEY_UPDATED',
      userId,
      provider
    });
    
    res.json({ success: true, message: 'API key stored successfully' });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'STORAGE_ERROR', message: error.message }
    });
  }
});
```

---

## Related Documentation

- **[AI Agent Extension](../planning/ai-agent-extension.md)** - Extending the AI agent with new providers and capabilities
- **[AI Service Flow](../planning/ai-service-flow.md)** - Complete lifecycle of AI service calls from request to response
- **[Backend Architecture](../architecture/backend-architecture.md)** - Overall backend system architecture and services
- **[Token Economy](../planning/token-economy.md)** - Token-based billing and usage tracking system

---

**Last Updated:** 2026-01-07  
**Status:** Draft  
**Maintainer:** Nova‑XFinity Security & Engineering Teams
