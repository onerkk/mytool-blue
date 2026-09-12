/* Real 3D target transforms. Values are presentation only, never divination data. */
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function cardPose(index,count,state){
 const middle=(count-1)/2,i=index-middle,t=state.time||0,p=clamp(state.power||0),phase=state.phase||0;
 let x=i*.145,y=-.55-Math.abs(i)*.016,z=.25-Math.abs(i)*.035,rx=-.08,ry=0,rz=-i*.07;
 if(phase===0){x=i*.018;y=-.55+index*.007;z=.15+index*.017;rx=-.08;ry=-.4;rz=-.1;}
 if(phase===1){x=x*(1-p)+i*.011*p;y=y*(1-p)+(-.35+index*.008)*p;ry=.5*p;}
 if(phase===2){
  const u=clamp((state.since||0)/2.2),split=Math.sin(u*Math.PI*2),fan=ease((u-.5)*2);
  x=(index%2?1:-1)*.7*split*(1-fan)+i*.19*fan;y=-.38+Math.sin(u*Math.PI)*.45-Math.abs(i)*.025*fan;z=.2+index*.01;ry=Math.sin(u*Math.PI*2)*.7;rz=-i*.1*fan;
 }
 if(phase>=3){x=i*.19;y=-.48-Math.abs(i)*.02;z=.35-Math.abs(i)*.035;rz=-i*.1;}
 y+=Math.sin(t*1.05+index*.25)*.006;
 return {x,y,z,rx,ry,rz};
}
export function actorPose(phase){return phase===0?0:phase===1?1:phase===2?2:3;}
// A restrained camera move makes the instrument, architecture and actor occupy
// different depths. The return shot settles before the next user action.
export function cameraPose(kind,state,aspect=1){
 const phase=state.phase||0,u=ease((state.since||0)/2.65),p=clamp(state.power||0);
 const base=aspect<.62?8.15:7.2,active=phase===2;
 const handed=kind==='compat'?-1:kind==='meihua'?.65:1;
 return {x:active?Math.sin(u*Math.PI)*.42*handed:0,
  y:active?.2-Math.sin(u*Math.PI)*.16:.2,
  z:base-(active?.52*Math.sin(u*Math.PI):phase>=3?.24:phase===1?p*.1:0),
  targetY:phase===0?.02:-.12};
}
// Distinct, reversible motion for each instrument. A phase never changes data.
export function instrumentPose(type,index,state){
 const p=clamp(state.power||0),u=ease((state.since||0)/2.65),active=state.phase===2,
  settled=state.phase>=3,lit=(state.lit||0)>index,turn=clamp(state.turn||0,-2,2);
 if(type==='pillar')return {rise:(lit?.16:0)+(active?Math.sin(u*Math.PI)*.22:0),tilt:active?Math.sin(u*Math.PI)*(index-1.5)*.12:0,glow:lit?1:.12};
 if(type==='partner')return {radius:active?.66-.23*u:settled?.43:.66,angle:(index?1:-1)*(active?u*Math.PI*2:turn*.3),rise:active?Math.sin(u*Math.PI)*.3:0};
 if(type==='seed')return {spread:1+(active?Math.sin(u*Math.PI)*.65:p*.18),angle:turn*.55+(active?u*Math.PI*(index%2?1:-1):0),glow:active||settled?1:p};
 if(type==='stick')return {rise:active?(index===6?Math.sin(u*Math.PI)*.62:Math.sin(u*Math.PI)*(.08+index%4*.045)):0,tilt:turn*.12+(active?Math.sin(u*Math.PI*6)*.045:0)};
 if(type==='orbit')return {angle:turn*.4+(active?u*Math.PI*2*(index%2?-1:1):0),glow:active||settled?1:p};
 return {rise:0,tilt:0,glow:0};
}
export const CAST={
 tarot:{actor:'lunar-guide',speaker:'月見',role:'塔羅引路人',accent:'#ddbd81',chapter:'月下問心',lens:'把心事說清楚，再看見下一步。'},
 lenormand:{actor:'lunar-guide',speaker:'月見',role:'牌語引路人',accent:'#9ed9c4',chapter:'翡翠密語',lens:'讓具體的生活線索，彼此相連。'},
 bazi:{actor:'star-guide',speaker:'星衡',role:'四柱引路人',accent:'#e4c790',chapter:'時光長卷',lens:'從出生時刻，理解一路走來的自己。'},
 compat:{actor:'star-guide',speaker:'星衡',role:'關係引路人',accent:'#e5bbd2',chapter:'雙星相會',lens:'理解兩個人的差異，尋找相處的方法。'},
 ziwei:{actor:'star-guide',speaker:'星衡',role:'星圖引路人',accent:'#c5b9f0',chapter:'紫微星河',lens:'循著十二宮，看見人生的不同面向。'},
 meihua:{actor:'blossom-guide',speaker:'清和',role:'觀象引路人',accent:'#c4dfba',chapter:'一念花開',lens:'停在此刻，觀察事情如何變化。'},
 oracle:{actor:'blossom-guide',speaker:'清和',role:'靜心引路人',accent:'#f1d9b4',chapter:'月庭祈願',lens:'一次專注一件事，安定地往前走。'},
 ootk:{actor:'lunar-guide',speaker:'月見',role:'開鑰引路人',accent:'#cab5ed',chapter:'秘鑰之門',lens:'沿著五層程序，循序深入事件脈絡。'}
};
