import { MODE_STORAGE_KEY } from '@/lib/mode';

/**
 * Resolves the drawing mode before first paint. Without this the sheet renders
 * on paper and then re-inks to blueprint, which is the one flash a site about
 * drawing sets cannot afford.
 *
 * A `?mode=` parameter wins over the stored preference so a specific view can
 * be linked to, and is then persisted like any other choice.
 */
const script = `(function(){
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
