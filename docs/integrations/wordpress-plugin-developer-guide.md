# WordPress Plugin Developer Guide

**Description:** Comprehensive developer guide covering local development setup, plugin architecture, hook registration, API integration, authentication, security practices, and troubleshooting for the Nova‑XFinity WordPress plugin.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

The Nova‑XFinity AI WordPress plugin integrates the Nova‑XFinity AI Article Writer React application directly into the WordPress admin dashboard. The plugin serves as a bridge between WordPress and the Nova‑XFinity backend services, enabling seamless AI-powered content generation, article publishing, and media management.

### Architecture Overview

The plugin follows WordPress best practices with a singleton pattern, REST API integration, and secure iframe embedding:

```
┌─────────────────────────────────────────┐
│  WordPress Admin Dashboard              │
│  ┌───────────────────────────────────┐  │
│  │  Nova‑XFinity AI Menu Page        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  React App (iframe)         │  │  │
│  │  │  - Article Writer            │  │  │
│  │  │  - Media Hub                │  │  │
│  │  │  - Research Tools           │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │                    │
           │ postMessage        │ REST API
           │                    │
           ▼                    ▼
┌─────────────────────────────────────────┐
│  WordPress Plugin (PHP)                 │
│  - Hook Registration                    │
│  - REST Endpoints                       │
│  - Permission Checks                    │
│  - Post Publishing                      │
└─────────────────────────────────────────┘
           │
           │ HTTP/HTTPS
           ▼
┌─────────────────────────────────────────┐
│  Nova‑XFinity Backend                   │
│  - Authentication Service               │
│  - Article Generation API               │
│  - Media Generation API                 │
│  - Subscription Management              │
└─────────────────────────────────────────┘
```

### Key Components

- **Main Plugin Class** (`Finity_AI_SEO_Writer`) - Singleton pattern managing plugin lifecycle
- **REST API Routes** - Custom endpoints for article publishing and status checks
- **Admin Interface** - Iframe-based integration with React application
- **Security Layer** - Permission checks, nonce verification, and sanitization

### Plugin Capabilities

- **Article Publishing** - Direct publishing from React app to WordPress as drafts
- **SEO Integration** - Yoast SEO compatibility for meta descriptions and focus keyphrases
- **Media Handling** - Featured image upload and management
- **Status Monitoring** - Plugin health checks and version information
- **Secure Communication** - PostMessage API for cross-origin iframe communication

---

## Plugin Directory Structure

The plugin follows WordPress plugin structure conventions:

```
wordpress-plugin/
├── finity-ai-seo-writer.php    # Main plugin file (bootstrap)
├── assets/
│   └── admin.css               # Admin page styles
├── includes/                   # (Future: modular includes)
├── templates/                  # (Future: UI templates)
├── README.md                   # Installation instructions
└── uninstall.php              # Cleanup on uninstall
```

### File Responsibilities

**`finity-ai-seo-writer.php`**
- Plugin header metadata
- Main plugin class definition
- Hook registration
- REST API route registration
- Activation/deactivation hooks

**`assets/admin.css`**
- Admin page styling
- Iframe container styles
- Responsive layout adjustments

**`uninstall.php`**
- Cleanup of plugin options on uninstall
- Database cleanup (if needed)
- Transient removal

### Constants

The plugin defines several constants for easy reference:

```php
define('FINITY_AI_VERSION', '1.0.0');
define('FINITY_AI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FINITY_AI_PLUGIN_URL', plugin_dir_url(__FILE__));
```

---

## Main Plugin File & Bootstrap Logic

### Plugin Header

The plugin header contains essential metadata for WordPress:

```php
<?php
/**
 * Plugin Name: Nova‑XFinity AI Article Writer
 * Plugin URI: https://finity.ai
 * Description: AI-powered SEO-optimized article generation for WordPress with multi-provider support, media generation, and research intelligence.
 * Version: 1.0.0
 * Author: Nova‑XFinity AI
 * Author URI: https://finity.ai
 * License: MIT
 * Text Domain: finity-ai
 */
```

### Singleton Pattern

The plugin uses a singleton pattern to ensure only one instance exists:

```php
class Finity_AI_SEO_Writer {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Hook registration happens here
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
}

// Initialize plugin
Finity_AI_SEO_Writer::get_instance();
```

### Security Check

All plugin files should start with a security check:

```php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
```

This prevents direct file access outside of WordPress.

### Activation Hook

Plugin activation sets default options:

```php
register_activation_hook(__FILE__, function() {
    add_option('finity_ai_app_url', 'http://localhost:3000');
});
```

