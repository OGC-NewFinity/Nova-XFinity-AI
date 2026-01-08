/**
 * ID Utilities
 * Functions for UUID generation, random ID generation, and unique identifier creation
 * 
 * This module provides utilities for:
 * - UUID generation (v4)
 * - Random ID generation
 * - Timestamp-based ID generation
 * - Draft ID generation
 * 
 * @module utils/idUtils
 */

/**
 * Generate a UUID v4 (random UUID)
 * 
 * @returns {string} UUID v4 string
 * 
 * @example
 * const uuid = generateUUID();
 * // Returns: '550e8400-e29b-41d4-a716-446655440000'
 */
export const generateUUID = () => {
  // Generate UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a random alphanumeric ID
 * 
 * @param {number} length - Length of the ID (default: 16)
 * @returns {string} Random alphanumeric ID
 * 
 * @example
 * const id = generateRandomId(16);
 * // Returns: 'aB3dEf5GhIjKlMnO'
 */
export const generateRandomId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a timestamp-based ID
 * 
 * @param {string} prefix - Optional prefix for the ID (default: '')
 * @returns {string} Timestamp-based ID
 * 
 * @example
 * const id = generateTimestampId('draft');
 * // Returns: 'draft-1704123456789'
 */
export const generateTimestampId = (prefix = '') => {
  const timestamp = Date.now();
  return prefix ? `${prefix}-${timestamp}` : timestamp.toString();
};

/**
 * Generate a draft ID (timestamp-based, used for article drafts)
 * 
 * @returns {number} Timestamp ID
 * 
 * @example
 * const draftId = generateDraftId();
 * // Returns: 1704123456789
 */
export const generateDraftId = () => {
  return Date.now();
};

/**
 * Generate a short unique ID (useful for component keys)
 * 
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Short unique ID
 * 
 * @example
 * const shortId = generateShortId();
 * // Returns: 'a3b5c7d9'
 */
export const generateShortId = (length = 8) => {
  return generateRandomId(length).toLowerCase();
};

/**
 * Generate a numeric ID from timestamp and random component
 * 
 * @returns {string} Numeric ID string
 * 
 * @example
 * const numId = generateNumericId();
 * // Returns: '1704123456789123'
 */
export const generateNumericId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random}`;
};
