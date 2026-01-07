<?php
/**
 * Citizen Science Messnetz Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Citizen Science Messnetz
 */
function luftdaten_register_citizen_science_messnetz_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-citizen-science-messnetz-block',
        get_stylesheet_directory_uri() . '/src/blocks/citizen-science-messnetz/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-citizen-science-messnetz-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/citizen-science-messnetz/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/citizen-science-messnetz', array(
        'editor_script' => 'luftdaten-citizen-science-messnetz-block',
        'editor_style' => 'luftdaten-citizen-science-messnetz-block-editor',
        'render_callback' => 'luftdaten_render_citizen_science_messnetz_block',
        'attributes' => array(
            'mapDataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_citizen_science_messnetz_block');

/**
 * Render the Citizen Science Messnetz block
 */
function luftdaten_render_citizen_science_messnetz_block($attributes) {
    $map_data_url = isset($attributes['mapDataUrl']) ? $attributes['mapDataUrl'] : '';

    ob_start();
    ?>
    <section class="section">
        <div class="sectionBody">
            <div class="chart" id="austria-pm25-map"<?php if (!empty($map_data_url)) : ?> data-api-url="<?php echo esc_url($map_data_url); ?>"<?php endif; ?>></div>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

