'use strict';
/* 時辰未知的分享：紫微、八字不再被擋下（原本錯誤訊息寫進已隱藏的輸入表單，畫面上「沒反應」）；
 * 改為照實分享「待確認」卡，結果頁上的任何錯誤也一定看得到。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');
const zw=fs.readFileSync(path.join(ROOT,'JS/ziwei-standalone.js'),'utf8'),bz=fs.readFileSync(path.join(ROOT,'JS/bazi-standalone.js'),'utf8'),sc=fs.readFileSync(path.join(ROOT,'JS/share-card.js'),'utf8');
const zs=zw.slice(zw.indexOf('window._ziweiShare'),zw.indexOf('window._zwCopy'));
assert(!/btimeUnknown\)\s*\{\s*_zwxErr\(/.test(zs),'ziwei no longer refuses unknown time');assert(/pending:\s*true/.test(zs),'ziwei shares a pending card');
const bs=bz.slice(bz.indexOf('window._baziShare'),bz.indexOf('window._baziOpenFullSuite'));
assert(!/_meta\.unknown\)\{_bzxErr\(/.test(bs),'bazi no longer refuses unknown time');assert(/pending:\s*true/.test(bs)&&/確認時辰後判定/.test(bs),'bazi shares three pillars with the hour pending');
for(const [src,fn] of [[zw,'_zwxErr'],[bz,'_bzxErr']])assert(new RegExp('function '+fn+'\\(msg\\)\\{[^}]*offsetParent===null[^}]*JYShareCard\\.notice').test(src),fn+' falls back to a visible notice when its box is hidden');
assert(/notice:notice/.test(sc),'share module exports notice');assert(/if\(d\.pending\)\{/.test(sc),'ziwei renderer has a pending state');assert(/pend\?'未'/.test(sc),'bazi renderer marks the pending hour');
console.log(JSON.stringify({passed:4}));
