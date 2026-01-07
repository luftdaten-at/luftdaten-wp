<?php
/**
 * Datasets Custom Post Type
 *
 * @package Luftdaten
 */

/**
 * Register Dataset Custom Post Type
 */
function luftdaten_register_datasets_post_type() {
    $labels = array(
        'name'                  => _x('Datasets', 'Post Type General Name', 'luftdaten'),
        'singular_name'         => _x('Dataset', 'Post Type Singular Name', 'luftdaten'),
        'menu_name'             => __('Datasets', 'luftdaten'),
        'name_admin_bar'        => __('Dataset', 'luftdaten'),
        'archives'              => __('Dataset Archives', 'luftdaten'),
        'attributes'            => __('Dataset Attributes', 'luftdaten'),
        'parent_item_colon'     => __('Parent Dataset:', 'luftdaten'),
        'all_items'             => __('All Datasets', 'luftdaten'),
        'add_new_item'          => __('Add New Dataset', 'luftdaten'),
        'add_new'               => __('Add New', 'luftdaten'),
        'new_item'              => __('New Dataset', 'luftdaten'),
        'edit_item'             => __('Edit Dataset', 'luftdaten'),
        'update_item'           => __('Update Dataset', 'luftdaten'),
        'view_item'             => __('View Dataset', 'luftdaten'),
        'view_items'            => __('View Datasets', 'luftdaten'),
        'search_items'          => __('Search Dataset', 'luftdaten'),
        'not_found'             => __('Not found', 'luftdaten'),
        'not_found_in_trash'    => __('Not found in Trash', 'luftdaten'),
        'featured_image'        => __('Featured Image', 'luftdaten'),
        'set_featured_image'    => __('Set featured image', 'luftdaten'),
        'remove_featured_image' => __('Remove featured image', 'luftdaten'),
        'use_featured_image'    => __('Use as featured image', 'luftdaten'),
        'insert_into_item'      => __('Insert into dataset', 'luftdaten'),
        'uploaded_to_this_item' => __('Uploaded to this dataset', 'luftdaten'),
        'items_list'            => __('Datasets list', 'luftdaten'),
        'items_list_navigation' => __('Datasets list navigation', 'luftdaten'),
        'filter_items_list'     => __('Filter datasets list', 'luftdaten'),
    );

    $args = array(
        'label'                 => __('Dataset', 'luftdaten'),
        'description'           => __('Chart datasets with JSON data or file URLs', 'luftdaten'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt'),
        'taxonomies'            => array(),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-chart-line',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true, // Enable REST API
        'rest_base'             => 'datasets',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
    );

    register_post_type('dataset', $args);
}
add_action('init', 'luftdaten_register_datasets_post_type', 0);

/**
 * Register custom fields for Dataset
 */
function luftdaten_register_dataset_meta_fields() {
    register_post_meta('dataset', '_dataset_json_data', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'description' => __('JSON data for the chart', 'luftdaten'),
        'default' => '',
        'sanitize_callback' => 'luftdaten_sanitize_json_data',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
    ));

    register_post_meta('dataset', '_dataset_file_url', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'description' => __('URL to JSON file containing chart data', 'luftdaten'),
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
    ));

    register_post_meta('dataset', '_dataset_chart_id', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'description' => __('Chart ID this dataset is associated with', 'luftdaten'),
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
    ));

    register_post_meta('dataset', '_dataset_data_type', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'description' => __('Type of data source: json or file_url', 'luftdaten'),
        'default' => 'json',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
    ));
}
add_action('init', 'luftdaten_register_dataset_meta_fields');

/**
 * Sanitize JSON data field
 */
function luftdaten_sanitize_json_data($value) {
    // Validate JSON if not empty
    if (!empty($value)) {
        json_decode($value);
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Invalid JSON, return empty string or throw error
            return '';
        }
    }
    return $value;
}

/**
 * Add meta boxes for Dataset
 */
