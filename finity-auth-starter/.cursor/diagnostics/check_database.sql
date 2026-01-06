-- Database Diagnostic Queries for Task 8
-- Run these queries in your PostgreSQL database to verify user setup

-- 1. Check all users
SELECT 
    id,
    email,
    username,
    role,
    is_verified,
    is_active,
    CASE 
        WHEN hashed_password IS NULL THEN 'OAuth Only'
        ELSE 'Password Set'
    END as auth_type,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Check admin user specifically
SELECT 
    id,
    email,
    username,
    role,
    is_verified,
    is_active,
    CASE 
        WHEN hashed_password IS NULL THEN 'OAuth Only'
        ELSE 'Password Set'
    END as auth_type,
    created_at,
    updated_at
FROM users
WHERE role = 'admin';

-- 3. Check users by email (for admin email from .env)
SELECT 
    id,
    email,
    role,
    is_verified,
    is_active
FROM users
WHERE email = 'ogcnewfinity@gmail.com';

-- 4. Count users by role
SELECT 
    role,
    COUNT(*) as count,
    SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified_count,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count
FROM users
GROUP BY role;

-- 5. Check OAuth connections
SELECT 
    oc.id,
    u.email,
    oc.provider,
    oc.provider_user_id,
    oc.created_at
FROM oauth_connections oc
JOIN users u ON oc.user_id = u.id
ORDER BY oc.created_at DESC;

-- 6. Check email verification tokens (active)
SELECT 
    t.id,
    u.email,
    t.token_type,
    t.is_used,
    t.expires_at,
    CASE 
        WHEN t.expires_at > NOW() THEN 'Valid'
        ELSE 'Expired'
    END as status
FROM tokens t
JOIN users u ON t.user_id = u.id
WHERE t.token_type = 'email_verification'
  AND t.is_used = false
ORDER BY t.expires_at DESC;

-- 7. Check password reset tokens (active)
SELECT 
    t.id,
    u.email,
    t.token_type,
    t.is_used,
    t.expires_at,
    CASE 
        WHEN t.expires_at > NOW() THEN 'Valid'
        ELSE 'Expired'
    END as status
FROM tokens t
JOIN users u ON t.user_id = u.id
WHERE t.token_type = 'password_reset'
  AND t.is_used = false
ORDER BY t.expires_at DESC;
