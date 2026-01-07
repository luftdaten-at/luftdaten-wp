<?php
/**
 * Theme Customizer Settings
 *
 * @package Luftdaten
 */

/**
 * Register customizer settings
 */
function luftdaten_customize_register($wp_customize) {
    // Add Debug Section
    $wp_customize->add_section('luftdaten_debug', array(
        'title'    => __('Debug Settings', 'luftdaten'),
        'priority' => 200,
    ));

    // Debug Mode Setting
    $wp_customize->add_setting('luftdaten_debug_mode', array(
        'default'           => false,
        'type'              => 'theme_mod',
        'capability'        => 'edit_theme_options',
        'sanitize_callback' => 'wp_validate_boolean',
    ));

    $wp_customize->add_control('luftdaten_debug_mode', array(
        'label'    => __('Enable Debug Mode', 'luftdaten'),
        'section'  => 'luftdaten_debug',
        'type'     => 'checkbox',
        'description' => __('Show debug console logs for charts and maps. Useful for troubleshooting data loading issues.', 'luftdaten'),
    ));
}
add_action('customize_register', 'luftdaten_customize_register');

/**
 * Get debug mode setting
 */
function luftdaten_get_debug_mode() {
    return get_theme_mod('luftdaten_debug_mode', false);
}