function luftdaten_add_dataset_meta_boxes() {
    add_meta_box(
        'dataset_data_meta_box',
        __('Dataset Data', 'luftdaten'),
        'luftdaten_dataset_meta_box_callback',
        'dataset',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'luftdaten_add_dataset_meta_boxes');

/**
 * Meta box callback for Dataset data
 */
function luftdaten_dataset_meta_box_callback($post) {
    wp_nonce_field('luftdaten_dataset_meta_box', 'luftdaten_dataset_meta_box_nonce');

    $data_type = get_post_meta($post->ID, '_dataset_data_type', true);
    if (empty($data_type)) {
        $data_type = 'json';
    }

    $json_data = get_post_meta($post->ID, '_dataset_json_data', true);
    $file_url = get_post_meta($post->ID, '_dataset_file_url', true);
    $chart_id = get_post_meta($post->ID, '_dataset_chart_id', true);
    ?>
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="dataset_data_type"><?php _e('Data Type', 'luftdaten'); ?></label>
            </th>
            <td>
                <select name="dataset_data_type" id="dataset_data_type">
                    <option value="json" <?php selected($data_type, 'json'); ?>><?php _e('JSON Data', 'luftdaten'); ?></option>
                    <option value="file_url" <?php selected($data_type, 'file_url'); ?>><?php _e('File URL', 'luftdaten'); ?></option>
                </select>
                <p class="description"><?php _e('Choose whether to store JSON data directly or provide a URL to a JSON file.', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr id="dataset_json_row" style="<?php echo $data_type === 'file_url' ? 'display:none;' : ''; ?>">
            <th scope="row">
                <label for="dataset_json_data"><?php _e('JSON Data', 'luftdaten'); ?></label>
            </th>
            <td>
                <textarea name="dataset_json_data" id="dataset_json_data" rows="15" class="large-text code" style="font-family: monospace;"><?php echo esc_textarea($json_data); ?></textarea>
                <p class="description"><?php _e('Enter valid JSON data for the chart. This will be stored and available via REST API.', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr id="dataset_file_url_row" style="<?php echo $data_type === 'json' ? 'display:none;' : ''; ?>">
            <th scope="row">
                <label for="dataset_file_url"><?php _e('File URL', 'luftdaten'); ?></label>
            </th>
            <td>
                <input type="url" name="dataset_file_url" id="dataset_file_url" value="<?php echo esc_attr($file_url); ?>" class="regular-text" />
                <button type="button" class="button" id="dataset_file_url_button"><?php _e('Select File', 'luftdaten'); ?></button>
                <p class="description"><?php _e('URL to a JSON file containing chart data. This can be an external URL or a file from the media library.', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="dataset_chart_id"><?php _e('Chart ID', 'luftdaten'); ?></label>
            </th>
            <td>
                <input type="text" name="dataset_chart_id" id="dataset_chart_id" value="<?php echo esc_attr($chart_id); ?>" class="regular-text" />
                <p class="description"><?php _e('Optional: Chart ID this dataset is associated with (e.g., m2Scatter, pm25Chart, etc.)', 'luftdaten'); ?></p>
            </td>
        </tr>
    </table>

    <script>
    jQuery(document).ready(function($) {
        $('#dataset_data_type').on('change', function() {
            if ($(this).val() === 'json') {
                $('#dataset_json_row').show();
                $('#dataset_file_url_row').hide();
            } else {
                $('#dataset_json_row').hide();
                $('#dataset_file_url_row').show();
            }
        });

        // Media uploader for file URL
        $('#dataset_file_url_button').on('click', function(e) {
            e.preventDefault();
            var file_frame = wp.media({
                title: '<?php echo esc_js(__('Select JSON File', 'luftdaten')); ?>',
                button: {
                    text: '<?php echo esc_js(__('Use this file', 'luftdaten')); ?>',
                },
                multiple: false
            });

            file_frame.on('select', function() {
                var attachment = file_frame.state().get('selection').first().toJSON();
                $('#dataset_file_url').val(attachment.url);
            });

            file_frame.open();
        });
    });
    </script>
    <?php
}

/**
 * Save Dataset meta data
 */
function luftdaten_save_dataset_meta($post_id) {
    // Check if nonce is set
    if (!isset($_POST['luftdaten_dataset_meta_box_nonce'])) {
        return;
    }

    // Verify nonce
    if (!wp_verify_nonce($_POST['luftdaten_dataset_meta_box_nonce'], 'luftdaten_dataset_meta_box')) {
        return;
    }

    // Check if autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Check post type
    if (get_post_type($post_id) !== 'dataset') {
        return;
    }

    // Save data type
    if (isset($_POST['dataset_data_type'])) {
        update_post_meta($post_id, '_dataset_data_type', sanitize_text_field($_POST['dataset_data_type']));
    }

    // Save JSON data
    if (isset($_POST['dataset_json_data'])) {
        $json_data = wp_unslash($_POST['dataset_json_data']);
        // Validate JSON
        json_decode($json_data);
        if (json_last_error() === JSON_ERROR_NONE || empty($json_data)) {
            update_post_meta($post_id, '_dataset_json_data', $json_data);
        }
    }

    // Save file URL
    if (isset($_POST['dataset_file_url'])) {
        update_post_meta($post_id, '_dataset_file_url', esc_url_raw($_POST['dataset_file_url']));
    }

    // Save chart ID
    if (isset($_POST['dataset_chart_id'])) {
        update_post_meta($post_id, '_dataset_chart_id', sanitize_text_field($_POST['dataset_chart_id']));
    }
}
add_action('save_post', 'luftdaten_save_dataset_meta');

/**
 * Customize REST API response to include formatted data
 */
function luftdaten_dataset_rest_response($response, $post, $request) {
    if ($post->post_type === 'dataset') {
        $data_type = get_post_meta($post->ID, '_dataset_data_type', true);
        $json_data = get_post_meta($post->ID, '_dataset_json_data', true);
        $file_url = get_post_meta($post->ID, '_dataset_file_url', true);
        $chart_id = get_post_meta($post->ID, '_dataset_chart_id', true);

        // Add data to REST response
        $response->data['dataset_data_type'] = $data_type;
        $response->data['dataset_json_data'] = $json_data;
        $response->data['dataset_file_url'] = $file_url;
        $response->data['dataset_chart_id'] = $chart_id;

        // Parse JSON data if available for easier consumption
        if ($data_type === 'json' && !empty($json_data)) {
            $parsed = json_decode($json_data, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $response->data['dataset_data'] = $parsed;
            }
        }
    }

    return $response;
}
add_filter('rest_prepare_dataset', 'luftdaten_dataset_rest_response', 10, 3);

/**
 * Add custom columns to datasets list
 */
function luftdaten_dataset_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['chart_id'] = __('Chart ID', 'luftdaten');
    $new_columns['data_type'] = __('Data Type', 'luftdaten');
    $new_columns['rest_endpoint'] = __('REST Endpoint', 'luftdaten');
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_dataset_posts_columns', 'luftdaten_dataset_columns');

/**
 * Populate custom columns
 */
function luftdaten_dataset_column_content($column, $post_id) {
    switch ($column) {
        case 'chart_id':
            $chart_id = get_post_meta($post_id, '_dataset_chart_id', true);
            echo $chart_id ? esc_html($chart_id) : '—';
            break;
        case 'data_type':
            $data_type = get_post_meta($post_id, '_dataset_data_type', true);
            if (empty($data_type)) {
                $data_type = 'json';
            }
            echo esc_html(ucfirst($data_type));
            break;
        case 'rest_endpoint':
            $rest_url = rest_url('wp/v2/datasets/' . $post_id);
            echo '<a href="' . esc_url($rest_url) . '" target="_blank" rel="noopener noreferrer" style="font-family: monospace; font-size: 11px;">' . esc_html($rest_url) . '</a>';
            break;
    }
}
add_action('manage_dataset_posts_custom_column', 'luftdaten_dataset_column_content', 10, 2);

/**
 * Make custom columns sortable
 */
function luftdaten_dataset_sortable_columns($columns) {
    $columns['chart_id'] = 'chart_id';
    $columns['data_type'] = 'data_type';
    return $columns;
}
add_filter('manage_edit-dataset_sortable_columns', 'luftdaten_dataset_sortable_columns');

