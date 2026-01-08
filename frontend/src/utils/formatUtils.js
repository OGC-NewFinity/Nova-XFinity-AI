/**
 * Format Utilities
 * Functions for data formatting, string conversions, and text transformations
 * 
 * This module provides utilities for:
 * - HTML content cleaning and optimization
 * - Text formatting and normalization
 * - String case conversions
 * - SEO content formatting
 * - Image metadata formatting
 * 
 * @module utils/formatUtils
 */

/**
 * Clean HTML content by removing unsafe tags and normalizing whitespace
 * 
 * @param {string} html - HTML content to clean
 * @returns {string} Cleaned HTML content
 * 
 * @example
 * const cleaned = cleanHTML('<script>alert("xss")</script><p>Content</p>');
 * // Returns: '<p>Content</p>'
 */
export const cleanHTML = (html) => {
  if (!html) return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Sanitize and clean text input
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 * 
 * @example
 * const sanitized = sanitizeText('  Hello   World!!!  ');
 * // Returns: 'Hello World!!!'
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
 * Convert string to lowercase
 * 
 * @param {string} str - String to convert
 * @returns {string} Lowercase string
 * 
 * @example
 * const lower = toLowerCase('Hello World');
 * // Returns: 'hello world'
 */
export const toLowerCase = (str) => {
  return str ? str.toLowerCase() : '';
};

/**
 * Convert string to uppercase
 * 
 * @param {string} str - String to convert
 * @returns {string} Uppercase string
 * 
 * @example
 * const upper = toUpperCase('hello world');
 * // Returns: 'HELLO WORLD'
 */
export const toUpperCase = (str) => {
  return str ? str.toUpperCase() : '';
};

/**
 * Capitalize first letter of string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * const capitalized = capitalize('hello world');
 * // Returns: 'Hello world'
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to title case (capitalize first letter of each word)
 * 
 * @param {string} str - String to convert
 * @returns {string} Title case string
 * 
 * @example
 * const title = toTitleCase('hello world example');
 * // Returns: 'Hello World Example'
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert string to URL-friendly slug
 * 
 * @param {string} str - String to convert to slug
 * @returns {string} URL-friendly slug
 * 
 * @example
 * const slug = slugify('Hello World Example!');
 * // Returns: 'hello-world-example'
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format keywords input string into array
 * 
 * @param {string} input - Comma-separated keywords string
 * @returns {string[]} Array of formatted keywords
 * 
 * @example
 * const keywords = formatKeywordsInput('react, hooks, javascript');
 * // Returns: ['react', 'hooks', 'javascript']
 */
export const formatKeywordsInput = (input) => {
  if (!input) return [];
  
  return input
    .split(',')
    .map(kw => kw.trim())
    .filter(kw => kw.length > 0);
};

/**
 * Optimize image alt text for SEO
 * 
 * @param {string} prompt - Image generation prompt
 * @param {string} focusKeyphrase - SEO focus keyphrase (optional)
 * @returns {string} Optimized alt text (max 125 characters)
 * 
 * @example
 * const alt = optimizeImageAlt('A futuristic cityscape at sunset', 'future technology');
 * // Returns: 'futuristic cityscape at sunset - future technology'
 */
export const optimizeImageAlt = (prompt, focusKeyphrase = '') => {
  if (!prompt) return 'Image';
  
  // Extract main subject from prompt
  let alt = prompt
    .toLowerCase()
    .replace(/generate|create|make|show|display|image of|picture of/gi, '')
    .trim()
    .substring(0, 100);
  
  // Add focus keyphrase if provided
  if (focusKeyphrase && !alt.includes(focusKeyphrase.toLowerCase())) {
    alt = `${alt} - ${focusKeyphrase}`;
  }
  
  // Ensure proper length
  if (alt.length > 125) {
    alt = alt.substring(0, 122) + '...';
  }
  
  return alt || 'Image';
};

/**
 * Optimize meta description for SEO
 * 
 * @param {string} description - Description text
 * @param {number} maxLength - Maximum length (default: 160)
 * @returns {string} Optimized meta description
 * 
 * @example
 * const meta = optimizeMetaDescription('<p>Long description text...</p>', 160);
 * // Returns: 'Long description text...' (without HTML, truncated to 160 chars)
 */
export const optimizeMetaDescription = (description, maxLength = 160) => {
  if (!description) return '';
  
  let optimized = description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (optimized.length > maxLength) {
    optimized = optimized.substring(0, maxLength - 3).trim() + '...';
  }
  
  return optimized;
};

/**
 * Optimize SEO title
 * 
 * @param {string} title - Title text
 * @param {number} maxLength - Maximum length (default: 60)
 * @returns {string} Optimized SEO title
 * 
 * @example
 * const seoTitle = optimizeSEOTitle('Very Long Title That Exceeds Limits');
 * // Returns: 'Very Long Title That Exceeds...'
 */
export const optimizeSEOTitle = (title, maxLength = 60) => {
  if (!title) return '';
  
  let optimized = title
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
  
  if (optimized.length > maxLength) {
    optimized = optimized.substring(0, maxLength - 3).trim() + '...';
  }
  
  return optimized;
};

/**
 * Count words in text content
 * 
 * @param {string} text - Text content (may include HTML)
 * @returns {number} Word count
 * 
 * @example
 * const count = countWords('<p>This is a test paragraph with five words.</p>');
 * // Returns: 8
 */
export const countWords = (text) => {
  if (!text) return 0;
  
  const cleaned = text.replace(/<[^>]*>/g, ' '); // Remove HTML tags
  const words = cleaned.match(/\S+/g);
  return words ? words.length : 0;
};

/**
 * Format image metadata object
 * 
 * @param {string} imagePrompt - Image generation prompt
 * @param {string} style - Image style (default: 'Photorealistic')
 * @param {string} aspectRatio - Aspect ratio (default: '16:9')
 * @param {string} focusKeyphrase - SEO focus keyphrase (optional)
 * @returns {Object} Formatted image metadata object
 * 
 * @example
 * const metadata = formatImageMetadata(
 *   'A futuristic cityscape',
 *   'Cinematic',
 *   '16:9',
 *   'future technology'
 * );
 * // Returns: { style: 'Cinematic', aspect: '16:9', alt: '...', prompt: '...', timestamp: '...' }
 */
export const formatImageMetadata = (imagePrompt, style, aspectRatio, focusKeyphrase) => {
  return {
    style: style || 'Photorealistic',
    aspect: aspectRatio || '16:9',
    alt: optimizeImageAlt(imagePrompt, focusKeyphrase),
    prompt: imagePrompt.substring(0, 500), // Limit prompt length
    timestamp: new Date().toISOString()
  };
};

/**
 * Optimize content structure for proper HTML hierarchy
 * 
 * @param {string} html - HTML content
 * @returns {string} Optimized HTML with proper structure
 */
export const optimizeContentStructure = (html) => {
  if (!html) return '';
  
  let optimized = html;
  
  // Ensure proper heading hierarchy
  optimized = optimized.replace(/<h3>(.*?)<\/h3>/gi, (match, content) => {
    // Check if there's an h2 before this
    const before = optimized.substring(0, optimized.indexOf(match));
    if (!before.includes('<h2')) {
      return `<h2>${content}</h2>`;
    }
    return match;
  });
  
  // Ensure paragraphs are properly wrapped
  optimized = optimized.replace(/(?<!<p>)([^\n<]+?)(?<!<\/p>)(?=\n|$)/g, (match) => {
    if (match.trim() && !match.startsWith('<')) {
      return `<p>${match.trim()}</p>`;
    }
    return match;
  });
  
  return optimized;
};

/**
 * Remove unnecessary HTML tags
 * 
 * @param {string} html - HTML content
 * @returns {string} HTML with unnecessary tags removed
 */
export const removeUnnecessaryTags = (html) => {
  if (!html) return '';
  
  return html
    .replace(/<div[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '');
};

/**
 * Optimize content for readability
 * 
 * @param {string} html - HTML content
 * @returns {string} Optimized content
 */
export const optimizeReadability = (html) => {
  if (!html) return '';
  
  let optimized = html;
  
  // Ensure sentences end with proper punctuation
  optimized = optimized.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
  
  // Ensure paragraphs are separated
  optimized = optimized.replace(/<\/p>\s*<p>/g, '</p>\n<p>');
  
  // Remove excessive line breaks
  optimized = optimized.replace(/\n{3,}/g, '\n\n');
  
  return optimized;
};

/**
 * Complete content optimization pipeline
 * 
 * @param {string} html - HTML content to optimize
 * @param {Object} options - Optimization options
 * @param {boolean} options.removeUnnecessaryTags - Whether to remove unnecessary tags (default: true)
 * @param {boolean} options.optimizeStructure - Whether to optimize structure (default: true)
 * @param {boolean} options.optimizeReadability - Whether to optimize readability (default: true)
 * @returns {string} Fully optimized content
 * 
 * @example
 * const optimized = optimizeContent('<div>Content</div>', {
 *   removeUnnecessaryTags: true,
 *   optimizeStructure: true
 * });
 */
export const optimizeContent = (html, options = {}) => {
  let optimized = html;
  
  // Clean HTML
  optimized = cleanHTML(optimized);
  
  // Remove unnecessary tags
  if (options.removeUnnecessaryTags !== false) {
    optimized = removeUnnecessaryTags(optimized);
  }
  
  // Optimize structure
  if (options.optimizeStructure !== false) {
    optimized = optimizeContentStructure(optimized);
  }
  
  // Optimize readability
  if (options.optimizeReadability !== false) {
    optimized = optimizeReadability(optimized);
  }
  
  return optimized;
};

/**
 * Optimize prompt for AI generation by combining topic, keywords, article type, and tone
 * 
 * @param {string} topic - Article topic
 * @param {Array<string>} keywords - Array of keywords (optional)
 * @param {string} articleType - Article type (optional)
 * @param {string} tone - Writing tone (optional)
 * @returns {string} Formatted prompt string
 * 
 * @example
 * const prompt = optimizePrompt('React Hooks', ['react', 'hooks'], 'How-to guide', 'Professional');
 * // Returns: 'Topic: React Hooks\nKeywords: react, hooks\nArticle Type: How-to guide\nTone: Professional'
 */
export const optimizePrompt = (topic, keywords = [], articleType = '', tone = '') => {
  let prompt = `Topic: ${topic}`;
  
  if (keywords && keywords.length > 0) {
    prompt += `\nKeywords: ${keywords.join(', ')}`;
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
 * Optimize source context (RSS/Pulse Mode) by cleaning and truncating
 * 
 * @param {string} context - Source context/RSS data
 * @param {number} maxLength - Maximum length (default: 5000)
 * @returns {string} Optimized context string
 * 
 * @example
 * const optimized = optimizeSourceContext('  Long RSS feed content...  ');
 * // Returns cleaned and truncated context
 */
export const optimizeSourceContext = (context, maxLength = 5000) => {
  if (!context) return '';
  
  // Remove excessive whitespace
  const cleaned = context.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent token overflow
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + '...';
  }
  
  return cleaned;
};
