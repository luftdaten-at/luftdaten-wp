<?php
/**
 * Enqueue Scripts and Styles
 *
 * @package Luftdaten
 */

/**
 * Enqueue scripts and styles
 */
function luftdaten_enqueue_scripts() {
    // Styles
    wp_enqueue_style('luftdaten-style', get_stylesheet_directory_uri() . '/styles.css', array(), '1.0.0');
    
    // Scripts
    wp_enqueue_script('d3-js', 'https://d3js.org/d3.v7.min.js', array(), '7.0.0', true);
    
    // Leaflet for citizen science map
    wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', array(), '1.9.4');
    wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', array(), '1.9.4', true);
    
    wp_enqueue_script('luftdaten-script', get_stylesheet_directory_uri() . '/script.js', array('d3-js', 'leaflet-js'), '1.0.0', true);
    
    // jQuery is required for city search (enqueued by WordPress core)
    wp_enqueue_script('jquery');
    
           // Localize script for AJAX (if needed in the future)
           wp_localize_script('luftdaten-script', 'luftdatenAjax', array(
               'ajaxurl' => admin_url('admin-ajax.php'),
               'nonce' => wp_create_nonce('luftdaten-nonce'),
           ));
           
           // Pass debug mode setting to JavaScript
           wp_localize_script('luftdaten-script', 'luftdatenDebug', array(
               'enabled' => luftdaten_get_debug_mode(),
           ));
}
add_action('wp_enqueue_scripts', 'luftdaten_enqueue_scripts');

