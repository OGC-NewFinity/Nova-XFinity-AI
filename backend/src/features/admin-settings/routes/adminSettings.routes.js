/**
 * Admin Settings Routes
 * System-wide settings endpoints (admin only)
 */

import express from 'express';
import { authenticateAdmin } from '../../../middleware/admin.middleware.js';
import * as adminSettingsController from '../controllers/adminSettings.controller.js';

const router = express.Router();

/**
 * GET /api/admin/settings
 * Get system-wide admin settings (sanitized - no sensitive keys)
 * Admin only
 */
router.get('/', authenticateAdmin, adminSettingsController.getAdminSettings);

/**
 * PUT /api/admin/settings
 * Update system-wide admin settings
 * Admin only
 * 
 * Body:
 * {
 *   provider?: string,          // 'gemini' | 'openai' | 'anthropic' | 'llama'
 *   focusKeyphrase?: string,    // Default SEO keyphrase
 *   // Note: API keys should be set via environment variables, not this endpoint
 * }
 */
router.put('/', authenticateAdmin, adminSettingsController.updateAdminSettings);

export default router;
