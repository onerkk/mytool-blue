/* Native-data adapter and the independent Navagraha palace renderer. */
import {createPalace} from './vedic-palace-scene.mjs';
import {motion,DURATION} from './vedic-cinema-motion.mjs';
const POS=[[0,.93],[-.96,1.48],[-1.48,.96],[-.93,0],[-1.48,-.96],[-.96,-1.48],[0,-.93],[.96,-1.48],[1.48,-.96],[.93,0],[1.48,.96],[.96,1.48]];
export function model(chart){
  const keys=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  return {nakshatra:chart.planets.Moon.nakshatra.index,lagna:chart.lagna?.sign??null,planets:keys.map((key,i)=>{
    const p=chart.planets[key],a=(90-p.longitude)*Math.PI/180,r=1.45+(i%3)*.22,house=p.house;
    const peers=keys.filter(k=>chart.planets[k].house===house),n=peers.indexOf(key),base=house?POS[house-1]:[Math.cos(a)*1.65,Math.sin(a)*1.65];
    return {key,longitude:p.longitude,house,sign:p.sign,ring:[Math.cos(a)*r,Math.sin(a)*r,.25+(i%3)*.09],target:[base[0]+(n-(peers.length-1)/2)*.18,base[1],.15]};
  })};
}
export const create=(host,chart)=>createPalace(host,chart,model(chart));
window.JYVedicScene=Object.freeze({create,model,motion,duration:DURATION});
