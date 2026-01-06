# API Documentation

## Base URL

**Development:** `http://localhost:3001/api`  
**Production:** `https://api.finity.ai/api`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "access_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newPassword123"
}
```

## Article Endpoints

### List Articles
```http
GET /api/articles?page=1&limit=10&status=published
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)
- `status` (optional: draft, published, archived)

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get Article
```http
GET /api/articles/:id
Authorization: Bearer <token>
```

### Create Article
```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Article Title",
  "topic": "Article Topic",
  "keywords": ["keyword1", "keyword2"],
  "config": {
    "articleType": "How-to guide",
    "articleSize": "Medium",
    "tone": "Professional"
  }
}
```

### Update Article
```http
PUT /api/articles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

### Delete Article
```http
DELETE /api/articles/:id
Authorization: Bearer <token>
```

### Publish to WordPress
```http
POST /api/articles/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "wordpressUrl": "https://yoursite.com",
  "username": "wp_username",
  "password": "wp_app_password"
}
```

## Draft Endpoints

### List Drafts
```http
GET /api/drafts?page=1&limit=10
Authorization: Bearer <token>
```

### Get Draft
```http
GET /api/drafts/:id
Authorization: Bearer <token>
```

### Save Draft
```http
POST /api/drafts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Draft Title",
  "config": { ... },
  "metadata": { ... },
  "sections": [ ... ],
  "ctaContent": "..."
}
```

### Update Draft
```http
PUT /api/drafts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "sections": [ ... ]
}
```

### Delete Draft
```http
DELETE /api/drafts/:id
Authorization: Bearer <token>
```

## Media Endpoints

### Generate Image
```http
POST /api/media/images
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Description of image",
  "style": "Photorealistic",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media_id",
    "url": "https://cdn.example.com/image.png",
    "type": "image"
  }
}
```

### Generate Video
```http
POST /api/media/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Description of video",
  "style": "Cinematic",
  "aspectRatio": "16:9",
  "duration": "9s",
  "resolution": "720p"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media_id",
    "url": "https://cdn.example.com/video.mp4",
    "type": "video",
    "status": "processing"
  }
}
```

**Note:** Video generation is async. Check status via GET endpoint.

### Generate Audio
```http
POST /api/media/audio
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "voice": "Kore"
}
```

### Get Media Asset
```http
GET /api/media/:id
Authorization: Bearer <token>
```

## Research Endpoints

### Execute Research Query
```http
POST /api/research/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Latest statistics about AI in 2024"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "query_id",
    "summary": "Research summary...",
    "sources": [
      {
        "title": "Source Title",
        "uri": "https://example.com/article"
      }
    ]
  }
}
```

### Get Research History
```http
GET /api/research/history?page=1&limit=10
Authorization: Bearer <token>
```

## Settings Endpoints

### Get User Settings
```http
GET /api/settings
Authorization: Bearer <token>
```

### Update Settings
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "defaultProvider": "gemini",
  "focusKeyphrase": "SEO optimization",
  "preferences": {
    "notifications": true,
    "theme": "dark"
  }
}
```

### Store API Keys
```http
POST /api/settings/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "openai",
  "apiKey": "sk-..."
}
```

**Security:** API keys are encrypted before storage.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_PROVIDER_ERROR` | 502 | AI service error |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Rate limits are applied per endpoint:

- **Auth endpoints:** 5 requests per minute
- **Article endpoints:** 30 requests per minute
- **Media endpoints:** 10 requests per minute
- **Research endpoints:** 20 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1609459200
```

## Webhooks (Future)

Webhook endpoints for async operations:

- `POST /api/webhooks/article-generated` - Article generation complete
- `POST /api/webhooks/video-ready` - Video generation complete

## SDK Examples

### JavaScript/TypeScript

```javascript
import { FinityAPI } from '@finity/api-client';

const api = new FinityAPI({
  baseURL: 'https://api.finity.ai',
  token: 'your_access_token'
});

// Create article
const article = await api.articles.create({
  title: 'My Article',
  topic: 'AI Writing',
  keywords: ['ai', 'writing']
});
```

### cURL Examples

```bash
# Login
curl -X POST https://api.finity.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create article
curl -X POST https://api.finity.ai/api/articles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Article","topic":"AI"}'
```

## Next Steps

- Review [Backend Architecture](backend.md) for implementation details
- Check [Authentication Integration](../integrations/authentication.md) for auth setup
- See [Setup Guide](../development/setup.md) for API testing
