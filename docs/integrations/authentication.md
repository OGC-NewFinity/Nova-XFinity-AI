# Authentication System Integration

## Overview

The Finity AI SEO Article Writer uses JWT-based authentication with refresh tokens. This document describes the authentication system and how to integrate it.

## Architecture

### Authentication Flow

```
User Login → Backend validates → Generate JWT tokens → Return to client
                ↓
         Store refresh token (httpOnly cookie)
         Return access token (localStorage)
                ↓
    Client uses access token for API requests
                ↓
    Access token expires → Use refresh token → Get new access token
```

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Stored in localStorage
   - Included in Authorization header
   - Contains user ID and permissions

2. **Refresh Token**
   - Long-lived (7 days)
   - Stored in httpOnly cookie
   - Used to get new access tokens
   - Can be revoked

## Backend Implementation

### JWT Configuration

```javascript
// backend/src/config/jwt.js
export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d'
  }
};
```

### Authentication Middleware

```javascript
// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Login Endpoint

```javascript
// backend/src/controllers/auth.controller.js
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  const user = await validateCredentials(email, password);
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.json({
    success: true,
    data: {
      user,
      token: accessToken
    }
  });
};
```

## Frontend Integration

### Auth Context

```javascript
// src/core/auth/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and load user
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.data.token);
    setUser(response.data.user);
    return response.data;
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    api.post('/auth/logout');
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Auth Hook

```javascript
// src/core/auth/useAuth.js
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Protected Route

```javascript
// src/shared/components/ProtectedRoute.js
import { useAuth } from '../../core/auth/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

## Open-Source Templates

### Recommended Resources

1. **React Auth Template**
   - Repository: https://github.com/arifszn/react-auth-template
   - Features: Login, Register, Forgot Password
   - Tech: React, React Router, Axios

2. **NextAuth.js**
   - Website: https://next-auth.js.org/
   - For Next.js applications
   - Multiple provider support

3. **Supabase Auth UI**
   - Repository: https://github.com/supabase/auth-ui
   - Pre-built auth components
   - Multiple providers

### Integration Example

Using React Auth Template structure:

```javascript
// src/features/auth/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/useAuth';
import { Button3D } from '../../../shared/components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (err) {
      setError(err.message);
    }
  };
  
  return html`
    <form onSubmit=${handleSubmit} className="login-form">
      <Input3D
        type="email"
        label="Email"
        value=${email}
        onChange=${e => setEmail(e.target.value)}
        required
      />
      <Input3D
        type="password"
        label="Password"
        value=${password}
        onChange=${e => setPassword(e.target.value)}
        required
      />
      ${error && html`<div className="error">${error}</div>`}
      <Button3D type="submit" variant="primary">
        Login
      </Button3D>
    </form>
  `;
};
```

## Password Reset Flow

### Backend

```javascript
// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  // Generate reset token
  const resetToken = generateResetToken(email);
  
  // Send email with reset link
  await sendResetEmail(email, resetToken);
  
  res.json({ success: true, message: 'Reset email sent' });
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  // Verify token
  const email = verifyResetToken(token);
  
  // Update password
  await updatePassword(email, password);
  
  res.json({ success: true, message: 'Password reset successful' });
};
```

### Frontend

```javascript
// src/features/auth/components/PasswordReset.js
const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setSent(true);
  };
  
  if (sent) {
    return html`<div>Check your email for reset instructions</div>`;
  }
  
  return html`
    <form onSubmit=${handleSubmit}>
      <Input3D
        type="email"
        label="Email"
        value=${email}
        onChange=${e => setEmail(e.target.value)}
      />
      <Button3D type="submit">Send Reset Link</Button3D>
    </form>
  `;
};
```

## Email Verification

### Backend

```javascript
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  
  // Verify token
  const userId = verifyEmailToken(token);
  
  // Mark email as verified
  await markEmailVerified(userId);
  
  res.json({ success: true, message: 'Email verified' });
};
```

## Security Best Practices

1. **Password Hashing:** Use bcrypt with 10+ rounds
2. **Token Expiration:** Short-lived access tokens
3. **HTTPS Only:** Secure cookies in production
4. **CSRF Protection:** Use CSRF tokens
5. **Rate Limiting:** Limit login attempts
6. **Account Lockout:** Lock after failed attempts
7. **Token Rotation:** Rotate refresh tokens

## API Client Integration

```javascript
// src/core/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const response = await axios.post('/auth/refresh');
        localStorage.setItem('accessToken', response.data.token);
        // Retry original request
        return api.request(error.config);
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Testing

### Auth Tests

```javascript
// backend/tests/auth.test.js
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

## Next Steps

- Review [Backend Architecture](../architecture/backend.md) for implementation details
- Check [Email Integration](email-autoresponders.md) for email templates
- See [API Documentation](../architecture/api.md) for endpoint details
