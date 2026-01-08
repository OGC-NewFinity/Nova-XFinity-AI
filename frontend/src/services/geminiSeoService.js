/**
 * Gemini SEO Service
 * Frontend service for SEO analysis, suggestions, and audits
 * 
 * This service handles all SEO-related AI operations including:
 * - SEO content analysis
 * - Keyword optimization suggestions
 * - SEO audit reports
 * - Content quality scoring
 * 
 * @module services/geminiSeoService
 */

import api from './api.js';

/**
 * Analyze SEO for content
 * 
 * Analyzes content for SEO optimization, providing recommendations on:
 * - Keyword usage and density
 * - Content structure and readability
 * - Meta tag optimization
 * - Internal/external linking suggestions
 * - Content quality metrics
 * 
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Target keywords for the content
 * @returns {Promise<Object>} SEO analysis results with recommendations and scores
 * 
 * @example
 * const analysis = await analyzeSEO(
 *   "Full article content here...",
 *   ["react", "hooks", "javascript"]
 * );
 * 
 * // Returns object with:
 * // {
 * //   keywordDensity: {...},
 * //   readabilityScore: 85,
 * //   recommendations: [...],
 * //   metaSuggestions: {...},
 * //   overallScore: 82
 * // }
 */
export const analyzeSEO = async (content, keywords) => {
  try {
    const response = await api.post('/api/seo/analyze', {
      content,
      keywords
    });
    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to analyze SEO');
  }
};

/**
 * Get SEO suggestions for content improvement
 * 
 * Provides actionable SEO suggestions to improve content ranking potential
 * 
 * @param {string} content - Content to get suggestions for
 * @param {string[]} keywords - Target keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<Object>} SEO suggestions object
 * 
 * @example
 * const suggestions = await getSEOSuggestions(
 *   "Article content...",
 *   ["react", "hooks"],
 *   "react hooks tutorial"
 * );
 */
export const getSEOSuggestions = async (content, keywords, focusKeyphrase) => {
  try {
    const response = await api.post('/api/seo/suggestions', {
      content,
      keywords,
      focusKeyphrase
    });
    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error getting SEO suggestions:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get SEO suggestions');
  }
};

/**
 * Perform comprehensive SEO audit
 * 
 * Performs a full SEO audit including content analysis, technical SEO,
 * and optimization recommendations
 * 
 * @param {Object} auditData - Audit data object
 * @param {string} auditData.content - Full article content
 * @param {string} auditData.title - Article title
 * @param {string} auditData.metaDescription - Meta description
 * @param {string} auditData.focusKeyphrase - Primary focus keyphrase
 * @param {string[]} auditData.keywords - Additional keywords
 * @param {string} auditData.url - Article URL (optional)
 * @returns {Promise<Object>} Comprehensive SEO audit report
 * 
 * @example
 * const audit = await performSEOAudit({
 *   content: "Full article...",
 *   title: "React Hooks Guide",
 *   metaDescription: "Learn React Hooks...",
 *   focusKeyphrase: "react hooks tutorial",
 *   keywords: ["react", "hooks", "javascript"],
 *   url: "https://example.com/react-hooks"
 * });
 */
export const performSEOAudit = async (auditData) => {
  try {
    const response = await api.post('/api/seo/audit', auditData);
    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error performing SEO audit:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to perform SEO audit');
  }
};
