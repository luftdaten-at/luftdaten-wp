<?php
/**
 * KPIs Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for KPIs
 */
function luftdaten_register_kpis_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-kpis-block',
        get_stylesheet_directory_uri() . '/src/blocks/kpis/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-kpis-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/kpis/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/kpis', array(
        'editor_script' => 'luftdaten-kpis-block',
        'editor_style' => 'luftdaten-kpis-block-editor',
        'render_callback' => 'luftdaten_render_kpis_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Übersicht', 'luftdaten'),
            ),
            'kpis' => array(
                'type' => 'array',
                'default' => array(),
            ),
            'source' => array(
                'type' => 'string',
                'default' => '',
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_kpis_block');

/**
 * Render the KPIs block
 */
function luftdaten_render_kpis_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Übersicht', 'luftdaten');
    $kpis = isset($attributes['kpis']) ? $attributes['kpis'] : array();
    $source = isset($attributes['source']) ? $attributes['source'] : '';

    if (empty($kpis)) {
        return '';
    }

    ob_start();
    ?>
    <section class="kpis-section" aria-label="<?php echo esc_attr($title); ?>">
        <h2><?php echo esc_html($title); ?></h2>
        <div class="kpis">
            <?php
            foreach ($kpis as $kpi) {
                $label = isset($kpi['label']) ? $kpi['label'] : '';
                $value = isset($kpi['value']) ? $kpi['value'] : '0';
                $unit = isset($kpi['unit']) ? $kpi['unit'] : '';
                $trend = isset($kpi['trend']) ? $kpi['trend'] : '';
                $note = isset($kpi['note']) ? $kpi['note'] : '';
                $link = isset($kpi['link']) ? $kpi['link'] : '';
                
                if (empty($label)) {
                    continue; // Skip KPIs without labels
                }
                
                // Combine value, unit, and trend for display
                $value_display = $value;
                if (!empty($unit)) {
                    $value_display .= ' ' . $unit;
                }
                if (!empty($trend)) {
                    $value_display .= ' ' . $trend;
                }
                
                // Wrap in link if provided
                $kpi_content = '';
                $kpi_content .= '<div class="label">' . esc_html($label) . '</div>';
                $kpi_content .= '<div class="value">' . esc_html($value_display) . '</div>';
                if (!empty($note)) {
                    $kpi_content .= '<div class="note">' . esc_html($note) . '</div>';
                }
                
                if (!empty($link)) {
                    ?>
                    <a href="<?php echo esc_url($link); ?>" class="kpi kpi-link">
                        <?php echo $kpi_content; ?>
                    </a>
                    <?php
                } else {
                    ?>
                    <div class="kpi">
                        <?php echo $kpi_content; ?>
                    </div>
                    <?php
                }
            }
            ?>
        </div>
        <?php if (!empty($source)) : ?>
            <div class="kpis-source">
                <span style="font-size: 11px; color: var(--muted);"><?php echo esc_html__('Quelle:', 'luftdaten'); ?></span> <?php echo esc_html($source); ?>
            </div>
        <?php endif; ?>
    </section>
    <?php
    return ob_get_clean();
}

