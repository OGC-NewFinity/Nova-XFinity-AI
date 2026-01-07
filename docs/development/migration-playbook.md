# Migration Playbook

🚧 This document is a work-in-progress. Migration procedures are being refined as the codebase evolves.

**Description:** Concrete playbook for planned migrations (path aliases, component refactors, service splits), with acceptance criteria.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

This migration playbook provides step-by-step procedures for executing codebase transitions, refactoring, and architectural changes in Nova‑XFinity AI. It covers migration scenarios from local development refactors to major architectural reorganizations, ensuring smooth transitions with minimal disruption.

### Purpose

The playbook serves as a comprehensive guide for:
- **Planning migrations** - Assessing impact, sequencing changes, and managing risk
- **Executing migrations** - Step-by-step procedures with acceptance criteria
- **Managing transitions** - Handling deprecated paths, aliases, and legacy code
- **Minimizing disruption** - Ensuring code remains functional during migrations
- **Rollback procedures** - Recovering from failed migrations

### Scope

This document covers:
- **Code migrations** - Refactoring, restructuring, and reorganization
- **Path alias transitions** - Moving from relative imports to path aliases
- **Service architecture changes** - Splitting services, monorepo adoption
- **Breaking changes** - Version upgrades and API changes
- **Legacy code management** - Deprecation and removal strategies

### Migration Philosophy

1. **Incremental Changes** - Break large migrations into smaller, manageable steps
2. **Backward Compatibility** - Maintain compatibility during transition periods
3. **Clear Communication** - Document all changes and notify team members
4. **Testing First** - Verify migrations don't break existing functionality
5. **Rollback Ready** - Always have a rollback plan

---

## Migration Scenarios

### 1. Local Dev Refactor

**Scenario:** Refactoring code within a single feature or component for better organization.

**Examples:**
- Breaking down large components into smaller ones
- Extracting utility functions
- Reorganizing file structure within a feature

**Characteristics:**
- Low risk, isolated impact
- No breaking changes to external APIs
- Can be done incrementally
- No coordination with other developers needed

**Procedure:**
1. Create feature branch: `git checkout -b refactor/feature-name`
2. Make incremental changes
3. Test locally after each change
4. Update imports as needed
5. Run full test suite
6. Submit PR with clear description

**Acceptance Criteria:**
- All tests pass
- No breaking changes to public APIs
- Code follows organization guidelines
- Documentation updated if needed

### 2. Backend Service Upgrade

**Scenario:** Upgrading backend dependencies, frameworks, or major version changes.

**Examples:**
- Node.js version upgrade
- Express.js major version update
- Prisma schema migrations
- Database driver updates

**Characteristics:**
- Medium to high risk
- May require API changes
- Needs coordination with frontend team
- Database migrations may be required

**Procedure:**
1. **Pre-Migration:**
   - Review changelog and breaking changes
   - Create migration branch
   - Backup database (if applicable)
   - Document current version and target version

2. **Migration:**
   - Update `package.json` dependencies
   - Run `npm install`
   - Fix breaking changes incrementally
   - Update configuration files
   - Run database migrations (if applicable)

3. **Testing:**
   - Run backend test suite
   - Test API endpoints manually
   - Verify database operations
   - Check integration with frontend

4. **Post-Migration:**
   - Update documentation
   - Update deployment scripts
   - Notify team of changes

**Acceptance Criteria:**
- All backend tests pass
- API endpoints function correctly
- Database migrations successful
- No performance regressions
- Documentation updated

### 3. Frontend Architecture Reorganization

**Scenario:** Restructuring frontend code to follow new architecture patterns.

**Examples:**
- Migrating from `components/` to `features/` structure
- Implementing feature-based organization
- Moving shared code to `shared/` directory
- Reorganizing component hierarchy

**Characteristics:**
- Medium risk
- Many file moves and import updates
- Requires careful import path management
- May need path alias migration

