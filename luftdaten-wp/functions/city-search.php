<?php
/**
 * City Search Block
 *
 * @package Luftdaten
 */

/**
 * Register Gutenberg block for City Search
 */
function luftdaten_register_city_search_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-city-search-block',
        get_stylesheet_directory_uri() . '/src/blocks/city-search/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-city-search-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/city-search/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/city-search', array(
        'editor_script' => 'luftdaten-city-search-block',
        'editor_style' => 'luftdaten-city-search-block-editor',
        'render_callback' => 'luftdaten_render_city_search_block',
        'attributes' => array(
            'title' => array(
                'type' => 'string',
                'default' => __('Nach Themen oder Gemeinden suchen', 'luftdaten'),
            ),
            'placeholder' => array(
                'type' => 'string',
                'default' => __('Nach Themen oder Gemeinden suchen', 'luftdaten'),
            ),
            'apiUrl' => array(
                'type' => 'string',
                'default' => 'https://api.luftdaten.at/v1/city/all',
            ),
            'baseUrl' => array(
                'type' => 'string',
                'default' => 'https://datahub.luftdaten.at/cities/',
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_city_search_block');

/**
 * Render the City Search block
 */
function luftdaten_render_city_search_block($attributes) {
    $title = isset($attributes['title']) ? $attributes['title'] : __('Nach Themen oder Gemeinden suchen', 'luftdaten');
    $placeholder = isset($attributes['placeholder']) ? $attributes['placeholder'] : __('Nach Themen oder Gemeinden suchen', 'luftdaten');
    $api_url = isset($attributes['apiUrl']) ? $attributes['apiUrl'] : 'https://api.luftdaten.at/v1/city/all';
    $base_url = isset($attributes['baseUrl']) ? $attributes['baseUrl'] : 'https://datahub.luftdaten.at/cities/';

    // Enqueue the city search script
    wp_enqueue_script(
        'luftdaten-city-search',
        get_stylesheet_directory_uri() . '/js/city-search.js',
        array('jquery'),
        '1.0.0',
        true
    );

    // Localize script with data
    wp_localize_script('luftdaten-city-search', 'citySearchData', array(
        'apiUrl' => esc_url_raw($api_url),
        'baseUrl' => esc_url_raw($base_url),
        'placeholder' => esc_js($placeholder),
        'noResultsText' => __('Keine Ergebnisse gefunden', 'luftdaten'),
        'loadingText' => __('Lädt...', 'luftdaten'),
    ));

    ob_start();
    ?>
    <?php if (!empty($title)) : ?>
        <h2 class="city-search-headline"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <section class="city-search-section" aria-label="<?php echo esc_attr($title); ?>">
        <div class="city-search-wrapper" id="city-search-wrapper">
            <form class="city-search-form" id="city-search-form" role="search" aria-label="<?php echo esc_attr__('Stadt- oder Themensuche', 'luftdaten'); ?>">
                <div class="city-search-input-wrapper">
                    <input 
                        type="text" 
                        id="city-search-input" 
                        class="city-search-input" 
                        placeholder="<?php echo esc_attr($placeholder); ?>"
                        autocomplete="off"
                        aria-label="<?php echo esc_attr__('Suchfeld für Städte oder Themen', 'luftdaten'); ?>"
                        aria-autocomplete="list"
                        aria-expanded="false"
                        aria-controls="city-search-suggestions"
                    />
                    <div id="city-search-loading" class="city-search-loading" aria-hidden="true" style="display: none;">
                        <span class="city-search-spinner"></span>
                        <span class="city-search-loading-text"><?php echo esc_html__('Lädt...', 'luftdaten'); ?></span>
                    </div>
                    <div id="city-search-suggestions" class="city-search-suggestions" role="listbox" aria-label="<?php echo esc_attr__('Suchvorschläge', 'luftdaten'); ?>" aria-live="polite"></div>
                </div>
                <button type="submit" class="city-search-button" aria-label="<?php echo esc_attr__('Suche starten', 'luftdaten'); ?>">
                    <?php echo esc_html__('Suchen', 'luftdaten'); ?>
                </button>
            </form>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

