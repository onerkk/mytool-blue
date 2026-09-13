'use strict';
// Export the actual method text and seasonal data; no model calls or chart casts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const out=path.resolve(process.argv[2]||path.join(root,'review/methods-20260913'));
const quality=require(path.join(root,'JS/reading-quality.js'));
const {ctx}=require(path.join(root,'tests/dom-fixture.cjs')).environment();
vm.runInContext(fs.readFileSync(path.join(root,'JS/bazi.js'),'utf8'),ctx,{filename:'JS/bazi.js'});
fs.mkdirSync(out,{recursive:true});
const methods=['# 實際共用解讀方法（2026-09-13）','由 JS/reading-quality.js 原樣匯出；來源與變體見 docs/method-sources-20260913.md。',quality.plainText()];
for(const kind of quality.methodKinds())methods.push('## '+kind,...quality.methodLines(kind));
fs.writeFileSync(path.join(out,'00-native-methods.md'),methods.join('\n\n')+'\n');
const records=[];
for(const stem of '甲乙丙丁戊己庚辛壬癸')for(const monthBranch of '寅卯辰巳午未申酉戌亥子丑')records.push({dayStem:stem,monthBranch,...ctx.getBaziSeasonalReference(stem,monthBranch)});
fs.writeFileSync(path.join(out,'seasonal-reference.json'),JSON.stringify({reviewDate:'2026-09-13',meaning:'典籍條件摘要；候選入口需與完整原局合參，不是自動定用神。',records},null,2)+'\n');
console.log('Exported '+quality.methodKinds().length+' native methods and '+records.length+' seasonal references to '+out);
