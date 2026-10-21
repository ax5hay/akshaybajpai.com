import { rosette } from '@/lib/card-art';

/**
 * The engraving on the calling card, issued at build time as a file so the
 * card can use it as a mask: once in ink, once again in foil.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(rosette(), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
}
