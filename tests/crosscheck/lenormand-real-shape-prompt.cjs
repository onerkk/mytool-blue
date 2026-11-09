const {environment,examples}=require(require('path').resolve(__dirname,'../..')+'/tests/native-fixtures-20261003.cjs');const fs=require('fs');
const src=fs.readFileSync(require('path').resolve(__dirname,'../..')+'/JS/lenormand.js','utf8');const a=src.indexOf('var CARDS = ['),b=src.indexOf('];',a);const CARDS=eval(src.slice(a+12,b+1));
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const P=c.JYPromptPacket;
console.log(CARDS.length,CARDS.map(k=>k.id+k.name).join(' '));
const pick=[29,25,24,6,28,8,34,21,33].map(n=>CARDS.find(k=>k.id===n));
const ln={spreadType:'nine',expectedCount:9,declaredGender:'female',personRep:{id:29,name:'淑女',basis:'性別聲明'},customFocus:null,cards:pick.map((d,i)=>({id:d.id,name:d.name,position:null,meaning:{keywords:d.key,scope:d.scope},guard:d.guard,isPersonRep:d.id===29,isCustomFocus:false,presetSig:false}))};
const b2=P.build('lenormand',ln,'我跟現在的男友交往三年了，明年適合結婚嗎？他是對的人嗎？');fs.writeFileSync('/tmp/x/p_ln_real.txt',b2);const i=b2.indexOf('【牌陣與程序'),j=b2.indexOf('【規則來源');console.log(b2.length);console.log(b2.slice(i,j));