**Procedure:**
1. **Planning:**
   - Map current structure to target structure
   - Identify all files to move
   - List all import statements to update
   - Create migration checklist

2. **Preparation:**
   - Create feature branch
   - Ensure all tests pass before migration
   - Document current import patterns

3. **Migration (Incremental):**
   - Move files in logical groups (e.g., by feature)
   - Update imports for moved files
   - Run tests after each group
   - Fix broken imports immediately

4. **Verification:**
   - Run full test suite
   - Manual testing of affected features
   - Check build process
   - Verify no broken imports remain

**Acceptance Criteria:**
- All files in correct locations
- All imports updated and working
- Tests pass
- Build succeeds
- No runtime errors
- Code organization guidelines followed

### 4. Monorepo Adoption (Planned)

**Scenario:** Restructuring project into a monorepo with multiple packages.

**Examples:**
- Separating frontend, backend, and shared code into packages
- Using tools like Turborepo, Nx, or Lerna
- Managing dependencies across packages
- Setting up build and deployment pipelines

**Characteristics:**
- High risk, major architectural change
- Requires significant planning
- Affects all parts of codebase
- Needs new tooling and CI/CD updates

**Procedure (Planned):**
1. **Planning Phase:**
   - Design monorepo structure
   - Choose monorepo tool (Turborepo, Nx, etc.)
   - Map current structure to packages
   - Plan dependency management

2. **Setup Phase:**
   - Initialize monorepo tool
   - Create package structure
   - Configure build tools
   - Set up shared dependencies

3. **Migration Phase:**
   - Move code to packages incrementally
   - Update import paths
   - Configure package dependencies
   - Update CI/CD pipelines

4. **Verification:**
   - Test all packages independently
   - Test package interactions
   - Verify build processes
   - Check deployment procedures

**Acceptance Criteria (Planned):**
- All packages build successfully
- Dependencies correctly managed
- CI/CD pipelines updated
- Documentation updated
- Team trained on new structure

### 5. Breaking Changes Across Versions

**Scenario:** Introducing breaking changes that affect API contracts or public interfaces.

**Examples:**
- Changing API endpoint structure
- Modifying component props
- Updating data models
- Changing authentication flow

**Characteristics:**
- High risk
- Requires versioning strategy
- May need deprecation period
- Coordination with all consumers

**Procedure:**
1. **Planning:**
   - Identify all breaking changes
   - Determine version strategy (semantic versioning)
   - Plan deprecation timeline
   - Document migration path for consumers

2. **Implementation:**
   - Add deprecation warnings
   - Implement new API alongside old
   - Update version numbers
   - Create migration guide

3. **Communication:**
   - Announce breaking changes
   - Provide migration timeline
   - Update documentation
   - Offer support during transition

4. **Removal:**
   - Remove deprecated code after grace period
   - Update version to reflect breaking change
   - Update all consumers

**Acceptance Criteria:**
- Deprecation warnings in place
- New API fully functional
- Migration guide available
- All consumers notified
- Version numbers updated

---

## Alias Management

### Current State

**Path Alias Configuration:**
- `@` → Project root (configured in `vite.config.ts` and `tsconfig.json`)
- Currently minimal usage, mostly relative imports

**Example:**
```javascript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}

// Usage
import { api } from '@/services/api';
```

### Planned Aliases

**Target Structure:**
```javascript
// vite.config.ts (planned)
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@features': path.resolve(__dirname, './src/features'),
    '@components': path.resolve(__dirname, './components'), // Legacy
    '@services': path.resolve(__dirname, './services'), // Legacy
    '@utils': path.resolve(__dirname, './utils'),
    '@hooks': path.resolve(__dirname, './hooks'),
  }
}
```

### Migration to Path Aliases

**Step 1: Configure Aliases**
```javascript
// Update vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@features': path.resolve(__dirname, './src/features'),
    // Legacy support during transition
    '@components': path.resolve(__dirname, './components'),
    '@services': path.resolve(__dirname, './services'),
  }
}
```

