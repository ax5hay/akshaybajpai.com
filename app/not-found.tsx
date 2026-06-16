import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: '404 — Not Found',
  description: "The page you're looking for doesn't exist.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <PageShell hideHeader hideFooter>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-7xl)',
            fontWeight: 400,
            color: 'var(--text-muted)',
            margin: '0 0 var(--space-6)',
            lineHeight: 1,
          }}>404</h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', margin: '0 0 var(--space-8)' }}>
            This path doesn&apos;t exist in the neural map.
          </p>
          <Link href="/" style={{ color: 'var(--shimmer-cyan)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Return home
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
