'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),noop=()=>{},element=()=>({style:{},classList:{add:noop,remove:noop,contains:()=>false},appendChild:noop,setAttribute:noop,querySelector:()=>null,querySelectorAll:()=>[]});
const ctx={console:{log:noop,warn:noop,error:console.error},Date,Math,Intl,setTimeout:noop,clearTimeout:noop,setInterval:noop,clearInterval:noop,document:{body:element(),head:element(),createElement:element,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},navigator:{},localStorage:{getItem:()=>null,setItem:noop},location:{hostname:'localhost'},alert:noop};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['vendor/lunar','bazi-calendar-core','bazi','liuyao-core','yijing-data','reading-quality','reading-workflow','name-data','name-engine','name-prompt'])vm.runInContext(fs.readFileSync(path.join(base,'JS',file+'.js'),'utf8'),ctx,{filename:file});
const E=ctx.JYNameEngine,P=ctx.JYNamePrompt,plain=x=>JSON.parse(JSON.stringify(x));let pass=0;
function test(name,run){try{run();pass++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
test('Versioned offline dictionary covers >100k glyphs and retains verifiable Kangxi residuals',()=>{assert(ctx.JYNameData.meta.characters>100000);assert(ctx.JYNameData.meta.kangxiResolved>60000);assert.equal(E.lookup('王').kangxi,4);assert.equal(E.lookup('源').kangxi,14);assert.equal(E.lookup('源').modern,13);assert.equal(E.lookup('華').kangxi,14);assert.equal(E.lookup('華').modern,10);assert.equal(E.lookup('王').kangxiRadicalResidual,'96.-1');});
test('Single/compound surname, single/double/triple given names use actual formulas',()=>{
 const a=E.analyze({surname:'王',given:'小明'});assert.deepEqual(plain(a.fiveGrids.grids.map(g=>g.num)),[5,7,11,9,15]);assert.equal(a.fiveGrids.sanCai.configuration,'土金木');
 const b=E.analyze({surname:'歐陽',given:'修'});assert.deepEqual(plain(b.fiveGrids.grids.map(g=>g.num)),[32,27,11,16,42]);
 const c=E.analyze({surname:'王',given:'安'});assert.deepEqual(plain(c.fiveGrids.grids.map(g=>g.num)),[5,10,7,2,10]);assert.equal(E.analyze({surname:'王',given:'小明安'}).fiveGrids.grids[2].num,17);
});
test('81 itself is retained; large numbers cycle by 80, not 81 and not zero',()=>{for(const [n,expected]of [[1,1],[80,80],[81,81],[82,2],[161,81],[162,2]])assert.equal(E.cycle(n),expected);const r=E.analyze({surname:'王',given:'小明',overrides:{王:{stroke:40},小:{stroke:21},明:{stroke:20}}});assert.equal(r.fiveGrids.grids[4].num,81);assert.equal(r.fiveGrids.grids[4].theme,JSON.parse(fs.readFileSync(path.join(base,'data/name/numerology-original-1935.json'),'utf8')).rows[80].theme);assert.equal(r.fiveGrids.grids[4].originalNumerology.profile,'KUMAZAKI-UN-NI-NORU-HO-1935');});
test('Every one of 81 entries and 125 configurations resolves; odd/even and five elements remain facts',()=>{assert.equal(ctx.JYNameData.numerology.themes.length,81);assert.equal(Object.keys(ctx.JYNameData.traditional._SC).length,125);for(let n=1;n<=81;n++){assert(ctx.JYNameData.numerology.themes[n-1].every(x=>typeof x==='string'&&x.length));assert(['木','火','土','金','水'].includes(E.element(n)));}assert.equal(E.relation('木','火'),'相生');assert.equal(E.relation('木','土'),'相剋');});
test('Numeric special rule is explicit and modern/Kangxi sensitivity never leaks manual values',()=>{
 const a=E.analyze({surname:'林',given:'四'}),b=E.analyze({surname:'林',given:'四',numericPolicy:'value'});assert.equal(a.characters[1].stroke,5);assert.equal(b.characters[1].stroke,4);
 const r=E.analyze({surname:'林',given:'源',overrides:{源:{stroke:16}}});assert.equal(r.characters[1].stroke,16);assert.equal(r.characters[1].strokeSource.startsWith('使用者覆核'),true);assert.equal(r.strokeSensitivity.alternateFiveGrids.grids[4].num,21);assert.equal(r.characters[1].modern,13);
});
test('Unknown Kangxi glyph keeps sound/shape and zodiac independent; no code-point guessing',()=>{
 const ch=Object.keys(ctx.JYNameData.characters).find(c=>ctx.JYNameData.characters[c][0]==null&&/\p{Script=Han}/u.test(c));assert(ch);const r=E.analyze({surname:'王',given:ch,birthDate:'1983-08-25'});assert.equal(r.fiveGrids.status,'incomplete');assert.equal(r.nameGua.status,'incomplete');assert.equal(r.phonetic.status,'complete');assert.equal(r.zodiac.status,'complete');assert.equal(E.analyze({surname:'王',given:ch,overrides:{[ch]:{stroke:6}}}).fiveGrids.status,'complete');
});
test('Chinese New Year zodiac boundary is real; civil date and leap dates are validated',()=>{
 assert.equal(E.dateFacts('2024-02-09').zodiac,'兔');assert.equal(E.dateFacts('2024-02-10').zodiac,'龍');assert.equal(E.dateFacts('1983-08-25').zodiac,'豬');
 for(const date of ['2026-02-30','2023-02-29','2026-13-01','26-01-01','1800-01-01'])assert.throws(()=>E.dateFacts(date));assert.equal(E.dateFacts('2024-02-29').lunarYear,2024);
});
test('Birth omissions do not fabricate a noon hour or favored element; exact pillars stay native',()=>{
 const missing=E.analyze({surname:'王',given:'小明',birthDate:'1983-08-25'});assert.equal(missing.bazi.status,'missing');assert.equal(missing.inputPolicy.birthTimePrecision,'未提供');
 const chart=ctx.computeBazi(1983,8,25,14,55,'male',{timezoneOffset:8,trueSolarTime:false,dayBoundaryMode:'MIDNIGHT_00'}),r=E.analyze({surname:'王',given:'小明',birthDate:'1983-08-25',birthTime:'14:55'}, {bazi:chart});assert.equal(r.bazi.status,'complete');assert.deepEqual(plain(Object.values(r.bazi.pillars).map(p=>p.gan+p.zhi)),['癸亥','庚申','乙酉','癸未']);assert.equal(r.bazi.civilTime,'14:55');assert(!JSON.stringify(r.bazi).includes('daYun'));
});
test('Name hexagram math resolves all 64 geometries and true moving/changed line',()=>{
 for(let upper=1;upper<=8;upper++)for(let lower=1;lower<=8;lower++){const r=E.analyze({surname:'王',given:'安',overrides:{王:{stroke:upper},安:{stroke:lower}}}),g=r.nameGua;assert.equal(g.status,'complete');assert.equal(g.upperNumber,upper);assert.equal(g.lowerNumber,lower);assert.equal(g.movingLine,(upper+lower)%6||6);assert.equal(g.original.lines.filter((v,i)=>v!==g.changed.lines[i]).length,1);assert.equal(g.original.lines[g.movingLine-1]+g.changed.lines[g.movingLine-1],1);assert(g.original.source.startsWith('https://zh.wikisource.org/'));}
});
test('Candidate comparison uses identical policies, retains all names and refuses duplicates',()=>{
 const input={surname:'王',candidates:['小明','安','源'],strokeBasis:'kangxi',birthDate:'1983-08-25'},before=JSON.stringify(input),r=E.compare(input);assert.equal(r.names.length,3);assert.equal(JSON.stringify(input),before);assert(r.names.every(x=>x.surname==='王'&&x.inputPolicy.strokeBasis==='kangxi'));assert.throws(()=>E.compare({surname:'王',candidates:['安','安']}));assert.throws(()=>E.compare({surname:'王',candidates:Array(6).fill('安')}));
});
test('Polyphonic sounds remain candidates; confirmed reading is explicit, not psychic inference',()=>{
 const r=E.analyze({surname:'王',given:'樂'});assert.equal(r.phonetic.characters[1].reading,null);assert(r.phonetic.characters[1].candidates.length>1);const confirmed=E.analyze({surname:'王',given:'樂',overrides:{樂:{reading:'lè'}}});assert.equal(confirmed.phonetic.characters[1].reading,'lè');assert.equal(confirmed.phonetic.characters[1].confirmed,true);
});
test('Prompt carries actual facts, all native schools, original question and one fixed ending',()=>{
 const r=E.compare({surname:'王',candidates:['小明','源'],question:'請比較這兩個名字',purpose:'rename'}),prompt=P.build(r);for(const marker of ['請比較這兩個名字','王小明','王源','五格','三才','生肖形義','八字用字','姓名易卦','音形字義','康熙','姓名深入取捨','本次資料與記憶邊界','研究或娛樂','待補','不假設正午'])assert(prompt.includes(marker),marker);assert.equal((prompt.match(/願你諸事順遂。/g)||[]).length,1);assert(prompt.endsWith('願你諸事順遂。'));assert(!prompt.includes('請登入'));assert(!prompt.includes('undefined'));assert(!prompt.includes('NaN'));
});
test('字形參照只依明列字根，八字調候候選不冒稱唯一字五行',()=>{
 const a=E.analyze({surname:'林',given:'源'});assert.equal(a.characters[0].elementReferences[0].element,'木');assert.equal(a.characters[1].elementReferences[0].element,'水');assert(a.shapeElementPolicy.scope.includes('不是唯一字五行'));
 const b=E.analyze({surname:'王',given:'明'});assert.equal(b.characters[0].elementReferences.length,0);assert.equal(b.characters[1].elementReferences.length,0);assert.equal(E.analyze({surname:'王',given:'安',timezoneOffset:5.75}).inputPolicy.trueSolarTime,false);
});
test('Bad splits, non-Han input and invalid stroke values fail with specific errors',()=>{for(const input of [{surname:'',given:'安'},{surname:'王',given:'安 abc'},{surname:'歐陽王',given:'安'},{surname:'王',given:'小明安安'},{surname:'王',given:'安',overrides:{安:{stroke:0}}},{surname:'王',given:'安',overrides:{安:{stroke:1.5}}}])assert.throws(()=>E.analyze(input));});
console.log('Name engine: '+pass+' groups; native dictionary, 81/125 tables, 64 name hexagrams, birth boundaries and complete prompt.');
