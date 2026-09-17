import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { Stamp } from '@/components/kit/Controls';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <PlateShell
      sheet="X-999"
      title="Sheet Not Issued"
      subtitle="This drawing is not part of the current set"
      discipline="X"
      scale="—"
      revision="—"
      refs={['G-000', 'W-400', 'E-600']}
      lead={
        <p>
          The reference you followed points at a sheet that was never issued, or was withdrawn in
          a later revision. The drawing index will have what you were looking for.
        </p>
      }
      record={[{ k: 'status', v: 'withdrawn / never issued' }]}
    >
      <div className={styles.void}>
        <Stamp tone="void">Not in contract</Stamp>
      </div>

      <div className="prose">
        <p>
          Press <kbd className={styles.kbd}>/</kbd> to open the index, or return to the{' '}
          <Link href="/">key plan</Link> and read the set from the general arrangement.
        </p>
      </div>
    </PlateShell>
  );
}
