# Database Design

## Overview

The application uses PostgreSQL as the primary database, managed through Docker. The database schema is defined using Prisma ORM, providing type safety and migration management.

## Docker Setup

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: finity-postgres
    environment:
      POSTGRES_USER: finity
      POSTGRES_PASSWORD: finity_password
      POSTGRES_DB: finity_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - finity-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: finity-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@finity.ai
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - finity-network

  redis:
    image: redis:7-alpine
    container_name: finity-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - finity-network

volumes:
  postgres_data:
  redis_data:

networks:
  finity-network:
    driver: bridge
```

### Connection Strings

**Development:**
```
DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db?schema=public
REDIS_URL=redis://localhost:6379
```

**Production:**
Use environment variables for secure connection strings.

## Database Schema

### Prisma Schema Overview

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Tables

### 1. Users Table

**Purpose:** Store user accounts and authentication data

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String?
  emailVerified Boolean   @default(false) @map("email_verified")
  emailToken    String?   @map("email_token")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  articles      Article[]
  drafts        Draft[]
  apiKeys       ApiKey[]
  settings      Settings?
  researchQueries ResearchQuery[]
  mediaAssets   MediaAsset[]
  
  @@map("users")
}
```

**Indexes:**
- `email` - Unique index
- `emailToken` - Index for verification lookups

### 2. Articles Table

**Purpose:** Store generated articles

```prisma
model Article {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  title           String
  slug            String   @unique
  seoTitle        String?  @map("seo_title")
  metaDescription String?  @map("meta_description")
  focusKeyphrase  String?  @map("focus_keyphrase")
  content         String   @db.Text
  htmlContent     String   @db.Text @map("html_content")
  status          ArticleStatus @default(DRAFT)
  wordCount       Int      @default(0) @map("word_count")
  publishedAt     DateTime? @map("published_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mediaAssets     MediaAsset[]
  
  @@index([userId])
  @@index([slug])
  @@index([status])
  @@map("articles")
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 3. Drafts Table

**Purpose:** Store article drafts and autosave data

```prisma
model Draft {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String
  config      Json     // Article configuration (topic, keywords, etc.)
  metadata    Json?    // Generated metadata
  sections    Json     // Article sections
  ctaContent  String?  @db.Text @map("cta_content")
  autosave    Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([updatedAt])
  @@map("drafts")
}
```

### 4. API Keys Table

**Purpose:** Store encrypted user API keys for AI providers

```prisma
model ApiKey {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  provider    Provider
  encryptedKey String  @map("encrypted_key") @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relations
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

**Security:** API keys are encrypted at rest using AES-256-GCM encryption.

### 5. Media Assets Table

**Purpose:** Store generated media (images, videos, audio)

```prisma
model MediaAsset {
  id          String      @id @default(uuid())
  userId      String      @map("user_id")
  articleId   String?     @map("article_id")
  type        MediaType
  provider    Provider
  prompt      String      @db.Text
  style       String?
  aspectRatio String?     @map("aspect_ratio")
  url         String?     // CDN URL or storage path
  metadata    Json?       // Additional metadata
  createdAt   DateTime    @default(now()) @map("created_at")
  
  // Relations
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  article     Article?    @relation(fields: [articleId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([articleId])
  @@index([type])
  @@map("media_assets")
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
}
```

### 6. Research Queries Table

**Purpose:** Store research query history and results

```prisma
model ResearchQuery {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  query       String   @db.Text
  summary     String?  @db.Text
  sources     Json?    // Array of source objects
  cached      Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@map("research_queries")
}
```

### 7. Settings Table

**Purpose:** Store user preferences and configuration

```prisma
model Settings {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  defaultProvider Provider @default(GEMINI) @map("default_provider")
  focusKeyphrase  String?  @map("focus_keyphrase")
  preferences     Json     @default("{}") // UI preferences, notifications, etc.
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("settings")
}
```

## Relationships Diagram

```
User (1) ──┐
           │
           ├── (N) Articles
           ├── (N) Drafts
           ├── (N) ApiKeys
           ├── (1) Settings
           ├── (N) ResearchQueries
           └── (N) MediaAssets

Article (1) ──┐
              │
              └── (N) MediaAssets
```

## Migrations

### Creating Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

### Migration Best Practices

1. Always create migrations for schema changes
2. Test migrations on development first
3. Backup database before production migrations
4. Use descriptive migration names
5. Review generated SQL before applying

## Indexes

### Performance Indexes

**Users:**
- `email` (unique)
- `emailToken` (for verification lookups)

**Articles:**
- `userId` (foreign key)
- `slug` (unique, lookup)
- `status` (filtering)

**Drafts:**
- `userId` (foreign key)
- `updatedAt` (sorting)

**Media Assets:**
- `userId` (foreign key)
- `articleId` (foreign key)
- `type` (filtering)

**Research Queries:**
- `userId` (foreign key)
- `createdAt` (sorting)

## Query Optimization

### Best Practices

1. **Use Indexes:** Ensure foreign keys and frequently queried fields are indexed
2. **Limit Results:** Use pagination for large datasets
3. **Select Specific Fields:** Avoid `SELECT *`
4. **Use Joins Efficiently:** Include only necessary relations
5. **Batch Operations:** Use transactions for multiple related operations

### Example Optimized Queries

```typescript
// Good: Specific fields, indexed lookup
const article = await prisma.article.findUnique({
  where: { slug },
  select: {
    id: true,
    title: true,
    content: true,
    user: {
      select: { name: true }
    }
  }
});

// Good: Pagination
const articles = await prisma.article.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

## Data Seeding

### Seed Script

Create `prisma/seed.ts` for development data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed development data
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with: `npx prisma db seed`

## Backup Strategy

### Development
- Regular exports to SQL files
- Docker volume backups

### Production
- Automated daily backups
- Point-in-time recovery
- Offsite backup storage
- Regular restore tests

## Connection Pooling

**Prisma Connection Pool:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

**Recommended Settings:**
- Connection limit: 10-20 connections
- Pool timeout: 20 seconds
- Idle timeout: 10 minutes

## Next Steps

- Review [Backend Architecture](backend.md) for Prisma integration
- Check [Setup Guide](../development/setup.md) for Docker setup instructions
- See [API Documentation](api.md) for database query patterns
