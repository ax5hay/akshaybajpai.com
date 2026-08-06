import styles from './NeuralVeins.module.css';

/** Static SVG neural vein pattern — echoes the homepage constellation */
export function NeuralVeins() {
  return (
    <svg className={styles.veins} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="vein-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--section-accent, var(--accent))" stopOpacity="0" />
          <stop offset="40%" stopColor="var(--section-accent, var(--accent))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--section-accent, var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={styles.path} d="M-40 420 C 200 380, 320 520, 520 440 S 880 320, 1100 480 S 1380 560, 1520 400" />
      <path className={`${styles.path} ${styles.pathDelay}`} d="M-60 620 C 180 580, 400 720, 640 600 S 960 480, 1200 640 S 1420 700, 1540 520" />
      <path className={`${styles.path} ${styles.pathThin}`} d="M720 -40 C 680 200, 820 340, 760 520 S 640 780, 720 960" />
      <path className={`${styles.path} ${styles.pathDelay} ${styles.pathThin}`} d="M360 900 C 420 680, 280 540, 400 360 S 620 120, 480 -40" />
      <circle className={styles.node} cx="520" cy="440" r="3" />
      <circle className={styles.node} cx="1100" cy="480" r="2.5" />
      <circle className={styles.node} cx="760" cy="520" r="2" />
    </svg>
  );
}
