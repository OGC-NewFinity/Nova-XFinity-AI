---
description: Modular, provider-agnostic, and extensible design of the Nova‑XFinity AI Agent, including routing, hooks, and plugin extensions.
lastUpdated: 2026-01-07
status: Draft
---

# Extending the Nova‑XFinity AI Agent

## Overview
Nova‑XFinity’s AI Agent is designed to be modular, provider‑agnostic, and safely extensible. It powers content generation, media creation, research, and SEO analysis while allowing teams to:
- Compose capabilities from multiple providers and tools
- Swap/route between models dynamically (Gemini, OpenAI‑compatible, Anthropic, local)
- Add new providers and execution layers without changing call sites
- Standardize formatting, output quality, and telemetry

Design philosophy:
- Composition over coupling: features are built as interchangeable layers.
- Capability‑first routing: select the best provider given task, cost, and availability.
- Safe by default: API keys are isolated; fallbacks avoid hard failures.
- Observable and testable: hooks and structured interfaces enable targeted testing.

## Core Architecture
At a high level, the Agent follows a layered lifecycle:
1) Input parsing and normalization
   - Utility helpers to sanitize and validate inputs (see `utils/inputOptimizer.js`).
2) Routing
   - Determine provider and model from user settings, feature flags, or capabilities.
3) Provider execution
   - Adapt request/response shape for the selected provider (e.g., Gemini, OpenAI‑compatible, Anthropic, local).
   - Graceful fallback to a default provider when possible.
4) Post‑processing and formatting
   - Clean and transform responses to match product requirements (see `utils/outputOptimizer.js` and local cleaners).
5) Observability and lifecycle hooks
   - Optional pre/post hooks for metrics, logging, redaction, and policy checks.

Current key modules:
- Routing and AI operations: `services/geminiService.js` (generalized caller with fallback, plus content/media utilities)
- Provider config: `services/ai/providerManager.js`
- Input utilities: `utils/inputOptimizer.js`
- Output utilities: `utils/outputOptimizer.js`

Example generated flows implemented today:
- Text content: `generateMetadata`, `generateOutline`, `generateSection`, `generateCTA`
- Media: `generateImage`, `editImage`, `generateVideo`, `generateAudio`
- Analysis/Research: `checkPlagiarism`, `performResearch`, `analyzeSEO`

## Provider Routing
Routing resolves which provider to use and how to shape the request:
- User settings are read from `localStorage` key `finity_settings` and merged with env keys.
- The config map defines base URLs, models, and keys.
- A generalized caller builds payloads for OpenAI‑compatible and Anthropic styles, or uses the Gemini SDK.
- On failure, a safe fallback to Gemini is attempted when configured.

Provider selection (simplified):
```js
// Pseudocode reflecting services/geminiService.js behavior
const config = getProviderConfig(); // derives id, key, baseUrl, model from settings/env
if (!config.key && config.id !== 'gemini') throw new Error('Missing API key');

if (config.id === 'gemini') {
  // Use @google/genai SDK
} else if (['openai', 'llama'].includes(config.id)) {
  // Use OpenAI-compatible chat completions schema
} else if (config.id === 'anthropic') {
  // Use Anthropic messages schema and headers
}
// On error, attempt Gemini fallback if primary ≠ 'gemini'
```

## Extensibility API
The Agent is intentionally simple to extend. You can add providers, formatters, hooks, or even replace execution layers.

- New model providers
  - Extend the provider config map with `id`, `baseUrl`, `model`, and `key` resolution.
  - Implement minimal branching for payload/headers if the schema differs.
- Formatters
  - Inject post‑processing to enforce output structure, clean markdown/HTML, or annotate SEO metadata.
- Pre/Post hooks
  - Attach hooks for metrics, redaction, retries, and policy validation.
- Custom execution layers
  - Wrap the core `callAI` with your own orchestrator, or register a task‑specific executor (e.g., research, retrieval‑augmented steps).

