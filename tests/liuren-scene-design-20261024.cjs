'use strict';
/* 六壬立體盤的「精緻」設計：沒有全畫面泛光（會把金邊與刻字一起暈開）；刻字兩倍解析度、無彩色外暈；
 * 打光集中（主光＋冷色輪廓光＋微弱暖光，不再把桌面照成一片琥珀霧）；金塵少而細；出圖解析度上限 2。原始碼與打包檔一致。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'JS/liuren-scene-src.mjs'),'utf8'),bundle=fs.readFileSync(path.join(ROOT,'JS/liuren-scene.js'),'utf8');
for(const [name,s] of [['src',src],['bundle',bundle]])assert(!/UnrealBloomPass|EffectComposer/.test(s),name+': no full-screen bloom');
const label=src.slice(src.indexOf('function label('),src.indexOf('const texture=own(new THREE.CanvasTexture(c));',src.indexOf('function label(')));
assert(/const S=2/.test(label),'lettering drawn at 2x');assert(!/shadowColor=color/.test(label),'no colored halo around lettering');assert(/strokeText/.test(label),'crisp engraved edge');
const num=re=>Number((src.match(re)||[])[1]);
assert(num(/toneMappingExposure=([.\d]+)/)<=1,'exposure ≤ 1');assert(/setPixelRatio\(Math\.min\(devicePixelRatio\|\|1,2\)\)/.test(src),'pixel ratio up to 2');
assert(num(/DirectionalLight\(0x[0-9a-f]+,([.\d]+)\);key\.position/)<=2.8,'key light');assert(num(/const sweep=new THREE\.PointLight\(0x[0-9a-f]+,([.\d]+)/)<=.6,'warm sweep is faint');
assert(num(/const DUST=(\d+)/)<=150,'few gold motes');assert(num(/PointsMaterial\(\{size:([.\d]+)/)<=.035,'fine gold motes');
assert(num(/roughness:([.\d]+),envMapIntensity:([.\d]+),clearcoat/)>=.28,'gold is polished, not mirror-blown');
console.log(JSON.stringify({passed:4}));
