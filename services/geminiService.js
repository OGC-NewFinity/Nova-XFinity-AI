/**
 * Compatibility Re-export
 * This file maintains backward compatibility for frontend imports
 * All functionality has been moved to the backend API
 * 
 * @deprecated These functions should be called via the backend API endpoints
 */

// Stub functions - these should call the backend API instead
// See: /api/articles, /api/media, /api/research

const throwDeprecatedError = (fnName) => {
  throw new Error(`${fnName} is deprecated. Please use the backend API endpoints instead.`);
};

// Article functions
export const generateMetadata = (...args) => throwDeprecatedError('generateMetadata');
export const generateOutline = (...args) => throwDeprecatedError('generateOutline');
export const generateSection = (...args) => throwDeprecatedError('generateSection');
export const generateCTA = (...args) => throwDeprecatedError('generateCTA');
export const checkPlagiarism = (...args) => throwDeprecatedError('checkPlagiarism');
export const analyzeSEO = (...args) => throwDeprecatedError('analyzeSEO');

// Media functions
export const generateImage = (...args) => throwDeprecatedError('generateImage');
export const editImage = (...args) => throwDeprecatedError('editImage');
export const generateVideo = (...args) => throwDeprecatedError('generateVideo');
export const generateAudio = (...args) => throwDeprecatedError('generateAudio');
export const decodeBase64 = (...args) => throwDeprecatedError('decodeBase64');
export const decodeAudioData = (...args) => throwDeprecatedError('decodeAudioData');

// Research functions
export const performResearch = (...args) => throwDeprecatedError('performResearch');

// Shared utilities
export const callAI = (...args) => throwDeprecatedError('callAI');
export const cleanAIOutput = (...args) => throwDeprecatedError('cleanAIOutput');
export const getApiKey = (...args) => throwDeprecatedError('getApiKey');
export const getSavedSettings = (...args) => throwDeprecatedError('getSavedSettings');
export const getProviderConfig = (...args) => throwDeprecatedError('getProviderConfig');
export const SYSTEM_INSTRUCTIONS = {};
