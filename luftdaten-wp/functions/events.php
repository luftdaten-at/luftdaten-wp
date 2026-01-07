<?php
/**
 * Events Custom Post Type and Block
 *
 * @package Luftdaten
 */

/**
 * Register Events Custom Post Type
 */
function luftdaten_register_events_post_type() {
    $labels = array(
        'name'               => _x('Events', 'post type general name', 'luftdaten'),
        'singular_name'      => _x('Event', 'post type singular name', 'luftdaten'),
        'menu_name'          => _x('Events', 'admin menu', 'luftdaten'),
        'name_admin_bar'     => _x('Event', 'add new on admin bar', 'luftdaten'),
        'add_new'            => _x('Add New', 'event', 'luftdaten'),
        'add_new_item'       => __('Add New Event', 'luftdaten'),
        'new_item'           => __('New Event', 'luftdaten'),
        'edit_item'          => __('Edit Event', 'luftdaten'),
        'view_item'          => __('View Event', 'luftdaten'),
        'all_items'          => __('All Events', 'luftdaten'),
        'search_items'       => __('Search Events', 'luftdaten'),
        'not_found'          => __('No events found.', 'luftdaten'),
        'not_found_in_trash' => __('No events found in Trash.', 'luftdaten'),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'events'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-calendar-alt',
        'supports'           => array('title', 'editor', 'excerpt', 'thumbnail'),
        'show_in_rest'       => true, // Enable Gutenberg editor
    );

    register_post_type('event', $args);
}
add_action('init', 'luftdaten_register_events_post_type');

/**
 * Add meta boxes for event fields
 */
