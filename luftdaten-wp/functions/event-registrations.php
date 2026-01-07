<?php
/**
 * Event Registrations Custom Post Type
 *
 * @package Luftdaten
 */

/**
 * Register Event Registration Custom Post Type
 */
function luftdaten_register_event_registration_post_type() {
    $labels = array(
        'name'               => _x('Event Registrations', 'post type general name', 'luftdaten'),
        'singular_name'      => _x('Event Registration', 'post type singular name', 'luftdaten'),
        'menu_name'          => _x('Event Registrations', 'admin menu', 'luftdaten'),
        'name_admin_bar'     => _x('Event Registration', 'add new on admin bar', 'luftdaten'),
        'add_new'            => _x('Add New', 'registration', 'luftdaten'),
        'add_new_item'       => __('Add New Registration', 'luftdaten'),
        'new_item'           => __('New Registration', 'luftdaten'),
        'edit_item'          => __('View Registration', 'luftdaten'),
        'view_item'          => __('View Registration', 'luftdaten'),
        'all_items'          => __('All Registrations', 'luftdaten'),
        'search_items'       => __('Search Registrations', 'luftdaten'),
        'not_found'          => __('No registrations found.', 'luftdaten'),
        'not_found_in_trash' => __('No registrations found in Trash.', 'luftdaten'),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => false, // Don't show as top-level menu
        'query_var'          => false,
        'rewrite'            => false,
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'supports'           => array('title'),
        'show_in_rest'       => false,
    );

    register_post_type('event_registration', $args);
}
add_action('init', 'luftdaten_register_event_registration_post_type');

/**
 * Add Event Registrations as submenu under Events
 */
function luftdaten_add_event_registrations_submenu() {
    add_submenu_page(
        'edit.php?post_type=event',                    // Parent slug (Events menu)
        __('Event Registrations', 'luftdaten'),         // Page title
        __('Registrations', 'luftdaten'),               // Menu title
        'edit_posts',                                   // Capability
        'edit.php?post_type=event_registration'         // Menu slug
    );
}
add_action('admin_menu', 'luftdaten_add_event_registrations_submenu', 11);

/**
 * Add meta boxes for event registration fields
 */
function luftdaten_add_event_registration_meta_boxes() {
    add_meta_box(
        'registration_details',
        __('Registration Details', 'luftdaten'),
        'luftdaten_event_registration_meta_box_callback',
        'event_registration',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'luftdaten_add_event_registration_meta_boxes');

/**
 * Event registration meta box callback
 */
function luftdaten_event_registration_meta_box_callback($post) {
    $event_id = get_post_meta($post->ID, '_registration_event_id', true);
    $registrant_name = get_post_meta($post->ID, '_registration_name', true);
    $registrant_email = get_post_meta($post->ID, '_registration_email', true);
    $registrant_phone = get_post_meta($post->ID, '_registration_phone', true);
    $registration_date = get_post_meta($post->ID, '_registration_date', true);
    
    $event_title = $event_id ? get_the_title($event_id) : __('Event not found', 'luftdaten');
    $event_link = $event_id ? get_edit_post_link($event_id) : '#';
    
    ?>
    <table class="form-table">
        <tr>
            <th><label><?php _e('Event', 'luftdaten'); ?></label></th>
            <td>
                <strong><?php echo esc_html($event_title); ?></strong>
                <?php if ($event_id) : ?>
                    <a href="<?php echo esc_url($event_link); ?>" class="button" style="margin-left: 10px;"><?php _e('View Event', 'luftdaten'); ?></a>
                <?php endif; ?>
            </td>
        </tr>
        <tr>
            <th><label><?php _e('Name', 'luftdaten'); ?></label></th>
            <td><strong><?php echo esc_html($registrant_name); ?></strong></td>
        </tr>
        <tr>
            <th><label><?php _e('Email', 'luftdaten'); ?></label></th>
            <td><strong><a href="mailto:<?php echo esc_attr($registrant_email); ?>"><?php echo esc_html($registrant_email); ?></a></strong></td>
        </tr>
        <?php if ($registrant_phone) : ?>
        <tr>
            <th><label><?php _e('Phone', 'luftdaten'); ?></label></th>
            <td><strong><?php echo esc_html($registrant_phone); ?></strong></td>
        </tr>
        <?php endif; ?>
        <tr>
            <th><label><?php _e('Registration Date', 'luftdaten'); ?></label></th>
            <td><strong><?php echo esc_html($registration_date ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($registration_date)) : '—'); ?></strong></td>
        </tr>
    </table>
    <?php
}

