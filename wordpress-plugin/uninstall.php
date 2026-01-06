<?php
/**
 * Uninstall script for Finity AI SEO Writer
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('finity_ai_app_url');
delete_option('finity_ai_version');
