'use strict';
/* 分享視窗在有 3D 場景的頁面（姓名書房、大六壬）不能卡死：預覽與分享用 2160×2700；高清版只在按下載時依裝置記憶體上限另畫並立即釋放；
 * 背景不做即時模糊。大六壬光暈：基礎與峰值都調降。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');const R=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const sc=R('JS/share-card.js');
assert(/render\(type,payload,\{scale:SCALE\}\)/.test(sc),'preview renders at the standard size');assert(!/render\(type,payload,\{auto:true\}\)/.test(sc),'preview never renders 8K');
assert(/dl\.onclick=function\(\)\{[\s\S]{0,400}render\(type,el\.payload\|\|d,\{auto:true\}\)/.test(sc),'high-res only on download');
assert(/navigator\.deviceMemory[\s\S]{0,80}mem<=2\?3200:mem<=4\?4320:mem<=6\?5760:7680/.test(sc),'memory-aware ceiling');assert(/cv\.width=cv\.height=0/.test(sc),'canvases freed');
assert(!/backdrop-filter/.test(R('assets/share/share-cards-20260911.css')),'no live blur behind the share modal');
// 六壬場景的光暈設計另由 tests/liuren-scene-design-20261024.cjs 把關。
console.log(JSON.stringify({passed:3}));
