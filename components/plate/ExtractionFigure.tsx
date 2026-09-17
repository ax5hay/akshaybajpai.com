import { ComparisonSlider } from '@/components/kit/ComparisonSlider';
import styles from './ExtractionFigure.module.css';

const Before = (
  <div className={styles.pane} data-state="before">
    <span className={styles.paneHead}>Unstructured EHR · as received</span>
    Patient John D. 45y male arrived 09:30 complaining of sharp chest pain radiating to left arm.
    BP is 145/90, HR 98. Meds: lisinopril 10mg daily. No known allergies. Doctor notes slight
    diaphoresis. Sent for stat ECG and troponin levels.
    <span className={styles.trace}>
      … parsing string
      <br />
      … regex failed
      <br />
      … layout parser confidence: 12%
    </span>
  </div>
);

/** Confidence per extracted field, so the right half of the pane carries
    content at any divider position rather than reading as empty stock. */
const FIELDS: [string, string][] = [
  ['patient_age', '1.00'],
  ['patient_gender', '0.99'],
  ['symptoms', '0.97'],
  ['vitals', '0.99'],
  ['medications', '0.98'],
  ['orders', '0.98'],
];

const After = (
  <div className={styles.pane} data-state="after">
    <span className={styles.paneHead}>Extracted intelligence · JSON</span>
    <div className={styles.afterGrid}>
    <pre className={styles.json}>
      <span className={styles.punct}>{'{'}</span>
      {'\n  '}
      <span className={styles.key}>&quot;patient_age&quot;</span>
      <span className={styles.punct}>: </span>
      <span className={styles.number}>45</span>
      <span className={styles.punct}>,</span>
      {'\n  '}
      <span className={styles.key}>&quot;patient_gender&quot;</span>
      <span className={styles.punct}>: </span>
      <span className={styles.string}>&quot;M&quot;</span>
      <span className={styles.punct}>,</span>
      {'\n  '}
      <span className={styles.key}>&quot;symptoms&quot;</span>
      <span className={styles.punct}>: [</span>
      <span className={styles.string}>&quot;chest pain&quot;</span>
      <span className={styles.punct}>, </span>
      <span className={styles.string}>&quot;diaphoresis&quot;</span>
      <span className={styles.punct}>],</span>
      {'\n  '}
      <span className={styles.key}>&quot;vitals&quot;</span>
      <span className={styles.punct}>: {'{'}</span>
      {'\n    '}
      <span className={styles.key}>&quot;bp&quot;</span>
      <span className={styles.punct}>: </span>
      <span className={styles.string}>&quot;145/90&quot;</span>
      <span className={styles.punct}>,</span>
      {'\n    '}
      <span className={styles.key}>&quot;hr&quot;</span>
      <span className={styles.punct}>: </span>
      <span className={styles.number}>98</span>
      {'\n  '}
      <span className={styles.punct}>{'}'},</span>
      {'\n  '}
      <span className={styles.key}>&quot;medications&quot;</span>
      <span className={styles.punct}>: [</span>
      <span className={styles.string}>&quot;lisinopril 10mg&quot;</span>
      <span className={styles.punct}>],</span>
      {'\n  '}
      <span className={styles.key}>&quot;orders&quot;</span>
      <span className={styles.punct}>: [</span>
      <span className={styles.string}>&quot;ECG&quot;</span>
      <span className={styles.punct}>, </span>
      <span className={styles.string}>&quot;troponin&quot;</span>
      <span className={styles.punct}>],</span>
      {'\n  '}
      <span className={styles.key}>&quot;confidence_score&quot;</span>
      <span className={styles.punct}>: </span>
      <span className={styles.number}>0.98</span>
      {'\n'}
      <span className={styles.punct}>{'}'}</span>
    </pre>
      <dl className={styles.schedule}>
        <div className={styles.scheduleHead}>
          <dt>Field</dt>
          <dd>Conf.</dd>
        </div>
        {FIELDS.map(([field, confidence]) => (
          <div key={field} className={styles.scheduleRow}>
            <dt>{field}</dt>
            <dd>{confidence}</dd>
          </div>
        ))}
      </dl>
    </div>
    <span className={styles.trace} data-state="after">
      … schema validated
      <br />
      … 6 of 6 fields resolved
      <br />
      … layout parser confidence: 98%
    </span>
  </div>
);

/** Section cut through a clinical record, before and after extraction. */
export function ExtractionFigure() {
  return (
    <ComparisonSlider
      before={Before}
      after={After}
      beforeLabel="As received"
      afterLabel="As extracted"
      figure="Fig. 1"
      caption="Drag the divider. The same clinical note, before and after the extraction pipeline — the point of the architecture is that the right-hand state is traceable back to the left."
    />
  );
}
