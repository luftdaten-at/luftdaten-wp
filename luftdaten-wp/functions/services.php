<?php
/**
 * Services Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Services
 */
function luftdaten_register_services_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-services-block',
        get_stylesheet_directory_uri() . '/src/blocks/services/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-services-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/services/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/services', array(
        'editor_script' => 'luftdaten-services-block',
        'editor_style' => 'luftdaten-services-block-editor',
        'render_callback' => 'luftdaten_render_services_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Unsere Angebote', 'luftdaten'),
            ),
            'numberOfServices' => array(
                'type' => 'number',
                'default' => 6,
            ),
            'services' => array(
                'type' => 'array',
                'default' => array(),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_services_block');

/**
 * Render the Services block
 */
function luftdaten_render_services_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Unsere Angebote', 'luftdaten');
    $number_of_services = isset($attributes['numberOfServices']) ? intval($attributes['numberOfServices']) : 6;
    $services = isset($attributes['services']) ? $attributes['services'] : array();

    if (empty($services)) {
        return '<div class="services-section"><p>' . esc_html__('No services configured. Please add services in the block settings.', 'luftdaten') . '</p></div>';
    }

    // Limit services based on configuration
    $services = array_slice($services, 0, $number_of_services);

    ob_start();
    ?>
    <section class="services-section" aria-label="<?php echo esc_attr($title); ?>">
        <h3><?php echo esc_html($title); ?></h3>
        <div class="services-grid">
            <?php
            foreach ($services as $service) {
                $service_icon = isset($service['icon']) ? $service['icon'] : '📋';
                $service_title = isset($service['title']) ? $service['title'] : '';
                $service_description = isset($service['description']) ? $service['description'] : '';
                $service_link = isset($service['link']) ? $service['link'] : '#';
                $service_link_text = isset($service['linkText']) ? $service['linkText'] : __('Mehr erfahren →', 'luftdaten');
                
                if (empty($service_title)) {
                    continue; // Skip services without titles
                }
                ?>
                <div class="service-card">
                    <div class="service-icon"><?php echo esc_html($service_icon); ?></div>
                    <h4 class="service-title"><?php echo esc_html($service_title); ?></h4>
                    <p class="service-description"><?php echo esc_html($service_description); ?></p>
                    <?php if (!empty($service_link) && $service_link !== '#') : ?>
                        <a href="<?php echo esc_url($service_link); ?>" class="service-link"><?php echo esc_html($service_link_text); ?></a>
                    <?php endif; ?>
                </div>
                <?php
            }
            ?>
        </div>
    </section>
    <?php
    return ob_get_clean();
}
