/* 三命通會卷二·論小運：醉醒子時柱法與古人男女固定起法分列。
 * 年齡索引採本引擎立春歲序；原文未定義公曆UTC界，這是明示的曆法政策。 */
(function(root){'use strict';
 const G='甲乙丙丁戊己庚辛壬癸',B='子丑寅卯辰巳午未申酉戌亥',E=['木','火','土','金','水'],H={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'},mod=(n,m)=>(n%m+m)%m;
 const cycle=Array.from({length:60},(_,i)=>G[i%10]+B[i%12]),source='https://www.laoziliao.net/gu/jie/info/13068';
 function god(dm,g){const a=G.indexOf(dm),b=G.indexOf(g);return [['比肩','劫財'],['食神','傷官'],['偏財','正財'],['七殺','正官'],['偏印','正印']][mod(Math.floor(b/2)-Math.floor(a/2),5)][mod(a-b,2)];}
 function relations(gz,c){return Object.entries(c.pillars).map(([pillar,p])=>({pillar,stemRelation:['比和','生','克','受克','受生'][mod(Math.floor(G.indexOf(p.gan)/2)-Math.floor(G.indexOf(gz[0])/2),5)],stemCombine:Math.abs(G.indexOf(gz[0])-G.indexOf(p.gan))===5,branchSame:gz[1]===p.zhi,branchClash:mod(B.indexOf(gz[1])-B.indexOf(p.zhi),12)===6,branchCombine:['子丑','寅亥','卯戌','辰酉','巳申','午未'].some(x=>x.includes(gz[1])&&x.includes(p.zhi)&&gz[1]!==p.zhi),branchHarm:['子未','丑午','寅巳','卯辰','申亥','酉戌'].some(x=>x.includes(gz[1])&&x.includes(p.zhi)&&gz[1]!==p.zhi)}));}
 function compute(c,count=120){
  if(c.birthTimeUnknown)return {status:'insufficient-data',missing:['confirmed-hour-pillar'],periods:[],source};
  if(!Number.isInteger(count)||count<1||count>150)throw Error('小運歲數必須為1至150');
  const hour=cycle.indexOf(c.pillars.hour.gan+c.pillars.hour.zhi),male=c.gender==='male',female=c.gender==='female',birth=Date.parse(c.calculationPolicy.birthInstant),gy=G.indexOf(c.pillars.year.gan);
  if(hour<0||(!male&&!female)||!Number.isFinite(birth))throw Error('小運需要已核對的時柱、性別與出生瞬間');
  const birthCivilYear=new Date(birth).getUTCFullYear(),li=y=>{const x=root.BaziCalendarCore?.getLiChun(y);if(!x)throw Error('小運立春曆法元件未載入');return x.instantTimestamp;},birthYear=birth<li(birthCivilYear)?birthCivilYear-1:birthCivilYear,dir=(male&&gy%2===0||female&&gy%2===1)?1:-1,reference=Date.parse(c.calculationPolicy.referenceInstant);
  const detail=gz=>({gz,god:god(c.dm,gz[0]),hidden:Array.from(H[gz[1]]).map(stem=>({stem,god:god(c.dm,stem)})),connections:relations(gz,c)});
  const periods=Array.from({length:count},(_,i)=>{const age=i+1,year=birthYear+i,start=Math.max(birth,li(year)),end=li(year+1),gz=cycle[mod(hour+dir*age,60)],fixed=cycle[mod(cycle.indexOf(male?'丙寅':'壬申')+(male?1:-1)*i,60)];return {year,age,ageKind:'立春歲序，出生為1',window:{start:new Date(start).toISOString(),endExclusive:new Date(end).toISOString()},...detail(gz),alternativeFixedSex:detail(fixed),annual:cycle[mod(year-4,60)],isCurrent:reference>=start&&reference<end};});
  return {version:'20261003xiaoyun1',status:'calculated',profile:'SANMING_ZUIXINGZI_HOUR_YEAR_DIRECTION',direction:dir,birthSolarYear:birthYear,hourPillar:cycle[hour],periods,current:periods.find(p=>p.isCurrent)||null,source,alternativeProfile:'SANMING_ANCIENT_MALE_BINGYIN_FEMALE_RENSHEN',policy:'時柱法：陽男陰女順、陰男陽女逆，出生一歲即進／退一位，每歲一位；固定起法男丙寅順、女壬申逆另列，不混投票。大運交接不停止小運；歲序按本引擎立春UTC半開區間，不冒稱原典唯一換歲日。只給干支十神及原局作用，不以小運單獨判吉凶。'};
 }
 root.JYBaziXiaoyun=Object.freeze({compute,god,relations,version:'20261003xiaoyun1'});
})(typeof window==='undefined'?globalThis:window);
