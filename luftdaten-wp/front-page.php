<?php
/**
 * Template Name: Front Page
 * The template for displaying the homepage
 *
 * @package Luftdaten
 */

get_header();
?>

  <div class="wrap">
    <!--  
    <div class="dashboard-header">
      <div class="title">
        <h1><?php echo esc_html__('Wir machen Klimawandelanpassung messbar', 'luftdaten'); ?></h1>
        <div class="sub">
        </div>
      </div>
      <div class="meta">
        <div id="lastUpdated"><?php echo esc_html__('Datenstand:', 'luftdaten'); ?> —</div>
      </div>
    
    </div>
    -->

    <?php
    // Display page content if a static page is set as front page
    $page_content_displayed = false;
    if (have_posts()) {
        while (have_posts()) {
            the_post();
            $page_content = get_the_content();
            if (!empty(trim($page_content))) {
                $page_content_displayed = true;
                ?>
                  <?php the_content(); ?>
                <?php
            }
        }
        wp_reset_postdata();
    }
    ?>
    
  </div> 

<?php
get_footer();

