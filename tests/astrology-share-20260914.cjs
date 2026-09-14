// Native astrology snapshot → share output contracts. Numerical fixtures live in the engine suites.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
function canvas(){const rec={text:[],rotations:[],images:[],scales:[]};const c={font:'20px serif',textAlign:'left',canvas:null,save(){},restore(){},scale(...v){rec.scales.push(v)},rotate(v){rec.rotations.push(v)},translate(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},arc(){},ellipse(){},fill(){},stroke(){},clip(){},fillRect(){},createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}},measureText(s){const size=Number(this.font.match(/([\d.]+)px/)?.[1]||20);return{width:Array.from(String(s)).reduce((a,ch)=>a+(/[\x00-\x7f]/.test(ch)?size*.52:size),0)}},fillText(s,x,y){assert(Number.isFinite(x)&&Number.isFinite(y));rec.text.push({s:String(s),x,y,font:this.font,align:this.textAlign})},drawImage(...a){rec.images.push(a)}};const cv={width:0,height:0,getContext:()=>c,_rec:rec};c.canvas=cv;return cv;}
class Img{constructor(){this.width=this.naturalWidth=400;this.height=this.naturalHeight=600}set src(v){this._src=v;queueMicrotask(()=>this.onload&&this.onload())}get src(){return this._src}}
const ctx={window:{},Image:Img,URL,location:{origin:'https://preview.invalid'},document:{baseURI:'https://preview.invalid/preview-share.html',currentScript:{src:'https://preview.invalid/JS/share-card.js'},fonts:null,createElement:t=>{assert.equal(t,'canvas');return canvas()}},setTimeout,clearTimeout,console};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(ROOT,'JS/method-catalog.js'),'utf8'),ctx);vm.runInContext(fs.readFileSync(path.join(ROOT,'JS/share-card.js'),'utf8'),ctx);const A=ctx.JYShareCard;
for(const name of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','vedic-engine.js','western-engine.js','western-chart.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,'JS',name),'utf8'),ctx);