/**
 * Handle event registration form submission
 */
function luftdaten_handle_event_registration() {
    // Verify nonce
    if (!isset($_POST['event_registration_nonce']) || !wp_verify_nonce($_POST['event_registration_nonce'], 'luftdaten_event_registration')) {
        wp_die(__('Security check failed', 'luftdaten'));
    }

    $event_id = isset($_POST['event_id']) ? intval($_POST['event_id']) : 0;
    $name = isset($_POST['registration_name']) ? sanitize_text_field($_POST['registration_name']) : '';
    $email = isset($_POST['registration_email']) ? sanitize_email($_POST['registration_email']) : '';
    $phone = isset($_POST['registration_phone']) ? sanitize_text_field($_POST['registration_phone']) : '';

    // Validation
    if (empty($event_id) || empty($name) || empty($email)) {
        wp_die(__('Required fields are missing', 'luftdaten'));
    }

    // Check if registration is enabled for this event
    $registration_enabled = get_post_meta($event_id, '_event_registration_enabled', true);
    if ($registration_enabled !== '1') {
        wp_die(__('Registration is not enabled for this event', 'luftdaten'));
    }

    // Check if email is already registered for this event
    $existing_registrations = get_posts(array(
        'post_type' => 'event_registration',
        'posts_per_page' => 1,
        'meta_query' => array(
            'relation' => 'AND',
            array(
                'key' => '_registration_event_id',
                'value' => $event_id,
                'compare' => '=',
            ),
            array(
                'key' => '_registration_email',
                'value' => $email,
                'compare' => '=',
            ),
        ),
    ));

    if (!empty($existing_registrations)) {
        wp_redirect(add_query_arg('registration', 'duplicate', get_permalink($event_id)));
        exit;
    }

    // Create registration
    $registration_id = wp_insert_post(array(
        'post_type' => 'event_registration',
        'post_title' => sprintf(__('%s - %s', 'luftdaten'), $name, get_the_title($event_id)),
        'post_status' => 'publish',
    ));

    if ($registration_id) {
        update_post_meta($registration_id, '_registration_event_id', $event_id);
        update_post_meta($registration_id, '_registration_name', $name);
        update_post_meta($registration_id, '_registration_email', $email);
        update_post_meta($registration_id, '_registration_phone', $phone);
        update_post_meta($registration_id, '_registration_date', current_time('mysql'));

        wp_redirect(add_query_arg('registration', 'success', get_permalink($event_id)));
        exit;
    } else {
        wp_die(__('Registration failed. Please try again.', 'luftdaten'));
    }
}
add_action('admin_post_luftdaten_event_registration', 'luftdaten_handle_event_registration');
add_action('admin_post_nopriv_luftdaten_event_registration', 'luftdaten_handle_event_registration');

/**
 * Add custom columns to event registrations list
 */
function luftdaten_event_registration_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = __('Name', 'luftdaten');
    $new_columns['event'] = __('Event', 'luftdaten');
    $new_columns['email'] = __('Email', 'luftdaten');
    $new_columns['phone'] = __('Phone', 'luftdaten');
    $new_columns['date'] = __('Registration Date', 'luftdaten');
    return $new_columns;
}
add_filter('manage_event_registration_posts_columns', 'luftdaten_event_registration_columns');

/**
 * Populate custom columns
 */
function luftdaten_event_registration_column_content($column, $post_id) {
    switch ($column) {
        case 'event':
            $event_id = get_post_meta($post_id, '_registration_event_id', true);
            if ($event_id) {
                echo '<a href="' . esc_url(get_edit_post_link($event_id)) . '">' . esc_html(get_the_title($event_id)) . '</a>';
            } else {
                echo '—';
            }
            break;
        case 'email':
            $email = get_post_meta($post_id, '_registration_email', true);
            echo $email ? '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>' : '—';
            break;
        case 'phone':
            $phone = get_post_meta($post_id, '_registration_phone', true);
            echo $phone ? esc_html($phone) : '—';
            break;
    }
}
add_action('manage_event_registration_posts_custom_column', 'luftdaten_event_registration_column_content', 10, 2);

/**
 * Make custom columns sortable
 */
function luftdaten_event_registration_sortable_columns($columns) {
    $columns['event'] = 'event';
    $columns['date'] = 'date';
    return $columns;
}
add_filter('manage_edit-event_registration_sortable_columns', 'luftdaten_event_registration_sortable_columns');

