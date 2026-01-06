# Quick Start Guide - Authentication Audit

## Running the Diagnostic Script

### Prerequisites
1. Backend dependencies installed: `cd finity-auth-starter/backend && pip install -r requirements.txt`
2. Database running (PostgreSQL)
3. `.env` file configured in `finity-auth-starter/` directory

### Run Diagnostic Script

```bash
cd finity-auth-starter/backend
python ../.cursor/diagnostics/run_audit.py
```

The script will automatically check:
- ✅ Environment variables
- ✅ Database connection
- ✅ Admin user existence
- ✅ All users in database
- ✅ OAuth configuration
- ✅ OAuth callback URLs

## Manual Database Checks

### Using psql
```bash
# Connect to database
psql -h localhost -p 5433 -U postgres -d finity_auth

# Run diagnostic queries
\i .cursor/diagnostics/check_database.sql
```

### Using Docker
```bash
# If using docker-compose
docker exec -it finity-auth-postgres psql -U postgres -d finity_auth

# Then run queries from check_database.sql
```

## Quick Test Commands

### Test Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ogcnewfinity@gmail.com","password":"FiniTy-2026-Data.CoM"}'
```

### Test OAuth Initiation
```bash
# Google
curl http://localhost:8000/api/auth/social/google

# Discord
curl http://localhost:8000/api/auth/social/discord

# Twitter
curl http://localhost:8000/api/auth/social/twitter
```

**Expected:** All should return `{"authorization_url": "https://..."}`

## Common Issues

### Issue: OAuth returns 500 error
**Solution:** Check if CLIENT_ID and CLIENT_SECRET are set in `.env`

### Issue: Admin user not found
**Solution:** 
1. Check if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are in `.env`
2. Restart backend server (admin is created on startup)
3. Check database directly with SQL queries

### Issue: Database connection fails
**Solution:**
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env` matches your setup
3. For Docker: `docker-compose up -d postgres`

## OAuth Callback URLs to Register

Make sure these URLs are registered in your OAuth provider dashboards:

- **Google:** `http://localhost:8000/api/auth/social/google/callback`
- **Discord:** `http://localhost:8000/api/auth/social/discord/callback`
- **Twitter:** `http://localhost:8000/api/auth/social/twitter/callback`

**Note:** For production, replace `localhost:8000` with your actual backend URL.
