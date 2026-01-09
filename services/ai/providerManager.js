/**
 * AI Provider Manager
 * 
 * ⚠️ DEPRECATED: This file is deprecated and should not be used.
 * 
 * SECURITY: This file previously attempted to access API keys from localStorage
 * and process.env, which is a security risk. API keys should NEVER be accessed
 * from frontend code or exposed to the client.
 * 
 * For backend usage, use: backend/src/services/ai/gemini.shared.js
 * For frontend usage, use: frontend/src/utils/providerUtils.js (provider metadata only)
 * 
 * All AI provider API calls must go through backend endpoints that securely
 * access API keys from environment variables.
 */

console.warn('⚠️ DEPRECATED: services/ai/providerManager.js is deprecated. Do not use this file.');

// Export stub functions that warn on usage
export const getProviderConfig = () => {
  console.error('⚠️ SECURITY: getProviderConfig() from providerManager.js is deprecated. Use backend services instead.');
  return {
    id: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-3-pro-preview'
    // SECURITY: No API key included
  };
};

export const getApiKey = () => {
  console.error('⚠️ SECURITY: getApiKey() from providerManager.js is deprecated. API keys are server-side only.');
  return null;
};
