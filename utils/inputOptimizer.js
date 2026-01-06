/**
 * Input Optimization Utilities
 * Optimizes user inputs for better AI processing
 */

/**
 * Sanitize and clean text input
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-.,!?;:()\[\]{}'"]/g, '') // Remove special characters except basic punctuation
    .substring(0, 5000); // Limit length
};

/**
 * Extract and optimize keywords
 */
export const optimizeKeywords = (keywords) => {
  if (!keywords || !Array.isArray(keywords)) return [];
  
  return keywords
    .map(kw => sanitizeText(kw))
    .filter(kw => kw.length > 0 && kw.length < 50)
    .filter((kw, index, self) => self.indexOf(kw) === index) // Remove duplicates
    .slice(0, 10) // Limit to 10 keywords
    .map(kw => kw.toLowerCase());
};

/**
 * Validate and optimize topic
 */
export const optimizeTopic = (topic) => {
  if (!topic) return '';
  
  const sanitized = sanitizeText(topic);
  
  if (sanitized.length < 3) {
    throw new Error('Topic must be at least 3 characters long');
  }
  
  if (sanitized.length > 200) {
    throw new Error('Topic must be less than 200 characters');
  }
  
  return sanitized;
};

/**
 * Optimize prompt for AI generation
 */
export const optimizePrompt = (topic, keywords = [], articleType = '', tone = '') => {
  const optimizedTopic = optimizeTopic(topic);
  const optimizedKeywords = optimizeKeywords(keywords);
  
  let prompt = `Topic: ${optimizedTopic}`;
  
  if (optimizedKeywords.length > 0) {
    prompt += `\nKeywords: ${optimizedKeywords.join(', ')}`;
  }
  
  if (articleType && articleType !== 'None (General Post)') {
    prompt += `\nArticle Type: ${articleType}`;
  }
  
  if (tone) {
    prompt += `\nTone: ${tone}`;
  }
  
  return prompt;
};

/**
 * Optimize source context (RSS/Pulse Mode)
 */
export const optimizeSourceContext = (context) => {
  if (!context) return '';
  
  // Remove excessive whitespace
  const cleaned = context.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent token overflow
  const maxLength = 5000;
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + '...';
  }
  
  return cleaned;
};

/**
 * Validate article configuration
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
 * Format keywords input string
 */
export const formatKeywordsInput = (input) => {
  if (!input) return [];
  
  return input
    .split(',')
    .map(kw => kw.trim())
    .filter(kw => kw.length > 0);
};
