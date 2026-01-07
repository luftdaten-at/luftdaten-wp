<?php
/**
 * Theme Setup Functions
 *
 * @package Luftdaten
 */

/**
 * Theme setup
 */
function luftdaten_theme_setup() {
    // Add theme support for title tag
    add_theme_support('title-tag');

    // Add theme support for post thumbnails
    add_theme_support('post-thumbnails');

    // Add theme support for HTML5 markup
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'luftdaten'),
        'footer' => __('Footer Menu', 'luftdaten'),
    ));
}
add_action('after_setup_theme', 'luftdaten_theme_setup');

/**
 * Enable SVG uploads
 */
function luftdaten_enable_svg_uploads($mimes) {
    $mimes['svg'] = 'image/svg+xml';
    $mimes['svgz'] = 'image/svg+xml';
    return $mimes;
}
add_filter('upload_mimes', 'luftdaten_enable_svg_uploads', 10, 1);

/**
 * Fix SVG file type check - WordPress validates file extensions separately
 */
function luftdaten_fix_svg_file_type_check($data, $file, $filename, $mimes) {
    $filetype = wp_check_filetype($filename, $mimes);
    
    if ($filetype['ext'] === 'svg' || $filetype['ext'] === 'svgz') {
        $data['ext'] = $filetype['ext'];
        $data['type'] = 'image/svg+xml';
    }
    
    return $data;
}
add_filter('wp_check_filetype_and_ext', 'luftdaten_fix_svg_file_type_check', 10, 4);

/**
 * Fix SVG display in media library
 */
function luftdaten_fix_svg_thumbnails($response, $attachment, $meta) {
    if ($response['type'] === 'image' && $response['subtype'] === 'svg+xml') {
        $attachment_url = wp_get_attachment_url($attachment->ID);
        
        if ($attachment_url) {
            $response['image'] = array(
                'src' => $attachment_url,
                'width' => 150,
                'height' => 150,
            );
            $response['thumb'] = array(
                'src' => $attachment_url,
                'width' => 150,
                'height' => 150,
            );
            $response['sizes'] = array(
                'full' => array(
                    'url' => $attachment_url,
                    'width' => 150,
                    'height' => 150,
                    'orientation' => 'landscape',
                ),
                'thumbnail' => array(
                    'url' => $attachment_url,
                    'width' => 150,
                    'height' => 150,
                    'orientation' => 'landscape',
                ),
                'medium' => array(
                    'url' => $attachment_url,
                    'width' => 300,
                    'height' => 300,
                    'orientation' => 'landscape',
                ),
                'large' => array(
                    'url' => $attachment_url,
                    'width' => 1024,
                    'height' => 1024,
                    'orientation' => 'landscape',
                ),
            );
        }
    }
    return $response;
}
add_filter('wp_prepare_attachment_for_js', 'luftdaten_fix_svg_thumbnails', 10, 3);

/**
 * Generate attachment metadata for SVG files
 */
function luftdaten_generate_svg_attachment_metadata($metadata, $attachment_id) {
    $mime_type = get_post_mime_type($attachment_id);
    if ($mime_type === 'image/svg+xml') {
        $svg_path = get_attached_file($attachment_id);
        if ($svg_path && file_exists($svg_path)) {
            $svg_content = file_get_contents($svg_path);
            $width = $height = 150; // Default size
            
            // Try to extract width and height from SVG
            if (preg_match('/width=["\']?(\d+)/i', $svg_content, $width_match)) {
                $width = intval($width_match[1]);
            }
            if (preg_match('/height=["\']?(\d+)/i', $svg_content, $height_match)) {
                $height = intval($height_match[1]);
            }
            
            // Try to extract viewBox if no width/height found
            if (($width === 150 && $height === 150) && preg_match('/viewBox=["\']?\s*[\d\.]+\s+[\d\.]+\s+([\d\.]+)\s+([\d\.]+)/i', $svg_content, $viewbox_match)) {
                $width = intval($viewbox_match[1]);
                $height = intval($viewbox_match[2]);
            }
            
            $metadata = array(
                'width' => $width,
                'height' => $height,
                'file' => basename($svg_path),
            );
        }
    }
    
    return $metadata;
}
add_filter('wp_generate_attachment_metadata', 'luftdaten_generate_svg_attachment_metadata', 10, 2);

