# OAuth Route Finalization Audit — Google & Discord (FastAPI)

**Scope:** Read-only audit of the FastAPI OAuth routes for `/auth/google` and `/auth/discord` (implemented via `/auth/{provider}`), including callback exchange, user match/create, and token/session compatibility with the React frontend and the Node.js backend.  
**Audited files:** `backend-auth/oauth.py`, `backend-auth/app.py`, `backend-auth/users.py`, `backend-auth/schemas.py`, `backend-auth/email_service.py`, `docs/troubleshooting/OAUTH_FIXES_MASTER_LOG.md`, `env.example`.  
**Note:** `.env` could not be inspected in this workspace (filtered by ignore rules), so **runtime configuration values were not verified**, only how they are read/used.

---

## Executive Summary

- **Google OAuth**: ⚠️
- **Discord OAuth**: ⚠️

Both providers are **functionally implemented** (redirect → callback → code exchange → fetch user identity/email → link/create user → mint JWT → return to frontend), and the token format is **compatible** with the React frontend and Node backend as currently written.  
The main gaps are **security hardening** (missing `state` validation / CSRF protection, token-in-URL handling, redirect URI source-of-truth behind proxies) and **scope explicitness** (ensuring email scope is requested consistently).

---

## Provider Checks

### Google — ⚠️

- **Redirect initiation works (✅)**  
  - Implemented by `GET /auth/{provider}`; for Google this is `GET /auth/google`.  
  - Redirect URI computed as `.../auth/google/callback` and passed to `get_authorization_url()`.
- **Callback exchanges code for token (✅)**  
  - `GET /auth/google/callback` exchanges `code` via `get_access_token(code, redirect_uri)`.
- **User match/create (✅)**  
  - Attempts `get_by_oauth_account("google", user_id)` → else `get_by_email(email)` and links OAuth account → else creates user and links OAuth account.
- **Session/token return compatible (⚠️)**  
  - Generates a FastAPI Users JWT and redirects to frontend as `FRONTEND_URL/login?tokens=<JWT>`.
  - Works with current frontend logic, but **token is transported in the URL** (see risks below).

**Primary issues / risks**
- **⚠️ No `state` validation (CSRF protection)** in OAuth authorize/callback flow.
- **⚠️ Token is returned via query string** (`?tokens=...`) and also logged in server logs (`token_url` is printed), which increases leak risk (browser history, referrer headers, logs, monitoring, screenshots).
- **⚠️ Redirect URI derived from `request.base_url`**; can be incorrect behind reverse proxies unless proxy headers are handled consistently.
- **⚠️ Scopes are not explicitly declared**; email retrieval depends on provider defaults/library behavior.

---

### Discord — ⚠️

Same implementation path and issues as Google, via:
- `GET /auth/discord` → provider redirect
- `GET /auth/discord/callback` → code exchange → `get_id_email(access_token)` → match/link/create → JWT → redirect to frontend

**Primary issues / risks**
- **⚠️ No `state` validation (CSRF protection)**.
- **⚠️ Token returned in query string + token URL logged**.
- **⚠️ Redirect URI derived from `request.base_url`** (proxy concerns).
- **⚠️ Scopes not explicit**; Discord email requires `email` scope (commonly paired with `identify`).

---

## Flow Verification (What the code does today)

### 1) Provider redirect initiation
- Endpoint: `GET /auth/{provider}` (covers `/auth/google` and `/auth/discord`)
- Behavior:
  - Validates provider configured in `oauth_clients`
  - Computes redirect URI as `BASE_URL/auth/{provider}/callback`
  - Generates provider authorization URL via `httpx-oauth`
  - Responds with `302` redirect to the provider consent/auth page

### 2) Callback handler: code → access token → user identity
- Endpoint: `GET /auth/{provider}/callback`
- Behavior:
  - Checks `error` and `code` query params
  - Exchanges `code` for an access token
  - Fetches `(user_id, user_email)` via `get_id_email(access_token)`

