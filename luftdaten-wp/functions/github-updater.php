<?php
/**
 * GitHub Auto-Update for WordPress Theme
 *
 * This file enables automatic updates from GitHub releases.
 * It checks for new releases and allows updating directly from WordPress dashboard.
 *
 * @package Luftdaten
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Get theme version from style.css
 */
function luftdaten_get_theme_version() {
    $theme = wp_get_theme();
    return $theme->get('Version');
}

/**
 * GitHub repository details
 */
define('LUFTDATEN_GITHUB_USERNAME', 'luftdaten-at');
define('LUFTDATEN_GITHUB_REPOSITORY', 'luftdaten-wp');
define('LUFTDATEN_GITHUB_API_URL', 'https://api.github.com/repos/' . LUFTDATEN_GITHUB_USERNAME . '/' . LUFTDATEN_GITHUB_REPOSITORY . '/releases/latest');

/**
 * Check for theme updates from GitHub
 */
function luftdaten_check_github_updates($transient) {
    if (empty($transient->checked)) {
        return $transient;
    }

    // Get current theme version
    $current_version = luftdaten_get_theme_version();

    // Fetch latest release from GitHub
    $response = wp_remote_get(LUFTDATEN_GITHUB_API_URL, array(
        'timeout' => 10,
        'headers' => array(
            'Accept' => 'application/vnd.github.v3+json',
        ),
    ));

    if (is_wp_error($response)) {
        return $transient;
    }

    $release_data = json_decode(wp_remote_retrieve_body($response));

    if (empty($release_data) || !isset($release_data->tag_name)) {
        return $transient;
    }

    // Extract version number (remove 'v' prefix if present)
    $latest_version = ltrim($release_data->tag_name, 'v');

    // Compare versions
    if (version_compare($current_version, $latest_version, '<')) {
        // Find the theme ZIP file in assets
        $download_url = '';
        if (isset($release_data->assets) && is_array($release_data->assets)) {
            foreach ($release_data->assets as $asset) {
                if (isset($asset->browser_download_url) && preg_match('/\.zip$/i', $asset->browser_download_url)) {
                    // Prefer theme ZIP (look for luftdaten-wp in filename)
                    if (strpos($asset->name, 'luftdaten-wp') !== false || strpos($asset->name, 'theme') !== false) {
                        $download_url = $asset->browser_download_url;
                        break;
                    }
                }
            }
            // If no theme-specific ZIP found, use first ZIP
            if (empty($download_url)) {
                foreach ($release_data->assets as $asset) {
                    if (isset($asset->browser_download_url) && preg_match('/\.zip$/i', $asset->browser_download_url)) {
                        $download_url = $asset->browser_download_url;
                        break;
                    }
                }
            }
        }

        // Fallback: construct download URL if no asset found
        if (empty($download_url)) {
            $download_url = sprintf(
                'https://github.com/%s/%s/archive/refs/tags/%s.zip',
                LUFTDATEN_GITHUB_USERNAME,
                LUFTDATEN_GITHUB_REPOSITORY,
                $release_data->tag_name
            );
        }

        // Add to transient
        $transient->response['luftdaten-wp'] = array(
            'theme' => 'luftdaten-wp',
            'new_version' => $latest_version,
            'url' => $release_data->html_url,
            'package' => $download_url,
        );
    }

    return $transient;
}
add_filter('pre_set_site_transient_update_themes', 'luftdaten_check_github_updates');

/**
 * Display update notification in theme details
 */
function luftdaten_theme_update_details($false, $action, $args) {
    if (isset($args->slug) && $args->slug === 'luftdaten-wp') {
        $response = wp_remote_get(LUFTDATEN_GITHUB_API_URL, array(
            'timeout' => 10,
            'headers' => array(
                'Accept' => 'application/vnd.github.v3+json',
            ),
        ));

        if (!is_wp_error($response)) {
            $release_data = json_decode(wp_remote_retrieve_body($response));
            if (!empty($release_data) && isset($release_data->tag_name)) {
                $latest_version = ltrim($release_data->tag_name, 'v');

                // Find download URL
                $download_url = '';
                if (isset($release_data->assets) && is_array($release_data->assets)) {
                    foreach ($release_data->assets as $asset) {
                        if (isset($asset->browser_download_url) && preg_match('/\.zip$/i', $asset->browser_download_url)) {
                            if (strpos($asset->name, 'luftdaten-wp') !== false || strpos($asset->name, 'theme') !== false) {
                                $download_url = $asset->browser_download_url;
                                break;
                            }
                        }
                    }
                    if (empty($download_url)) {
                        foreach ($release_data->assets as $asset) {
                            if (isset($asset->browser_download_url) && preg_match('/\.zip$/i', $asset->browser_download_url)) {
                                $download_url = $asset->browser_download_url;
                                break;
                            }
                        }
                    }
                }

                if (empty($download_url)) {
                    $download_url = sprintf(
                        'https://github.com/%s/%s/archive/refs/tags/%s.zip',
                        LUFTDATEN_GITHUB_USERNAME,
                        LUFTDATEN_GITHUB_REPOSITORY,
                        $release_data->tag_name
                    );
                }

                return array(
                    'name' => 'Luftdaten.at',
                    'slug' => 'luftdaten-wp',
                    'version' => $latest_version,
                    'author' => 'Luftdaten.at',
                    'requires' => '5.0',
                    'tested' => get_bloginfo('version'),
                    'rating' => 100,
                    'num_ratings' => 0,
                    'downloaded' => 0,
                    'added' => '',
                    'homepage' => 'https://www.luftdaten.at',
                    'description' => wp_kses_post($release_data->body ?? ''),
                    'download_link' => $download_url,
                    'sections' => array(
                        'description' => wp_kses_post($release_data->body ?? ''),
                        'changelog' => wp_kses_post($release_data->body ?? ''),
                    ),
                );
            }
        }
    }

    return $false;
}
add_filter('themes_api', 'luftdaten_theme_update_details', 10, 3);

/**
 * Customize update messages for the theme
 */
function luftdaten_theme_update_message($theme_data, $r) {
    if (isset($r['checked']) && isset($r['checked']['luftdaten-wp'])) {
        if (version_compare($theme_data['Version'], $r['checked']['luftdaten-wp'], '<')) {
            printf(
                '<p><strong>%s</strong> %s <a href="%s" target="_blank" rel="noopener noreferrer">%s</a></p>',
                esc_html__('A new version is available!', 'luftdaten'),
                esc_html__('View release notes on', 'luftdaten'),
                esc_url('https://github.com/' . LUFTDATEN_GITHUB_USERNAME . '/' . LUFTDATEN_GITHUB_REPOSITORY . '/releases/latest'),
                esc_html__('GitHub', 'luftdaten')
            );
        }
    }
}
add_action('in_theme_update_message-luftdaten-wp', 'luftdaten_theme_update_message', 10, 2);

/**
 * Handle authentication for private repositories (if needed in future)
 */
function luftdaten_github_auth($args, $url) {
    // If you need to access a private repository, add GitHub token here
    // $args['headers']['Authorization'] = 'token YOUR_GITHUB_TOKEN';
    return $args;
}
add_filter('http_request_args', 'luftdaten_github_auth', 10, 2);

