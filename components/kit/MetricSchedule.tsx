import styles from './MetricSchedule.module.css';

/**
 * Pulls a leading measured value out of a metric string so it can be set
 * large, leaving the rest as its description. Only tokens that actually begin
 * with a figure are pulled, so "E2E pipeline" or "p99-friendly renderer" stay
 * whole rather than being cut at a stray digit.
 */
function split(metric: string): { value: string | null; label: string } {
  const match = metric.match(/^((?:~|<|>|Sub-)?\d[\w%+./-]*)\s+(.+)$/i);
  return match ? { value: match[1], label: match[2] } : { value: null, label: metric };
}

export function MetricSchedule({ metrics }: { metrics?: string[] }) {
  if (!metrics?.length) return null;

  return (
    <section className={styles.schedule} aria-label="Schedule of measured outcomes">
      <header className={styles.head}>
        <span className={styles.headTitle}>Schedule of outcomes</span>
        <span className={styles.headCount}>{metrics.length} items</span>
      </header>

      <ol className={styles.list}>
        {metrics.map((metric, i) => {
          const { value, label } = split(metric);
          return (
            <li key={metric} className={styles.row}>
              <span className={styles.no}>{String(i + 1).padStart(2, '0')}</span>
              {value && <span className={styles.value}>{value}</span>}
              <span className={styles.label} data-full={!value || undefined}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