---

## Hook Registration (Actions, Filters)

### WordPress Actions

Actions are events triggered by WordPress at specific points. The plugin registers several action hooks:

#### Admin Menu Registration

```php
public function add_admin_menu() {
    add_menu_page(
        'Nova‑XFinity AI Writer',        // Page title
        'Nova‑XFinity AI',                // Menu title
        'edit_posts',                     // Capability required
        'finity-ai-writer',               // Menu slug
        array($this, 'render_admin_page'), // Callback function
        'dashicons-edit',                 // Icon (dashicon)
        30                                // Position in menu
    );
}
```

**Capabilities:**
- `edit_posts` - Minimum required to access the plugin
- `publish_posts` - Required for publishing articles
- `manage_options` - Required for settings access (future)

#### Script and Style Enqueuing

```php
public function enqueue_scripts($hook) {
    // Only load on our admin page
    if ('toplevel_page_finity-ai-writer' !== $hook) {
        return;
    }
    
    wp_enqueue_style(
        'finity-ai-admin',
        FINITY_AI_PLUGIN_URL . 'assets/admin.css',
        array(), // Dependencies
        FINITY_AI_VERSION // Version for cache busting
    );
}
```

**Best Practices:**
- Always check `$hook` to load assets only where needed
- Use version numbers for cache busting
- Enqueue dependencies explicitly

#### REST API Initialization

```php
public function register_rest_routes() {
    register_rest_route('finity-ai/v1', '/publish', array(
        'methods' => 'POST',
        'callback' => array($this, 'publish_article'),
        'permission_callback' => array($this, 'check_permission'),
    ));
    
    register_rest_route('finity-ai/v1', '/status', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_status'),
        'permission_callback' => array($this, 'check_permission'),
    ));
}
```

**Route Structure:**
- Namespace: `finity-ai/v1` (allows versioning)
- Endpoint: `/publish`, `/status`
- Methods: `GET`, `POST`, `PUT`, `DELETE`
- Permission callback: Always required for security

### WordPress Filters

Filters allow modification of data before it's used. Future filter examples:

```php
// Filter post content before publishing
add_filter('finity_ai_post_content', function($content) {
    // Modify content here
    return $content;
}, 10, 1);

// Filter SEO meta data
add_filter('finity_ai_seo_meta', function($meta) {
    // Modify meta data here
    return $meta;
}, 10, 1);
```

---

## Shortcodes & Admin Settings Pages

### Shortcodes

Shortcodes allow embedding plugin functionality in posts and pages. Current implementation doesn't include shortcodes, but here's the pattern for future implementation:

```php
// Register shortcode
add_shortcode('finity_ai_writer', array($this, 'render_shortcode'));

public function render_shortcode($atts) {
    $atts = shortcode_atts(array(
        'mode' => 'writer',
        'height' => '600px',
    ), $atts);
    
    $app_url = get_option('finity_ai_app_url', 'http://localhost:3000');
    
    ob_start();
    ?>
    <div class="finity-ai-shortcode-container" style="height: <?php echo esc_attr($atts['height']); ?>;">
        <iframe 
            src="<?php echo esc_url($app_url); ?>?mode=<?php echo esc_attr($atts['mode']); ?>"
            style="width: 100%; height: 100%; border: none;"
            frameborder="0"
        ></iframe>
    </div>
    <?php
    return ob_get_clean();
}
```

**Usage:**
```
[finity_ai_writer mode="writer" height="600px"]
```

### Admin Settings Page

Settings pages allow users to configure plugin options:

```php
public function add_admin_menu() {
    // Main menu page
    add_menu_page(/* ... */);
    
    // Settings submenu
    add_submenu_page(
        'finity-ai-writer',
        'Nova‑XFinity AI Settings',
        'Settings',
        'manage_options',
        'finity-ai-settings',
        array($this, 'render_settings_page')
    );
}

public function render_settings_page() {
    // Handle form submission
    if (isset($_POST['finity_ai_settings_submit'])) {
        check_admin_referer('finity_ai_settings');
        
        $app_url = sanitize_text_field($_POST['finity_ai_app_url']);
        update_option('finity_ai_app_url', $app_url);
        
        echo '<div class="notice notice-success"><p>Settings saved.</p></div>';
    }
    
    $app_url = get_option('finity_ai_app_url', 'http://localhost:3000');
    ?>
    <div class="wrap">
        <h1>Nova‑XFinity AI Settings</h1>
        <form method="post" action="">
            <?php wp_nonce_field('finity_ai_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="finity_ai_app_url">App URL</label>
                    </th>
                    <td>
                        <input 
                            type="url" 
                            id="finity_ai_app_url" 
                            name="finity_ai_app_url" 
                            value="<?php echo esc_attr($app_url); ?>"
                            class="regular-text"
                        />
                        <p class="description">URL where the Nova‑XFinity React app is hosted.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings', 'primary', 'finity_ai_settings_submit'); ?>
        </form>
    </div>
    <?php
}
```