Suggested lightweight registration surfaces (optional utility you can introduce next to the Agent):
```js
// providerRegistry.js
const providers = new Map();
export const registerProvider = (id, impl) => providers.set(id, impl);
export const getProvider = (id) => providers.get(id);

const formatters = new Map();
export const registerFormatter = (name, fn) => formatters.set(name, fn);
export const formatWith = (name, value, options) => (formatters.get(name) || ((x)=>x))(value, options);

const hooks = { 'pre:route': [], 'pre:execute': [], 'post:execute': [], 'post:format': [] };
export const addHook = (event, fn) => hooks[event]?.push(fn);
export const runHooks = async (event, ctx) => { for (const fn of hooks[event] || []) await fn(ctx); };
```

You can incrementally adopt the registry without breaking current APIs. Keep `getProviderConfig` as a simple compatibility layer that consults the registry first, then falls back to the static config map.

## Example Extensions

### 1) Add a new model provider (local Ollama)
Add configuration and payload handling for Ollama (OpenAI‑compatible shape) by extending the config map:
```js
// Inside getProviderConfig()
const configs = {
  // ...
  ollama: {
    key: null, // typically not needed for local Ollama
    baseUrl: 'http://localhost:11434/v1/chat/completions',
    model: 'llama3.1:8b'
  }
};
```

Update compatibility branching where payloads are built:
```js
const isOpenAICompatible = ['openai', 'llama', 'ollama'].includes(config.id);
const payload = isOpenAICompatible
  ? {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    }
  : /* provider-specific body */;

const headers = {
  'Content-Type': 'application/json',
  ...(config.id === 'openai' && { 'Authorization': `Bearer ${config.key}` }),
  ...(config.id === 'llama' && { 'Authorization': `Bearer ${config.key}` })
  // No auth header for local Ollama
};
```

Usage stays the same for callers (`generateOutline`, `generateSection`, etc.), because routing/execution is abstracted.

### 2) Inject a custom formatting function
Wrap the Agent’s result with your formatter. You can integrate with `utils/outputOptimizer.js` or register your own:
```js
// register once at app bootstrap
registerFormatter('myHtmlPolish', (html, options) => {
  return optimizeContent(html, { optimizeStructure: true, ...options });
});

// at call site
const raw = await callAI(userPrompt, systemPrompt);
const polished = formatWith('myHtmlPolish', raw, { removeUnnecessaryTags: true });
```

If you prefer not to introduce a registry yet, pass a formatter as an option and apply it after `callAI`:
```js
const text = await callAI(prompt, systemPrompt);
const output = myFormatter ? myFormatter(text) : text;
```

### 3) Handle async streaming and long‑running tools
For streaming responses (OpenAI‑compatible), use a readable stream and an `onChunk` callback:
```js
export async function callAIStreaming({ url, headers, body, onChunk, signal }) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ ...body, stream: true }), signal });
  if (!res.body) throw new Error('Streaming not supported by response');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk?.(decoder.decode(value, { stream: true }));
  }
}
```

For long‑running operations, poll status and support cancellation:
```js
export async function pollOperationUntilDone({ start, poll, intervalMs = 5000, signal }) {
  let op = await start();
  while (!op.done) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, intervalMs));
    op = await poll(op);
    if (op.error) throw new Error(op.error.message || 'Operation failed');
  }
  return op.response;
}
// Example aligns with generateVideo() pattern in services/geminiService.js
```

## Planned Features
- Streaming across all OpenAI‑compatible providers (with unified `onChunk` API)
- Sandboxed tools and tool‑use policy (web search, retrieval, structured I/O)
- Async chaining and step‑wise orchestration (planner/executor pattern)
- Provider health checks, circuit breakers, and adaptive routing
- Fine‑grained telemetry with evented hooks (trace IDs, spans)
- First‑class TypeScript types for providers, hooks, and formatters
- Capability registry (vision, JSON mode, tools, streaming) for smarter routing
- E2E tests and simulators for fallback/timeout scenarios

## Related Documentation
- [ai-service-flow.md](../ai-service-flow.md)
- [api-key-integration-guide.md](../api-key-integration-guide.md)
- [debugging.md](../development/debugging.md)
- [testing.md](../development/testing.md)
- [architecture/backend-architecture.md](../architecture/backend-architecture.md)

