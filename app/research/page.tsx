import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Research · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Published medical AI research, Master\'s thesis on dementia classification, and ongoing work in robust AI infrastructure.',
  path: '/research/',
});

export default function ResearchPage() {
  return (
    <PageShell>
      <ContentPage section="research">
        <PageHero
          section="research"
          title="Research"
          lead="Published work and experimental directions."
        />
        <ProseContent section="research">
          <p>
            My formal training is in intelligent systems and medical AI. I completed a Master of Science in
            Artificial Intelligence &amp; Intelligent Systems at Lviv Polytechnic National University (2021–2023)
            with a CGPA of 9.8/10 and distinction. Before that, a B.Tech in Computer Science &amp; Engineering
            from Rajiv Gandhi Prodyogiki Vishwavidyalaya, Bhopal (2017–2021), with honours.
          </p>
          <p>
            <strong>Peer-reviewed publication.</strong> I am lead author on Chapter 17 — machine learning approaches
            to medical diagnosis — in <em>ML for Medical Diagnosis in Data-Centric Business and Application</em>,
            3rd edition (Springer, 2024, ISBN 978-3-031-60815-5). The chapter situates diagnostic models inside
            data-centric business constraints: label quality, deployment accountability, and the gap between
            benchmark accuracy and clinical utility.
          </p>
          <p>
            <strong>Undergraduate research.</strong> At IIT Gandhinagar I authored a comparative study on
            Alzheimer&apos;s disease diagnosis using machine learning — the methodological foundation for my later{' '}
            <Link href="/work/alzheimers-ml-thesis-research/">Master&apos;s thesis on OASIS biomarkers</Link>, where
            nine models were benchmarked with explicit preprocessing choices and recall-weighted evaluation.
          </p>
          <p>
            Production work since then — insurance document intelligence, EHR variable extraction, multimodal
            diagnostic imaging, programme KPI engines — extends the same principle: rigor in data, honest metrics,
            and systems that clinicians and operators can override. Deeper build narratives live under{' '}
            <Link href="/work/">Work</Link>; opinion and infrastructure philosophy under{' '}
            <Link href="/blog/">Blog</Link> and <Link href="/essays/">Essays</Link>.
          </p>
          <p>
            Current research interests include governed agentic retrieval, schema-grounded text-to-SQL, minimal-
            dependency edge deployments, and evaluation pipelines that survive executive readouts — the same
            problems I ship against in forward-deployed engagements.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
