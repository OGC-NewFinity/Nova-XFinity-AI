# Component Library

## Overview

This document describes reusable UI components following the 3D design system. All components are built with React and HTM, styled with Tailwind CSS.

## Shared Components

### Button3D

**Purpose:** Primary action button with 3D effects

**Props:**
- `children` - Button content
- `onClick` - Click handler
- `variant` - `'primary' | 'secondary' | 'danger'`
- `size` - `'sm' | 'md' | 'lg'`
- `disabled` - Boolean
- `loading` - Boolean

**Usage:**
```javascript
<Button3D 
  variant="primary" 
  size="md"
  onClick={handleClick}
>
  Generate Article
</Button3D>
```

### Card3D

**Purpose:** Elevated card container with glassmorphism

**Props:**
- `children` - Card content
- `elevation` - `1 | 2 | 3 | 4` (depth level)
- `className` - Additional classes
- `onClick` - Optional click handler

**Usage:**
```javascript
<Card3D elevation={2}>
  <h3>Article Title</h3>
  <p>Article content...</p>
</Card3D>
```

### Input3D

**Purpose:** Styled input with 3D focus effects

**Props:**
- `type` - Input type
- `value` - Input value
- `onChange` - Change handler
- `placeholder` - Placeholder text
- `label` - Input label
- `error` - Error message

**Usage:**
```javascript
<Input3D
  label="Article Topic"
  value={topic}
  onChange={handleChange}
  placeholder="Enter topic..."
/>
```

### GlassPanel

**Purpose:** Glassmorphism container panel

**Props:**
- `children` - Panel content
- `blur` - Blur intensity
- `opacity` - Background opacity

**Usage:**
```javascript
<GlassPanel blur={20} opacity={0.1}>
  <SettingsForm />
</GlassPanel>
```

### AnimatedBackground

**Purpose:** Animated background with particles/gradient

**Props:**
- `variant` - `'particles' | 'gradient' | 'mesh'`
- `intensity` - Animation intensity
- `colors` - Color scheme

**Usage:**
```javascript
<AnimatedBackground variant="particles" intensity="medium">
  {/* Content */}
</AnimatedBackground>
```

## Feature Components

### Writer Components

#### WriterConfig

**Purpose:** Article configuration form

**Location:** `features/writer/components/WriterConfig.js`

**Features:**
- Topic input
- Keywords management
- Article type selection
- Size and tone settings
- Language selection

#### WriterWorkspace

**Purpose:** Main editor workspace

**Location:** `features/writer/components/WriterWorkspace.js`

**Features:**
- Section generation
- Draft management
- SEO audit
- Publishing

### Media Components

#### ImageGenerator

**Purpose:** Image generation interface

**Location:** `features/media/components/ImageGenerator.js`

**Features:**
- Prompt input
- Style selection
- Aspect ratio options
- Generation controls

#### VideoGenerator

**Purpose:** Video generation interface

**Location:** `features/media/components/VideoGenerator.js`

**Features:**
- Video prompt
- Duration selection
- Resolution options
- Voiceover toggle

### Research Components

#### ResearchMain

**Purpose:** Research query interface

**Location:** `features/research/components/ResearchMain.js`

**Features:**
- Search input
- Quick search templates
- Query history
- Results display

## Component Patterns

### Loading States

**Pattern:**
```javascript
{loading ? (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-3 text-slate-400">Loading...</span>
  </div>
) : (
  <Content />
)}
```

### Error States

**Pattern:**
```javascript
{error ? (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex items-center">
      <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>
      <span className="text-red-700">{error.message}</span>
    </div>
  </div>
) : (
  <Content />
)}
```

### Empty States

**Pattern:**
```javascript
{items.length === 0 ? (
  <div className="text-center py-12">
    <i className="fa-solid fa-inbox text-4xl text-slate-400 mb-4"></i>
    <p className="text-slate-500">No items found</p>
  </div>
) : (
  <ItemList items={items} />
)}
```

## Component Composition

### Container Pattern

```javascript
const FeatureContainer = ({ children, title, actions }) => {
  return html`
    <div className="feature-container">
      <header className="feature-header">
        <h2>${title}</h2>
        ${actions && html`<div className="feature-actions">${actions}</div>`}
      </header>
      <main className="feature-content">
        ${children}
      </main>
    </div>
  `;
};
```

### Form Pattern

```javascript
const FormField = ({ label, error, children }) => {
  return html`
    <div className="form-field">
      ${label && html`<label className="form-label">${label}</label>`}
      ${children}
      ${error && html`<span className="form-error">${error}</span>`}
    </div>
  `;
};
```

## Styling Patterns

### Component Styling

Use Tailwind utility classes with custom 3D effects:

```javascript
const StyledButton = () => html`
  <button
    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95"
  >
    Click Me
  </button>
`;
```

### Responsive Patterns

```javascript
const ResponsiveCard = () => html`
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Cards -->
  </div>
`;
```

## Component Best Practices

1. **Keep Components Small:** < 100 lines
2. **Single Responsibility:** One purpose per component
3. **Reusable Props:** Generic, flexible props
4. **Consistent Styling:** Follow design system
5. **Accessible:** Proper ARIA labels, keyboard navigation
6. **Type Safety:** Use PropTypes or TypeScript
7. **Documentation:** Comment complex logic

## Component Examples

### Example: Reusable Button Component

```javascript
// shared/components/Button3D.js
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Button3D = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'font-bold rounded-xl transition-all transform';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
    secondary: 'bg-slate-800 text-white border-2 border-slate-700 hover:border-blue-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return html`
    <button
      className=${`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
      onClick=${onClick}
      disabled=${disabled || loading}
    >
      ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
      ${children}
    </button>
  `;
};

export default Button3D;
```

### Example: Card Component

```javascript
// shared/components/Card3D.js
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Card3D = ({ 
  children, 
  elevation = 2,
  className = '',
  onClick 
}) => {
  const elevationShadows = {
    1: 'shadow-sm',
    2: 'shadow-lg shadow-slate-200/50',
    3: 'shadow-xl shadow-slate-300/50',
    4: 'shadow-2xl shadow-slate-400/50'
  };
  
  return html`
    <div
      className=${`bg-white rounded-[2.5rem] border border-gray-100 p-8 ${elevationShadows[elevation]} ${onClick ? 'cursor-pointer' : ''} transition-all hover:-translate-y-1 ${className}`}
      onClick=${onClick}
    >
      ${children}
    </div>
  `;
};

export default Card3D;
```

## Next Steps

- Review [Design System](design-system.md) for styling guidelines
- Check [Animation Guidelines](animations.md) for animation patterns
- See [Frontend Architecture](../architecture/frontend.md) for structure
