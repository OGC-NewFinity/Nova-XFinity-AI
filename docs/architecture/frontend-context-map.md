# Frontend Context Map

## Introduction

Context providers in React enable global state management and cross-component data sharing without prop drilling. The Nova‑XFinity application uses three primary context providers to manage authentication state, theme preferences, and application settings across the entire component tree.

These providers are nested in a specific order in `App.js`, creating a layered architecture where each provider wraps the application and makes its state available to all child components through custom hooks.

---

## Context Provider Architecture

The following Mermaid diagram illustrates how the three context providers wrap the application and interact with each other:

```mermaid
graph TB
    subgraph "App Component"
        App[App Component]
    end
    
    subgraph "Provider Hierarchy"
        TP[ThemeProvider<br/>Outermost]
        SP[SettingsProvider<br/>Middle]
        AP[AuthProvider<br/>Innermost]
        Router[React Router]
    end
    
    subgraph "Context State"
        ThemeState[Theme State<br/>- theme: 'dark' | 'light'<br/>- localStorage: 'nova-xfinity-theme']
        SettingsState[Settings State<br/>- language: 'en'<br/>- editorMode: 'basic'<br/>- localStorage: 'nova-xfinity-settings']
        AuthState[Auth State<br/>- user: object | null<br/>- isAuthenticated: boolean<br/>- loading: boolean<br/>- Cookies: 'access_token']
    end
    
    subgraph "Custom Hooks"
        useThemeHook[useTheme<br/>Returns: theme, toggleTheme]
        useSettingsHook[useSettings<br/>Returns: language, editorMode,<br/>settings, updateSettings]
        useAuthHook[useAuth<br/>Returns: user, isAuthenticated,<br/>loading, isAdmin, login,<br/>logout, register, etc.]
    end
    
    subgraph "Consumer Components"
        Dashboard[Dashboard<br/>Uses: useAuth]
        Login[Login<br/>Uses: useAuth]
        Writer[Writer<br/>Uses: useAuth, useSettings]
        SettingsPanel[SettingsPanel<br/>Uses: useSettings]
    end
    
    App --> TP
    TP --> SP
    SP --> AP
    AP --> Router
    Router --> Dashboard
    Router --> Login
    Router --> Writer
    Router --> SettingsPanel
    
    TP -.provides.-> ThemeState
    SP -.provides.-> SettingsState
    AP -.provides.-> AuthState
    
    ThemeState -.accessed via.-> useThemeHook
    SettingsState -.accessed via.-> useSettingsHook
    AuthState -.accessed via.-> useAuthHook
    
    useThemeHook -.used by.-> Writer
    useSettingsHook -.used by.-> Writer
    useSettingsHook -.used by.-> SettingsPanel
    useAuthHook -.used by.-> Dashboard
    useAuthHook -.used by.-> Login
    useAuthHook -.used by.-> Writer
    
    style TP fill:#e1f5ff
    style SP fill:#fff4e1
    style AP fill:#ffe1f5
    style ThemeState fill:#e1f5ff
    style SettingsState fill:#fff4e1
    style AuthState fill:#ffe1f5
```

---

## Context Providers

### 1. AuthContext

**Location:** `context/AuthContext.js`

**Purpose:** Manages user authentication state, login/logout operations, and user session persistence.

#### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `user` | `object \| null` | Current authenticated user object (includes email, role, etc.) |
| `loading` | `boolean` | Indicates if authentication check is in progress |
| `isAuthenticated` | `boolean` | Whether the user is currently authenticated |
| `isAdmin` | `boolean` | Derived value: `user?.role === 'admin'` |

#### Custom Hook

**`useAuth()`**

Returns the authentication context. Throws an error if used outside `AuthProvider`.

**Return Value:**
```javascript
{
  user,                    // User object or null
  loading,                 // Boolean
  isAuthenticated,         // Boolean
  isAdmin,                 // Boolean (derived)
  login,                   // Function(email, password) => Promise
  register,                // Function(userData) => Promise
  logout,                  // Function() => void
  updateUser,              // Function(userData) => void
  checkAuth,               // Function() => Promise
  loginWithProvider        // Function(provider) => void
}
```

#### LocalStorage Keys

**Cookies (via `js-cookie`):**
- `access_token` - JWT token for authenticated requests (expires: 7 days)

**Note:** AuthContext uses cookies instead of localStorage for token storage to support cross-origin requests and automatic cookie handling.

#### Consumer Examples

**Example 1: Dashboard Component**
```javascript
import { useAuth } from '@/hooks';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return (
    // Component JSX using user data
  );
};
```

**Example 2: Login Component**
```javascript
import { useAuth } from '@/hooks';

const Login = () => {
  const { login, isAuthenticated, loginWithProvider } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };
  
  // Component JSX
};
```

**Example 3: Protected Route**
```javascript
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/unauthorized" />;
  
  return children;
};
```

---

### 2. ThemeContext

