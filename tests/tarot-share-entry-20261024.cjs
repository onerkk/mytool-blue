'use strict';
/* 塔羅分享入口：抽牌完成頁（牌陣已完成時）就有分享鍵；分享的是目前這次抽的牌，不是上一次占卜殘留在 S.tarot.drawn 的牌。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');const ROOT=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const dock=html.slice(html.indexOf('id="tarot-draw-dock"'),html.indexOf('</div>',html.indexOf('id="tarot-selection-progress"')));
assert(/id="tarot-dock-share"[^>]*onclick="_tarotShare\(\)"/.test(dock),'share button lives in the draw dock');
const atelier=fs.readFileSync(path.join(ROOT,'JS/atelier-ui.js'),'utf8');
assert(atelier.includes("share.hidden=!complete||busy"),'share button appears only when the spread is complete');
// run the real _tarotShare with a stale previous reading in S.tarot.drawn and a live current draw
const ui=fs.readFileSync(path.join(ROOT,'JS/ui.js'),'utf8');const i=ui.indexOf('window._tarotShare = function');let d=0,j=ui.indexOf('{',i);for(;j<ui.length;j++){if(ui[j]==='{')d++;else if(ui[j]==='}'&&--d===0)break;}
const fn=ui.slice(i,j+1)+';';let captured=null;
const ctx={window:{},S:{tarot:{spreadType:'five_card',drawn:[{n:'舊牌一'},{n:'舊牌二'},{n:'舊牌三'}],spreadDef:{id:'five_card',positions:[]}},form:{question:'測試'}},
  drawnCards:[{n:'新牌一',readingMode:'rws_reversals',isUp:false},{n:'新牌二',readingMode:'rws_reversals',isUp:true},{n:'新牌三',readingMode:'rws_reversals',isUp:true}],
  getCurrentSpread:()=>'three_card',getCurrentSpreadDef:()=>({id:'three_card',zh:'三牌陣',positions:[{name:'過去'},{name:'現在'},{name:'未來'}]}),getTarotCardImage:()=>'',alert:()=>{}};
ctx.window=ctx;ctx.JYShareCard={open:(type,data)=>{captured={type,data};}};ctx.window.JYShareCard=ctx.JYShareCard;vm.createContext(ctx);vm.runInContext(fn,ctx);ctx._tarotShare();
assert(captured&&captured.type==='tarot');assert.deepEqual(captured.data.cards.map(c=>c.name),['新牌一','新牌二','新牌三'],'shares the live draw');
assert.equal(captured.data.cards[0].reversed,true);assert.equal(captured.data.cards[0].pos,'過去','positions come from the current spread');
console.log(JSON.stringify({passed:3}));
