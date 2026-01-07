<?php
/**
 * Block Categories
 *
 * @package Luftdaten
 */

/**
 * Register block category for Luftdaten blocks
 */
function luftdaten_block_categories($categories, $editor_context) {
    if (!empty($editor_context->post)) {
        array_unshift(
            $categories,
            array(
                'slug' => 'luftdaten',
                'title' => __('Luftdaten Blocks', 'luftdaten'),
                'icon' => null,
            )
        );
    }
    return $categories;
}
add_filter('block_categories_all', 'luftdaten_block_categories', 10, 2);