**Location:** `frontend/src/context/ThemeContext.js`

**Purpose:** Manages application theme (dark/light mode) and persists user preference.

#### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `theme` | `'dark' \| 'light'` | Current theme mode (defaults to 'dark') |

#### Custom Hook

**`useTheme()`**

Returns the theme context. Throws an error if used outside `ThemeProvider`.

**Return Value:**
```javascript
{
  theme,        // 'dark' | 'light'
  toggleTheme   // Function() => void
}
```

#### LocalStorage Keys

- `nova-xfinity-theme` - Stores the current theme preference ('dark' or 'light')

#### Consumer Examples

**Example 1: Theme Toggle Button**
```javascript
import { useTheme } from '@/hooks';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
```

**Example 2: Conditional Styling Based on Theme**
```javascript
import { useTheme } from '@/hooks';

const Component = () => {
  const { theme } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      {/* Content */}
    </div>
  );
};
```

**Note:** ThemeContext automatically applies the theme class to `document.documentElement`, so you can also use CSS classes like `.dark` and `.light` for styling.

---

### 3. SettingsContext

**Location:** `frontend/src/context/SettingsContext.js`

**Purpose:** Manages application-wide settings such as language and editor mode preferences.

#### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `settings` | `object` | Full settings object containing all preferences |
| `language` | `string` | Current language setting (default: 'en') |
| `editorMode` | `string` | Current editor mode (default: 'basic') |

#### Custom Hook

**`useSettings()`**

Returns the settings context. Throws an error if used outside `SettingsProvider`.

**Return Value:**
```javascript
{
  language,        // string
  editorMode,      // string
  settings,        // Full settings object
  updateSettings   // Function(newSettings) => void
}
```

#### LocalStorage Keys

- `nova-xfinity-settings` - Stores the full settings object as JSON

#### Consumer Examples

**Example 1: Reading Settings**
```javascript
import { useSettings } from '@/hooks';

const Component = () => {
  const { language, editorMode, settings } = useSettings();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <p>Editor mode: {editorMode}</p>
    </div>
  );
};
```

**Example 2: Updating Settings**
```javascript
import { useSettings } from '@/hooks';

const SettingsPanel = () => {
  const { settings, updateSettings } = useSettings();
  
  const handleLanguageChange = (newLanguage) => {
    updateSettings({ language: newLanguage });
    // Settings are automatically persisted to localStorage
  };
  
  return (
    <select onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Spanish</option>
    </select>
  );
};
```

**Example 3: Merging Settings**
```javascript
const { updateSettings } = useSettings();

// This merges with existing settings (doesn't replace)
updateSettings({ 
  language: 'es',
  editorMode: 'advanced'
});
```

---

## Provider Nesting in App.js

The providers are nested in a specific order in `App.js` to ensure proper dependency resolution:

```javascript
const App = () => {
  return React.createElement(ThemeProvider, null,
    React.createElement(SettingsProvider, null,
      React.createElement(AuthProvider, null,
        React.createElement(Router, null,
          // Routes and components
        )
      )
    )
  );
};
```

**Provider Order (Outermost to Innermost):**
1. **ThemeProvider** - Outermost wrapper
2. **SettingsProvider** - Middle layer
3. **AuthProvider** - Inner layer (wraps Router)
4. **Router** - React Router for navigation

**Why This Order?**
- **ThemeProvider** is outermost because theme affects the entire UI and doesn't depend on other contexts
- **SettingsProvider** is in the middle as it may need theme information in the future
- **AuthProvider** is innermost because authentication state may need to access settings or theme, and it wraps the Router which contains protected routes

**Important:** All three providers must wrap the Router to ensure context is available to all route components, including protected routes and authentication pages.

---

## Usage Patterns

### Accessing Multiple Contexts

Components can access multiple contexts simultaneously:

```javascript
import { useAuth, useTheme, useSettings } from '@/hooks';

const Component = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  
  // Use all contexts as needed
  return (
    <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
      {isAuthenticated && <p>Welcome, {user.email}</p>}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### Conditional Rendering Based on Context

```javascript
const Component = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <AuthenticatedContent />;
};
```

### Context-Dependent Side Effects

```javascript
const Component = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Side effect that depends on context values
    if (user) {
      console.log(`User ${user.email} is using ${theme} theme`);
    }
  }, [user, theme]);
  
  return <div>Content</div>;
};
```

---

## Troubleshooting

### Common Context Issues

#### 1. "useAuth must be used within AuthProvider"

**Problem:** A component is trying to use `useAuth()` but is not wrapped by `AuthProvider`.

**Solution:**
- Ensure the component is rendered within the `AuthProvider` in `App.js`
- Check that the component is not rendered outside the Router (which is inside AuthProvider)
- Verify the import path: `import { useAuth } from '@/hooks'` or `import { useAuth } from './context/AuthContext.js'`

**Example Fix:**
```javascript
// ❌ Wrong - Component outside provider
const App = () => (
  <div>
    <ComponentUsingAuth /> {/* Error! */}
    <AuthProvider>
      <Router>...</Router>
    </AuthProvider>
  </div>
);

