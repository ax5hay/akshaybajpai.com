import { CARD_ART, cardArt } from '@/lib/card-art';

/**
 * The card's artwork as plain images, issued at build time: the engraving in
 * each mode's ink and the foil in three phases. See cardArt in lib/card-art.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return CARD_ART.map((name) => ({ name: `${name}.svg` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const art = cardArt(name.replace(/\.svg$/, ''));
  if (!art) return new Response('Not found', { status: 404 });
  return new Response(art, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
