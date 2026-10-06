import { PlateShell } from '@/components/plate/PlateShell';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import { SetPlateMeta } from '@/components/sheet/PlateMetaProvider';
import { Schematic } from '@/components/figures/Schematic';
import { SCHEMATICS } from '@/components/figures/schematics';
import { PlateFigure } from '@/components/figures/PlateFigure';
import { PrintButton } from '@/components/kit/PrintButton';
import { getCollection, estimateReadingTime, type WorkFrontmatter } from '@/lib/content';
import { buildSheetIndex } from '@/lib/sheet-index';
import { detailSheetNumber, getPlateByHref, type Discipline, type SeriesName } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';
import { SITE_URL, SOCIAL } from '@/lib/constants';
import AboutPage from '@/app/about/page';
import ResearchPage from '@/app/research/page';
import ArchitecturePage from '@/app/architecture/page';
import styles from './set.module.css';

export const metadata = buildMetadata({
  title: 'The complete set · Akshay Bajpai',
  description: 'Every sheet of the drawing set in one document, laid out for print.',
  path: '/set/',
  noIndex: true,
});

/**
 * The whole set as one document: a cover, the drawing index, and every sheet
 * in order, each starting a new page. It exists to be printed or saved as a
 * PDF, so it is the one route that is laid out for paper first and the screen
 * second, and it is kept out of the index, the sitemap and the cover's
 * prefetching.
 */
export default async function CompleteSet() {
  const [index, work, essays, blog] = await Promise.all([
    buildSheetIndex(),
    getCollection<WorkFrontmatter>('work'),
    getCollection('essays'),
    getCollection('blog'),
  ]);

  const now = new Date();
  const issued = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const contact = getPlateByHref('/contact/')!;

  const series: Array<{
    name: SeriesName;
    discipline: Discipline;
    label: string;
    entries: typeof blog;
  }> = [
    { name: 'work', discipline: 'W', label: 'Works', entries: work },
    { name: 'essays', discipline: 'E', label: 'Essays', entries: essays },
    { name: 'blog', discipline: 'B', label: 'Field Notes', entries: blog },
  ];

  const groups = [...new Set(index.map((e) => e.group))];

  return (
    <div className={styles.doc}>
      <div className={styles.bar} data-lens-skip>
        <span className={styles.barText}>
          <b>The complete set</b>
          <span>
            {index.length} sheets in one document. Choose “Save as PDF” in the print dialog.
          </span>
        </span>
        <PrintButton className={styles.barButton}>Print or save as PDF</PrintButton>
      </div>

      {/* ---- Cover ------------------------------------------------------- */}
      <section className={styles.cover}>
        <p className={styles.coverKicker}>
          <span>G-000</span> The Architecture of Intelligence
        </p>
        <h1 className={styles.coverName}>Akshay Bajpai</h1>
        <p className={styles.coverRole}>Architect of systems · Builder of intelligence</p>

        <div className={styles.coverFigures} aria-hidden="true">
          {['architecture', 'work', 'about', 'research'].map((id) => (
            <PlateFigure key={id} id={id} />
          ))}
        </div>

        <dl className={styles.coverCells}>
          <div>
            <dt>Document</dt>
            <dd>Drawing set, complete</dd>
          </div>
          <div>
            <dt>Sheets</dt>
            <dd>{index.length}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{issued}</dd>
          </div>
          <div>
            <dt>Drawn</dt>
            <dd>A. Bajpai</dd>
          </div>
          <div>
            <dt>Live at</dt>
            <dd>{SITE_URL.replace('https://', '')}</dd>
          </div>
        </dl>
      </section>

      {/* ---- Drawing index ----------------------------------------------- */}
      <section className={styles.index}>
        <h2 className={styles.indexTitle}>Drawing index</h2>
        {groups.map((group) => (
          <div key={group} className={styles.indexGroup}>
            <h3>{group}</h3>
            <ol>
              {index
                .filter((e) => e.group === group)
                .map((e) => (
                  <li key={e.href}>
                    <span className={styles.indexSheet}>{e.sheet}</span>
                    <span className={styles.indexName}>{e.title}</span>
                    <span className={styles.indexIssued}>{e.issued ?? ''}</span>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </section>

      {/* ---- Section sheets, as they stand on the site -------------------- */}
      <AboutPage />
      <ResearchPage />
      <ArchitecturePage />

      {/* ---- Detail sheets ------------------------------------------------- */}
      {series.map(({ name, discipline, label, entries }) =>
        entries.map((entry, i) => {
          const fm = entry.frontmatter as WorkFrontmatter;
          return (
            <ArticlePlate
              key={`${name}/${entry.slug}`}
              compact
              sheet={detailSheetNumber(name, i)}
              title={fm.title}
              description={fm.description}
              discipline={discipline}
              date={fm.pubDate}
              html={entry.html}
              source={entry.content}
              readingTime={estimateReadingTime(entry.content)}
              seriesHref={`/${name}/`}
              seriesLabel={label}
              client={fm.client}
              stack={fm.stack}
              metrics={fm.metrics}
              figure={
                name === 'work' && SCHEMATICS[entry.slug] ? (
                  <Schematic spec={SCHEMATICS[entry.slug]} />
                ) : undefined
              }
            />
          );
        })
      )}

      {/* ---- Correspondence, as an address and not a form ------------------ */}
      <PlateShell
        sheet={contact.sheet}
        title={contact.title}
        subtitle={contact.subtitle}
        discipline={contact.discipline}
        scale={contact.scale}
        revision={contact.revision}
        figure={contact.id}
        lead={<p>Let&apos;s build something that matters.</p>}
      >
        <dl className={styles.lines}>
          <div>
            <dt>Email</dt>
            <dd>{SOCIAL.email}</dd>
          </div>
          <div>
            <dt>LinkedIn</dt>
            <dd>linkedin.com/in/ax5hay</dd>
          </div>
          <div>
            <dt>GitHub</dt>
            <dd>github.com/ax5hay</dd>
          </div>
          <div>
            <dt>Write</dt>
            <dd>{SITE_URL.replace('https://', '')}/contact/</dd>
          </div>
        </dl>
      </PlateShell>

      {/* Rendered last, so of all the sheets above it is this one the title
          block and the rail report. */}
      <SetPlateMeta
        sheet="G-900"
        title="The Complete Set"
        subtitle="Every sheet in one document, laid out for print"
        discipline="G"
        scale="NTS"
        revision="D"
      />
    </div>
  );
}
