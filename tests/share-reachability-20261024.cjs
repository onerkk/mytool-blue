'use strict';
/* 分享入口要在使用者完成解讀交付的地方看得到：吠陀解讀分頁的交付區（複製提示詞／AI 連結／下載）內也有分享鍵，
 * 與頂部標題列的分享鍵共用同一個 data-vd-action="share" 處理。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');
const vd=fs.readFileSync(path.join(ROOT,'JS/vedic-standalone.js'),'utf8');
const start=vd.indexOf('<div class="vd-copy-panel">'),panel=vd.slice(start,vd.indexOf('<details class="vd-technical"',start));
assert(/btn\(\\?'share\\?',\\?'↗ 分享本命星圖\\?'/.test(panel),'share is reachable from the reading handoff panel');
assert(/a==='share'&&chart\)root\.JYShareCard\.open\('vedic'/.test(vd),'single share handler');
const ln=fs.readFileSync(path.join(ROOT,'JS/lenormand.js'),'utf8');assert(ln.includes('onclick="_lenormandShare()"'));
const wx=fs.readFileSync(path.join(ROOT,'JS/western-standalone.js'),'utf8');assert(/wx-export-bar[^']*'\+button\('share'/.test(wx),'western export bar keeps share');
console.log(JSON.stringify({passed:3}));
