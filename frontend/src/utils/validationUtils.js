/**
 * Validation Utilities
 * Functions for input validation, email/password rules, and quota checking
 * 
 * This module provides utilities for:
 * - Input validation (email, password, text fields)
 * - Article configuration validation
 * - Quota checking and usage validation
 * - Keyword and topic validation
 * 
 * @module utils/validationUtils
 */

/**
 * Validate email address format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 * 
 * @example
 * const isValid = validateEmail('user@example.com');
 * // Returns: true
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @param {boolean} options.requireUppercase - Require uppercase letter (default: false)
 * @param {boolean} options.requireLowercase - Require lowercase letter (default: false)
 * @param {boolean} options.requireNumber - Require number (default: false)
 * @param {boolean} options.requireSpecial - Require special character (default: false)
 * @returns {Object} Validation result with valid boolean and errors array
 * 
 * @example
 * const result = validatePassword('MyPassword123!', { minLength: 8 });
 * // Returns: { valid: true, errors: [] }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false
  } = options;
  
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate and optimize topic
 * 
 * @param {string} topic - Topic to validate and optimize
 * @returns {string} Optimized topic
 * @throws {Error} If topic is invalid
 * 
 * @example
 * try {
 *   const optimized = optimizeTopic('React Hooks Tutorial');
 *   // Returns: 'React Hooks Tutorial'
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export const optimizeTopic = (topic) => {
  if (!topic) return '';
  
  const sanitized = topic.trim().replace(/\s+/g, ' ');
  
  if (sanitized.length < 3) {
    throw new Error('Topic must be at least 3 characters long');
  }
  
  if (sanitized.length > 200) {
    throw new Error('Topic must be less than 200 characters');
  }
  
  return sanitized;
};

/**
 * Extract and optimize keywords (validates and formats)
 * 
 * @param {Array<string>} keywords - Array of keywords
 * @returns {Array<string>} Optimized keywords array (max 10, lowercase, deduplicated)
 * 
 * @example
 * const optimized = optimizeKeywords(['React', 'react', 'HOOKS', 'JavaScript']);
 * // Returns: ['react', 'hooks', 'javascript']
 */
export const optimizeKeywords = (keywords) => {
  if (!keywords || !Array.isArray(keywords)) return [];
  
  return keywords
    .map(kw => kw.trim().replace(/\s+/g, ' '))
    .filter(kw => kw.length > 0 && kw.length < 50)
    .filter((kw, index, self) => self.indexOf(kw) === index) // Remove duplicates
    .slice(0, 10) // Limit to 10 keywords
    .map(kw => kw.toLowerCase());
};

/**
 * Validate article configuration
 * 
 * @param {Object} config - Article configuration object
 * @param {string} config.topic - Article topic
 * @param {Array<string>} config.keywords - Keywords array
 * @param {string} config.articleSize - Article size option
 * @returns {Object} Validation result with valid boolean and errors array
 * 
 * @example
 * const result = validateArticleConfig({
 *   topic: 'React Hooks',
 *   keywords: ['react', 'hooks'],
 *   articleSize: 'Medium (1,200-1,800 words)'
 * });
 * // Returns: { valid: true, errors: [] }
 */
export const validateArticleConfig = (config) => {
  const errors = [];
  
  if (!config.topic || config.topic.trim().length < 3) {
    errors.push('Topic is required and must be at least 3 characters');
  }
  
  if (config.keywords && !Array.isArray(config.keywords)) {
    errors.push('Keywords must be an array');
  }
  
  if (config.articleSize && !['Small', 'Medium', 'Large'].some(size => 
    config.articleSize.includes(size)
  )) {
    errors.push('Invalid article size');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if usage is at or above warning threshold (90%)
 * 
 * @param {number} used - Current usage count
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {boolean} True if usage >= 90%
 * 
 * @example
 * const warning = isQuotaWarning(90, 100);
 * // Returns: true
 */
export const isQuotaWarning = (used, limit) => {
  if (limit === -1) return false; // Unlimited
  if (limit === 0) return true; // No quota
  const percentage = (used / limit) * 100;
  return percentage >= 90;
};

/**
 * Check if quota is exceeded
 * 
 * @param {number} used - Current usage count
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {boolean} True if quota exceeded
 * 
 * @example
 * const exceeded = isQuotaExceeded(100, 100);
 * // Returns: true
 */
export const isQuotaExceeded = (used, limit) => {
  if (limit === -1) return false; // Unlimited
  return used >= limit;
};

/**
 * Get usage percentage
 * 
 * @param {number} used - Current usage count
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {number} Usage percentage (0-100)
 * 
 * @example
 * const percentage = getUsagePercentage(75, 100);
 * // Returns: 75
 */
export const getUsagePercentage = (used, limit) => {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
};

/**
 * Check if a feature can be used based on usage stats
 * 
 * @param {Object} usageStats - Usage stats object from API
 * @param {string} feature - Feature name ('articles', 'images', 'videos', 'research', 'wordpress')
 * @returns {Object} Quota check result with allowed, warning, exceeded, percentage, remaining, used, limit
 * 
 * @example
 * const quotaCheck = checkFeatureQuota({
 *   articles: { used: 90, limit: 100, remaining: 10 }
 * }, 'articles');
 * // Returns: { allowed: true, warning: true, exceeded: false, percentage: 90, remaining: 10, used: 90, limit: 100 }
 */
export const checkFeatureQuota = (usageStats, feature) => {
  if (!usageStats || !usageStats[feature]) {
    return {
      allowed: false,
      warning: false,
      exceeded: true,
      percentage: 100,
      remaining: 0,
      used: 0,
      limit: 0
    };
  }

  const featureUsage = usageStats[feature];
  const used = featureUsage.used || 0;
  const limit = featureUsage.limit || 0;
  const remaining = featureUsage.remaining || 0;

  const percentage = getUsagePercentage(used, limit);
  const warning = isQuotaWarning(used, limit);
  const exceeded = isQuotaExceeded(used, limit);
  const allowed = !exceeded;

  return {
    allowed,
    warning,
    exceeded,
    percentage,
    remaining,
    used,
    limit
  };
};

/**
 * Get warning message for a feature based on quota check
 * 
 * @param {Object} quotaCheck - Result from checkFeatureQuota
 * @param {string} featureName - Display name for the feature
 * @returns {string|null} Warning message or null if no warning needed
 * 
 * @example
 * const message = getQuotaWarningMessage({ warning: true, percentage: 95, remaining: 5 }, 'Articles');
 * // Returns: "You're using 95% of your Articles quota (5 remaining). Consider upgrading your plan."
 */
export const getQuotaWarningMessage = (quotaCheck, featureName) => {
  if (!quotaCheck.warning && !quotaCheck.exceeded) {
    return null;
  }

  if (quotaCheck.exceeded) {
    return `You have reached your ${featureName} quota limit. Please upgrade your plan to continue.`;
  }

  if (quotaCheck.warning) {
    return `You're using ${quotaCheck.percentage}% of your ${featureName} quota (${quotaCheck.remaining} remaining). Consider upgrading your plan.`;
  }

  return null;
};
