<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package Luftdaten
 */

get_header();
?>

  <div class="wrap">
    <section class="error-404-section">
      <div class="error-404-body">
        <div class="error-404-content">
          <h1 class="error-404-title">404</h1>
          <h2 class="error-404-heading">
            <?php esc_html_e('Seite nicht gefunden', 'luftdaten'); ?>
          </h2>
          <p class="error-404-description">
            <?php esc_html_e('Die von Ihnen gesuchte Seite existiert leider nicht. Möglicherweise wurde sie verschoben oder gelöscht.', 'luftdaten'); ?>
          </p>
          
          <div class="error-404-actions">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="button button-primary error-404-home-button">
              <?php esc_html_e('Zur Startseite', 'luftdaten'); ?>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>

<?php
get_footer();

