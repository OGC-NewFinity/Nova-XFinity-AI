# 🔐 Authentication System Testing Checklist

## Pre-Testing Setup

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Database connected and accessible
- [ ] SMTP credentials configured (for email testing)
- [ ] OAuth credentials configured (for OAuth testing)
- [ ] Browser console open (F12) to monitor errors
- [ ] Network tab open to monitor API calls

---

## STEP 1: Email/Password Registration Flow

### Test Case 1.1: Successful Registration
- [ ] Navigate to `http://localhost:3000/register`
- [ ] Fill in registration form:
  - Email: `testuser@demo.local`
  - Username: `testuser` (optional)
  - Full Name: `Test User` (optional)
  - Password: `TestPassword123!`
  - Confirm Password: `TestPassword123!`
  - Check "Agree to terms" checkbox
- [ ] Click "Create Account"
- [ ] Verify: Redirects to `/verify-email` page
- [ ] Check backend logs: `📧 [Email Service] Email sent successfully...`
- [ ] Check email inbox (Mailtrap/test SMTP)
- [ ] Verify: Welcome email received with verification link

### Test Case 1.2: Email Verification
- [ ] Click verification link in email
- [ ] Verify: Redirects to `/verify-email?token=...`
- [ ] Verify: Success message displayed
- [ ] Verify: Auto-redirects to `/login` after 2 seconds
- [ ] Check database: `is_verified = true` for user

### Test Case 1.3: Login After Verification
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter credentials:
  - Email: `testuser@demo.local`
  - Password: `TestPassword123!`
- [ ] Click "Sign In"
- [ ] Verify: Redirects to `/profile`
- [ ] Verify: User info displayed correctly
- [ ] Check browser cookies: `access_token` and `refresh_token` present
- [ ] Check Network tab: No CORS errors

### Test Case 1.4: Duplicate Email Registration
- [ ] Try to register with `testuser@demo.local` again
- [ ] Verify: Error message "Email already registered"
- [ ] Verify: HTTP status 400

### Test Case 1.5: Invalid Registration Data
- [ ] Try registration without agreeing to terms
- [ ] Verify: Error message about terms agreement
- [ ] Try registration with mismatched passwords
- [ ] Verify: Error message "Passwords do not match"
- [ ] Try registration with password < 8 characters
- [ ] Verify: Error message about password length

---

## STEP 2: OAuth Flow (Google)

### Test Case 2.1: Google OAuth Login
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Click "Login with Google" button
- [ ] Verify: Redirects to Google OAuth consent screen
- [ ] Approve access
- [ ] Verify: Redirects back to frontend with `?tokens=...`
- [ ] Verify: Tokens stored in cookies
- [ ] Verify: Auto-redirects to `/profile`
- [ ] Check database:
  - [ ] User created with email from Google
  - [ ] `is_verified = true`
  - [ ] `role = "user"`
  - [ ] OAuth connection recorded in `oauth_connections` table

