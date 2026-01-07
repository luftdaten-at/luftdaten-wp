<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

  <!-- Top Navigation Header -->
  <header class="top-header" role="banner">
    <div class="nav-container">
      <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-logo" aria-label="<?php esc_attr_e('Luftdaten.at Startseite', 'luftdaten'); ?>">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/img/logo.png'); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?>" />
      </a>
      <?php
      wp_nav_menu(array(
          'theme_location' => 'primary',
          'container' => 'nav',
          'container_class' => 'nav-menu',
          'container_id' => 'mainNav',
          'menu_class' => '',
          'items_wrap' => '<ul>%3$s</ul>',
          'fallback_cb' => 'luftdaten_default_menu',
      ));
      ?>
      <button class="menu-toggle" id="menuToggle" aria-label="<?php esc_attr_e('Menü öffnen/schließen', 'luftdaten'); ?>" aria-expanded="false" aria-controls="mainNav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

