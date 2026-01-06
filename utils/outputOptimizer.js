/**
 * Output Optimization Utilities
 * Optimizes generated content for better quality and SEO
 */

/**
 * Clean HTML content
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
 * Optimize image alt text
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
 * Optimize content structure
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
 * Optimize meta description
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
 * Count words in content
 */
export const countWords = (text) => {
  if (!text) return 0;
  
  const cleaned = text.replace(/<[^>]*>/g, ' '); // Remove HTML tags
  const words = cleaned.match(/\S+/g);
  return words ? words.length : 0;
};

/**
 * Optimize content for readability
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
 * Extract and format image metadata
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
 * Final content optimization pipeline
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
