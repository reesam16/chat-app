import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        © {currentYear} Messaging App
      </p>

      <nav className={styles.footerLinks} aria-label="Footer navigation">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/help">Help</a>
      </nav>
    </footer>
  );
}