**Step 2: Update Imports Incrementally**
```javascript
// Before
import { Button3D } from '../../../shared/components/Button3D';
import { useApi } from '../../hooks/useApi';

// After
import { Button3D } from '@shared/components/Button3D';
import { useApi } from '@hooks/useApi';
```

**Step 3: Update TypeScript Config**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

**Step 4: Verify and Test**
- Run build to verify aliases work
- Check all imports resolve correctly
- Run test suite
- Manual testing of affected features

### Managing Deprecated Paths

**During Transition:**
- Keep both old and new paths working
- Use symbolic links if needed (not recommended for cross-platform)
- Add deprecation warnings in code
- Document migration timeline

**After Migration:**
- Remove deprecated alias configurations
- Update all remaining imports
- Remove legacy path support

### Symbolic Links (If Needed)

**Windows (PowerShell):**
```powershell
New-Item -ItemType SymbolicLink -Path "src/legacy" -Target "components"
```

**Unix/Mac:**
```bash
ln -s ../components src/legacy
```

**Note:** Symbolic links can cause issues in CI/CD and cross-platform development. Prefer alias configuration over symbolic links.

---

## Legacy Code Mapping

### Current Legacy Structure

**Legacy Directories:**
- `components/` - Legacy components (to be migrated to `features/`)
- `services/` - Legacy services (to be migrated to `features/` or `shared/`)
- `utils/` - Legacy utilities (to be migrated to `shared/utils/` or feature-specific)
- `hooks/` - Legacy hooks (to be migrated to `shared/hooks/` or feature-specific)

### Target Structure

**New Organization:**
```
src/
├── features/           # Feature-based modules
│   ├── writer/
│   ├── research/
│   ├── media/
│   └── dashboard/
├── shared/            # Shared code
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── constants/
└── core/              # Core functionality
    ├── api/
    ├── auth/
    └── config/
```

### Mapping Guide

**Components:**
```
components/Account/AccountPage.js
  → features/account/components/AccountPage.js

components/common/Button3D.js
  → shared/components/Button3D.js

components/writer/Writer.js
  → features/writer/components/Writer.js
```

**Services:**
```
services/api.js
  → core/api/api.js

services/geminiService.js
  → features/writer/services/geminiService.js

services/subscriptionApi.js
  → features/account/services/subscriptionApi.js
```

**Utilities:**
```
utils/quotaChecker.js
  → shared/utils/quotaChecker.js

utils/inputOptimizer.js
  → features/writer/utils/inputOptimizer.js
```

**Hooks:**
```
hooks/useQuota.js
  → shared/hooks/useQuota.js

hooks/useWriter.js (if exists)
  → features/writer/hooks/useWriter.js
```

### Migration Tracking

**Create Migration Map:**
```markdown
## Component Migration Map

| Legacy Path | New Path | Status | Notes |
|------------|----------|--------|-------|
| `components/Account/AccountPage.js` | `features/account/components/AccountPage.js` | ✅ Complete | |
| `components/common/Button3D.js` | `shared/components/Button3D.js` | ✅ Complete | |
| `components/writer/Writer.js` | `features/writer/components/Writer.js` | 🚧 In Progress | |
```

### Finding Legacy References

**Search for Imports:**
```bash
# Find all imports from legacy paths
grep -r "from '../components" src/
grep -r "from '../../services" src/
grep -r "from '../../../utils" src/
```

**Update Script (Example):**
```javascript
// scripts/migrate-imports.js
const fs = require('fs');
const path = require('path');

const mappings = {
  '../components/Account': '@features/account/components',
  '../components/common': '@shared/components',
  '../../services/api': '@core/api',
  // ... more mappings
};

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(mappings).forEach(([old, newPath]) => {
    const regex = new RegExp(old.replace(/\//g, '\\/'), 'g');
    content = content.replace(regex, newPath);
  });
  
  fs.writeFileSync(filePath, content);
}
```

---

## Migration Checklist

