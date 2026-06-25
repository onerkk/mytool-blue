/*! bazi-calendar-core.js — 八字曆法事實層 v1.0.0 (2026-06-25)
 * 依賴本地 JS/vendor/lunar.js（lunar-javascript 1.7.7）。
 * 僅處理：節氣四柱、換日政策、精確起運與立春界線；不判旺衰、喜忌或吉凶。
 */
(function(root){
  'use strict';
  var TG=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var DZ=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  function pad2(n){return String(n).padStart(2,'0');}
  function parts(s){return {year:s.getYear(),month:s.getMonth(),day:s.getDay(),hour:s.getHour(),minute:s.getMinute(),second:s.getSecond()};}
  function pseudoUtc(p){return Date.UTC(p.year,p.month-1,p.day,p.hour||0,p.minute||0,p.second||0);}
  function formatParts(p){return p.year+'-'+pad2(p.month)+'-'+pad2(p.day)+' '+pad2(p.hour||0)+':'+pad2(p.minute||0)+':'+pad2(p.second||0);}
  function splitGz(gz){return {gan:String(gz||'').charAt(0),zhi:String(gz||'').charAt(1)};}
  function hasEngine(){return typeof root.Solar!=='undefined'&&root.Solar&&typeof root.Solar.fromYmdHms==='function';}
  function getEightChar(y,m,d,h,mi,sec,mode){
    if(!hasEngine()) return null;
    var solar=root.Solar.fromYmdHms(y,m,d,h||0,mi||0,sec||0);
    var lunar=solar.getLunar();
    var ec=lunar.getEightChar();
    ec.setSect(mode==='ZI_HOUR_23'?1:2);
    return {solar:solar,lunar:lunar,eightChar:ec};
  }
  function calculateChart(input){
    input=input||{};
    var mode=input.dayBoundaryMode==='MIDNIGHT_00'?'MIDNIGHT_00':'ZI_HOUR_23';
    var ctx=getEightChar(input.year,input.month,input.day,input.hour,input.minute,input.second,mode);
    if(!ctx) return null;
    var ec=ctx.eightChar;
    var year=splitGz(ec.getYear()),month=splitGz(ec.getMonth()),day=splitGz(ec.getDay()),hour=splitGz(ec.getTime());
    // lunar-javascript 的 sect=2 仍沿用「晚子時時干按次日」口徑。
    // 本系統 MIDNIGHT_00 明確定義為日、時干都到 00:00 才換，故 23:00–23:59 重算時干。
    if(mode==='MIDNIGHT_00'&&(input.hour||0)>=23){
      var dgi=TG.indexOf(day.gan),hzi=0;
      hour={gan:TG[((dgi%5)*2+hzi)%10],zhi:'子'};
    }
    var prevJie=ctx.lunar.getPrevJie(),nextJie=ctx.lunar.getNextJie();
    return {
      pillars:{year:year,month:month,day:day,hour:hour},
      indices:{
        yearGan:TG.indexOf(year.gan),yearZhi:DZ.indexOf(year.zhi),
        monthGan:TG.indexOf(month.gan),monthZhi:DZ.indexOf(month.zhi),
        dayGan:TG.indexOf(day.gan),dayZhi:DZ.indexOf(day.zhi),
        hourGan:TG.indexOf(hour.gan),hourZhi:DZ.indexOf(hour.zhi)
      },
      previousJie:prevJie?{name:prevJie.getName(),date:prevJie.getSolar().toYmdHms()}:null,
      nextJie:nextJie?{name:nextJie.getName(),date:nextJie.getSolar().toYmdHms()}:null,
      engine:'lunar-javascript',engineVersion:'1.7.7',precision:'second',dayBoundaryMode:mode
    };
  }
  function calculateYun(input){
    input=input||{};
    var mode=input.dayBoundaryMode==='MIDNIGHT_00'?'MIDNIGHT_00':'ZI_HOUR_23';
    var ctx=getEightChar(input.year,input.month,input.day,input.hour,input.minute,input.second,mode);
    if(!ctx) return null;
    var gender=input.gender==='female'?0:1;
    var yun=ctx.eightChar.getYun(gender);
    var start=parts(yun.getStartSolar());
    var ref=yun.isForward()?ctx.lunar.getNextJie():ctx.lunar.getPrevJie();
    var cycles=[];
    yun.getDaYun(11).forEach(function(d){
      if(d.getIndex()===0)return;
      cycles.push({index:d.getIndex(),gz:d.getGanZhi(),startYear:d.getStartYear(),endYear:d.getEndYear(),startAge:d.getStartAge(),endAge:d.getEndAge()});
    });
    return {
      years:yun.getStartYear(),months:yun.getStartMonth(),days:yun.getStartDay(),hours:yun.getStartHour(),
      startTimestamp:pseudoUtc(start),startDate:formatParts(start),startParts:start,
      direction:yun.isForward()?'forward':'backward',isForward:yun.isForward(),
      referenceJie:ref?ref.getName():null,referenceJieDate:ref?ref.getSolar().toYmdHms():null,
      cycles:cycles,engine:'lunar-javascript',engineVersion:'1.7.7',precision:'second'
    };
  }
  function getLiChun(year){
    if(!hasEngine())return null;
    var lunar=root.Solar.fromYmdHms(year,2,1,12,0,0).getLunar();
    var table=lunar.getJieQiTable(),s=table['立春'];
    if(!s)return null;
    var p=parts(s);
    return {timestamp:pseudoUtc(p),date:formatParts(p),parts:p,engine:'lunar-javascript',precision:'second'};
  }
  root.BaziCalendarCore={
    version:'1.0.0',engine:'lunar-javascript',engineVersion:'1.7.7',
    hasEngine:hasEngine,calculateChart:calculateChart,calculateYun:calculateYun,getLiChun:getLiChun,
    formatParts:formatParts
  };
})(typeof window!=='undefined'?window:this);
