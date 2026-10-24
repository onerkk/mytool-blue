'use strict';
/* 資產版本＝內容雜湊：index.html 與 ui.js 引用的每個 JS/CSS 的 ?v= 必須等於檔案目前內容的雜湊，sw.js 快取名稱等於合併雜湊。
 * 改了檔案卻沒重跑 `npm run stamp` 就會在這裡失敗（瀏覽器才不會拿到舊檔）。 */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');const root=path.resolve(__dirname,'..');
const h=b=>crypto.createHash('sha1').update(b).digest('hex').slice(0,10);const REF=/((?:JS|CSS|js|css)\/[A-Za-z0-9_.\/-]+\.(?:js|css|mjs))\?v=([A-Za-z0-9_-]+)/g;
const bad=[];const all=new Map();
for(const t of ['index.html','JS/ui.js','ui.js']){const s=fs.readFileSync(path.join(root,t),'utf8');for(const m of s.matchAll(REF)){const fp=path.join(root,m[1]);if(!fs.existsSync(fp))continue;const want=h(fs.readFileSync(fp)),mm=/^(\d{8})h([0-9a-f]+)$/.exec(m[2]);all.set(m[1],m[2]);if(!mm||mm[2]!==want)bad.push(t+': '+m[1]+' v='+m[2]+' expected <date>h'+want);}}
const combined='jy-main-'+h([...all.entries()].sort().map(([f,v])=>f+v.replace(/^\d{8}h/,'')).join('|'));
for(const sw of ['sw.js','JS/sw.js']){const s=fs.readFileSync(path.join(root,sw),'utf8');if(!s.includes("const CACHE_NAME = '"+combined+"';"))bad.push(sw+': cache name is not the combined hash');}
if(bad.length)console.log(bad.slice(0,10).join('\n'));assert.equal(bad.length,0,'run `npm run stamp`');console.log(JSON.stringify({references:all.size,passed:1}));