function luftdaten_add_event_meta_boxes() {
    add_meta_box(
        'event_details',
        __('Event Details', 'luftdaten'),
        'luftdaten_event_meta_box_callback',
        'event',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'luftdaten_add_event_meta_boxes');

/**
 * Event meta box callback
 */
function luftdaten_event_meta_box_callback($post) {
    wp_nonce_field('luftdaten_save_event_meta', 'luftdaten_event_meta_nonce');
    
    $event_date = get_post_meta($post->ID, '_event_date', true);
    $event_time = get_post_meta($post->ID, '_event_time', true);
    $event_location = get_post_meta($post->ID, '_event_location', true);
    $registration_enabled = get_post_meta($post->ID, '_event_registration_enabled', true);
    
    ?>
    <table class="form-table">
        <tr>
            <th><label for="event_date"><?php _e('Event Date', 'luftdaten'); ?></label></th>
            <td>
                <input type="date" id="event_date" name="event_date" value="<?php echo esc_attr($event_date); ?>" class="regular-text" />
                <p class="description"><?php _e('Select the event date', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr>
            <th><label for="event_time"><?php _e('Event Time', 'luftdaten'); ?></label></th>
            <td>
                <input type="text" id="event_time" name="event_time" value="<?php echo esc_attr($event_time); ?>" class="regular-text" placeholder="14:00–17:00 Uhr" />
                <p class="description"><?php _e('Enter the event time (e.g., 14:00–17:00 Uhr)', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr>
            <th><label for="event_location"><?php _e('Event Location', 'luftdaten'); ?></label></th>
            <td>
                <input type="text" id="event_location" name="event_location" value="<?php echo esc_attr($event_location); ?>" class="regular-text" placeholder="Wien, Hauptbücherei" />
                <p class="description"><?php _e('Enter the event location', 'luftdaten'); ?></p>
            </td>
        </tr>
        <tr>
            <th><label for="event_registration_enabled"><?php _e('Enable Registration', 'luftdaten'); ?></label></th>
            <td>
                <input type="checkbox" id="event_registration_enabled" name="event_registration_enabled" value="1" <?php checked($registration_enabled, '1'); ?> />
                <label for="event_registration_enabled"><?php _e('Allow users to register for this event', 'luftdaten'); ?></label>
                <p class="description"><?php _e('If enabled, a registration form will be displayed on the event page', 'luftdaten'); ?></p>
            </td>
        </tr>
    </table>
    <?php
}

/**
 * Save event meta data
 */
function luftdaten_save_event_meta($post_id) {
    // Check nonce
    if (!isset($_POST['luftdaten_event_meta_nonce']) || !wp_verify_nonce($_POST['luftdaten_event_meta_nonce'], 'luftdaten_save_event_meta')) {
        return;
    }

    // Check autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Check permissions
    if (isset($_POST['post_type']) && 'event' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return;
        }
    } else {
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
    }

    // Save meta fields
    if (isset($_POST['event_date'])) {
        update_post_meta($post_id, '_event_date', sanitize_text_field($_POST['event_date']));
    }
    if (isset($_POST['event_time'])) {
        update_post_meta($post_id, '_event_time', sanitize_text_field($_POST['event_time']));
    }
    if (isset($_POST['event_location'])) {
        update_post_meta($post_id, '_event_location', sanitize_text_field($_POST['event_location']));
    }
    if (isset($_POST['event_registration_enabled'])) {
        update_post_meta($post_id, '_event_registration_enabled', '1');
    } else {
        update_post_meta($post_id, '_event_registration_enabled', '0');
    }
}
add_action('save_post', 'luftdaten_save_event_meta');

/**
 * Register Gutenberg block for Events
 */
function luftdaten_register_events_block() {
    if (!function_exists('register_block_type')) {
        return; // Gutenberg is not available
    }

    // Register block script
    wp_register_script(
        'luftdaten-events-block',
        get_stylesheet_directory_uri() . '/src/blocks/events/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        '1.0.0',
        true
    );

    // Register block style
    wp_register_style(
        'luftdaten-events-block-editor',
        get_stylesheet_directory_uri() . '/src/blocks/events/editor.css',
        array(),
        '1.0.0'
    );

    register_block_type('luftdaten/events', array(
        'editor_script' => 'luftdaten-events-block',
        'editor_style' => 'luftdaten-events-block-editor',
        'render_callback' => 'luftdaten_render_events_block',
        'attributes' => array(
            'numberOfPosts' => array(
                'type' => 'number',
                'default' => 3,
            ),
            'title' => array(
                'type' => 'string',
                'default' => __('Nächste Veranstaltungen', 'luftdaten'),
            ),
        ),
    ));
}
add_action('init', 'luftdaten_register_events_block');

/**
 * Render the Events block
 */
function luftdaten_render_events_block($attributes) {
    $number_of_posts = isset($attributes['numberOfPosts']) ? intval($attributes['numberOfPosts']) : 3;
    $title = isset($attributes['title']) ? $attributes['title'] : __('Nächste Veranstaltungen', 'luftdaten');

    // Query upcoming events
    $args = array(
        'post_type' => 'event',
        'posts_per_page' => $number_of_posts,
        'post_status' => 'publish',
        'meta_key' => '_event_date',
        'orderby' => 'meta_value',
        'order' => 'ASC',
        'meta_query' => array(
            array(
                'key' => '_event_date',
                'value' => date('Y-m-d'),
                'compare' => '>=',
                'type' => 'DATE',
            ),
        ),
    );

    $events_query = new WP_Query($args);

    if (!$events_query->have_posts()) {
        return '<p>' . esc_html__('No upcoming events found.', 'luftdaten') . '</p>';
    }

    ob_start();
    ?>
    <section class="events-section" aria-label="<?php echo esc_attr($title); ?>">
        <h3><?php echo esc_html($title); ?></h3>
        <div class="events-list" id="eventsList">
            <?php
            while ($events_query->have_posts()) {
                $events_query->the_post();
                $event_date = get_post_meta(get_the_ID(), '_event_date', true);
                $event_time = get_post_meta(get_the_ID(), '_event_time', true);
                $event_location = get_post_meta(get_the_ID(), '_event_location', true);

                // Format date
                $date_obj = $event_date ? date_create($event_date) : false;
                $day = $date_obj ? $date_obj->format('d') : '';
                $month = $date_obj ? $date_obj->format('M') : '';
                $year = $date_obj ? $date_obj->format('Y') : '';

                // German month names
                $months_de = array(
                    'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mär', 'Apr' => 'Apr',
                    'May' => 'Mai', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Aug',
                    'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Dez',
                );
                $month_de = isset($months_de[$month]) ? $months_de[$month] : $month;
                ?>
                <div class="event-card">
                    <div class="event-date">
                        <div class="event-day"><?php echo esc_html($day); ?></div>
                        <div class="event-month"><?php echo esc_html($month_de); ?></div>
                        <div class="event-year"><?php echo esc_html($year); ?></div>
                    </div>
                    <div class="event-content">
                        <h4 class="event-title"><?php the_title(); ?></h4>
                        <div class="event-meta">
                            <?php if ($event_location) : ?>
                                <span class="event-location">📍 <?php echo esc_html($event_location); ?></span>
                            <?php endif; ?>
                            <?php if ($event_time) : ?>
                                <span class="event-time">🕐 <?php echo esc_html($event_time); ?></span>
                            <?php endif; ?>
                        </div>
                        <?php if (has_excerpt()) : ?>
                            <p class="event-description"><?php the_excerpt(); ?></p>
                        <?php elseif (get_the_content()) : ?>
                            <p class="event-description"><?php echo wp_trim_words(get_the_content(), 20); ?></p>
                        <?php endif; ?>
                        <a href="<?php the_permalink(); ?>" class="event-link"><?php echo esc_html__('Mehr erfahren →', 'luftdaten'); ?></a>
                    </div>
                </div>
                <?php
            }
            wp_reset_postdata();
            ?>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

