import { buildMetadata } from '@/lib/metadata';
import { HomePage } from '@/components/HomePage';

export const metadata = buildMetadata({
  title: 'Akshay Bajpai — Architect of Systems, Builder of Intelligence',
  description:
    'The Architecture of Intelligence. A living, explorable neural archive. AI infrastructure, systems thinking, performance engineering.',
  path: '/',
});

export default function Page() {
  return <HomePage />;
}
