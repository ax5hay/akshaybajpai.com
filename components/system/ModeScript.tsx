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
 * And it decides whether the cover sheet plays: once per visit. On later
 * loads in the same session it sets `data-preloaded`, which removes the cover
 * and the delay the rest of the entrance was waiting behind it.
 */
const script = `(function(){
document.documentElement.dataset.js='';
try{if(sessionStorage.getItem('plate.booted')){document.documentElement.dataset.preloaded=''}else{sessionStorage.setItem('plate.booted','1')}}catch(e){}
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