**Security Considerations:**
- Always use `check_admin_referer()` for nonce verification
- Sanitize all user input with appropriate functions
- Use `esc_attr()` and `esc_url()` for output escaping

---

## Interfacing with the Nova‑XFinity Core (APIs, Token Handling, Authentication)

### API Communication Flow

The plugin communicates with the Nova‑XFinity backend through the React application embedded in an iframe. Communication uses the PostMessage API:

```javascript
// In React app (iframe)
window.postMessage({
    type: 'finity-publish',
    payload: {
        title: 'Article Title',
        content: '<p>Article content...</p>',
        meta: {
            focusKeyphrase: 'seo keyword',
            metaDescription: 'SEO description',
            seoTitle: 'SEO Title'
        },
        featuredImage: 'data:image/png;base64,...'
    }
}, window.location.origin);
```

```php
// In WordPress plugin (parent window)
window.addEventListener('message', function(event) {
    // Verify origin
    if (event.origin !== '<?php echo esc_js($app_url); ?>') return;
    
    if (event.data.type === 'finity-publish') {
        // Handle publishing via REST API
        fetch('<?php echo rest_url('finity-ai/v1/publish'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify(event.data.payload)
        })
        .then(response => response.json())
        .then(data => {
            // Send success message back to iframe
            window.postMessage({
                type: 'finity-publish-success',
                data: data
            }, '<?php echo esc_js($app_url); ?>');
        })
        .catch(error => {
            // Send error message back to iframe
            window.postMessage({
                type: 'finity-publish-error',
                error: error.message
            }, '<?php echo esc_js($app_url); ?>');
        });
    }
});
```

### REST API Endpoint Implementation

#### Publish Article Endpoint

```php
public function publish_article($request) {
    $params = $request->get_json_params();
    
    // Validate required fields
    if (empty($params['title']) || empty($params['content'])) {
        return new WP_Error(
            'missing_fields',
            'Title and content are required',
            array('status' => 400)
        );
    }
    
    // Prepare post data
    $post_data = array(
        'post_title'    => sanitize_text_field($params['title']),
        'post_content'  => wp_kses_post($params['content']),
        'post_status'   => 'draft', // Always publish as draft for review
        'post_type'     => 'post',
        'post_author'   => get_current_user_id(),
    );
    
    // Insert post
    $post_id = wp_insert_post($post_data);
    
    if (is_wp_error($post_id)) {
        return new WP_Error(
            'publish_failed',
            $post_id->get_error_message(),
            array('status' => 500)
        );
    }
    
    // Add SEO meta (Yoast SEO compatibility)
    if (isset($params['meta'])) {
        $meta = $params['meta'];
        
        if (isset($meta['focusKeyphrase'])) {
            update_post_meta(
                $post_id,
                '_yoast_wpseo_focuskw',
                sanitize_text_field($meta['focusKeyphrase'])
            );
        }
        if (isset($meta['metaDescription'])) {
            update_post_meta(
                $post_id,
                '_yoast_wpseo_metadesc',
                sanitize_text_field($meta['metaDescription'])
            );
        }
        if (isset($meta['seoTitle'])) {
            update_post_meta(
                $post_id,
                '_yoast_wpseo_title',
                sanitize_text_field($meta['seoTitle'])
            );
        }
    }
    
    // Upload featured image if provided
    if (isset($params['featuredImage']) && !empty($params['featuredImage'])) {
        $this->upload_featured_image($post_id, $params['featuredImage']);
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'post_id' => $post_id,
        'edit_url' => admin_url('post.php?action=edit&post=' . $post_id)
    ));
}
```

#### Status Endpoint

```php
public function get_status($request) {
    return rest_ensure_response(array(
        'success' => true,
        'version' => FINITY_AI_VERSION,
        'wp_version' => get_bloginfo('version'),
        'user_can_publish' => current_user_can('publish_posts'),
        'app_url' => get_option('finity_ai_app_url', 'http://localhost:3000')
    ));
}
```

### Token Handling

For future API key authentication with Nova‑XFinity backend:

