# Contributing to Nova‑XFinity AI

Thank you for your interest in contributing to Nova‑XFinity AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
- [Coding Guidelines](#coding-guidelines)
  - [Folder Structure](#folder-structure)
  - [Style Rules](#style-rules)
- [Pull Request Process](#pull-request-process)
  - [Before Submitting](#before-submitting)
  - [PR Guidelines](#pr-guidelines)
  - [Review and Approval](#review-and-approval)
- [Issue Guidelines](#issue-guidelines)
- [Questions](#questions)

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### Setup Instructions

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nova-XFinity-AI.git
   cd Nova-XFinity-AI
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/OGC-NewFinity/Nova-XFinity-AI.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

For detailed setup instructions including Docker setup, see [`docs/development/setup.md`](docs/development/setup.md).

---

## Development Workflow

### Branch Naming

Use descriptive branch names with the following prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-voice-synthesis` |
| `fix/` | Bug fixes | `fix/auth-token-expiry` |
| `docs/` | Documentation | `docs/api-examples` |
| `refactor/` | Code refactoring | `refactor/provider-manager` |
| `test/` | Test additions | `test/quota-service` |
| `chore/` | Maintenance | `chore/update-dependencies` |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` – New feature
- `fix:` – Bug fix
- `docs:` – Documentation changes
- `style:` – Code style (formatting, missing semicolons)
- `refactor:` – Code refactoring
- `test:` – Adding or updating tests
- `chore:` – Maintenance tasks

**Examples:**
```bash
feat(media): add support for Suno audio generation

Integrated Suno API for AI-powered audio generation with
customizable style parameters and format options.

Closes #123
```

```bash
fix(auth): resolve JWT refresh token race condition

Fixed issue where concurrent requests during token refresh
could cause authentication failures.

Fixes #456
```

---

## Coding Guidelines

### Folder Structure

```
Nova-XFinity-AI/
├── frontend/           # React page components (Vite)
├── backend/            # Express API (Node.js)
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── config/     # Configuration
│   └── prisma/         # Database schema
├── backend-auth/       # FastAPI auth service (Python)
├── components/         # Shared React components
├── services/           # Frontend services (API clients)
├── hooks/              # Custom React hooks
├── utils/              # Shared utilities
├── pages/              # Page-level components
└── docs/               # Documentation
```

### Style Rules

**JavaScript/TypeScript:**
- Use ES6+ features
- Prefer functional components with hooks
- Keep components under 150 lines
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

**Formatting:**
- Use Prettier for code formatting
- Use ESLint for linting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline

**React:**
- One component per file
- Use custom hooks for reusable logic
- Prefer composition over inheritance
- Memoize expensive computations

**Backend:**
- RESTful API conventions
- Consistent error handling
- Input validation on all endpoints
- Async/await for asynchronous code

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Check linting:**
   ```bash
   npm run lint
   ```

4. **Format code:**
   ```bash
   npm run format
   ```

5. **Update documentation** if your changes affect user-facing features or APIs

### PR Guidelines

When creating a pull request:

1. **Use a clear, descriptive title** following conventional commit format
2. **Fill out the PR template** completely
3. **Link related issues** using keywords (Closes #123, Fixes #456)
4. **Add screenshots** for UI changes
5. **Request review** from at least one maintainer

**PR Description Template:**
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review and Approval

1. All PRs require at least **one approving review** from a maintainer
2. Address all review comments before merging
3. Ensure CI checks pass
4. Squash commits if requested
5. Maintainers will merge approved PRs

---

## Issue Guidelines

### Bug Reports

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots or logs if applicable

### Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:
- Problem description
- Proposed solution
- Use cases
- Alternative approaches considered

---

## Questions

- **Check existing documentation** in [`docs/`](docs/)
- **Search existing issues** before creating new ones
- **Use GitHub Discussions** for general questions
- **Contact maintainers** at dev@ogcnewfinity.com

---

Thank you for contributing to Nova‑XFinity AI! 🎉
