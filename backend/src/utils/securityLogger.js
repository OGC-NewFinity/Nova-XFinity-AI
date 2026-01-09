/**
 * Security Logger
 * Utility for detecting and logging potential API key exposure
 */

/**
 * Check if a string contains what looks like an API key
 * @param {string} value - Value to check
 * @returns {boolean} True if value looks like an API key
 */
export const looksLikeApiKey = (value) => {
  if (!value || typeof value !== 'string') return false;
  
  // Common API key patterns
  const patterns = [
    /^sk-[a-zA-Z0-9]{32,}$/,           // OpenAI
    /^sk-ant-[a-zA-Z0-9-]{95,}$/,      // Anthropic
    /^gsk_[a-zA-Z0-9]{32,}$/,           // Groq
    /^[A-Za-z0-9_-]{39}$/,              // Gemini (39 chars)
    /^r8_[a-zA-Z0-9]{32,}$/,            // Replicate
    /^sk-[a-zA-Z0-9]{32,}$/,            // Stability AI
    /^pcsk_[a-zA-Z0-9]{32,}$/,         // Pinecone
  ];
  
  return patterns.some(pattern => pattern.test(value));
};

/**
 * Check if response data contains API keys
 * @param {Object} data - Response data to check
 * @param {string} context - Context for logging (e.g., 'API response', 'localStorage')
 * @returns {boolean} True if API keys detected
 */
export const detectApiKeyExposure = (data, context = 'unknown') => {
  if (!data || typeof data !== 'object') return false;
  
  let detected = false;
  const checkValue = (value, key) => {
    if (typeof value === 'string' && looksLikeApiKey(value)) {
      console.error(`⚠️  SECURITY ALERT: Potential API key detected in ${context}`);
      console.error(`⚠️  Key field: ${key}`);
      console.error(`⚠️  Key preview: ${value.substring(0, 10)}...`);
      detected = true;
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(subKey => checkValue(value[subKey], `${key}.${subKey}`));
    }
  };
  
  Object.keys(data).forEach(key => {
    // Skip known safe fields
    if (['hasOpenAIKey', 'hasClaudeKey', 'hasLlamaKey', 'hasGeminiKey'].includes(key)) {
      return;
    }
    checkValue(data[key], key);
  });
  
  return detected;
};

/**
 * Sanitize response data by removing any potential API keys
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeResponse = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const keyFields = ['openaiKey', 'claudeKey', 'llamaKey', 'geminiKey', 'apiKey', 'api_key'];
  
  keyFields.forEach(field => {
    if (sanitized[field]) {
      console.warn(`⚠️  SECURITY: Removing ${field} from response`);
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

/**
 * Log security warning for API key access attempt
 * @param {string} source - Source of the attempt (e.g., 'frontend', 'API endpoint')
 * @param {string} details - Additional details
 */
export const logKeyAccessAttempt = (source, details = '') => {
  console.error('⚠️  SECURITY WARNING: API key access attempt detected');
  console.error(`⚠️  Source: ${source}`);
  if (details) {
    console.error(`⚠️  Details: ${details}`);
  }
  // In production, you might want to send this to a security monitoring service
};
