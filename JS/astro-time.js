/* IANA civil-time conversion shared by the Western chart. Strict folds/gaps. */
(function(root){
"use strict";
const finite=(n,label)=>{if(!Number.isFinite(n))throw Error(label+"不正確");return n;};
  function civilToUTC(input){
    const {date,time,timezone}=input;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^\d{2}:\d{2}(:\d{2})?$/.test(time||''))throw Error('請填完整出生日期與時間');
    const parts=(date+'T'+time).match(/\d+/g).map(Number),[y,m,d,h,min,sec=0]=parts;
    const wall=Date.UTC(y,m-1,d,h,min,sec),check=new Date(wall);
    if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d||h>23||min>59||sec>59)throw Error('出生日期或時間不存在');
    if(input.offsetMinutes!=null){const offset=finite(Number(input.offsetMinutes),'UTC 時差');if(Math.abs(offset)>14*60)throw Error('UTC 時差超出範圍');return {date:new Date(wall-offset*60000),offsetMinutes:offset,policy:'explicit-offset'};}
    if(typeof timezone!=='string'||!timezone.trim())throw Error('請選有效的 IANA 時區，例如 Asia/Taipei');
    let fmt;try{fmt=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}catch(_){throw Error('請選有效的 IANA 時區，例如 Asia/Taipei');}
    function localMs(ms){let q={};fmt.formatToParts(new Date(ms)).forEach(p=>{q[p.type]=p.value;});return Date.UTC(+q.year,+q.month-1,+q.day,+q.hour,+q.minute,+q.second);}
    const offsets=new Set();for(let h=-48;h<=48;h+=6){const t=wall+h*3600000;offsets.add(localMs(t)-t);}
    const candidates=[...offsets].map(offset=>wall-offset).filter(t=>localMs(t)===wall).sort((a,b)=>a-b);
    if(!candidates.length)throw Error('這個當地時間位於夏令時間跳時，實際不存在，請核對出生紀錄');
    if(candidates.length>1&&!['earlier','later'].includes(input.disambiguation))throw Error('這個時間因夏令時間結束而出現兩次，請在進階設定選第一次或第二次');
    const value=input.disambiguation==='later'?candidates[candidates.length-1]:candidates[0];
    return {date:new Date(value),offsetMinutes:(wall-value)/60000,policy:'IANA',timezone,ambiguous:candidates.length>1};
  }
// Locate the actual civil-day interval, including midnight jumps and skipped dates.
function civilDayBounds(date,timezone){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('日期無效');
  const wall=Date.parse(date+'T12:00:00Z'),fmt=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'});
  const dayAt=ms=>{const p={};fmt.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month+'-'+p.day;};
  let hit=null;for(let t=wall-48*3600000;t<=wall+48*3600000;t+=3600000)if(dayAt(t)===date){hit=t;break;}
  if(hit==null)throw Error('這個出生日期在所選時區不存在，請核對紀錄');
  let a=hit-30*3600000,b=hit;while(b-a>1){const m=Math.floor((a+b)/2);if(dayAt(m)<date)a=m;else b=m;}const start=b;
  a=hit;b=hit+30*3600000;while(b-a>1){const m=Math.floor((a+b)/2);if(dayAt(m)<=date)a=m;else b=m;}
  return [new Date(start),new Date(b)];
}
root.JYAstroTime=Object.freeze({civilToUTC,civilDayBounds});
})(globalThis);
