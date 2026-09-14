/* Presentation transforms only. Native chart values never enter a camera formula. */
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a+(b-a)*t;
export const DURATION=14500;
export function motion(progress,aspect=.5,turn=0){
 const p=clamp(progress),base=aspect<.72?12.0:8.8;
 const frames=[
  [0,[.85,1.25,base+5.8],[0,.8,0]],
  [.24,[-.7,1.05,base],[0,.7,0]],
  [.48,[-2.8,2.9,base-.7],[0,1.0,0]],
  [.73,[3.6,2.15,base-.25],[0,1.0,0]],
  [1,[2.9,3.15,base-.35],[0,1.05,0]]
 ];
 let k=0;while(k<frames.length-2&&p>frames[k+1][0])k++;
 const a=frames[k],b=frames[k+1],u=ease((p-a[0])/(b[0]-a[0]));
 return {progress:p,chapter:p<.24?'arrival':p<.49?'awakening':p<.76?'alignment':'revelation',
  camera:a[1].map((v,i)=>mix(v,b[1][i],u)+(i===0?turn*.35:0)),target:a[2].map((v,i)=>mix(v,b[2][i],u)),
  gateZ:base+1.2,gateOpen:ease((p-.018)/.19),lift:ease((p-.21)/.28),
  orbit:ease((p-.44)/.32),reveal:ease((p-.74)/.25),
  tileRise:Array.from({length:12},(_,i)=>ease((p-.755-i*.012)/.105)),
  orbitTurns:[p*1.1,-p*.85,p*.58],boardEuler:[-.24,-.25+clamp(turn,-.65,.65),.025]};
}
