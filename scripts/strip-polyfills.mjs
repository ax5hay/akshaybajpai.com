import fs from 'fs';
import path from 'path';

/**
 * Next emits a 112 KB polyfill bundle for browsers without module support
 * and marks it `nomodule`. Modern browsers never run it, but several still
 * fetch it, and nothing in this set needs it: it is served to browsers that
 * cannot show the site anyway. The tag is removed from every exported page.
 */
const OUT = path.join(process.cwd(), 'out');
let pages = 0;
let hits = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) {
      pages += 1;
      const html = fs.readFileSync(file, 'utf8');
      const stripped = html.replace(/<script src="[^"]*\/polyfills-[^"]*\.js" noModule(?:="")?><\/script>/g, '');
      if (stripped !== html) {
        hits += 1;
        fs.writeFileSync(file, stripped);
      }
    }
  }
}

walk(OUT);
for (const f of fs.readdirSync(path.join(OUT, '_next/static/chunks'))) {
  if (f.startsWith('polyfills-')) fs.unlinkSync(path.join(OUT, '_next/static/chunks', f));
}
console.log(`Stripped the polyfill script from ${hits} of ${pages} pages`);