/**
 * Add SVG inline styles for media library preview
 */
function luftdaten_svg_media_library_css() {
    ?>
    <style>
        .attachment-266x266, .thumbnail img,
        .media-icon img[src$=".svg"],
        .attachment img[src$=".svg"] {
            width: 100% !important;
            height: auto !important;
            max-width: 100%;
        }
        .media-icon img[src$=".svg"] {
            width: 100%;
            height: auto;
        }
        /* Ensure SVG previews show in grid view */
        .attachment-preview .thumbnail img[src$=".svg"],
        .attachment-preview .thumbnail[data-filetype="svg"] img {
            width: 100% !important;
            height: auto !important;
            max-width: 100%;
            max-height: 100%;
        }
        /* Fix for media library modal */
        .media-modal img[src$=".svg"],
        .attachment-details .thumbnail img[src$=".svg"] {
            max-width: 100%;
            height: auto;
        }
    </style>
    <?php
}
add_action('admin_head', 'luftdaten_svg_media_library_css');

/**
 * Sanitize SVG uploads for security
 */
function luftdaten_sanitize_svg_upload($file) {
    // Check if it's an SVG file by extension (more reliable than MIME type)
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($file_ext === 'svg' || $file_ext === 'svgz') {
        // Check if file exists and is readable
        if (!empty($file['tmp_name']) && is_readable($file['tmp_name'])) {
            // Read the file
            $svg_content = file_get_contents($file['tmp_name']);
            
            if ($svg_content !== false) {
                // Basic security check - remove script tags and event handlers
                $svg_content = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi', '', $svg_content);
                $svg_content = preg_replace('/on\w+\s*=\s*["\'][^"\']*["\']/i', '', $svg_content);
                $svg_content = preg_replace('/javascript:/i', '', $svg_content);
                
                // Write back the sanitized content
                file_put_contents($file['tmp_name'], $svg_content);
            }
        }
    }
    return $file;
}
add_filter('wp_handle_upload_prefilter', 'luftdaten_sanitize_svg_upload');

/**
 * Register widget area
 */
function luftdaten_widgets_init() {
    register_sidebar(array(
        'name' => __('Sidebar', 'luftdaten'),
        'id' => 'sidebar-1',
        'description' => __('Add widgets here.', 'luftdaten'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget' => '</section>',
        'before_title' => '<h2 class="widget-title">',
        'after_title' => '</h2>',
    ));
}
add_action('widgets_init', 'luftdaten_widgets_init');

/**
 * Custom excerpt length
 */
function luftdaten_excerpt_length($length) {
    return 30;
}
add_filter('excerpt_length', 'luftdaten_excerpt_length');

/**
 * Custom excerpt more
 */
function luftdaten_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'luftdaten_excerpt_more');

/**
 * Default menu fallback
 */
function luftdaten_default_menu() {
    echo '<nav class="nav-menu" id="mainNav" role="navigation" aria-label="' . esc_attr__('Hauptnavigation', 'luftdaten') . '">';
    echo '<ul>';
    echo '<li><a href="' . esc_url(home_url('/')) . '" class="active">' . esc_html__('Dashboard', 'luftdaten') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/luftqualitaet/')) . '">' . esc_html__('Luftqualität & Hitze', 'luftdaten') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/projekte/')) . '">' . esc_html__('Projekte', 'luftdaten') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/bildung/')) . '">' . esc_html__('Bildung', 'luftdaten') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/ueber-uns/')) . '">' . esc_html__('Über uns', 'luftdaten') . '</a></li>';
    echo '<li class="nav-cta"><a href="' . esc_url(home_url('/kontakt/')) . '">' . esc_html__('Kontakt', 'luftdaten') . '</a></li>';
    echo '</ul>';
    echo '</nav>';
}

