import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { buildMetadata } from '@/lib/metadata';
import styles from './not-found.module.css';

export const metadata = buildMetadata({
  title: '404 — Not Found',
  description: "The page you're looking for doesn't exist.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <PageShell hideHeader hideFooter>
      <ContentPage section="architecture">
        <div className={styles.wrap}>
          <PageHero section="architecture" title="404" showOrb={false} showBack={false} centered lead="This path doesn't exist in the neural map." />
          <Link href="/" className={styles.home}>
            Return to neural map
          </Link>
        </div>
      </ContentPage>
    </PageShell>
  );
}
