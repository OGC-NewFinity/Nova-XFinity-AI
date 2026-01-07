# Nova‑XFinity AI Platform

> 🚀 The all-in-one modular AI framework for chat, content, media, and automation — powered by multi-provider LLMs, extensible agents, and advanced system integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![CI](https://github.com/OGC-NewFinity/Nova-XFinity-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/OGC-NewFinity/Nova-XFinity-AI/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🔧 Quickstart

```bash
git clone https://github.com/OGC-NewFinity/Nova-XFinity-AI.git
cd Nova-XFinity-AI
npm install
npm run dev
```

See [`docs/development/setup.md`](docs/development/setup.md) for Docker setup.

---

## 📁 Monorepo Structure

```
Nova-XFinity-AI/
├── frontend/           # Vite + React frontend
├── backend/            # Node.js (Express) services
├── backend-auth/       # FastAPI authentication microservice
├── services/           # AI agent handlers, provider routers
├── components/         # Shared React components
├── pages/              # Page-level React components
├── hooks/              # Custom React hooks
├── utils/              # Shared utilities
├── docs/               # Internal documentation
└── wordpress-plugin/   # WordPress integration plugin
```

---

## 🧠 Core Features

- **Modular AI Agent System** - Extensible agent architecture for chat, content generation, and automation
- **Multi-Provider Routing** - Seamless switching between OpenAI, Gemini, Claude, Suno, and more
- **API Key Isolation per Tenant** - Secure multi-tenant key management with encryption
- **Token Economy with Quotas** - Flexible quota system with plan-based limits and usage tracking
- **Full Dev + CI/CD Support** - Docker-based development with automated testing

---

## 📄 Docs & Developer Guide

All internal architecture and dev documentation is available in the [`docs/`](docs/) folder.

---

## 🛠 Maintainers

- **Wael** – OGC NewFinity Founder

---

## 📌 Status

| Component | Status |
|-----------|--------|
| Frontend | ✅ Active Development |
| Backend API | ✅ Active Development |
| Auth Service | ✅ Stable |
| Documentation | ✅ Complete (Phase 1-3) |
| WordPress Plugin | 🚧 In Progress |
| Mobile App | 📋 Planned |

---

