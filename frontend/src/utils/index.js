/**
 * Utils Index
 * Central export point for all utility functions
 * 
 * This module provides a unified interface for accessing all utility functions
 * organized by category: formatting, validation, providers, and ID generation.
 * 
 * @module utils
 * 
 * @description
 * The utils index consolidates exports from:
 * - Format utilities (formatUtils.js) - Text formatting, HTML cleaning, SEO optimization
 * - Validation utilities (validationUtils.js) - Input validation, quota checking
 * - Provider utilities (providerUtils.js) - AI provider configuration and management
 * - ID utilities (idUtils.js) - UUID and ID generation
 * 
 * @example
 * // Import specific utilities
 * import { cleanHTML, slugify, validateEmail } from '@/utils';
 * 
 * // Or import from specific utility files
 * import { cleanHTML } from '@/utils/formatUtils.js';
 * import { validateEmail } from '@/utils/validationUtils.js';
 */

// Format utilities
export {
  cleanHTML,
  sanitizeText,
  toLowerCase,
  toUpperCase,
  capitalize,
  toTitleCase,
  slugify,
  formatKeywordsInput,
  optimizeImageAlt,
  optimizeMetaDescription,
  optimizeSEOTitle,
  countWords,
  formatImageMetadata,
  optimizeContentStructure,
  removeUnnecessaryTags,
  optimizeReadability,
  optimizeContent,
  optimizePrompt,
  optimizeSourceContext
} from './formatUtils.js';

// Validation utilities
export {
  validateEmail,
  validatePassword,
  optimizeTopic,
  optimizeKeywords,
  validateArticleConfig,
  isQuotaWarning,
  isQuotaExceeded,
  getUsagePercentage,
  checkFeatureQuota,
  getQuotaWarningMessage
} from './validationUtils.js';

// Provider utilities
export {
  getSavedSettings,
  getProviderConfig,
  getApiKey,
  getModelForProvider,
  getBaseUrlForProvider,
  requiresApiKey,
  validateApiKeyFormat,
  getFallbackChain
} from './providerUtils.js';

// ID utilities
export {
  generateUUID,
  generateRandomId,
  generateTimestampId,
  generateDraftId,
  generateShortId,
  generateNumericId
} from './idUtils.js';
