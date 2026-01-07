<?php
/**
 * Doppelbelastung Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Doppelbelastung
 */
function luftdaten_register_doppelbelastung_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-doppelbelastung-block',
        get_stylesheet_directory_uri() . '/src/blocks/doppelbelastung/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-doppelbelastung-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/doppelbelastung/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/doppelbelastung', array(
        'editor_script' => 'luftdaten-doppelbelastung-block',
        'editor_style' => 'luftdaten-doppelbelastung-block-editor',
        'render_callback' => 'luftdaten_render_doppelbelastung_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Modul 4 — Doppelbelastung: Hitze + hohe Luftbelastung', 'luftdaten'),
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
                'default' => __('Anzahl Tage pro Jahr, an denen „heiß" und „Ozon hoch" gleichzeitig auftreten. In Produktion: Schwellen sauber dokumentieren.', 'luftdaten'),
            ),
            'chartId' => array(
                'type' => 'string',
                'default' => 'm4Bars',
            ),
            'chartDataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
            'source' => array(
                'type' => 'string',
                'default' => __('Quelle: GeoSphere (Tmax) + UBA/EEA (O₃) — Wireframe Mock.', 'luftdaten'),
            ),
            'sourcePill' => array(
                'type' => 'string',
                'default' => __('Einheit: Tage/Jahr', 'luftdaten'),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_doppelbelastung_block');

/**
 * Render the Doppelbelastung block
 */
function luftdaten_render_doppelbelastung_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Modul 4 — Doppelbelastung: Hitze + hohe Luftbelastung', 'luftdaten');
    $takeaway = isset($attributes['takeaway']) ? $attributes['takeaway'] : '';
    $key_figure = isset($attributes['keyFigure']) ? $attributes['keyFigure'] : '';
    $description = isset($attributes['description']) ? $attributes['description'] : '';
    $chart_id = isset($attributes['chartId']) ? $attributes['chartId'] : 'm4Bars';
    $chart_data_url = isset($attributes['chartDataUrl']) ? $attributes['chartDataUrl'] : '';
    $source = isset($attributes['source']) ? $attributes['source'] : '';
    $source_pill = isset($attributes['sourcePill']) ? $attributes['sourcePill'] : '';

    ob_start();
    ?>
    <section class="section">
        <div class="sectionHead">
            <h2><?php echo esc_html($title); ?></h2>
            <div class="takeaway" id="m4Takeaway"><?php echo esc_html($takeaway ? $takeaway : '—'); ?></div>
        </div>
        <div class="sectionBody">
            <div class="bigNumberRow">
                <div class="bigNumber">
                    <div class="pill"><?php echo esc_html__('Key figure', 'luftdaten'); ?></div>
                    <div class="num" id="m4Big"><?php echo esc_html($key_figure ? $key_figure : '—'); ?></div>
                    <div class="desc">
                        <?php echo wp_kses_post(nl2br($description)); ?>
                    </div>
                </div>
                <div class="chart" id="<?php echo esc_attr($chart_id); ?>"<?php if (!empty($chart_data_url)) : ?> data-api-url="<?php echo esc_url($chart_data_url); ?>"<?php endif; ?>></div>
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

