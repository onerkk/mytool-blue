'use strict';
/* 根目錄鏡像一致性：凡 JS/X.js 在根目錄有同名檔，兩者必須逐位元相同（原上傳版本中所有成對檔案皆相同）。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const pairs=fs.readdirSync(path.join(root,'JS')).filter(f=>f.endsWith('.js')&&fs.existsSync(path.join(root,f)));
const bad=pairs.filter(f=>!fs.readFileSync(path.join(root,'JS',f)).equals(fs.readFileSync(path.join(root,f))));
assert.equal(bad.length,0,'root mirrors out of sync: '+bad.join(', '));console.log(JSON.stringify({pairs:pairs.length,passed:1}));