```php
private function get_api_key() {
    return get_option('finity_ai_api_key', '');
}

private function validate_api_key($api_key) {
    // Make request to Nova‑XFinity backend
    $response = wp_remote_post('https://api.finity.ai/v1/auth/validate', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode(array('api_key' => $api_key)),
        'timeout' => 10
    ));
    
    if (is_wp_error($response)) {
        return false;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return isset($body['valid']) && $body['valid'] === true;
}
```

### Authentication Flow

1. **User Authentication** - Handled by React app (JWT tokens stored in cookies)
2. **WordPress Authentication** - WordPress nonce verification for REST API
3. **API Key Storage** - Stored securely in WordPress options (future)

---

## Handling Updates & WordPress.org Compatibility

### Version Management

Always update the version constant when releasing:

```php
define('FINITY_AI_VERSION', '1.0.1'); // Increment on each release
```

### Update Hooks

Use update hooks to handle database migrations and option updates:

```php
register_activation_hook(__FILE__, array($this, 'activate'));
add_action('admin_init', array($this, 'check_version'));

public function check_version() {
    $installed_version = get_option('finity_ai_version');
    
    if ($installed_version !== FINITY_AI_VERSION) {
        $this->upgrade($installed_version);
        update_option('finity_ai_version', FINITY_AI_VERSION);
    }
}

private function upgrade($from_version) {
    // Handle version-specific upgrades
    if (version_compare($from_version, '1.0.1', '<')) {
        // Migration code for 1.0.1
    }
}
```

### WordPress.org Submission Checklist

If submitting to WordPress.org:

- [ ] Plugin header must match WordPress.org standards
- [ ] No external dependencies without proper licensing
- [ ] All code must follow WordPress Coding Standards
- [ ] Proper sanitization and escaping
- [ ] Internationalization (i18n) support
- [ ] No hardcoded URLs or credentials
- [ ] Proper uninstall.php cleanup
- [ ] Readme.txt file with proper format
- [ ] Screenshots for plugin directory
- [ ] Tested with latest WordPress version

### Internationalization (i18n)

Prepare strings for translation:

```php
// Load text domain
load_plugin_textdomain('finity-ai', false, dirname(plugin_basename(__FILE__)) . '/languages');

// Use translation functions
__('Nova‑XFinity AI', 'finity-ai');
_e('Settings', 'finity-ai');
esc_html__('Save Settings', 'finity-ai');
```

---

## Security Best Practices

### Input Sanitization

Always sanitize user input:

```php
// Text fields
sanitize_text_field($_POST['title']);

// URLs
esc_url_raw($_POST['url']);

// HTML content
wp_kses_post($_POST['content']);

// Email
sanitize_email($_POST['email']);

// Integers
absint($_GET['id']);
```

### Output Escaping

Always escape output:

```php
// HTML attributes
esc_attr($value);

// URLs
esc_url($url);

// HTML content
esc_html($text);

// JavaScript
esc_js($javascript);
```

### Nonce Verification

Protect forms and AJAX requests with nonces:

```php
// Create nonce
wp_nonce_field('action_name');

// Verify nonce
check_admin_referer('action_name');

// REST API nonce
wp_verify_nonce($_SERVER['HTTP_X_WP_NONCE'], 'wp_rest');
```

### Capability Checks

Always check user capabilities:

```php
// Check if user can edit posts
if (!current_user_can('edit_posts')) {
    return new WP_Error('insufficient_permissions', 'You do not have permission to perform this action', array('status' => 403));
}

// Check specific capability
if (!current_user_can('publish_posts')) {
    // Handle insufficient permissions
}
```

### SQL Injection Prevention

Use WordPress database functions:

```php
// Good - Use WordPress functions
$wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $post_id);

// Bad - Direct SQL
$wpdb->query("SELECT * FROM posts WHERE ID = " . $post_id);
```

### XSS Prevention

- Use `wp_kses_post()` for HTML content
- Use `esc_html()`, `esc_attr()`, `esc_url()` for output
- Never trust user input
- Validate and sanitize all data

### CSRF Protection

- Use nonces for all forms
- Verify nonces on form submission
- Use `check_admin_referer()` for admin forms

### Secure API Communication

- Verify PostMessage origin
- Use HTTPS for all external API calls
- Store API keys securely (not in code)
- Use WordPress transients for caching sensitive data

---

## Known Issues & Plugin Debugging

### Common Issues

#### Issue: Iframe Not Loading

**Symptoms:** Blank iframe or connection error

**Diagnosis:**
1. Check if React app is running on configured URL
2. Verify CORS settings in Vite config
3. Check browser console for errors
4. Verify `finity_ai_app_url` option value