### Pre-Migration

- [ ] **Assess Impact**
  - [ ] Identify all affected files
  - [ ] List all dependencies
  - [ ] Estimate migration complexity
  - [ ] Identify potential breaking changes

- [ ] **Plan Migration**
  - [ ] Create migration branch
  - [ ] Document current state
  - [ ] Define target state
  - [ ] Create step-by-step plan
  - [ ] Set acceptance criteria

- [ ] **Prepare Environment**
  - [ ] Ensure all tests pass
  - [ ] Backup database (if applicable)
  - [ ] Create feature branch
  - [ ] Update dependencies
  - [ ] Review related documentation

- [ ] **Communication**
  - [ ] Notify team of planned migration
  - [ ] Coordinate with other developers
  - [ ] Schedule migration window (if needed)
  - [ ] Prepare rollback plan

### Migration

- [ ] **Execute Changes**
  - [ ] Make incremental changes
  - [ ] Update imports as you go
  - [ ] Fix breaking changes immediately
  - [ ] Test after each change group

- [ ] **Update Configuration**
  - [ ] Update build configuration
  - [ ] Update path aliases
  - [ ] Update TypeScript config
  - [ ] Update CI/CD scripts

- [ ] **Update Imports**
  - [ ] Find all affected imports
  - [ ] Update import paths
  - [ ] Verify imports resolve
  - [ ] Check for circular dependencies

- [ ] **Code Quality**
  - [ ] Run linter
  - [ ] Fix linting errors
  - [ ] Follow code organization guidelines
  - [ ] Update code comments

### Post-Migration

- [ ] **Testing**
  - [ ] Run full test suite
  - [ ] Manual testing of affected features
  - [ ] Integration testing
  - [ ] Performance testing (if applicable)

- [ ] **Verification**
  - [ ] Verify build succeeds
  - [ ] Check for runtime errors
  - [ ] Verify all imports work
  - [ ] Check console for warnings

- [ ] **Documentation**
  - [ ] Update code organization docs
  - [ ] Update architecture docs
  - [ ] Update migration playbook (if needed)
  - [ ] Document any gotchas

- [ ] **Cleanup**
  - [ ] Remove deprecated code
  - [ ] Remove unused imports
  - [ ] Clean up temporary files
  - [ ] Update .gitignore if needed

- [ ] **Deployment**
  - [ ] Test in staging environment
  - [ ] Verify deployment scripts
  - [ ] Monitor for issues
  - [ ] Deploy to production (when ready)

---

## Developer Guidelines

### Writing Migration-Safe Code

**1. Use Path Aliases from the Start**
```javascript
// ✅ Good - Uses alias
import { Button3D } from '@shared/components/Button3D';

// ❌ Avoid - Relative paths
import { Button3D } from '../../../shared/components/Button3D';
```

**2. Keep Components Modular**
- Single responsibility principle
- Easy to move and reorganize
- Minimal dependencies
- Clear interfaces

**3. Avoid Deep Nesting**
```javascript
// ✅ Good - Flat structure
features/writer/components/Writer.js
features/writer/hooks/useWriter.js

// ❌ Avoid - Deep nesting
features/writer/components/editor/toolbar/buttons/Button.js
```

**4. Use Feature-Based Organization**
- Group related code together
- Keep features self-contained
- Minimize cross-feature dependencies

**5. Document Dependencies**
```javascript
/**
 * Writer Component
 * 
 * Dependencies:
 * - @shared/components/Button3D
 * - @features/writer/hooks/useWriter
 * - @core/api/api
 */
```

### Minimizing Migration Impact

**1. Incremental Changes**
- Make small, focused changes
- Test after each change
- Commit frequently with clear messages

**2. Backward Compatibility**
- Support old and new patterns during transition
- Add deprecation warnings
- Provide migration path

**3. Clear Communication**
- Document breaking changes
- Update migration playbook
- Notify team of changes

**4. Comprehensive Testing**
- Write tests before migration
- Test after each change
- Verify integration points

