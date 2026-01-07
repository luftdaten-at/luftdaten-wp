<?php
/**
 * Functions and Definitions
 *
 * This file loads all theme functionality from the functions directory.
 * The code is organized into logical groups in separate files.
 *
 * @package Luftdaten
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Load all function files
 */
$functions_dir = get_template_directory() . '/functions/';
    $functions_files = array(
        'theme-setup.php',           // Theme support, menus, widgets, excerpt customization
        'customizer.php',            // Theme customizer settings (must be before enqueue.php)
        'enqueue.php',               // Script and style enqueuing
        'block-categories.php',      // Gutenberg block categories
    'events.php',                // Events custom post type and block
    'event-registrations.php',   // Event registrations custom post type
    'datasets.php',              // Datasets custom post type with REST API
    'services.php',              // Services block
    'partner-logos.php',         // Partner logos block
    'kpis.php',                  // KPIs block
    'ozon-hitze.php',            // Ozon folgt der Hitze block
    'urban-heat-island.php',     // Urban Heat Island block
    'doppelbelastung.php',       // Doppelbelastung block
    'jahresmittel-trend.php',    // Jahresmittel (Trend) block
    'citizen-science-messnetz.php', // Citizen Science Messnetz block
    'city-search.php',           // City Search block
);

foreach ($functions_files as $file) {
    $file_path = $functions_dir . $file;
    if (file_exists($file_path)) {
        require_once $file_path;
    }
}
