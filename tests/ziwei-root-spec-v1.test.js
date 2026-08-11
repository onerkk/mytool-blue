'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const fixedNow = new Date('2026-07-17T00:00:00Z');
function FixedDate(...args){ return args.length ? new Date(...args) : new Date(fixedNow); }
FixedDate.now = () => fixedNow.getTime();
FixedDate.parse = Date.parse;
FixedDate.UTC = Date.UTC;
FixedDate.prototype = Date.prototype;

const ctx = {
  console,
  Date: FixedDate,
  setTimeout: function(){},
  clearTimeout: function(){},
  requestAnimationFrame: function(fn){ if (fn) fn(); },
  navigator: {},
  document: {
    getElementById: function(){ return null; },
    createElement: function(){ return { style: {}, appendChild:function(){}, setAttribute:function(){}, remove:function(){}, querySelector:function(){return null;} }; },
    body: { appendChild:function(){}, style:{} }
  }
};
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.getStarBright = function(name){
  const m = {天府:'廟', 天相:'得地', 紫微:'旺', 貪狼:'利', 武曲:'平', 破軍:'平', 廉貞:'利', 七殺:'廟'};
  return { label: m[name] || '' };
};
vm.createContext(ctx);

function load(rel){
  const src = fs.readFileSync(path.join(rootDir, rel), 'utf8');
  vm.runInContext(src, ctx, { filename: rel });
}

load('JS/ziwei-prompt-root.js');
assert(ctx.JY_ZIWEI_PROMPT_ROOT, 'root api missing');
assert.strictEqual(ctx.JY_ZIWEI_PROMPT_ROOT.version, '2.0.1');

const head = ctx.JY_ZIWEI_PROMPT_ROOT.composeHead();
const tail = ctx.JY_ZIWEI_PROMPT_ROOT.composeTail();
[
  '必要條件瓶頸', '外部主體與身分延續', '使用者自述不是命中證據',
  '動態宮位圖', '禁止重複計票', '弱年份允許留白',
  '一般桃花／合作／財務窗口不得綁定', '品牌附加層', '靜月之光蝦皮有相關選品'
].forEach(x => assert((head + tail).includes(x), 'missing v2 invariant: ' + x));
[
  '化忌沖命就是卡', '空宮無主就是飄', '配偶年齡差：由夫妻宮主星',
  '公司場合確實可能成為緣分來源', '2029年是定案年'
].forEach(x => assert(!(head + tail).includes(x), 'legacy/answer patch remains: ' + x));
assert(tail.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));
assert(tail.includes('願你諸事順遂。'));

load('JS/ziwei-standalone.js');
assert.strictEqual(typeof ctx._ziweiBuildPrompt, 'function', 'standalone builder missing');

const names = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮'];
const branches = ['丑','子','亥','戌','酉','申','未','午','巳','辰','卯','寅'];
const palaces = names.map((name, i) => ({ name, branch: branches[i], gan:'乙', stars:[], changsheng:'', isMing:i===0, isShen:i===10 }));
palaces[0].stars = [{name:'天府',type:'major'},{name:'擎羊',type:'sha'}];
palaces[2].stars = [{name:'武曲',type:'major'},{name:'破軍',type:'major',hua:'化祿'}];
palaces[6].stars = [{name:'廉貞',type:'major'},{name:'七殺',type:'major'}];
palaces[8].stars = [{name:'天相',type:'major'}];
palaces[10].stars = [{name:'紫微',type:'major'},{name:'貪狼',type:'major',hua:'化忌'}];

const zw = {
  yGan:'癸', yZhi:'亥', wuxingJu:4, mingZhu:'巨門', shenZhu:'天機', mingGan:'乙',
  palaces,
  sihua:[{star:'破軍',hua:'化祿',palace:'夫妻'}],
  selfHua:[{palace:'夫妻',star:'破軍',type:'化祿',direction:'↓'}],
  laiYin:{name:'夫妻',branch:'亥',gan:'癸'},
  feiGongHua:[{palace:'夫妻',gan:'癸',lu:{star:'破軍',to:'夫妻',self:true},quan:{star:'巨門',to:'田宅'},ke:{star:'太陰',to:'父母'},ji:{star:'貪狼',to:'福德'}}],
  patterns:[{name:'府相朝垣',level:'吉',desc:'傳統格局摘要'}],
  starComboNotes:['武破同宮（夫妻）：財來財去，破舊立新的模式，投資要特別審慎。'],
  daXian:[{ageStart:44,ageEnd:53,palaceName:'財帛',palace:'財帛',branch:'酉',level:'中凶',theme:'理財重點期',isCurrent:true,hua:[]}],
  getLiuNianZw:function(y){ return {gz:'丙午',mingPalace:'交友',focus:'人際社交',hua:[{star:'廉貞',hua:'化忌',palace:'遷移'}],notes:[]}; }
};
const prompt = ctx._ziweiBuildPrompt(zw, {question:'公司異性未來會跟我交往嗎？',bdate:'1983-08-25',btime:'14:00',gender:'male'});
assert(prompt.includes('公司異性未來會跟我交往嗎？'));
assert(prompt.includes('以時辰代表時排盤，未作出生地經度真太陽時校正'));
assert(prompt.includes('【三方四正索引（引擎依本盤地支動態計算）】'));
assert(prompt.includes('夫妻宮(亥)：對宮 官祿宮(巳)；三合 福德宮(卯)、遷移宮(未)'));
assert(prompt.includes('財帛宮(酉)：對宮 福德宮(卯)；三合 命宮(丑)、官祿宮(巳)'));
assert(prompt.includes('【運限計算政策】大限採虛歲'));
assert(prompt.includes('資料未提供精確大限切換日期'));
assert(prompt.includes('單一命盤不能證明特定他人'));
assert(prompt.includes('一般桃花／合作／財務窗口不得綁定'));
assert(prompt.includes('弱年份允許留白'));
assert(prompt.includes('使用者自述不是命中證據'));
assert(prompt.includes('欽天派輔助視角'));
assert(prompt.includes('命盤格局候選'));
assert(prompt.includes('星系組合候選'));
assert(prompt.includes('武破同宮（夫妻）'));
assert(!prompt.includes('財來財去，破舊立新的模式'));
assert(!prompt.includes('化忌沖命就是卡'));
assert(!prompt.includes('哪一年/哪幾個月'));
assert(prompt.includes('靜月之光蝦皮賣場'));

const standaloneSource = fs.readFileSync(path.join(rootDir, 'JS/ziwei-standalone.js'), 'utf8');
assert(standaloneSource.includes('JY_ZIWEI_PROMPT_ROOT'));
assert(standaloneSource.includes('三方四正由實際地支動態計算'));
assert(!standaloneSource.includes('空宮無主就是飄'));
assert(!standaloneSource.includes('配偶年齡差：由夫妻宮主星'));

console.log('ziwei-root-spec-v2: all assertions passed');
