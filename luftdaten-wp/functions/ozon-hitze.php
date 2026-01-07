<?php
/**
 * Ozon folgt der Hitze Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Ozon folgt der Hitze
 */
function luftdaten_register_ozon_hitze_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-ozon-hitze-block',
        get_stylesheet_directory_uri() . '/src/blocks/ozon-hitze/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-ozon-hitze-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/ozon-hitze/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/ozon-hitze', array(
        'editor_script' => 'luftdaten-ozon-hitze-block',
        'editor_style' => 'luftdaten-ozon-hitze-block-editor',
        'render_callback' => 'luftdaten_render_ozon_hitze_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Modul 2 — Ozon folgt der Hitze', 'luftdaten'),
            ),
            'takeaway' => array(
                'type' => 'string',
                'default' => '',
            ),
            'keyFigure' => array(
                'type' => 'string',
                'default' => '',
            ),
            'description' => array(
                'type' => 'string',
                'default' => __('Beispielmetrik: Zusammenhang Sommer-Tage (Tmax) ↔ Tagesmaximum O₃. In Produktion: definieren (Sommerhalbjahr, Schwellen, Stations-/Regionalaggregation).', 'luftdaten'),
            ),
            'chartId' => array(
                'type' => 'string',
                'default' => 'm2Scatter',
            ),
            'source' => array(
                'type' => 'string',
                'default' => __('Quelle: Ozon (UBA/EEA) + Temperatur (GeoSphere) — im Wireframe nicht live geladen.', 'luftdaten'),
            ),
            'scale' => array(
                'type' => 'string',
                'default' => 'x: Tmax (°C) · y: O₃ max (µg/m³)',
            ),
            'dataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_ozon_hitze_block');

/**
 * Render the Ozon folgt der Hitze block
 */
function luftdaten_render_ozon_hitze_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Modul 2 — Ozon folgt der Hitze', 'luftdaten');
    $takeaway = isset($attributes['takeaway']) ? $attributes['takeaway'] : '';
    $key_figure = isset($attributes['keyFigure']) ? $attributes['keyFigure'] : '';
    $description = isset($attributes['description']) ? $attributes['description'] : '';
    $chart_id = isset($attributes['chartId']) ? $attributes['chartId'] : 'm2Scatter';
    $source = isset($attributes['source']) ? $attributes['source'] : '';
    $scale = isset($attributes['scale']) ? $attributes['scale'] : '';
    $data_url = isset($attributes['dataUrl']) ? $attributes['dataUrl'] : '';

    ob_start();
    ?>
    <section class="section">
        <div class="sectionHead">
            <h2><?php echo esc_html($title); ?></h2>
            <div class="takeaway" id="m2Takeaway"><?php echo esc_html($takeaway ? $takeaway : '—'); ?></div>
        </div>
        <div class="sectionBody">
            <div class="bigNumberRow">
                <div class="bigNumber">
                    <div class="pill"><?php echo esc_html__('Key figure', 'luftdaten'); ?></div>
                    <div class="num" id="m2Big"><?php echo esc_html($key_figure ? $key_figure : '—'); ?></div>
                    <div class="desc">
                        <?php echo esc_html($description); ?>
                    </div>
                </div>
                <div class="chart" id="<?php echo esc_attr($chart_id); ?>"<?php if (!empty($data_url)) : ?> data-api-url="<?php echo esc_url($data_url); ?>"<?php endif; ?>></div>
            </div>
            <div class="sourceLine">
                <div><?php echo esc_html($source); ?></div>
                <?php if (!empty($scale)) : ?>
                    <div class="pill"><?php echo esc_html($scale); ?></div>
                <?php endif; ?>
            </div>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

