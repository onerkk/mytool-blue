'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'CSS/ui-upgrade-20260924.css');
const css = fs.readFileSync(cssPath, 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const lenormand = fs.readFileSync(path.join(root, 'JS/lenormand.js'), 'utf8');
const ast = postcss.parse(css, { from: cssPath });

function rule(selector) {
  let found;
  ast.walkRules(selector, node => { if (!found) found = node; });
  assert(found, `Expected CSS rule: ${selector}`);
  return found;
}
function declaration(node, property) {
  let found;
  node.walkDecls(property, decl => { found = decl; });
  assert(found, `Expected ${property} in ${node.selector || node.params}`);
  return found.value;
}

assert.match(index, /CSS\/ui-upgrade-20260924\.css\?v=20260924atelier1/);
assert(index.indexOf('CSS/ui-upgrade-20260924.css') > index.indexOf('CSS/gua-room.css'), 'upgrade layer must load after all method styles');

const mobileHero = ast.nodes.find(node => node.type === 'atrule' && node.params === '(max-width: 700px)');
assert(mobileHero, 'mobile breakpoint exists');
assert(css.includes('.jy-atelier .jc-home-hero .at-hero-art'), 'hero artwork has a compact mobile height');
assert(css.includes('.jy-atelier .at-tools { gap: 12px 9px; }'), 'narrow phones retain two-column collection cards without overflow');
assert(css.includes('grid-template-columns: repeat(4, minmax(0, 1fr))'), 'desktop tool collection uses four columns');

const fiveCard = rule('.jy-atelier #ln-screen .ln-five-layout');
assert.equal(declaration(fiveCard, 'grid-template-columns'), 'repeat(6, minmax(0, 1fr))');
assert(lenormand.includes('五張線：上排三張，下排兩張'), 'five-card reading geometry stays intact');
const lenormandScroll = rule('.jy-atelier #ln-screen');
assert.equal(declaration(lenormandScroll, 'height'), '100dvh');
assert.equal(declaration(lenormandScroll, 'overflow-y'), 'auto');
assert.equal(declaration(lenormandScroll, 'overflow-x'), 'hidden');

const primary = rule('.jy-atelier :is(.bzx-cast-btn, .ln-draw-btn, .mhx-cast-btn, .zw-in-go, .bzs-primary,\n  .btn-primary, .orc-btn-primary, .bzx-ai-copy-btn, .ln-ai-copy-btn, .mhx-ai-copy-btn,\n  .zw-ai-copy, .orc-ai-copy-btn, .jy-ex-btn, .jr-next)');
assert.equal(declaration(primary, 'animation'), 'none');
const sound = rule('.jy-foley-button, .jy-foley-settings summary');
assert.equal(declaration(sound, 'min-height'), '44px');
assert(css.includes('[data-sound-state="error"]'), 'recorded sound errors receive visible feedback');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion behavior is explicit');

console.log('ui-upgrade-20260924: stylesheet parses; responsive, scroll, sound, motion, and existing spread contracts pass.');