// ✅ Correct - Component inside provider
const App = () => (
  <AuthProvider>
    <Router>
      <ComponentUsingAuth /> {/* Works! */}
    </Router>
  </AuthProvider>
);
```

#### 2. Context Value is Undefined

**Problem:** Context returns `undefined` even though the component is inside the provider.

**Solution:**
- Check that you're using the custom hook (e.g., `useAuth()`) instead of `useContext(AuthContext)` directly
- Verify the provider is exporting the hook correctly
- Ensure the provider's `value` prop includes all expected properties

**Example:**
```javascript
// ❌ Wrong - Direct useContext
const Component = () => {
  const auth = useContext(AuthContext); // May be undefined
  return <div>{auth?.user?.email}</div>;
};

// ✅ Correct - Use custom hook
const Component = () => {
  const { user } = useAuth(); // Includes error handling
  return <div>{user?.email}</div>;
};
```

#### 3. State Not Persisting (localStorage Issues)

**Problem:** Theme or settings are not persisting across page refreshes.

**Solution:**
- Check browser localStorage is enabled and not full
- Verify localStorage keys match: `nova-xfinity-theme`, `nova-xfinity-settings`
- Check for localStorage errors in console
- Ensure the provider's `useEffect` for persistence is running

**Debug Steps:**
```javascript
// Check localStorage
console.log(localStorage.getItem('nova-xfinity-theme'));
console.log(localStorage.getItem('nova-xfinity-settings'));

// Check for errors
try {
  localStorage.setItem('test', 'value');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

#### 4. Auth State Not Updating After Login

**Problem:** User logs in successfully but `isAuthenticated` remains `false`.

**Solution:**
- Verify the cookie `access_token` is being set correctly
- Check that `checkAuth()` is called after login
- Ensure the API endpoint `/users/me` returns valid user data
- Check browser console for authentication errors

**Debug Steps:**
```javascript
// In AuthContext, after login:
console.log('Cookie set:', Cookies.get('access_token'));
console.log('User data:', userResponse.data);
console.log('isAuthenticated:', isAuthenticated);
```

#### 5. Theme Not Applying to DOM

**Problem:** Theme state updates but CSS classes aren't applied to the document.

**Solution:**
- Verify `ThemeProvider`'s `useEffect` that applies classes is running
- Check that `document.documentElement` exists
- Ensure CSS classes `.dark` and `.light` are defined in your stylesheet

**Debug:**
```javascript
// Check if classes are applied
console.log(document.documentElement.classList);
// Should show: ['dark'] or ['light']
```

#### 6. Settings Not Merging Correctly

**Problem:** Calling `updateSettings({ language: 'es' })` replaces all settings instead of merging.

**Solution:**
- Verify `updateSettings` uses the spread operator to merge: `setSettings(prev => ({ ...prev, ...newSettings }))`
- Check that the SettingsContext implementation is correct

**Correct Implementation:**
```javascript
const updateSettings = (newSettings) => {
  setSettings(prev => ({
    ...prev,        // Keep existing settings
    ...newSettings  // Merge new settings
  }));
};
```

#### 7. Provider Order Issues

**Problem:** One context tries to use another context but gets undefined.

**Solution:**
- Ensure providers are nested in the correct order (see Provider Nesting section)
- If `AuthProvider` needs `SettingsContext`, ensure `SettingsProvider` wraps `AuthProvider`
- Check that all providers are present in `App.js`

#### 8. Cookie Not Being Set (AuthContext)

**Problem:** Login succeeds but cookie is not set, causing authentication to fail.

**Solution:**
- Check cookie options (sameSite, secure, path)
- Verify `js-cookie` library is installed
- Check browser console for cookie-related errors
- Ensure domain/path settings are correct for your environment

**Debug:**
```javascript
// After setting cookie
const cookieValue = Cookies.get('access_token');
console.log('Cookie value:', cookieValue);
console.log('All cookies:', document.cookie);
```

---

## Best Practices

1. **Always use custom hooks** (`useAuth`, `useTheme`, `useSettings`) instead of `useContext` directly for built-in error handling
2. **Check loading states** before accessing context values, especially for `AuthContext`
3. **Handle undefined values** gracefully with optional chaining (`user?.email`)
4. **Don't mutate context state directly** - use provided update functions
5. **Keep context providers focused** - each provider should manage a single concern
6. **Use localStorage sparingly** - only for user preferences that should persist
7. **Test context isolation** - ensure one context's changes don't break others

---

## Related Documentation

- [Frontend Architecture](./frontend-architecture.md) - Overall frontend structure
- [State Management](./state-management.md) - Global state management patterns
- [Authentication System](../architecture/auth-system.md) - Authentication flow details
