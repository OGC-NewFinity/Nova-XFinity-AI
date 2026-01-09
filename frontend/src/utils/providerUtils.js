/**
 * Provider Utilities
 * Functions for AI provider logic, configuration, and model mappings
 * 
 * SECURITY: This module does NOT handle API keys. All API keys are stored
 * server-side in environment variables and accessed only by backend services.
 * Frontend should only store provider preferences and make API calls through
 * backend endpoints.
 * 
 * This module provides utilities for:
 * - Provider configuration management (metadata only, no keys)
 * - Model selection and mapping
 * - Provider settings retrieval (preferences only)
 * 
 * @module utils/providerUtils
 */

/**
 * Get saved settings from localStorage
 * SECURITY: Only stores provider preference and non-sensitive settings.
 * API keys are NEVER stored in localStorage or accessed by frontend.
 * 
 * @returns {Object} Settings object with provider preference (no API keys)
 * 
 * @example
 * const settings = getSavedSettings();
 * // Returns: { provider: 'gemini', focusKeyphrase: '...' }
 */
export const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('nova_xfinity_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // SECURITY: Remove any API keys that might have been stored previously
      const { openaiKey, claudeKey, llamaKey, geminiKey, ...safeSettings } = parsed;
      if (openaiKey || claudeKey || llamaKey || geminiKey) {
        console.warn('⚠️ SECURITY: API keys detected in localStorage. Removing them.');
        localStorage.setItem('nova_xfinity_settings', JSON.stringify(safeSettings));
      }
      return safeSettings;
    }
  } catch (e) {
    console.error('Failed to parse saved settings:', e);
  }
  
  // Return default settings (no API keys)
  return {
    provider: 'gemini',
    focusKeyphrase: ''
  };
};

/**
 * Get provider configuration based on current settings
 * SECURITY: Returns provider metadata only. Does NOT include API keys.
 * All AI provider API calls must go through backend endpoints.
 * 
 * @returns {Object} Provider configuration with id, baseUrl, and model (NO KEY)
 * 
 * @example
 * const config = getProviderConfig();
 * // Returns: { id: 'gemini', baseUrl: '...', model: '...' }
 */
export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};

/**
 * Get API key for current provider
 * 
 * @deprecated SECURITY: This function is deprecated. API keys should NEVER
 * be accessed from frontend. All AI provider calls must go through backend APIs.
 * 
 * @returns {null} Always returns null - keys are server-side only
 */
export const getApiKey = () => {
  console.warn('⚠️ SECURITY: getApiKey() called from frontend. API keys are server-side only.');
  return null;
};

/**
 * Get model name for a specific provider
 * 
 * @param {string} providerId - Provider ID ('gemini', 'openai', 'anthropic', 'llama')
 * @returns {string|null} Model name or null if provider not found
 * 
 * @example
 * const model = getModelForProvider('gemini');
 * // Returns: 'gemini-3-pro-preview'
 */
export const getModelForProvider = (providerId) => {
  const modelMap = {
    gemini: 'gemini-3-pro-preview',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-latest',
    llama: 'llama-3.3-70b-versatile'
  };
  
  return modelMap[providerId] || null;
};

/**
 * Get base URL for a specific provider
 * 
 * @param {string} providerId - Provider ID
 * @returns {string|null} Base URL or null if provider not found
 * 
 * @example
 * const baseUrl = getBaseUrlForProvider('openai');
 * // Returns: 'https://api.openai.com/v1/chat/completions'
 */
export const getBaseUrlForProvider = (providerId) => {
  const urlMap = {
    gemini: 'https://generativelanguage.googleapis.com',
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    llama: 'https://api.groq.com/openai/v1/chat/completions'
  };
  
  return urlMap[providerId] || null;
};

/**
 * Check if provider requires API key
 * 
 * @param {string} providerId - Provider ID
 * @returns {boolean} True if provider requires API key
 * 
 * @example
 * const requiresKey = requiresApiKey('openai');
 * // Returns: true
 */
export const requiresApiKey = (providerId) => {
  // Gemini can use native context system, others require API keys
  return providerId !== 'gemini';
};

/**
 * Validate provider API key format
 * 
 * @param {string} providerId - Provider ID
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format is valid
 * 
 * @example
 * const isValid = validateApiKeyFormat('openai', 'sk-...');
 * // Returns: true
 */
export const validateApiKeyFormat = (providerId, apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  const validators = {
    openai: (k) => /^sk-[a-zA-Z0-9]{32,}$/.test(k),
    anthropic: (k) => /^sk-ant-[a-zA-Z0-9-]{95,}$/.test(k),
    gemini: (k) => /^[A-Za-z0-9_-]{39}$/.test(k),
    llama: (k) => /^gsk_[a-zA-Z0-9]{32,}$/.test(k)
  };
  
  const validator = validators[providerId];
  return validator ? validator(apiKey) : false;
};

/**
 * Get fallback provider chain for a given provider
 * 
 * @param {string} providerId - Primary provider ID
 * @returns {string[]} Array of fallback provider IDs in order
 * 
 * @example
 * const fallbacks = getFallbackChain('openai');
 * // Returns: ['gemini', 'anthropic', 'llama']
 */
export const getFallbackChain = (providerId) => {
  const chains = {
    openai: ['gemini', 'anthropic', 'llama'],
    gemini: ['openai', 'anthropic'],
    anthropic: ['gemini', 'openai'],
    llama: ['openai', 'gemini']
  };
  
  return chains[providerId] || ['gemini'];
};
