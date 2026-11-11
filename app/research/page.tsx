import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { RecordSchedule } from '@/components/plate/RecordSchedule';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/research/')!;

const META = {
  title: 'Research · World models, reinforcement learning, publication and thesis',
  description:
    "Akshay Bajpai's research: world models and reinforcement learning now; before that a Springer chapter and an MSc thesis, from a master's degree in artificial intelligence and intelligent systems.",
  path: '/research/',
  card: 'research',
  keywords: ['Akshay Bajpai research', 'world models', 'reinforcement learning', 'JEPA', 'AI researcher', 'MSc Artificial Intelligence', 'machine learning for medical diagnosis', 'Springer chapter', 'Alzheimer\'s classification', 'MSc thesis AI'],
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
      lead={<p>What I am working through now, and the published work under it.</p>}
      facts={[
        { k: 'Current', v: 'World models · RL' },
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
          My training covers artificial intelligence as a whole, and the systems built on it: a
          Master of Science in Artificial Intelligence &amp; Intelligent
          Systems at Lviv Polytechnic National University (2021–2023), with a CGPA of 9.8/10 and
          distinction. The thesis and my early research took one hard problem, dementia
          classification, and worked it properly. Before that, a B.Tech in
          Computer Science &amp; Engineering from Rajiv Gandhi Prodyogiki Vishwavidyalaya, Bhopal
          (2017–2021), with honours.
        </p>
      </div>

      <RecordSchedule
        title="Schedule of record"
        rows={[
          {
            when: 'Now',
            kind: 'Research notes',
            title: (
              <Link href="/blog/world-models-as-issued-2026/">World models, as issued</Link>
            ),
            detail: (
              <>
                What has shipped and what it cost, read from the papers. With{' '}
                <Link href="/blog/reinforcement-learning-after-the-reward-model/">
                  reinforcement learning after the reward model
                </Link>{' '}
                and an essay on{' '}
                <Link href="/essays/the-model-that-refuses-to-draw/">the model that refuses to draw</Link>.
              </>
            ),
          },
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
          <strong>Now.</strong> I am working through world models and reinforcement learning:
          what a model learns when it predicts meaning instead of pixels, and how reasoning models
          are trained once a verifier replaces the judge. I write it up as I go, keep to what the
          papers say, and mark where I am inferring. Nearer the client work: governed agentic
          retrieval, schema-grounded text-to-SQL, and evaluation that survives an executive
          readout.
        </p>
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
          The work since has run wherever the problem was, in healthcare, finance, defence and
          well beyond: language models and agents, computer vision, document AI, forecasting and
          native software. The principle carried
          over intact: rigour in data, honest metrics, and systems that the people running them
          can override. How it
          was built is under <Link href="/work/">Works</Link>; the arguments are in the{' '}
          <Link href="/blog/">field notes</Link> and <Link href="/essays/">essays</Link>.
        </p>
      </div>
    </PlateShell>
  );
}
