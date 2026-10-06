import { MODE_STORAGE_KEY } from '@/lib/mode';

/**
 * Resolves the drawing mode before first paint. Without this the sheet renders
 * on paper and then re-inks to blueprint, which is the one flash a site about
 * drawing sets cannot afford.
 *
 * A `?mode=` parameter wins over the stored preference so a specific view can
 * be linked to, and is then persisted like any other choice.
 *
 * It also stamps `data-js` on the root. The scroll reveals start from
 * invisible, and they key off that flag so a reader whose script never
 * arrives still gets the whole sheet.
 *
 * It retries stylesheets that fail. Every deploy renames the hashed CSS, and
 * for a short while afterwards a CDN edge can serve the new HTML while still
 * answering 404 for the new files, then cache that 404 for ten minutes. A
 * reader in that window got the whole set unstyled. A failed stylesheet is
 * now asked for again under a fresh query string, which is a different cache
 * key, up to four times with a growing pause. The failed link is left in
 * place, since React owns it; the retry is inserted after it.
 *
 * Two routes in, because an inline script waits for the stylesheets ahead of
 * it: those have already failed, silently, by the time this runs, so they are
 * checked directly. Anything later is caught by its error event.
 *
 * And it decides whether the cover sheet plays: once per visit, and never
 * for a reader who asks for reduced motion. When it will play, `data-cover`
 * holds the set's own entrance animations until the cover reports the set
 * issued; the timer here releases them regardless, so a cover that never
 * hydrates cannot leave the page waiting behind it.
 */
const script = `(function(){
document.documentElement.dataset.js='';
document.addEventListener('visibilitychange',function(){if(document.hidden){document.documentElement.dataset.hidden=''}else{delete document.documentElement.dataset.hidden}});
function again(l){
var n=+(l.dataset.retry||0);if(n>=4)return;
setTimeout(function(){var c=l.cloneNode();c.dataset.retry=n+1;c.href=l.href.split('?')[0]+'?retry='+Date.now();l.parentNode.insertBefore(c,l.nextSibling)},n?500*n:0)
}
addEventListener('error',function(e){var l=e.target;if(l&&l.tagName==='LINK'&&l.rel==='stylesheet')again(l)},true);
var me=document.currentScript,ls=document.querySelectorAll('link[rel=stylesheet]');
for(var i=0;i<ls.length;i++){var l=ls[i],ok=0;
if(!(l.compareDocumentPosition(me)&4))continue;
try{ok=l.sheet&&l.sheet.cssRules.length}catch(x){ok=1}
if(!ok)again(l)}
try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('plate.booted')){document.documentElement.dataset.preloaded=''}
else{sessionStorage.setItem('plate.booted','1');document.documentElement.dataset.cover='';setTimeout(function(){document.documentElement.dataset.issued=''},22000)}
}catch(e){document.documentElement.dataset.preloaded=''}
try{
var m=new URLSearchParams(location.search).get('mode');
if(m!=='artifact'&&m!=='annotated'&&m!=='raw'){m=localStorage.getItem('${MODE_STORAGE_KEY}')}
else{localStorage.setItem('${MODE_STORAGE_KEY}',m)}
if(m!=='artifact'&&m!=='annotated'&&m!=='raw'){m='artifact'}
document.documentElement.dataset.mode=m
}catch(e){document.documentElement.dataset.mode='artifact'}
})()`.replace(/\n/g, '');

export function ModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
