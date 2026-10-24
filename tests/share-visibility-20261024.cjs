'use strict';
/* 分享視窗在任何全螢幕房間裡都看得見：凡是「隱藏 body 其他子元素」的房間規則，都必須排除 #jysc-bd／#jysc-notice；分享樣式表另有保險。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');
const bad=[];for(const f of fs.readdirSync(path.join(ROOT,'CSS')).filter(x=>x.endsWith('.css'))){const s=fs.readFileSync(path.join(ROOT,'CSS',f),'utf8');
  for(const m of s.matchAll(/body[.#][A-Za-z0-9_-]+>:not\([^{]*\{[^}]*(?:visibility:hidden|display:none)[^}]*\}/g)){if(!/#jysc-bd/.test(m[0])||!/#jysc-notice/.test(m[0]))bad.push(f+': '+m[0].slice(0,80));}}
assert.equal(bad.length,0,'room rules must exempt the share modal:\n'+bad.join('\n'));
const sc=fs.readFileSync(path.join(ROOT,'assets/share/share-cards-20260911.css'),'utf8');assert(/body>#jysc-bd,body>#jysc-notice\{visibility:visible!important\}/.test(sc));
console.log(JSON.stringify({passed:2}));
