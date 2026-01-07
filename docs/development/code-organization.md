# Code Organization Guidelines

**Description:** Guidelines for project structure and code organization following a feature-based modular structure to improve maintainability and scalability.  
**Last Updated:** 2026-01-07  
**Status:** Stable

## Table of Contents

- [Project Structure](#project-structure)
- [Feature-Based Organization](#feature-based-organization)
  - [Feature Structure](#feature-structure)
  - [Feature Module Guidelines](#feature-module-guidelines)
- [Component Organization](#component-organization)
  - [Component Size Guidelines](#component-size-guidelines)
  - [Breaking Down Large Components](#breaking-down-large-components)
  - [Component Naming](#component-naming)
  - [Component Structure Template](#component-structure-template)
- [File Organization Rules](#file-organization-rules)
  - [Single Responsibility Principle](#single-responsibility-principle)
  - [File Size Limits](#file-size-limits)
  - [Code Splitting Strategy](#code-splitting-strategy)
- [Shared Code Organization](#shared-code-organization)
  - [Shared Components](#shared-components)
  - [Shared Hooks](#shared-hooks)
  - [Shared Utils](#shared-utils)
- [Constants Organization](#constants-organization)
  - [Global Constants](#global-constants)
  - [Feature-Specific Constants](#feature-specific-constants)
- [Import Organization](#import-organization)
  - [Import Order](#import-order)
  - [Path Aliases (Planned)](#path-aliases-planned)
- [Naming Conventions](#naming-conventions)
  - [Files](#files)
  - [Variables](#variables)
  - [CSS Classes](#css-classes)
- [Code Splitting Examples](#code-splitting-examples)
  - [Example 1: Breaking Down Writer.js](#example-1-breaking-down-writerjs)
  - [Example 2: Breaking Down MediaHub.js](#example-2-breaking-down-mediahubjs)
  - [Example 3: Breaking Down geminiService.js](#example-3-breaking-down-geminiservicejs)
- [Migration Strategy](#migration-strategy)
  - [Phase 1: Extract Settings](#phase-1-extract-settings)
  - [Phase 2: Modularize Writer](#phase-2-modularize-writer)
  - [Phase 3: Modularize MediaHub](#phase-3-modularize-mediahub)
  - [Phase 4: Reorganize Services](#phase-4-reorganize-services)
  - [Phase 5: Migrate to Features](#phase-5-migrate-to-features)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)

---

## Project Structure

The project follows a **feature-based modular structure** to improve maintainability and scalability.

```
nova-xfinity-ai/
├── docs/                    # Documentation
├── backend/                 # Backend application
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── tests/
├── src/                     # Frontend source
│   ├── features/            # Feature-based modules
│   │   ├── writer/
│   │   ├── research/
│   │   ├── media/
│   │   ├── dashboard/
│   │   └── auth/
│   ├── shared/              # Shared components/utilities
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── constants/
│   ├── core/                # Core functionality
│   │   ├── api/
│   │   ├── auth/
│   │   └── config/
│   ├── App.js
│   └── index.js
├── components/              # Legacy components (to be migrated)
├── services/                # Legacy services (to be migrated)
├── public/                  # Static assets
└── package.json
```

## Feature-Based Organization

Each feature module is self-contained with its own components, hooks, utilities, and services.

### Feature Structure

```
features/
└── writer/
    ├── components/          # Feature-specific components
    │   ├── WriterMain.js
    │   ├── WriterConfig.js
    │   └── WriterWorkspace.js
    ├── hooks/               # Custom React hooks
    │   └── useWriterState.js
    ├── utils/               # Utility functions
    │   └── draftManager.js
    ├── services/            # API calls
    │   └── articleService.js
    └── index.js             # Feature exports
```

### Feature Module Guidelines

1. **Self-Contained:** Each feature should be independent and reusable
2. **Clear Boundaries:** Minimal dependencies between features
3. **Shared Code:** Common code goes in `shared/`
4. **Exports:** Each feature exports through `index.js`

## Component Organization

### Component Size Guidelines

- **Small Components:** < 50 lines (simple UI elements)
- **Medium Components:** 50-100 lines (feature components)
- **Large Components:** > 100 lines → **Must be split**

### Breaking Down Large Components

**Before (365 lines):**
```javascript
// Writer.js - TOO LARGE
const Writer = () => {
  // Configuration state (50 lines)
  // Draft management (50 lines)
  // Generation logic (100 lines)
  // UI rendering (165 lines)
}
```

**After (modularized):**
```javascript
// WriterMain.js (50 lines) - Container
// WriterConfig.js (80 lines) - Configuration
// WriterWorkspace.js (100 lines) - Editor
// useWriterState.js (60 lines) - State hook
// draftManager.js (50 lines) - Utilities
```

### Component Naming

- **PascalCase** for component files: `WriterConfig.js`
- **Descriptive names:** `WriterMain.js` not `Main.js`
- **Consistent prefixes:** Feature-specific components use feature prefix

### Component Structure Template

```javascript
import React, { useState } from 'react';
import htm from 'htm';
// Import dependencies
import { useCustomHook } from '../hooks/useCustomHook';
import { SharedComponent } from '../../../shared/components';

const html = htm.bind(React.createElement);

const FeatureComponent = ({ prop1, prop2 }) => {
  // 1. Hooks
  const { data, loading } = useCustomHook();
  
  // 2. State
  const [localState, setLocalState] = useState(null);
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4. Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // 5. Render
  return html`
    <div className="component-wrapper">
      <!-- Component JSX -->
    </div>
  `;
};

export default FeatureComponent;
```

## File Organization Rules

### Single Responsibility Principle

Each file should have **one clear purpose**:

- ✅ **Good:** `draftManager.js` - Only draft operations
- ❌ **Bad:** `utils.js` - Everything mixed together

### File Size Limits

- **Components:** Maximum 100 lines
- **Hooks:** Maximum 60 lines
- **Utilities:** Maximum 50 lines per function
- **Services:** Maximum 100 lines per service

### Code Splitting Strategy

**Large Service File (310 lines):**
```
services/geminiService.js
```

**Split into:**
```
services/ai/
├── contentGeneration.js    # Content generation (80 lines)
├── imageGeneration.js      # Image generation (60 lines)
├── videoGeneration.js      # Video generation (70 lines)
├── researchService.js      # Research functionality (50 lines)
└── providerManager.js      # Provider management (50 lines)
```

## Shared Code Organization

### Shared Components

Place in `shared/components/` when:
- Used by multiple features
- Generic UI elements
- Reusable patterns

**Examples:**
- `Button3D.js` - 3D button component
- `Card3D.js` - 3D card component
- `Input3D.js` - 3D input component
- `LoadingSpinner.js` - Loading indicator

### Shared Hooks

Place in `shared/hooks/` when:
- Used across multiple features
- Generic functionality

**Examples:**
- `useLocalStorage.js` - Local storage hook
- `useApi.js` - API call hook
- `useDebounce.js` - Debounce hook

### Shared Utils

Place in `shared/utils/` when:
- Pure functions
- No React dependencies
- Reusable across features

**Examples:**
- `formatters.js` - Date/number formatting
- `validators.js` - Input validation
- `helpers.js` - Common helper functions

## Constants Organization

### Global Constants

Place in `shared/constants/` or root `constants.js`:

```javascript
// shared/constants/index.js
export const PROVIDER_OPTIONS = [...];
export const TONE_OPTIONS = [...];
export const CATEGORY_OPTIONS = [...];
```

### Feature-Specific Constants

Place in feature directory:

```javascript
// features/writer/constants.js
export const WRITER_DEFAULTS = {...};
export const ARTICLE_TYPES = [...];
```

## Import Organization

### Import Order

1. **React/External libraries**
2. **Internal shared components**
3. **Feature-specific imports**
4. **Utilities/Constants**
5. **Types (if using TypeScript)**

```javascript
// 1. External
import React, { useState } from 'react';
import htm from 'htm';

// 2. Shared
import { Button3D } from '../../../shared/components';
import { useApi } from '../../../shared/hooks';

// 3. Feature-specific
import { WriterConfig } from '../components';
import { useWriterState } from '../hooks';

// 4. Utils/Constants
import { formatDate } from '../../../shared/utils';
import { PROVIDER_OPTIONS } from '../../../shared/constants';

// 5. Types
// import { WriterProps } from '../types';
```

### Path Aliases (Planned)

Configure path aliases in `vite.config.ts`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@features': path.resolve(__dirname, './src/features'),
  }
}
```

Then use:
```javascript
import { Button3D } from '@shared/components';
import { WriterConfig } from '@features/writer/components';
```

## Naming Conventions

### Files
- **Components:** PascalCase - `WriterConfig.js`
- **Hooks:** camelCase with `use` prefix - `useWriterState.js`
- **Utils:** camelCase - `draftManager.js`
- **Constants:** UPPER_SNAKE_CASE - `PROVIDER_OPTIONS`

### Variables
- **Components:** PascalCase - `const WriterMain = ...`
- **Functions:** camelCase - `const handleSubmit = ...`
- **Constants:** UPPER_SNAKE_CASE - `const MAX_RETRIES = 3`
- **Private:** Prefix with `_` - `const _internalFunction = ...`

### CSS Classes
- Use Tailwind utility classes
- Custom classes: kebab-case - `writer-config-panel`

## Code Splitting Examples

### Example 1: Breaking Down Writer.js

**Original:** `components/writer/Writer.js` (365 lines)

**Refactored:**
```
components/writer/
├── WriterMain.js          # Main container (50 lines)
├── WriterConfig.js        # Config form (80 lines)
├── WriterWorkspace.js     # Editor workspace (100 lines)
├── hooks/
│   └── useWriterState.js  # State management (60 lines)
└── utils/
    └── draftManager.js    # Draft utilities (50 lines)
```

### Example 2: Breaking Down MediaHub.js

**Original:** `components/MediaHub.js` (343 lines)

**Refactored:**
```
components/MediaHub/
├── MediaHubMain.js        # Main container (50 lines)
├── ImageGenerator.js      # Image generation (80 lines)
├── VideoGenerator.js      # Video generation (100 lines)
├── MediaPreview.js        # Preview component (60 lines)
└── hooks/
    └── useMediaGeneration.js  # Generation logic (50 lines)
```

### Example 3: Breaking Down geminiService.js

**Original:** `services/geminiService.js` (310 lines)

**Refactored:**
```
services/ai/
├── contentGeneration.js   # Content generation (80 lines)
├── imageGeneration.js     # Image generation (60 lines)
├── videoGeneration.js     # Video generation (70 lines)
├── researchService.js     # Research functionality (50 lines)
└── providerManager.js     # Provider management (50 lines)
```

## Migration Strategy

### Phase 1: Extract Settings
- Extract Settings component from `App.js`
- Create `components/Settings/SettingsPanel.js`

### Phase 2: Modularize Writer
- Split `Writer.js` into smaller components
- Create hooks and utilities

### Phase 3: Modularize MediaHub
- Split `MediaHub.js` into smaller components
- Create media generation hooks

### Phase 4: Reorganize Services
- Split `geminiService.js` into feature services
- Organize into `services/ai/` directory

### Phase 5: Migrate to Features
- Move components to `src/features/`
- Organize by feature

## Best Practices

1. **Keep Files Small:** Aim for < 100 lines per file
2. **Single Responsibility:** One purpose per file
3. **Feature Boundaries:** Keep features independent
4. **Reusable Code:** Extract to `shared/`
5. **Consistent Naming:** Follow conventions
6. **Clear Imports:** Organize import statements
7. **Documentation:** Comment complex logic
8. **Testing:** Keep test files co-located

## Related Documents

- [Contributing Guidelines](contributing.md) - Coding standards and contribution process
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend structure details
- [Backend Architecture](../architecture/backend-architecture.md) - Backend structure details
- [Design System](../design/design-system.md) - Component patterns and design guidelines
- [Setup Guide](setup.md) - Development environment setup
