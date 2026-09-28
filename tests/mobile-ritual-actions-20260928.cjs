'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const postcss=require('postcss');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const cssSource=read('CSS/mobile-ritual-actions-20260928.css');
const css=postcss.parse(cssSource,{from:'CSS/mobile-ritual-actions-20260928.css'});
const all=node=>{const out=[];node.walkRules(rule=>out.push(rule));return out;};
const rules=all(css);
const rule=selector=>rules.find(item=>item.selector===selector);
const declarations=item=>Object.fromEntries(item.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));

assert(rule('body.jy-atelier dialog.jr-dialog'),'shared dialog viewport rule exists');
const dialog=declarations(rule('body.jy-atelier dialog.jr-dialog'));
assert.equal(dialog['overflow-y'],'auto','the dialog remains a real scroll container');
assert.match(dialog.height,/100dvh/,'dynamic mobile viewport is supported');
assert.match(dialog['scroll-padding-bottom'],/safe-area-inset-bottom/,'keyboard and device inset scrolling is accounted for');

const dock=declarations(rule('body.jy-atelier dialog.jr-dialog > .jr-action-dock'));
assert.equal(dock.position,'fixed','actions are anchored to the viewport, outside scene/grid clipping');
assert.match(dock.bottom,/safe-area-inset-bottom/,'dock clears the device gesture area');
assert.equal(dock['pointer-events'],'none','the decorative dock surface cannot block scrolling');

const phone=css.nodes.find(node=>node.type==='atrule'&&node.name==='media'&&node.params.includes('max-width: 849px'));
assert(phone,'mobile layout override exists');
const phoneRules=all(phone);
assert(phoneRules.some(item=>item.selector==='body.jy-atelier dialog.jr-dialog[data-story] .jr-shell'),'story rituals get a compact stage track');
assert(phoneRules.some(item=>item.selector==='body.jy-atelier dialog.jr-dialog:not([data-story]) .jr-shell'),'legacy ritual presentation uses the same safe viewport');

const source=read('JS/ritual-ateliers.js');
assert(source.includes('class="jr-action-dock"'),'the common ritual director emits the single action dock');
assert(source.includes('class="jr-next"'),'the primary control stays the original wired button');
assert(source.includes('class="jr-skip"'),'the skip control stays the original wired button');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle','ootk','vedic']){
  const env=fixture();load(env,'ritual-ateliers');const handle=env.ctx.JYRitual.play(kind),dialog=env.doc.querySelector('dialog'),dock=dialog.querySelector('.jr-action-dock');
  assert(dock,kind+' receives the shared action dock');
  assert.equal(dock.parentNode,dialog,kind+' controls cannot be clipped by the scene grid');
  assert.equal(dock.querySelector('.jr-next').parentNode,dock,kind+' keeps its real continue button');
  assert.equal(dock.querySelector('.jr-footer').parentNode,dock,kind+' keeps its real skip and progress controls');
  handle.cancel();
}
const html=read('index.html');
assert(html.includes('CSS/mobile-ritual-actions-20260928.css?v=20260928actiondock1'),'root fix is loaded after the existing competing layout sheets');
assert(html.includes('JS/ritual-ateliers.js?v=20260928actiondock1'),'the shared director cannot be served from the old cache-busted asset URL');
for(const file of ['sw.js','JS/sw.js'])assert.match(read(file),/jy-main-v103/,'fresh service worker cache version: '+file);
assert.equal(read('sw.js'),read('JS/sw.js'),'the source and served service worker stay synchronized');

console.log('mobile-ritual-actions: shared viewport, scroll, safe-area dock, and every ritual entry point verified');
