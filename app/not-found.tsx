import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { Stamp } from '@/components/kit/Controls';
import { NearestSheets } from '@/components/plate/NearestSheets';
import { buildSheetIndex } from '@/lib/sheet-index';
import { Levels, Voice } from '@/components/system/Voice';
import { V } from '@/lib/voice';
import styles from './not-found.module.css';

export default async function NotFound() {
  const entries = await buildSheetIndex();

  return (
    <PlateShell
      sheet="X-999"
      title="Sheet Not Issued"
      subtitle="This drawing is not part of the current set"
      discipline="X"
      scale="NTS"
      revision="X"
      refs={['G-000', 'W-400', 'E-600']}
      voice={{ title: V.notFound, subtitle: V.notFoundSub }}
      lead={
        <p>
          <Levels
            a="The link you followed points at a page that does not exist, or has been removed. Search will find what you were looking for."
            b="The reference you followed points at a sheet that was never issued, or was withdrawn in a later revision. The drawing index will have what you were looking for."
            c="No route was exported at this path. It may have been renamed or removed; the index lists every route in the build."
          />
        </p>
      }
      record={[{ k: 'status', v: 'withdrawn / never issued' }]}
    >
      <div className={styles.void}>
        <Stamp tone="void">
          <Voice k="notInContract" />
        </Stamp>
      </div>

      {/* Read by PlateMetaProvider before hydration; see the note there. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.unissued=''" }} />

      <NearestSheets entries={entries} />

      <div className="prose">
        <p>
          Press <kbd className={styles.kbd}>/</kbd> to{' '}
          <Levels a="search the site, or go back to the" b="open the index, or return to the" c="open the index, or return to the" />{' '}
          <Link href="/">
            <Levels a="home page" b="key plan" c="route map" />
          </Link>
          <Levels a="." b=" and read the set from the general arrangement." c="." />
        </p>
      </div>
    </PlateShell>
  );
}
