/**
 * Tell the engines that share IndexNow (Bing, Yandex, Naver, Seznam, and
 * through Bing's index DuckDuckGo and the Copilot/ChatGPT search layers) that
 * the set was reissued. Runs after `wrangler deploy`. Google does not take
 * IndexNow; it reads the sitemap.
 *
 * The key is public by design: IndexNow proves it by fetching /<key>.txt, so
 * the file ships in public/. Every sheet in the built sitemap is submitted.
 * This never fails the deploy; a missed ping costs a crawl, not the site.
 */
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'www.akshaybajpai.com';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const keyFile = fs.readdirSync(path.join(ROOT, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.log('IndexNow: no key file in public/, skipped');
  process.exit(0);
}
const key = keyFile.replace(/\.txt$/, '');

const sitemap = fs.readFileSync(path.join(ROOT, 'out', 'sitemap.xml'), 'utf-8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

try {
  // The edge can take a moment to serve the new key file after a deploy.
  for (let i = 0; i < 12; i++) {
    const live = await fetch(`https://${HOST}/${key}.txt`, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : ''), () => '');
    if (live.trim() === key) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
  });
  if (res.status === 200 || res.status === 202) console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${res.status})`);
  else console.warn(`IndexNow answered HTTP ${res.status}: ${await res.text()}`);
} catch (err) {
  console.warn(`IndexNow not reached: ${err.message}`);
}
