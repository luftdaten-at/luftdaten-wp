<?php
/**
 * Single Event Template
 *
 * @package Luftdaten
 */

get_header();
?>

<div class="wrap">
    <?php
    while (have_posts()) :
        the_post();
        
        $event_date = get_post_meta(get_the_ID(), '_event_date', true);
        $event_time = get_post_meta(get_the_ID(), '_event_time', true);
        $event_location = get_post_meta(get_the_ID(), '_event_location', true);
        $registration_enabled = get_post_meta(get_the_ID(), '_event_registration_enabled', true);
        
        // Format date
        $date_obj = $event_date ? date_create($event_date) : false;
        $formatted_date = $date_obj ? date_i18n(get_option('date_format'), strtotime($event_date)) : '';
        
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="entry-header">
                <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="event-meta-info">
                <?php if ($formatted_date) : ?>
                    <div class="event-meta-item">
                        <strong><?php echo esc_html__('Date:', 'luftdaten'); ?></strong> <?php echo esc_html($formatted_date); ?>
                    </div>
                <?php endif; ?>
                <?php if ($event_time) : ?>
                    <div class="event-meta-item">
                        <strong><?php echo esc_html__('Time:', 'luftdaten'); ?></strong> <?php echo esc_html($event_time); ?>
                    </div>
                <?php endif; ?>
                <?php if ($event_location) : ?>
                    <div class="event-meta-item">
                        <strong><?php echo esc_html__('Location:', 'luftdaten'); ?></strong> <?php echo esc_html($event_location); ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="entry-content">
                <?php the_content(); ?>
            </div>

            <?php if ($registration_enabled === '1') : ?>
                <div class="event-registration-section">
                    <h2><?php echo esc_html__('Register for this Event', 'luftdaten'); ?></h2>
                    
                    <?php
                    // Display messages
                    if (isset($_GET['registration'])) {
                        if ($_GET['registration'] === 'success') {
                            echo '<div class="registration-message registration-success">';
                            echo esc_html__('Thank you! Your registration was successful.', 'luftdaten');
                            echo '</div>';
                        } elseif ($_GET['registration'] === 'duplicate') {
                            echo '<div class="registration-message registration-error">';
                            echo esc_html__('You are already registered for this event.', 'luftdaten');
                            echo '</div>';
                        }
                    }
                    ?>
                    
                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="event-registration-form">
                        <?php wp_nonce_field('luftdaten_event_registration', 'event_registration_nonce'); ?>
                        <input type="hidden" name="action" value="luftdaten_event_registration">
                        <input type="hidden" name="event_id" value="<?php echo esc_attr(get_the_ID()); ?>">
                        
                        <p>
                            <label for="registration_name"><?php echo esc_html__('Name', 'luftdaten'); ?> <span class="required">*</span></label>
                            <input type="text" id="registration_name" name="registration_name" required class="regular-text" />
                        </p>
                        
                        <p>
                            <label for="registration_email"><?php echo esc_html__('Email', 'luftdaten'); ?> <span class="required">*</span></label>
                            <input type="email" id="registration_email" name="registration_email" required class="regular-text" />
                        </p>
                        
                        <p>
                            <label for="registration_phone"><?php echo esc_html__('Phone', 'luftdaten'); ?></label>
                            <input type="tel" id="registration_phone" name="registration_phone" class="regular-text" />
                        </p>
                        
                        <p>
                            <button type="submit" class="button button-primary"><?php echo esc_html__('Register', 'luftdaten'); ?></button>
                        </p>
                    </form>
                </div>
            <?php endif; ?>
        </article>
        <?php
    endwhile;
    ?>
</div>

<?php
get_footer();

