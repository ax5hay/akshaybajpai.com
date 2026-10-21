import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { vCard } from '@/lib/card';

/**
 * The contact as a file. Issued at build time like every other sheet, so a
 * phone that follows "Save contact" from the calling card is handed a vCard
 * and opens its address book on it. The mark on the printed card goes in as
 * the contact's picture, from the small copy in /public.
 */
export const dynamic = 'force-static';

export function GET() {
  const photo = readFileSync(join(process.cwd(), 'public', 'card-mark.png')).toString('base64');
  return new Response(vCard({ photo }), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="akshay-bajpai.vcf"',
    },
  });
}
