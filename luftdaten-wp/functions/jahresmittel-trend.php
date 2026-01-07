<?php
/**
 * Jahresmittel (Trend) Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for Jahresmittel (Trend)
 */
function luftdaten_register_jahresmittel_trend_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-jahresmittel-trend-block',
        get_stylesheet_directory_uri() . '/src/blocks/jahresmittel-trend/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-jahresmittel-trend-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/jahresmittel-trend/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/jahresmittel-trend', array(
        'editor_script' => 'luftdaten-jahresmittel-trend-block',
        'editor_style' => 'luftdaten-jahresmittel-trend-block-editor',
        'render_callback' => 'luftdaten_render_jahresmittel_trend_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('PM₂.₅ — Jahresmittel (Trend)', 'luftdaten'),
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
                'default' => __('Jahresmittelwert (vereinfachte Aggregation) – im Wireframe über Messnetz gemittelt. In Produktion: stations- vs. bevölkerungsgewichtet entscheiden.', 'luftdaten'),
            ),
            'chartId' => array(
                'type' => 'string',
                'default' => 'pm25Chart',
            ),
            'chartDataUrl' => array(
                'type' => 'string',
                'default' => '',
            ),
            'yAxisLabel' => array(
                'type' => 'string',
                'default' => __('Jahresmittel in µg/m³', 'luftdaten'),
            ),
            'refLineValue' => array(
                'type' => 'number',
                'default' => 10,
            ),
            'refLineLabel' => array(
                'type' => 'string',
                'default' => __('EU 2030: 10 µg/m³', 'luftdaten'),
            ),
            'source' => array(
                'type' => 'string',
                'default' => __('Quelle: UBA/EEA — Wireframe Mock.', 'luftdaten'),
            ),
            'sourcePill' => array(
                'type' => 'string',
                'default' => __('Einheit: µg/m³', 'luftdaten'),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_jahresmittel_trend_block');

/**
 * Render the Jahresmittel (Trend) block
 */
function luftdaten_render_jahresmittel_trend_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('PM₂.₅ — Jahresmittel (Trend)', 'luftdaten');
    $takeaway = isset($attributes['takeaway']) ? $attributes['takeaway'] : '';
    $key_figure = isset($attributes['keyFigure']) ? $attributes['keyFigure'] : '';
    $description = isset($attributes['description']) ? $attributes['description'] : '';
    $chart_id = isset($attributes['chartId']) ? $attributes['chartId'] : 'pm25Chart';
    $chart_data_url = isset($attributes['chartDataUrl']) ? $attributes['chartDataUrl'] : '';
    $y_axis_label = isset($attributes['yAxisLabel']) ? $attributes['yAxisLabel'] : __('Jahresmittel in µg/m³', 'luftdaten');
    $ref_line_value = isset($attributes['refLineValue']) ? $attributes['refLineValue'] : 10;
    $ref_line_label = isset($attributes['refLineLabel']) ? $attributes['refLineLabel'] : __('EU 2030: 10 µg/m³', 'luftdaten');
    $source = isset($attributes['source']) ? $attributes['source'] : '';
    $source_pill = isset($attributes['sourcePill']) ? $attributes['sourcePill'] : '';

    // Determine takeaway ID based on chart ID for compatibility
    $takeaway_id = 'pm25Takeaway';
    if (strpos($chart_id, 'no2') !== false) {
        $takeaway_id = 'no2Takeaway';
    } elseif (strpos($chart_id, 'o3') !== false) {
        $takeaway_id = 'o3Takeaway';
    } elseif (strpos($chart_id, 'pm10') !== false) {
        $takeaway_id = 'pm10Takeaway';
    }

    // Determine key figure ID based on chart ID for compatibility
    $key_figure_id = 'pm25Big';
    if (strpos($chart_id, 'no2') !== false) {
        $key_figure_id = 'no2Big';
    } elseif (strpos($chart_id, 'o3') !== false) {
        $key_figure_id = 'o3Big';
    } elseif (strpos($chart_id, 'pm10') !== false) {
        $key_figure_id = 'pm10Big';
    }

    ob_start();
    ?>
    <section class="section">
        <div class="sectionHead">
            <h2><?php echo esc_html($title); ?></h2>
            <div class="takeaway" id="<?php echo esc_attr($takeaway_id); ?>"><?php echo esc_html($takeaway ? $takeaway : '—'); ?></div>
        </div>
        <div class="sectionBody">
            <div class="bigNumberRow">
                <div class="bigNumber">
                    <div class="num" id="<?php echo esc_attr($key_figure_id); ?>"><?php echo esc_html($key_figure ? $key_figure : '—'); ?></div>
                    <div class="desc">
                        <?php echo wp_kses_post(nl2br($description)); ?>
                    </div>
                </div>
                <div class="chart" id="<?php echo esc_attr($chart_id); ?>"<?php if (!empty($chart_data_url)) : ?> data-api-url="<?php echo esc_url($chart_data_url); ?>"<?php endif; ?><?php if (!empty($y_axis_label)) : ?> data-y-label="<?php echo esc_attr($y_axis_label); ?>"<?php endif; ?><?php if ($ref_line_value !== '' && $ref_line_value !== null) : ?> data-ref-line="<?php echo esc_attr($ref_line_value); ?>"<?php endif; ?><?php if (!empty($ref_line_label)) : ?> data-ref-label="<?php echo esc_attr($ref_line_label); ?>"<?php endif; ?>></div>
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

