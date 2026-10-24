'use strict';
/* 分享卡設計稿模式：15 種卡片以設計稿為底（assets/share/tpl，由 scripts/build-share-templates.py 從 assets/share/source 產生），
 * 動態內容以向量重畫、二維碼重畫為清晰版；規格與圖檔齊全、疊加程式用到的座標都在規格裡；載不到設計稿時回到程序繪製。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');const ROOT=path.resolve(__dirname,'..');const R=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const TYPES=['invite','name','liuren','yijing','liuyao','meihua','oracle','western','vedic','ziwei','baziCompatibility','tarot','lenormand','bazi','ootk'];
const spec=JSON.parse(R('assets/share/tpl/spec.json'));let passed=0;
// 1. assets and geometry
assert.deepEqual(Object.keys(spec.t).sort(),TYPES.slice().sort());
for(const t of TYPES){const e=spec.t[t];assert(fs.existsSync(path.join(ROOT,'assets/share/tpl',e.f)),t+' template');assert(/^[0-9a-f]{10}$/.test(e.h));if(e.a)assert(fs.existsSync(path.join(ROOT,'assets/share/tpl',e.a.f)),t+' atlas');
  assert(['webp','jpg'].some(x=>fs.existsSync(path.join(ROOT,'assets/share/source',t+'.'+x))),t+' designer source kept');
  for(const [k,r] of Object.entries(e.r))assert(r[0]>=0&&r[1]>=0&&r[2]<=1.0001&&r[3]<=1.0001&&r[2]>r[0]&&r[3]>r[1],t+'.'+k+' inside the card');
  const q=e.r.qr,[w,h]=e.src,ratio=((q[2]-q[0])*w)/((q[3]-q[1])*h);assert(q[0]>.7&&q[1]>.78&&ratio>.85&&ratio<1.18,t+' QR is the square white block');}
passed++;
// 2. every rectangle the overlay reads exists for that type
const sc=R('JS/share-card.js'),block=sc.slice(sc.indexOf('var TPLR={'),sc.indexOf('var RENDER={'));
for(const m of block.matchAll(/\n    (\w+):function\(c,d,t,g\)\{([\s\S]*?)(?=\n    \w+:function|\n  \};)/g)){const t=m[1],body=m[2],r=spec.t[t].r;
  for(const n of body.matchAll(/g\.Z\('(\w+)'\)/g))assert(r[n[1]],t+' uses '+n[1]);
  for(const n of body.matchAll(/g\.Z\('(\w+)'\+i\)/g))assert(r[n[1]+'0'],t+' uses '+n[1]+'N');
  for(const n of body.matchAll(/tplQ\(c,d,g,'(\w+)'\)/g))assert(r[n[1]],t+' question zone');}
for(const n of block.matchAll(/function tplGua[\s\S]*?\n/g))for(const k of ['name0','bars0','tri0','name1','bars1','tri1'])for(const t of ['yijing','liuyao'])assert(spec.t[t].r[k],t+' '+k);
passed++;
// 3. rendering: template first, live content on top; no template → procedural
function ctx2d(rec){const base={font:'20px serif',measureText:s=>({width:Array.from(String(s)).length*parseFloat((base.font.match(/(\d+(?:\.\d+)?)px/)||[0,20])[1])}),fillText:(s,x,y)=>rec.text.push(String(s)),drawImage:(im)=>rec.images.push(String(im&&im.src||'')),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
  return new Proxy(base,{get:(o,k)=>k in o?o[k]:(typeof k==='string'?()=>{}:undefined),set:(o,k,v)=>{o[k]=v;return true;}});}
function sandbox(withFetch){class Img{constructor(){this.width=this.naturalWidth=400;this.height=this.naturalHeight=600;}set src(v){this._s=v;queueMicrotask(()=>this.onload&&this.onload());}get src(){return this._s;}}
  const ctx={Image:Img,URL,console,Promise,setTimeout,clearTimeout,queueMicrotask,location:{origin:'https://preview.invalid'},navigator:{},
    document:{baseURI:'https://preview.invalid/',currentScript:{src:'https://preview.invalid/JS/share-card.js'},fonts:null,createElement:()=>{const rec={text:[],images:[]};return {_rec:rec,width:0,height:0,getContext:()=>ctx2d(rec),toBlob:cb=>cb(null)};}}};
  if(withFetch)ctx.fetch=u=>Promise.resolve({ok:true,json:()=>Promise.resolve(JSON.parse(R(String(u).replace('https://preview.invalid/','').split('?')[0])))});
  ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(R('JS/method-catalog.js'),ctx);vm.runInContext(sc,ctx);return ctx;}
const S=sandbox(true),A=S.JYShareCard;
const gua={method:'yarrow',calendar:{monthBranch:'戌',day:'辛未',voidBranches:['戌','亥']},original:{palace:{name:'離'}},reading:{selections:[{role:'本卦',hexagram:'未濟',label:'九四',text:'貞吉，悔亡。'}]},lines:Array.from({length:6},(x,i)=>({spirit:'青龍',relative:'兄弟',stem:'戊',branch:'午',element:'火',role:i===2?'世':'',valueName:'少陰'}))};
const cases={name:[{chars:[{char:'陳',stroke:16},{char:'弘',stroke:5}],grids:[{role:'天格',num:17,element:'金',level:'偏利'},{role:'人格',num:21,element:'木',level:'偏利'},{role:'地格',num:13,element:'火',level:'偏利'},{role:'外格',num:9,element:'水',level:'偏阻'},{role:'總格',num:29,element:'土',level:'吉阻並存'}],sancai:{config:'金木火',level:'凶'}},['陳','人格','金木火・凶']],
  liuren:[{pillarLine:'年 丙午',courses:[{upper:'未',lower:'辛',general:'天后'},{upper:'辰',lower:'未',general:'朱雀'},{upper:'辰',lower:'未',general:'朱雀'},{upper:'丑',lower:'辰',general:'青龍'}],transmissions:[{role:'初傳',branch:'亥',general:'白虎',kinship:'子孫',empty:true}],classLine:'課體 別責'},['天后','亥・白虎・子孫（旬空）','課體 別責']],
  yijing:[{cards:[{name:'地水師',lines:[0,1,0,0,0,0],moving:[3]},{name:'地風升',lines:[0,1,1,0,0,0]}],moving:[3],gua},['地水師','坤','坎','大衍蓍草','動爻 3']],
  liuyao:[{cards:[{name:'火水未濟',lines:[0,1,0,1,0,1]}],gua},['火水未濟','離','辛未','離宮','六爻皆靜']],
  meihua:[{cards:[{name:'山風蠱',lines:[0,1,1,0,0,1],dong:1},{name:'雷澤歸妹',lines:[1,1,0,1,0,0]},{name:'山天大畜',lines:[1,1,1,0,0,1]}],conclusion:'用克體'},['山風蠱','用克體']],
  oracle:[{number:9,numberLabel:'第九籤',ganzhi:'乙巳',poem:'龍虎相隨在深山\n君爾何須背後看'},['第九籤','乙巳','龍']],
  ziwei:[{palaces:[{branch:'辰',name:'命宮',star:'貪狼'}],ming:'命宮 ・ 貪狼',info:'木三局'},['命宮','貪狼','木三局']],
  baziCompatibility:[{scenario:'婚戀 / 婚姻',nameA:'甲',nameB:'乙',pillarsA:'己巳 丙子',pillarsB:'庚午 戊子',systems:'八字與紫微斗數',dayPillars:'丙寅 × 辛未'},['婚戀 / 婚姻','己巳 丙子','八字與紫微斗數']],
  tarot:[{spread:'三牌陣',cards:[{name:'太陽',pos:'基礎',img:'x.webp'}]},['三牌陣','太陽']],
  lenormand:[{spread:'五張線',cards:[{name:'騎士',pos:'第1張',img:'y.webp'}]},['五張線（1張）','騎士']],
  bazi:[{pillars:[{label:'年柱',gan:'己',zhi:'巳'},{label:'月柱',gan:'丙',zhi:'子'},{label:'日柱',gan:'丙',zhi:'寅'},{label:'時柱',gan:'',zhi:'',pending:true}],dayMaster:'丙（火行）',yongShen:'確認時辰後判定',dayun:'確認時辰後計算'},['己','己巳','時辰未定','確認時辰後判定']],
  ootk:[{layers:[{cards:'聖杯侍者、魔術師'}]},['聖杯侍者、魔術師']],
  invite:[{},[]]};
(async()=>{
  for(const [type,[data,expect]] of Object.entries(cases)){const cv=await A.render(type,Object.assign({question:'測試'},data),{scale:1});const rec=cv._rec;
    assert(rec.images[0]&&rec.images[0].includes('assets/share/tpl/'+spec.t[type].f),type+': designer template is drawn first');
    for(const s of expect)assert(rec.text.some(x=>x.includes(s)),type+': draws '+s+' — got '+rec.text.slice(0,40).join('|'));
    if(type!=='invite')assert(type==='bazi'||rec.text.includes('測試'),type+': question redrawn');}
  passed++;
  const P=sandbox(false).JYShareCard,cv=await P.render('bazi',cases.bazi[0],{scale:1});assert(!cv._rec.images.some(s=>s.includes('assets/share/tpl/')),'no template → procedural');assert(cv._rec.text.includes('讀懂自己的節奏'),'procedural heading');passed++;
  // 4. pipeline wiring
  assert(/LOADERS=\[[^\]]*'JS\/share-card\.js'/.test(R('scripts/stamp-asset-versions.cjs')));assert(/'assets\/share\/tpl\/spec\.json\?v='\+TPLV/.test(sc));assert(JSON.parse(R('package.json')).scripts['build:share-templates']);passed++;
  console.log(JSON.stringify({passed}));
})().catch(e=>{console.error(e);process.exit(1);});
