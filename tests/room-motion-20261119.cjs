'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {ctx, doc, Element} = require('./dom-fixture.cjs').environment();
const root = path.resolve(__dirname, '..');
const motion = {matches:false};
ctx.Element = Element;
ctx.matchMedia = () => motion;
ctx.MutationObserver = class {observe() {}};
Element.prototype.animate = function () { return this.track = {}; };
for (const file of ['method-catalog','motion-system']) {
  vm.runInContext(fs.readFileSync(path.join(root,'JS',file+'.js'),'utf8'),ctx);
}
let previous;
for (const [route,,,label] of ctx.JYMethodCatalog) {
  const door = doc.createElement('button');
  door.setAttribute('data-tool',route);
  door.textContent = label;
  ctx.JYMotion.bloom(door);
  const portal = doc.querySelector('.jy-portal');
  assert.ok(portal,route);
  if (previous) assert.equal(previous.isConnected,false,'replace prior scene');
  assert.equal(portal.querySelector('.jy-room-icon').getAttribute('data-art'),route);
  assert.ok(portal.querySelector('.jy-marks').children.length >= 2);
  const art = portal.style['--room-art'].match(/url\("(.+)"\)/)[1];
  assert.ok(fs.existsSync(path.join(root,art)),art);
  previous = portal;
}
previous.track.onfinish();
assert.equal(doc.querySelector('.jy-portal'),null);
motion.matches = true;
ctx.JYMotion.bloom(doc.createElement('button'));
assert.equal(doc.querySelector('.jy-portal'),null);
console.log('PASS all catalogue entrances, room art files, rapid navigation, cleanup and reduced motion');