### 3) User lookup / creation
Order:
1. Lookup by OAuth account: `(provider, user_id)`
2. Else lookup by email; if found, link OAuth account to existing user
3. Else create a new user (with random password, password validation skipped), mark verified, and link OAuth account

### 4) Token issuance and return to frontend
- Token: FastAPI Users JWT (created by `JWTStrategy(secret=SECRET, lifetime_seconds=...)`)
- Returned to frontend by redirect:
  - `FRONTEND_URL/login?tokens=<JWT>`

---

## Token/Session Compatibility

### React frontend compatibility (✅)
Current frontend expects OAuth callback to land on `/login` with `tokens` query parameter:
- Reads `tokens` from `window.location.search`
- Stores it to `access_token` cookie using `js-cookie`
- Calls `/users/me` with `Authorization: Bearer <token>` via Axios interceptor

**Example returned URL (current behavior):**
- `http://localhost:3000/login?tokens=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Example cookie set by frontend:**
- `access_token=<JWT>; Path=/; SameSite=Lax;`

### Node.js backend compatibility (✅, with an important configuration requirement)
The Node backend middleware (`backend/src/middleware/auth.middleware.js`) validates:
- Cookie: `req.cookies.access_token`
- Secret: `process.env.SECRET`

**Compatibility requirement:** The Node backend must use the **same `SECRET` value** as the FastAPI auth service, otherwise `jwt.verify()` will fail.

---

## Env Var Usage & “No Hardcoded Secrets” Check

### OAuth credentials (✅ no hardcoded secrets)
Read from environment:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`

Credentials are only considered configured if present **and non-empty after `.strip()`**, which prevents accidental empty-string configuration.

### Redirects / URLs (⚠️ needs operational confirmation)
- `FRONTEND_URL` defaults to `http://localhost:3000` if not set.
- OAuth callback redirect URIs are derived from `request.base_url`, not from a fixed env var.

### `.env` validation (⚠️ cannot verify actual values here)
`.env` could not be read in this workspace. Confirm in your deployment environment that:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` are set
- `FRONTEND_URL` is set correctly
- `SECRET` is set to a strong random value and **shared** with Node backend (if Node needs to validate the same JWT)

---

## Recommendations (Final Fixes / Confirmations)

### Must-do security hardening (recommended) — applies to both Google & Discord
- **Add and validate OAuth `state`**:
  - Generate a cryptographically strong `state` per login attempt
  - Store it server-side (signed cookie / server session / cache) and validate it in callback
  - Reject callback if state is missing/mismatched
- **Stop returning JWT in a query parameter**:
  - Prefer setting a cookie from the backend (ideally `HttpOnly`, `Secure`, `SameSite=Lax/Strict` depending on flow), or
  - Return token in the URL fragment (`#token=...`) to reduce referrer leakage, or
  - Implement a short-lived one-time code exchanged by the frontend for a token (backend-to-backend secure exchange)
- **Do not log token-bearing URLs**:
  - Remove/avoid printing `token_url` (or scrub tokens from logs).

### Robustness improvements (recommended)
- **Make redirect URI a source-of-truth**:
  - In production behind a proxy, ensure the app uses forwarded headers (or set a fixed external base URL env var) so `request.base_url` matches registered redirect URIs.
- **Explicit scopes**:
  - Ensure Google requests at least: `openid`, `email`, `profile`
  - Ensure Discord requests at least: `identify`, `email`
- **Return consistent error codes**:
  - Today, some failures redirect to `/login?error=...` and one path returns JSON error (`provider not configured` on `/auth/{provider}`).
  - Consider consistently redirecting to frontend with a structured error indicator.

---

## Final Status

- **Google**: ⚠️ (Implemented and likely functional; needs `state` validation + safer token return/logging + explicit scopes + proxy-safe redirect URI strategy)
- **Discord**: ⚠️ (Same as Google)