### Test Case 2.2: Google OAuth Re-login
- [ ] Logout
- [ ] Click "Login with Google" again
- [ ] Verify: Links to existing user (doesn't create duplicate)
- [ ] Verify: OAuth connection updated

---

## STEP 3: OAuth Flow (Discord)

### Test Case 3.1: Discord OAuth Login
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Click "Login with Discord" button
- [ ] Verify: Redirects to Discord OAuth consent screen
- [ ] Approve access
- [ ] Verify: Redirects back to frontend with `?tokens=...`
- [ ] Verify: Tokens stored in cookies
- [ ] Verify: Auto-redirects to `/profile`
- [ ] Check database:
  - [ ] User created with email from Discord
  - [ ] `is_verified = true`
  - [ ] `role = "user"`
  - [ ] OAuth connection recorded

### Test Case 3.2: Discord OAuth Re-login
- [ ] Logout
- [ ] Click "Login with Discord" again
- [ ] Verify: Links to existing user
- [ ] Verify: OAuth connection updated

---

## STEP 4: Password Reset Flow

### Test Case 4.1: Request Password Reset
- [ ] Navigate to `http://localhost:3000/forgot-password`
- [ ] Enter email: `testuser@demo.local`
- [ ] Click "Send Reset Link"
- [ ] Verify: Success message displayed
- [ ] Check backend logs: Email sent confirmation
- [ ] Check email inbox: Password reset email received

### Test Case 4.2: Reset Password
- [ ] Click reset link in email
- [ ] Verify: Redirects to `/reset-password?token=...`
- [ ] Enter new password: `NewPassword123!`
- [ ] Confirm password: `NewPassword123!`
- [ ] Click "Reset Password"
- [ ] Verify: Success message displayed
- [ ] Verify: Auto-redirects to `/login`

### Test Case 4.3: Login with New Password
- [ ] Login with:
  - Email: `testuser@demo.local`
  - Password: `NewPassword123!`
- [ ] Verify: Login successful
- [ ] Verify: Old password no longer works

### Test Case 4.4: Invalid Reset Token
- [ ] Try to access `/reset-password?token=invalid_token`
- [ ] Verify: Error message displayed
- [ ] Try expired token (wait 1+ hour)
- [ ] Verify: Error message about expired token

---

## STEP 5: JWT Token Behavior

### Test Case 5.1: Token Storage
- [ ] Login successfully
- [ ] Check browser cookies:
  - [ ] `access_token` present
  - [ ] `refresh_token` present
  - [ ] Both have 7-day expiration

### Test Case 5.2: Token Persistence
- [ ] Login successfully
- [ ] Reload page (F5)
- [ ] Verify: Still logged in
- [ ] Verify: User info loaded from `/api/users/me`

### Test Case 5.3: Token Refresh
- [ ] Login successfully
- [ ] Wait for access token to expire (or manually expire it)
- [ ] Make API call (e.g., navigate to profile)
- [ ] Verify: Token automatically refreshed
- [ ] Check Network tab: Refresh token endpoint called
- [ ] Verify: New tokens stored in cookies

### Test Case 5.4: Expired Refresh Token
- [ ] Login successfully
- [ ] Manually expire refresh token in cookies
- [ ] Make API call
- [ ] Verify: Redirects to `/login`
- [ ] Verify: Tokens cleared from cookies

### Test Case 5.5: Token Validation
- [ ] Call `/api/users/me` with valid token
- [ ] Verify: Returns 200 with user data
- [ ] Call `/api/users/me` with invalid token
- [ ] Verify: Returns 401 Unauthorized
- [ ] Call `/api/users/me` without token
- [ ] Verify: Returns 401 Unauthorized

---

## STEP 6: Role & Access Checks

### Test Case 6.1: Admin Access
- [ ] Login as admin: `admin@finity.local`
- [ ] Access `/api/users/admin/users`
- [ ] Verify: Returns 200 with list of users
- [ ] Access `/api/users/admin/stats`
- [ ] Verify: Returns 200 with statistics
- [ ] Call `/api/users/me`
- [ ] Verify: `role = "admin"`

### Test Case 6.2: Regular User Access
- [ ] Login as regular user: `testuser@demo.local`
- [ ] Access `/api/users/admin/users`
- [ ] Verify: Returns 403 Forbidden
- [ ] Access `/api/users/admin/stats`
- [ ] Verify: Returns 403 Forbidden
- [ ] Call `/api/users/me`
- [ ] Verify: `role = "user"`

---

## STEP 7: Error Handling

### Test Case 7.1: Registration Errors
- [ ] Register with existing email
- [ ] Verify: 400 Bad Request, "Email already registered"
- [ ] Register with existing username
- [ ] Verify: 400 Bad Request, "Username already taken"
- [ ] Register without agreeing to terms
- [ ] Verify: 400 Bad Request, terms agreement message

### Test Case 7.2: Login Errors
- [ ] Login with wrong password
- [ ] Verify: 401 Unauthorized, "Incorrect email or password"
- [ ] Login with non-existent email
- [ ] Verify: 401 Unauthorized, "Incorrect email or password"
- [ ] Login with inactive user (if you can create one)
- [ ] Verify: 403 Forbidden, "User account is inactive"

### Test Case 7.3: Token Errors
- [ ] Access protected route without token
- [ ] Verify: 401 Unauthorized
- [ ] Access protected route with invalid token
- [ ] Verify: 401 Unauthorized
- [ ] Use expired verification token
- [ ] Verify: 400 Bad Request, "Invalid or expired verification token"
- [ ] Use expired reset token
- [ ] Verify: 400 Bad Request, "Invalid or expired reset token"

### Test Case 7.4: OAuth Errors
- [ ] Try OAuth with invalid provider
- [ ] Verify: Error message displayed
- [ ] Cancel OAuth approval
- [ ] Verify: Redirects with error parameter
- [ ] Test with invalid OAuth credentials
- [ ] Verify: Appropriate error handling

### Test Case 7.5: Access Control Errors
- [ ] Access admin route with regular user token
- [ ] Verify: 403 Forbidden, "Access denied. Admin role required."

---

## STEP 8: Security Checks

### Test Case 8.1: Password Security
- [ ] Verify passwords are hashed in database (not plain text)
- [ ] Verify password verification uses bcrypt
- [ ] Test password strength requirements

### Test Case 8.2: Token Security
- [ ] Verify JWT secret is not exposed in frontend
- [ ] Verify tokens are stored in httpOnly cookies (if implemented)
- [ ] Verify token expiration times are correct

### Test Case 8.3: CORS Security
- [ ] Verify CORS is properly configured
- [ ] Test from different origin (should be blocked)
- [ ] Verify credentials are included in requests

---

## Final Verification

- [ ] All test cases passed
- [ ] No console errors
- [ ] No CORS errors
- [ ] All API calls return expected status codes
- [ ] Database records are correct
- [ ] Email delivery working
- [ ] OAuth flows working (if credentials configured)
- [ ] Admin user created on startup
- [ ] Role-based access working

---

## Notes

- Mark each test case as ✅ Pass or ❌ Fail
- Document any issues found
- Take screenshots of errors if needed
- Update test report JSON with results
