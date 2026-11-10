const {environment,examples}=require('../native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
for(const m of Object.keys(x.charts)){const b=P.build(m,x.charts[m],'明年適合換工作嗎？');const data=b.slice(b.indexOf('【資料閱讀方式】'),b.indexOf('【資料結束】'));
 const secs=data.split(/\n\n(?=【)/).map(s=>{const t=(s.match(/^【([^】]*)】/)||[])[1]||'';const body=s.slice(t.length+2);const rows=body.split('\n').filter(Boolean);const slashRows=rows.filter(r=>(r.match(/\//g)||[]).length>=4).length;return {t:t.slice(0,14),len:s.length,table:slashRows>=2&&slashRows/rows.length>0.6,sent:/已寫成句|每爻一句/.test(t)};});
 const tb=secs.filter(s=>s.table),sn=secs.filter(s=>s.sent);
 console.log(m.padEnd(11),'句子段',sn.length,'('+sn.reduce((a,s)=>a+s.len,0)+'字)','| 代碼表',tb.length,'('+tb.reduce((a,s)=>a+s.len,0)+'字)：',tb.map(s=>s.t).join('、').slice(0,150));}
