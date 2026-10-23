'use strict';
/* 輸入框可複製貼上：所有 contextmenu 擋板（ui.js、根目錄鏡像、obfuscate.js 注入碼）對可編輯元素與已選取文字放行；
 * 輸入框所在的容器不得設 user-select:none；沒有任何 paste／copy／cut 事件被 preventDefault。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of ['JS/ui.js','ui.js','obfuscate.js']){const s=read(f);const blocks=s.match(/addEventListener\('contextmenu'[\s\S]{0,420}?\}(?:,true)?\);/g)||[];assert(blocks.length>=1,f+' has a contextmenu handler');blocks.forEach(b=>assert(/input,textarea/.test(b)&&/getSelection/.test(b),f+' contextmenu blocker must allow editable fields and selected text'));}
const js=fs.readdirSync(path.join(root,'JS')).filter(f=>f.endsWith('.js')&&!/scene\.js$|cinematic-stage|vendor/.test(f));
for(const f of js){const s=read('JS/'+f);assert(!/addEventListener\(['"](paste|copy|cut)['"][^)]*\)[\s\S]{0,200}preventDefault/.test(s),f+' must not block paste/copy/cut');}
const css=fs.readdirSync(path.join(root,'CSS')).filter(f=>f.endsWith('.css'));
for(const f of css){const s=read('CSS/'+f);const m=s.match(/(?:^|[}\s,])(?:input|textarea|body|html|\*)\s*[{,][^}]*user-select:\s*none/);assert(!m,f+' must not disable selection on inputs/body: '+(m&&m[0]));}
console.log(JSON.stringify({passed:3}));
