<?php
/**
 * Urban Heat Island Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Urban Heat Island
 */
function luftdaten_register_urban_heat_island_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-urban-heat-island-block',
        get_stylesheet_directory_uri() . '/src/blocks/urban-heat-island/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-urban-heat-island-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/urban-heat-island/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/urban-heat-island', array(
        'editor_script' => 'luftdaten-urban-heat-island-block',
        'editor_style' => 'luftdaten-urban-heat-island-block-editor',
        'render_callback' => 'luftdaten_render_urban_heat_island_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Modul 3 — Urban Heat Island: Nächte werden zum Problem', 'luftdaten'),
            ),
            'takeaway' => array(
                'type' => 'string',
                'default' => '',
            ),
            'chart1Label' => array(
                'type' => 'string',
                'default' => __('Tropennächte', 'luftdaten'),
            ),
            'chart1Id' => array(
                'type' => 'string',
                'default' => 'm3TropicalNights',
            ),
            'chart1DataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
            'chart2Label' => array(
                'type' => 'string',
                'default' => __('UHI-Indikator', 'luftdaten'),
            ),
            'chart2Id' => array(
                'type' => 'string',
                'default' => 'm3UhiDelta',
            ),
            'chart2DataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
            'source' => array(
                'type' => 'string',
                'default' => __('Quelle: GeoSphere (Stations-/Indexdaten) — im Wireframe Mock.', 'luftdaten'),
            ),
            'sourcePill' => array(
                'type' => 'string',
                'default' => __('Tropennächte: Tmin ≥ 20°C (Beispiel)', 'luftdaten'),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_urban_heat_island_block');

/**
 * Render the Urban Heat Island block
 */
function luftdaten_render_urban_heat_island_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Modul 3 — Urban Heat Island: Nächte werden zum Problem', 'luftdaten');
    $takeaway = isset($attributes['takeaway']) ? $attributes['takeaway'] : '';
    $chart1_label = isset($attributes['chart1Label']) ? $attributes['chart1Label'] : __('Tropennächte', 'luftdaten');
    $chart1_id = isset($attributes['chart1Id']) ? $attributes['chart1Id'] : 'm3TropicalNights';
    $chart1_data_url = isset($attributes['chart1DataUrl']) ? $attributes['chart1DataUrl'] : '';
    $chart2_label = isset($attributes['chart2Label']) ? $attributes['chart2Label'] : __('UHI-Indikator', 'luftdaten');
    $chart2_id = isset($attributes['chart2Id']) ? $attributes['chart2Id'] : 'm3UhiDelta';
    $chart2_data_url = isset($attributes['chart2DataUrl']) ? $attributes['chart2DataUrl'] : '';
    $source = isset($attributes['source']) ? $attributes['source'] : '';
    $source_pill = isset($attributes['sourcePill']) ? $attributes['sourcePill'] : '';

    ob_start();
    ?>
    <section class="section">
        <div class="sectionHead">
            <h2><?php echo esc_html($title); ?></h2>
            <div class="takeaway" id="m3Takeaway"><?php echo esc_html($takeaway ? $takeaway : '—'); ?></div>
        </div>
        <div class="sectionBody">
            <div class="grid2">
                <div>
                    <div class="pill"><?php echo esc_html($chart1_label); ?></div>
                    <div class="chart small" id="<?php echo esc_attr($chart1_id); ?>"<?php if (!empty($chart1_data_url)) : ?> data-api-url="<?php echo esc_url($chart1_data_url); ?>"<?php endif; ?>></div>
                </div>
                <div>
                    <div class="pill"><?php echo esc_html($chart2_label); ?></div>
                    <div class="chart small" id="<?php echo esc_attr($chart2_id); ?>"<?php if (!empty($chart2_data_url)) : ?> data-api-url="<?php echo esc_url($chart2_data_url); ?>"<?php endif; ?>></div>
                </div>
            </div>
            <div class="sourceLine">
                <div><?php echo esc_html($source); ?></div>
                <?php if (!empty($source_pill)) : ?>
                    <div class="pill"><?php echo esc_html($source_pill); ?></div>
                <?php endif; ?>
            </div>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

