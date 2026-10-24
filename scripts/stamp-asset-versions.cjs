'use strict';
/* 資產版本由內容決定：index.html 與 ui.js 延遲載入裡每個 JS/CSS 引用的 ?v= 改成檔案內容雜湊；
   sw.js 快取名稱改成全部被引用資產的合併雜湊。內容一變版本就變，不可能漏改；內容沒變版本不動。 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');const root=path.resolve(__dirname,'..');
const h=b=>crypto.createHash('sha1').update(b).digest('hex').slice(0,10);
const today=new Date().toISOString().slice(0,10).replace(/-/g,'');
// 版本格式：YYYYMMDD + 'h' + 內容雜湊。內容沒變就沿用原日期；內容變了才換成今天日期（保留專案「日期開頭」慣例）。
const ver=(old,hash)=>{const m=/^(\d{8})h([0-9a-f]+)$/.exec(old||'');return m&&m[2]===hash?old:today+'h'+hash;};
const REF=/((?:JS|CSS|js|css)\/[A-Za-z0-9_.\/-]+\.(?:js|css|mjs))\?v=([A-Za-z0-9_-]+)/g;
const targets=['index.html','JS/ui.js','ui.js'];const all=new Map();let changed=0;
for(const t of targets){const p=path.join(root,t);if(!fs.existsSync(p))continue;let s=fs.readFileSync(p,'utf8');
  const next=s.replace(REF,(m,file,v)=>{const fp=path.join(root,file);if(!fs.existsSync(fp))return m;const hv=ver(v,h(fs.readFileSync(fp)));all.set(file,hv);return file+'?v='+hv;});
  if(next!==s){fs.writeFileSync(p,next);changed++;}}
// ui.js changed above → its own hash in index.html must be recomputed (second pass is idempotent for others)
{const p=path.join(root,'index.html');let s=fs.readFileSync(p,'utf8');const next=s.replace(REF,(m,file,v)=>{const fp=path.join(root,file);if(!fs.existsSync(fp))return m;const hv=ver(v,h(fs.readFileSync(fp)));all.set(file,hv);return file+'?v='+hv;});if(next!==s){fs.writeFileSync(p,next);changed++;}}
const combined='jy-main-'+h([...all.entries()].sort().map(([f,v])=>f+v.replace(/^\d{8}h/,'')).join('|'));
for(const sw of ['sw.js','JS/sw.js']){const p=path.join(root,sw);if(!fs.existsSync(p))continue;const s=fs.readFileSync(p,'utf8');const next=s.replace(/const CACHE_NAME = '[^']*';/,"const CACHE_NAME = '"+combined+"';");if(next!==s){fs.writeFileSync(p,next);changed++;}}
console.log('asset versions stamped: '+all.size+' references; files changed: '+changed+'; cache '+combined);