const input={utc:'1983-08-25T06:55:00Z',reference:'2026-09-14T04:00:00Z',latitude:22.99,longitude:120.23,location:'台南',civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
const vd=ctx.JYVedic.compute(input),wx=ctx.JYWestern.compute(input);
const texts=c=>c._rec.text.map(p=>p.s).join('\n');
const svg=c=>decodeURIComponent(c._rec.images.find(a=>String(a[0].src).startsWith('data:image/svg+xml'))[0].src.split(',').slice(1).join(','));
let passed=0;async function test(name,fn){await fn();passed++;console.log('PASS '+name);}
(async()=>{
 await test('Invitation and homepage use the same frozen ten-method catalogue',async()=>{
  const c=await A.render('invite',{}),labels=Array.from(ctx.JYMethodCatalog,m=>m[3]);assert.equal(labels.length,10);assert.equal(new Set(labels).size,10);
  for(const label of labels){const t=c._rec.text.filter(t=>t.s===label);assert.equal(t.length,1,label);assert(t[0].x>64&&t[0].x<1016&&t[0].y<1070);}
  assert.equal(new Set(c._rec.text.filter(t=>labels.includes(t.s)).map(t=>t.y)).size,2);
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');assert(html.indexOf('JS/method-catalog.js?')<html.indexOf('JS/share-card.js?'));assert(html.indexOf('JS/method-catalog.js?')<html.indexOf('<script src="JS/ui.js?'));
  assert(fs.readFileSync(path.join(ROOT,'JS/ui.js'),'utf8').includes('var methods = window.JYMethodCatalog;'));
 });
 await test('Both native snapshots survive rendering and privacy changes without recalculation',async()=>{
  for(const [type,chart] of [['vedic',vd],['western',wx]]){const before=JSON.stringify(chart),payload=Object.freeze({chart,question:'私密問題測試'}),c=await A.render(type,payload);assert.equal(c.width,2160);assert.equal(c.height,2700);assert(!texts(c).includes('1983-08-25'));assert(!texts(c).includes('私密問題測試'));assert(!texts(c).includes('14:55'));
   const personal=await A.render(type,{...payload,showPersonal:true});assert(texts(personal).includes('1983-08-25'));assert(texts(personal).includes('14:55'));assert(texts(personal).includes('私密問題測試'));assert.equal(JSON.stringify(chart),before);assert(Object.isFrozen(chart.planets.Sun));
  }
 });
 await test('Indian D1 contains every graha in its real sign, with no tropical substitution',async()=>{
  const c=await A.render('vedic',{chart:vd}),body=c._rec.text.filter(p=>p.x>=250&&p.x<=830&&p.y>=421&&p.y<990),short={Sun:'日',Moon:'月',Mars:'火',Mercury:'水',Jupiter:'木',Venus:'金',Saturn:'土',Rahu:'羅',Ketu:'計'};
  for(const [key,label] of Object.entries(short)){const cell=body.find(p=>p.s.split(' ').includes(label));assert(cell,key);const name=body.find(p=>p.s===vd.planets[key].signName);assert.equal(cell.x,name.x);assert(cell.y>name.y&&cell.y-name.y<=81);}
  assert(texts(c).includes('恆星黃道'));assert(texts(c).includes('Lahiri'));assert(!texts(c).includes('回歸黃道'));
  const raman=ctx.JYVedic.compute({...input,ayanamsa:'raman'});assert(texts(await A.render('vedic',{chart:raman})).includes('Raman'));
 });
 await test('Western card embeds the exact native noninteractive wheel in all four house systems',async()=>{
  for(const system of ['P','W','E','O']){const ch=ctx.JYWestern.compute({...input,houseSystem:system}),c=await A.render('western',{chart:ch});assert.equal(svg(c),ctx.JYWesternChart.wheel(ch,{selected:null,interactive:false,id:'share-western',margin:16,centerLabel:ch.sensitivity.unknownTime?'REFERENCE':'NATAL'}));assert(texts(c).includes(ch.policy.houseName));assert(!svg(c).includes('data-wx-house'));assert(svg(c).includes('viewBox="-16 -16 632 632"'));assert(!texts(c).includes('恆星黃道'));}
 });
 await test('Unknown time shares only the midday reference, without ASC, fixed houses or dasha',async()=>{
  const data={...input,utc:'1983-08-25T04:00:00Z',unknownTime:true,civil:{...input.civil,time:'12:00'}};
  for(const type of ['vedic','western']){const ch=(type==='vedic'?ctx.JYVedic:ctx.JYWestern).compute(data),c=await A.render(type,{chart:ch,showPersonal:true,question:'私密問題測試'});assert(texts(c).includes('中午'));assert(texts(c).includes('時間不詳'));assert(!texts(c).includes('12:00'));if(type==='western')assert(!svg(c).includes('>ASC<'));else{assert(texts(c).includes('南印度式'));assert(!texts(c).includes('北印度式'));assert(!texts(c).includes('大運'));}}
 });
 await test('A concentrated D1 conjunction retains all nine grahas instead of truncating the cell',async()=>{
  const ch=JSON.parse(JSON.stringify(vd));for(const p of Object.values(ch.planets)){p.longitude=ch.lagna.sign*30+1;p.sign=ch.lagna.sign;p.signName=ch.lagna.signName;}
  const c=await A.render('vedic',{chart:ch}),glyphs=c._rec.text.filter(p=>p.y>420&&p.y<970&&/^[日月火水木金土羅計 ]+$/.test(p.s)).map(p=>p.s).join(' ');assert.equal(glyphs.split(' ').filter(Boolean).length,9);assert(!glyphs.includes('+'));
 });
 await test('Absent, crossed-school and nonfinite snapshots never become fabricated birth charts',async()=>{
  for(const [type,chart]of [['western',vd],['vedic',wx],['western',null],['vedic',null]])assert(texts(await A.render(type,{chart})).includes('尚無'));
  const ch=JSON.parse(JSON.stringify(wx));ch.planets.Sun.longitude=NaN;assert(texts(await A.render('western',{chart:ch})).includes('尚無'));
 });
 console.log('Astrology share contracts: '+passed+' groups passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