**5. Version Control**
- Use feature branches
- Create clear commit messages
- Tag migration milestones

### Code Review Checklist

When reviewing migration PRs:

- [ ] All tests pass
- [ ] No breaking changes (or clearly documented)
- [ ] Imports use path aliases (if applicable)
- [ ] Code follows organization guidelines
- [ ] Documentation updated
- [ ] Migration checklist completed
- [ ] Rollback plan documented

---

## Tools & Automation

### Migration Scripts

**Find and Replace Imports:**
```bash
# scripts/migrate-imports.sh
#!/bin/bash

# Find all files with old import pattern
find src -type f -name "*.js" -o -name "*.jsx" | while read file; do
  # Replace old import with new
  sed -i 's|from "../../components|from "@components|g' "$file"
  sed -i 's|from "../../services|from "@services|g' "$file"
done
```

**Verify Imports:**
```javascript
// scripts/verify-imports.js
const fs = require('fs');
const path = require('path');

function findBrokenImports(dir) {
  const files = fs.readdirSync(dir);
  const broken = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for relative imports that might be broken
    const relativeImports = content.match(/from ['"]\.\.\/\.\.\/\.\./g);
    if (relativeImports) {
      broken.push({ file: filePath, imports: relativeImports });
    }
  });
  
  return broken;
}
```

### Linters and Validators

**ESLint Rules:**
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "../../components",
            "message": "Use @components alias instead"
          },
          {
            "name": "../../services",
            "message": "Use @services alias instead"
          }
        ]
      }
    ]
  }
}
```

**Custom Import Validator:**
```javascript
// scripts/validate-imports.js
const fs = require('fs');
const path = require('path');

const allowedAliases = ['@shared', '@features', '@components', '@services'];
const restrictedPatterns = [/\.\.\/\.\.\/\.\./];

function validateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  restrictedPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push(`Found restricted import pattern: ${pattern}`);
    }
  });
  
  return issues;
}
```

### CI/CD Integration

**Pre-commit Hooks:**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check for restricted import patterns
npm run validate-imports

# Run linter
npm run lint

# Run tests
npm run test
```

**CI Pipeline Checks:**
```yaml
# .github/workflows/migration-check.yml
name: Migration Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate Imports
        run: npm run validate-imports
      - name: Check Path Aliases
        run: npm run check-aliases
      - name: Run Tests
        run: npm run test
```

### Automated Refactoring Tools

**jscodeshift (for large refactors):**
```javascript
// codemods/migrate-imports.js
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Transform imports
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.value.source.value;
    
    if (source.startsWith('../../components')) {
      path.value.source.value = source.replace(
        '../../components',
        '@components'
      );
    }
  });
  
  return root.toSource();
};
```

**Usage:**
```bash
npx jscodeshift -t codemods/migrate-imports.js src/
```

---

## Known Issues

### Previous Migration Challenges

**1. Import Path Resolution**

**Issue:** After moving files, relative imports broke due to incorrect path calculations.

**Solution:**
- Use path aliases instead of relative imports
- Verify imports after each file move
- Use automated tools to update imports

**Prevention:**
- Configure path aliases before migration
- Update imports incrementally
- Test import resolution after changes

**2. Circular Dependencies**

**Issue:** Reorganization created circular dependencies between modules.

**Solution:**
- Identify circular dependencies with tools
- Refactor to break cycles
- Use dependency injection where needed

**Prevention:**
- Map dependencies before migration
- Keep features self-contained
- Minimize cross-feature dependencies

**3. Build Configuration**

**Issue:** Path aliases not configured correctly in build tools.

**Solution:**
- Update both `vite.config.ts` and `tsconfig.json`
- Verify alias resolution in build
- Test in both dev and production builds

**Prevention:**
- Configure aliases in all relevant config files
- Test build process after configuration
- Document alias configuration

**4. Test Path Updates**

**Issue:** Test files had hardcoded paths that broke after migration.