**Solution:**
```php
// Debug: Check option value
$app_url = get_option('finity_ai_app_url');
error_log('Finity AI App URL: ' . $app_url);

// Verify URL is accessible
$response = wp_remote_get($app_url);
if (is_wp_error($response)) {
    error_log('Cannot reach app URL: ' . $response->get_error_message());
}
```

#### Issue: REST API Returns 401/403

**Symptoms:** Publishing fails with permission error

**Diagnosis:**
1. Check user capabilities
2. Verify nonce is being sent
3. Check REST API is enabled
4. Verify permission callback

**Solution:**
```php
// Add debug logging
public function check_permission() {
    $can_edit = current_user_can('edit_posts');
    error_log('User can edit posts: ' . ($can_edit ? 'yes' : 'no'));
    error_log('Current user ID: ' . get_current_user_id());
    return $can_edit;
}
```

#### Issue: Post Published But Content Missing

**Symptoms:** Post created but content is empty or malformed

**Diagnosis:**
1. Check content sanitization
2. Verify `wp_kses_post()` isn't stripping required HTML
3. Check for encoding issues

**Solution:**
```php
// Use wp_kses with custom allowed tags
$allowed_html = wp_kses_allowed_html('post');
$allowed_html['iframe'] = array(
    'src' => true,
    'width' => true,
    'height' => true,
    'frameborder' => true
);
$content = wp_kses($params['content'], $allowed_html);
```

### Debugging Tools

#### Enable WordPress Debug Mode

Add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

#### Plugin-Specific Debugging

```php
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('Finity AI: ' . print_r($data, true));
}
```

#### REST API Debugging

```php
// Add to REST endpoint callback
public function publish_article($request) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Finity AI Publish Request: ' . print_r($request->get_params(), true));
    }
    // ... rest of code
}
```

#### Browser Console Debugging

```javascript
// In admin page JavaScript
console.log('Finity AI App URL:', '<?php echo esc_js($app_url); ?>');
console.log('REST URL:', '<?php echo esc_js(rest_url('finity-ai/v1/publish')); ?>');
console.log('Nonce:', '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>');
```

### Testing Checklist

- [ ] Plugin activates without errors
- [ ] Admin menu appears for users with `edit_posts` capability
- [ ] Iframe loads React application
- [ ] PostMessage communication works
- [ ] REST API endpoints respond correctly
- [ ] Permission checks work (test with different user roles)
- [ ] Posts are created as drafts
- [ ] SEO meta data is saved correctly
- [ ] Featured images upload successfully
- [ ] Plugin deactivates cleanly
- [ ] Uninstall removes all options

---

## TODO / Roadmap

### Short-term (v1.1)

- [ ] Add settings page for API key configuration
- [ ] Implement featured image upload functionality
- [ ] Add support for custom post types
- [ ] Implement shortcode support
- [ ] Add Gutenberg block support
- [ ] Improve error handling and user feedback
- [ ] Add logging for debugging

### Medium-term (v1.2)

- [ ] Token usage tracking and display
- [ ] Integration with WordPress media library
- [ ] Support for multiple article formats
- [ ] Batch publishing capabilities
- [ ] Template system for article structure
- [ ] WP-CLI commands for automation

### Long-term (v2.0)

- [ ] Multisite support
- [ ] Nova‑X Cloud sync integration
- [ ] Advanced SEO analysis integration
- [ ] Content scheduling
- [ ] A/B testing for generated content
- [ ] Analytics integration
- [ ] Third-party plugin compatibility (Rank Math, All in One SEO)

### Technical Debt

- [ ] Refactor into modular structure (`/includes/` directory)
- [ ] Add unit tests for core functionality
- [ ] Improve code documentation (PHPDoc)
- [ ] Add internationalization (i18n) support
- [ ] Create admin notice system
- [ ] Implement proper error handling class
- [ ] Add caching for API responses

---

## Related Documentation

- [WordPress Plugin Overview](wordpress-plugin-overview.md) - High-level overview of the WordPress plugin, features, and roadmap
- [Plugin API Endpoints](plugin-api-endpoints.md) - Complete reference for all WordPress REST API endpoints registered by the plugin
- [Security Model](../architecture/security-model.md) - Comprehensive security documentation including token handling, authentication, and best practices
- [API Documentation](../architecture/api.md) - Backend API documentation for Nova‑XFinity services
- [Debugging Guide](../development/debugging.md) - General debugging strategies and tools for the Nova‑XFinity platform
- [Testing Guide](../development/testing.md) - Testing strategies and best practices for plugin development
