/**
 * Gemini Article Service
 * Frontend service for article generation, metadata, outlines, sections, and CTAs
 * 
 * This service handles all article-related AI operations including:
 * - Article metadata generation (SEO title, slug, meta description)
 * - Article outline generation
 * - Section content generation
 * - Call-to-Action (CTA) generation
 * - Plagiarism checking
 * 
 * @module services/geminiArticleService
 */

import api from './api.js';

/**
 * Generate article metadata (SEO title, slug, meta description, featured image)
 * 
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} articleType - Type of article (e.g., "Blog Post", "How-to Guide")
 * @param {string} language - Language code (e.g., "English (US)")
 * @param {string} articleSize - Target article size (e.g., "Medium (1,200-1,800 words)")
 * @param {string} pov - Point of view (e.g., "First Person", "Third Person")
 * @param {string} manualFocusKeyphrase - Manual focus keyphrase override
 * @param {string} imageStyle - Style for featured image (e.g., "Photorealistic")
 * @param {string} aspectRatio - Image aspect ratio (e.g., "16:9")
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<Object>} Metadata object with focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage
 * 
 * @example
 * const metadata = await generateMetadata(
 *   "React Hooks Guide",
 *   ["react", "hooks", "javascript"],
 *   "How-to Guide",
 *   "English (US)",
 *   "Medium (1,200-1,800 words)",
 *   "First Person",
 *   "react hooks tutorial",
 *   "Photorealistic",
 *   "16:9",
 *   "",
 *   "Technical (Development/Engineering)"
 * );
 */
export const generateMetadata = async (
  topic,
  keywords,
  articleType,
  language,
  articleSize,
  pov,
  manualFocusKeyphrase,
  imageStyle,
  aspectRatio,
  sourceContext,
  category
) => {
  try {
    const response = await api.post('/api/articles/metadata', {
      topic,
      keywords,
      articleType,
      language,
      articleSize,
      pov,
      manualFocusKeyphrase,
      imageStyle,
      aspectRatio,
      sourceContext,
      category
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error generating metadata:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate metadata');
  }
};

/**
 * Generate article outline (array of section headings)
 * 
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} articleType - Type of article
 * @param {string} language - Language code
 * @param {string} articleSize - Target article size
 * @param {string} pov - Point of view
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<string[]>} Array of section headings
 * 
 * @example
 * const outline = await generateOutline(
 *   "React Hooks Guide",
 *   ["react", "hooks"],
 *   "How-to Guide",
 *   "English (US)",
 *   "Medium (1,200-1,800 words)",
 *   "First Person",
 *   "",
 *   "Technical (Development/Engineering)"
 * );
 */
export const generateOutline = async (
  topic,
  keywords,
  articleType,
  language,
  articleSize,
  pov,
  sourceContext,
  category
) => {
  try {
    const response = await api.post('/api/articles/outline', {
      topic,
      keywords,
      articleType,
      language,
      articleSize,
      pov,
      sourceContext,
      category
    });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error generating outline:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate outline');
  }
};

/**
 * Generate content for a specific article section
 * 
 * @param {string} sectionTitle - Title of the section to generate
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} tone - Writing tone (e.g., "Professional", "Casual")
 * @param {string} articleType - Type of article
 * @param {string} language - Language code
 * @param {string} articleSize - Target article size
 * @param {string} pov - Point of view
 * @param {string} imageQuantity - Number of images to include
 * @param {string} aspectRatio - Image aspect ratio
 * @param {string} imageStyle - Image style
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<string>} Generated section content
 * 
 * @example
 * const content = await generateSection(
 *   "Introduction to React Hooks",
 *   "React Hooks Guide",
 *   ["react", "hooks"],
 *   "Professional",
 *   "How-to Guide",
 *   "English (US)",
 *   "Medium (1,200-1,800 words)",
 *   "First Person",
 *   "2",
 *   "16:9",
 *   "Photorealistic",
 *   "",
 *   "Technical (Development/Engineering)"
 * );
 */
export const generateSection = async (
  sectionTitle,
  topic,
  keywords,
  tone,
  articleType,
  language,
  articleSize,
  pov,
  imageQuantity,
  aspectRatio,
  imageStyle,
  sourceContext,
  category
) => {
  try {
    const response = await api.post('/api/articles/section', {
      sectionTitle,
      topic,
      keywords,
      tone,
      articleType,
      language,
      articleSize,
      pov,
      imageQuantity,
      aspectRatio,
      imageStyle,
      sourceContext,
      category
    });
    return response.data.data || response.data || '';
  } catch (error) {
    console.error('Error generating section:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate section');
  }
};

/**
 * Generate Call-to-Action (CTA) content
 * 
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<string>} Generated CTA content
 * 
 * @example
 * const cta = await generateCTA(
 *   "React Hooks Guide",
 *   ["react", "hooks", "javascript"],
 *   "react hooks tutorial"
 * );
 */
export const generateCTA = async (topic, keywords, focusKeyphrase) => {
  try {
    const response = await api.post('/api/articles/cta', {
      topic,
      keywords,
      focusKeyphrase
    });
    return response.data.data || response.data || '';
  } catch (error) {
    console.error('Error generating CTA:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate CTA');
  }
};

/**
 * Check content for plagiarism
 * 
 * @param {string} content - Content to check for plagiarism
 * @returns {Promise<Object>} Plagiarism check results
 * 
 * @example
 * const result = await checkPlagiarism("Article content here...");
 */
export const checkPlagiarism = async (content) => {
  try {
    const response = await api.post('/api/articles/plagiarism', {
      content
    });
    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to check plagiarism');
  }
};
