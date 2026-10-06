import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { RecordSchedule } from '@/components/plate/RecordSchedule';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/research/')!;

const META = {
  title: 'Research · Medical AI, thesis and publication',
  description:
    "Published medical AI research, Master's thesis on dementia classification, and ongoing work in robust AI infrastructure.",
  path: '/research/',
  card: 'research',
  keywords: ['Akshay Bajpai research', 'machine learning for medical diagnosis', 'Springer chapter', 'Alzheimer\'s classification', 'MSc thesis AI'],
};

export const metadata = buildMetadata(META);

export default function ResearchPage() {
  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      refs={PLATE.refs}
      jsonLd={[
        webPage({
          path: META.path,
          name: META.title,
          description: META.description,
          type: 'WebPage',
          card: META.card,
          extra: {
          mainEntity: {
            '@type': 'Chapter',
            name: 'Chapter 17: Machine learning approaches to medical diagnosis',
            author: { '@id': PERSON_ID },
            datePublished: '2024',
            isPartOf: {
              '@type': 'Book',
              name: 'ML for Medical Diagnosis in Data-Centric Business and Application',
              bookEdition: '3rd',
              isbn: '978-3-031-60815-5',
              publisher: { '@type': 'Organization', name: 'Springer' },
            },
          },
        },
        }),
        breadcrumbs([{ name: 'R-301 Research', path: META.path }]),
      ]}
      figure={PLATE.id}
      lead={<p>Published work and experimental directions.</p>}
      facts={[
        { k: 'Degree', v: 'MSc AI, 9.8/10' },
        { k: 'Publication', v: 'Springer 2024' },
      ]}
      record={[
        { k: 'msc', v: 'Lviv Polytechnic National University, 2021–2023, distinction' },
        { k: 'btech', v: 'RGPV Bhopal, 2017–2021, honours' },
        { k: 'isbn', v: '978-3-031-60815-5' },
      ]}
    >
      <div className="prose prose-lead">
        <p>
          My formal training is in intelligent systems and medical AI. I completed a Master of
          Science in Artificial Intelligence &amp; Intelligent Systems at Lviv Polytechnic National
          University (2021–2023) with a CGPA of 9.8/10 and distinction. Before that, a B.Tech in
          Computer Science &amp; Engineering from Rajiv Gandhi Prodyogiki Vishwavidyalaya, Bhopal
          (2017–2021), with honours.
        </p>
      </div>

      <RecordSchedule
        title="Schedule of record"
        rows={[
          {
            when: '2024',
            kind: 'Publication · lead author',
            title: 'Chapter 17: machine learning approaches to medical diagnosis',
            detail: (
              <>
                In <em>ML for Medical Diagnosis in Data-Centric Business and Application</em>, 3rd
                edition. Springer, ISBN 978-3-031-60815-5.
              </>
            ),
          },
          {
            when: '2021–2023',
            kind: 'Degree',
            title: 'MSc, Artificial Intelligence & Intelligent Systems',
            detail: 'Lviv Polytechnic National University. Awarded with distinction.',
            mark: '9.8/10',
          },
          {
            when: '2021–2023',
            kind: "Master's thesis",
            title: (
              <Link href="/work/alzheimers-ml-thesis-research/">
                Alzheimer&apos;s classification on OASIS biomarkers
              </Link>
            ),
            detail:
              'Nine models benchmarked with explicit preprocessing choices and recall-weighted evaluation.',
            mark: '9 models',
          },
          {
            when: 'Undergraduate',
            kind: 'Research study',
            title: "Comparative study of Alzheimer's diagnosis using machine learning",
            detail: 'Authored at IIT Gandhinagar. The methodological foundation for the thesis.',
          },
          {
            when: '2017–2021',
            kind: 'Degree',
            title: 'B.Tech, Computer Science & Engineering',
            detail: 'Rajiv Gandhi Prodyogiki Vishwavidyalaya, Bhopal. Awarded with honours.',
          },
        ]}
      />

      <div className="prose">
        <p>
          <strong>Peer-reviewed publication.</strong> I am lead author on Chapter 17, machine
          learning approaches to medical diagnosis, in{' '}
          <em>ML for Medical Diagnosis in Data-Centric Business and Application</em>, 3rd edition
          (Springer, 2024, ISBN 978-3-031-60815-5). The chapter situates diagnostic models inside
          data-centric business constraints: label quality, deployment accountability, and the gap
          between benchmark accuracy and clinical utility.
        </p>
        <p>
          <strong>Undergraduate research.</strong> At IIT Gandhinagar I authored a comparative study
          on Alzheimer&apos;s disease diagnosis using machine learning, the methodological
          foundation for my later{' '}
          <Link href="/work/alzheimers-ml-thesis-research/">
            Master&apos;s thesis on OASIS biomarkers
          </Link>
          , where nine models were benchmarked with explicit preprocessing choices and
          recall-weighted evaluation.
        </p>
        <p>
          Production work since then (insurance document intelligence, EHR variable extraction,
          multimodal diagnostic imaging, programme KPI engines) extends the same principle: rigor
          in data, honest metrics, and systems that clinicians and operators can override. Deeper
          build narratives live under <Link href="/work/">Work</Link>; opinion and infrastructure
          philosophy under <Link href="/blog/">Blog</Link> and <Link href="/essays/">Essays</Link>.
        </p>
        <p>
          Current research interests include governed agentic retrieval, schema-grounded
          text-to-SQL, minimal-dependency edge deployments, and evaluation pipelines that survive
          executive readouts, the same problems I ship against in forward-deployed engagements.
        </p>
      </div>
    </PlateShell>
  );
}
