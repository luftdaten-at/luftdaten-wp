<?php
/**
 * Partner Logos Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Partner Logos
 */
function luftdaten_register_partner_logos_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-partner-logos-block',
        get_stylesheet_directory_uri() . '/src/blocks/partner-logos/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-partner-logos-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/partner-logos/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/partner-logos', array(
        'editor_script' => 'luftdaten-partner-logos-block',
        'editor_style' => 'luftdaten-partner-logos-block-editor',
        'render_callback' => 'luftdaten_render_partner_logos_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Unsere Partner', 'luftdaten'),
            ),
            'partners' => array(
                'type' => 'array',
                'default' => array(),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_partner_logos_block');

/**
 * Render the Partner Logos block
 */
function luftdaten_render_partner_logos_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Unsere Partner', 'luftdaten');
    $partners = isset($attributes['partners']) ? $attributes['partners'] : array();

    if (empty($partners)) {
        return '';
    }

    ob_start();
    ?>
    <div class="partners-section-footer" aria-label="<?php echo esc_attr($title); ?>">
        <div class="footer-container">
            <?php if (!empty($title)) : ?>
                <h4 class="footer-partners-title"><?php echo esc_html($title); ?></h4>
            <?php endif; ?>
            <div class="partners-grid-footer">
                <?php
                foreach ($partners as $partner) {
                    $partner_name = isset($partner['name']) ? $partner['name'] : '';
                    $logo_url = isset($partner['logoUrl']) ? $partner['logoUrl'] : '';
                    $partner_link = isset($partner['link']) ? $partner['link'] : '';
                    
                    if (empty($logo_url)) {
                        continue; // Skip partners without logos
                    }
                    
                    if (!empty($partner_link)) {
                        echo '<a href="' . esc_url($partner_link) . '" class="partner-logo-footer" target="_blank" rel="noopener noreferrer" aria-label="' . esc_attr($partner_name ? $partner_name : __('Partner Logo', 'luftdaten')) . '">';
                        echo '<img src="' . esc_url($logo_url) . '" alt="' . esc_attr($partner_name ? $partner_name . ' ' . __('Logo', 'luftdaten') : __('Partner Logo', 'luftdaten')) . '" />';
                        echo '</a>';
                    } else {
                        echo '<div class="partner-logo-footer">';
                        echo '<img src="' . esc_url($logo_url) . '" alt="' . esc_attr($partner_name ? $partner_name . ' ' . __('Logo', 'luftdaten') : __('Partner Logo', 'luftdaten')) . '" />';
                        echo '</div>';
                    }
                }
                ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

