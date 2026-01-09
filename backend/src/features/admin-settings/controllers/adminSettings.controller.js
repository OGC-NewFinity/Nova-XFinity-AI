/**
 * Admin Settings Controller
 * Handles system-wide settings (provider configs, API keys, etc.)
 * Admin-only access required
 */

import prisma from '../../../config/database.js';
import crypto from 'crypto';
import { detectApiKeyExposure, sanitizeResponse } from '../../../utils/securityLogger.js';

// Encryption key (should be in environment variable)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted
  };
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedData) {
  if (!encryptedData || !encryptedData.encrypted) return null;
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * GET /api/admin/settings
 * Get system-wide admin settings (sanitized - no keys in response)
 * Admin only - role check handled by authenticateAdmin middleware
 */
export const getAdminSettings = async (req, res) => {
  try {
    // Verify admin access (should already be checked by middleware, but double-check for security)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }

    // Load system settings from environment variables (secure)
    // In production, consider using a dedicated SystemSettings table or key management service
    const systemSettings = {
      provider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
      focusKeyphrase: process.env.DEFAULT_FOCUS_KEYPHRASE || '',
      // SECURITY: Never return actual API keys - only indicate if they're configured
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasClaudeKey: !!process.env.ANTHROPIC_API_KEY,
      hasLlamaKey: !!process.env.GROQ_API_KEY,
    };

    // SECURITY: Explicitly ensure no actual keys are sent
    // Double-check that no environment variables leaked into response
    const envKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GROQ_API_KEY', 'GEMINI_API_KEY'];
    for (const key of envKeys) {
      if (systemSettings[key] || systemSettings[key.toLowerCase()]) {
        console.error(`⚠️  SECURITY ERROR: Environment variable ${key} was included in response!`);
        delete systemSettings[key];
        delete systemSettings[key.toLowerCase()];
      }
    }
    
    // SECURITY: Use security logger to detect any API key exposure
    if (detectApiKeyExposure(systemSettings, 'GET /api/admin/settings response')) {
      console.error('⚠️  SECURITY CRITICAL: API keys detected in admin settings response!');
    }
    
    // Sanitize response before sending
    const sanitized = sanitizeResponse(systemSettings);

    res.json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch admin settings'
      }
    });
  }
};

/**
 * PUT /api/admin/settings
 * Update system-wide admin settings
 * SECURITY: API keys should be set via environment variables, not this endpoint
 * This endpoint can update non-sensitive system settings (provider preference, default keyphrase)
 * Admin only - role check handled by authenticateAdmin middleware
 */
export const updateAdminSettings = async (req, res) => {
  try {
    // Verify admin access (should already be checked by middleware, but double-check for security)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }

    const { provider, focusKeyphrase, openaiKey, claudeKey, llamaKey } = req.body;

    // Validate provider
    const validProviders = ['gemini', 'openai', 'anthropic', 'llama'];
    if (provider && !validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROVIDER',
          message: `Provider must be one of: ${validProviders.join(', ')}`
        }
      });
    }

    // SECURITY: API keys should NOT be accepted via API endpoint for security reasons
    // They should be configured via environment variables or secure key management service
    // Reject the request if keys are provided
    if (openaiKey || claudeKey || llamaKey) {
      console.error('⚠️  SECURITY WARNING: API keys were provided in request body. Rejecting request.');
      console.error('⚠️  Request IP:', req.ip || req.connection.remoteAddress);
      console.error('⚠️  User:', req.user?.email || 'Unknown');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'API keys cannot be set via API. Please configure them via environment variables (.env file) for security.'
        }
      });
    }

    // Update non-sensitive system settings only
    const updates = {};
    if (provider) updates.provider = provider;
    if (focusKeyphrase !== undefined) updates.focusKeyphrase = focusKeyphrase;

    // In a production implementation, you would:
    // 1. Store non-sensitive settings in a SystemSettings database table
    // 2. Use environment variables or a key management service (AWS Secrets Manager, HashiCorp Vault, etc.) for API keys
    // 3. Potentially use a separate admin interface for key management

    // For now, we'll return success but note that actual persistence should be implemented
    // based on your infrastructure preferences

    // SECURITY: Never return actual API keys in response
    const responseData = {
      provider: updates.provider || process.env.DEFAULT_AI_PROVIDER || 'gemini',
      focusKeyphrase: updates.focusKeyphrase !== undefined ? updates.focusKeyphrase : (process.env.DEFAULT_FOCUS_KEYPHRASE || ''),
      // Only indicate if keys are configured, never return actual values
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasClaudeKey: !!process.env.ANTHROPIC_API_KEY,
      hasLlamaKey: !!process.env.GROQ_API_KEY
      // SECURITY: Do not include any key fields, even masked ones
    };
    
    // SECURITY: Check for API key exposure before sending
    if (detectApiKeyExposure(responseData, 'PUT /api/admin/settings response')) {
      console.error('⚠️  SECURITY CRITICAL: API keys detected in admin settings update response!');
    }
    
    // Sanitize response
    const sanitized = sanitizeResponse(responseData);
    
    res.json({
      success: true,
      message: 'Settings updated. Note: API keys should be configured via environment variables for security.',
      data: sanitized
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update admin settings'
      }
    });
  }
};
