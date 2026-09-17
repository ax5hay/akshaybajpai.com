'use client';

import { useState } from 'react';
import { Button, Stamp, Switch } from './Controls';
import { useToast } from '@/components/system/ToastProvider';
import { useMode } from '@/components/system/ModeProvider';
import { MODE_INFO } from '@/lib/mode';
import styles from './ControlSchedule.module.css';

/**
 * The drawing conventions, as working controls. Every switch here changes the
 * sheet you are reading rather than demonstrating against a mock — the grid
 * and grain toggles drive real attributes on <html> that globals.css reads.
 */
export function ControlSchedule() {
  const { toast } = useToast();
  const { mode, cycleMode } = useMode();
  const [revision, setRevision] = useState(0);

  const setFlag = (flag: 'grid' | 'grain', on: boolean) => {
    const root = document.documentElement;
    if (on) delete root.dataset[flag === 'grid' ? 'grid' : 'grain'];
    else root.dataset[flag === 'grid' ? 'grid' : 'grain'] = 'off';
  };

  return (
    <section className={styles.panel} aria-label="Control schedule">
      <header className={styles.head}>
        <span className={styles.headTitle}>Control schedule</span>
        <Stamp tone={revision > 0 ? 'approved' : 'draft'}>
          {revision > 0 ? `Rev ${revision}` : 'Draft'}
        </Stamp>
      </header>

      <p className={styles.note}>
        These are the real controls for this sheet, not a specimen panel. Everything below is
        wired to the drawing you are looking at.
      </p>

      <div className={styles.switches}>
        <Switch
          label="Construction grid"
          hint="The graph ruling behind the sheet"
          defaultOn
          onChange={(on) => setFlag('grid', on)}
        />
        <Switch
          label="Paper grain"
          hint="Fibre texture over the whole surface"
          defaultOn
          onChange={(on) => setFlag('grain', on)}
        />
      </div>

      <div className={styles.buttons}>
        <Button
          variant="solid"
          onClick={() => {
            setRevision((r) => r + 1);
            toast({
              kind: `Revision ${revision + 1} issued`,
              message: 'The sheet has been stamped and re-dated.',
              detail: 'Revision clouds would be added in a real set',
              tone: 'issue',
            });
          }}
        >
          Issue revision
        </Button>

        <Button onClick={cycleMode}>Next mode · {MODE_INFO[mode].label}</Button>

        <Button
          variant="ghost"
          onClick={() =>
            toast({
              kind: 'Keyboard',
              message: 'D cycles modes · L deploys the lens · / opens the index',
              detail: 'Every control here has a shortcut',
              tone: 'note',
            })
          }
        >
          Shortcuts
        </Button>
      </div>
    </section>
  );
}