**Solution:**
- Update test imports
- Use path aliases in tests
- Update test file locations if needed

**Prevention:**
- Include tests in migration planning
- Update test paths alongside source code
- Run tests after each migration step

**5. CI/CD Pipeline Failures**

**Issue:** CI/CD scripts had hardcoded paths that broke after file moves.

**Solution:**
- Update CI/CD scripts
- Use environment variables for paths
- Test CI/CD pipeline after migration

**Prevention:**
- Review CI/CD scripts before migration
- Use relative paths or environment variables
- Test pipeline in staging first

### Common Pitfalls

**1. Moving Files Without Updating Imports**
- Always update imports when moving files
- Use search and replace tools
- Verify all imports after moves

**2. Breaking Changes Without Communication**
- Always document breaking changes
- Provide migration guide
- Give team advance notice

**3. Large, Atomic Migrations**
- Break large migrations into smaller steps
- Test after each step
- Commit frequently

**4. Ignoring Deprecation Warnings**
- Address deprecation warnings promptly
- Plan removal timeline
- Update consumers before removal

**5. Not Testing Thoroughly**
- Run full test suite
- Manual testing of affected features
- Integration testing
- Performance testing if applicable

---

## TODO / Roadmap

### Short-Term (Q1 2026)

- [ ] **Path Alias Migration**
  - [ ] Configure all planned aliases in `vite.config.ts`
  - [ ] Update `tsconfig.json` paths
  - [ ] Migrate imports incrementally
  - [ ] Remove relative import patterns
  - [ ] Add ESLint rules to enforce aliases

- [ ] **Component Migration**
  - [ ] Complete migration of `components/` to `features/`
  - [ ] Move shared components to `shared/components/`
  - [ ] Update all import paths
  - [ ] Remove legacy `components/` directory

- [ ] **Service Migration**
  - [ ] Migrate services to feature-based structure
  - [ ] Move shared services to `shared/services/`
  - [ ] Update service imports
  - [ ] Remove legacy `services/` directory

### Medium-Term (Q2 2026)

- [ ] **Feature-Based Organization**
  - [ ] Complete feature module structure
  - [ ] Ensure all features are self-contained
  - [ ] Minimize cross-feature dependencies
  - [ ] Document feature boundaries

- [ ] **Legacy Code Removal**
  - [ ] Remove all deprecated code
  - [ ] Clean up unused imports
  - [ ] Remove legacy directory structures
  - [ ] Update documentation

- [ ] **Migration Automation**
  - [ ] Create migration scripts
  - [ ] Set up import validation
  - [ ] Add CI/CD checks
  - [ ] Document migration tools

### Long-Term (Q3-Q4 2026)

- [ ] **Monorepo Adoption**
  - [ ] Evaluate monorepo tools
  - [ ] Design package structure
  - [ ] Plan migration strategy
  - [ ] Execute migration

- [ ] **TypeScript Migration**
  - [ ] Plan TypeScript adoption
  - [ ] Migrate incrementally
  - [ ] Update build configuration
  - [ ] Train team on TypeScript

- [ ] **Build System Optimization**
  - [ ] Optimize build configuration
  - [ ] Improve code splitting
  - [ ] Enhance tree shaking
  - [ ] Optimize bundle size

---

## Related Documentation

- [Code Organization](./code-organization.md) - Project structure and organization guidelines
- [Backend Architecture](../architecture/backend-architecture.md) - Backend system architecture
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend system architecture
- [Debugging](./debugging.md) - Debugging workflows and tools
- [Testing](./testing.md) - Testing strategies and procedures
- [Setup](./setup.md) - Development environment setup
- [Docker Containerization System](./docker-containerization-system.md) - Docker-based service orchestration and development workflow

---

## Changelog

**2026-01-07:**
- Initial migration playbook created
- Documented migration scenarios and procedures
- Added alias management guidelines
- Created legacy code mapping guide
- Documented known issues and solutions
