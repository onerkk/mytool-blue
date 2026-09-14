/* Actual zodiac/cusp geometry, shared by the result and the 3D instrument. */
(function(root){
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function wheel(chart,{selected='Sun',interactive=true,id='wx-wheel',light=false,margin=0,centerLabel=null}={}){
  const E=root.JYWestern,origin=chart.houses?.angles.ASC||0,p=(lon,r)=>{const t=(180+lon-origin)*Math.PI/180;return [300+r*Math.cos(t),300-r*Math.sin(t)];},xy=a=>a.map(x=>x.toFixed(3)).join(','),gold=light?'#987039':'#cfaf72',ink=light?'#4c3b29':'#eee1c3';
  const line=(a,b,color,width=1)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+color+'" stroke-width="'+width+'"/>',text=(s,a,size,color=ink,more='')=>'<text x="'+a[0]+'" y="'+a[1]+'" fill="'+color+'" font-size="'+size+'" text-anchor="middle" dominant-baseline="central" '+more+'>'+esc(s)+'</text>';
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(-margin)+' '+(-margin)+' '+(600+2*margin)+' '+(600+2*margin)+'" class="wx-chart-svg" role="img" aria-label="回歸黃道西洋星盤" style="font-family:Georgia,serif"><defs><radialGradient id="'+id+'-face"><stop stop-color="'+(light?'#fbf2db':'#192b44')+'"/><stop offset="1" stop-color="'+(light?'#ddcba8':'#091624')+'"/></radialGradient></defs><circle cx="300" cy="300" r="289" fill="url(#'+id+'-face)" stroke="'+gold+'" stroke-width="3"/>';
  for(const r of [283,278,239,226,177,131])s+='<circle cx="300" cy="300" r="'+r+'" stroke="'+gold+'" stroke-opacity=".65" fill="none" stroke-width="'+(r===239?1.5:.7)+'"/>';
  for(let i=0;i<360;i++)s+=line(p(i,278),p(i,i%30===0?266:i%5===0?271:275),gold,i%30===0?1.4:.6);
  for(let i=0;i<12;i++){s+=line(p(i*30,239),p(i*30,278),gold);s+=text(E.GLYPHS[i],p(i*30+15,257),25,['#d4a186','#c4b991','#9dbcc9','#9cbab9'][i%4]);}
  if(chart.houses)chart.houses.cusps.forEach((c,i)=>{const next=chart.houses.cusps[(i+1)%12],mid=c+E.norm(next-c)/2,a=p(c,131),b=p(c,239);s+='<g'+(interactive?' data-wx-house="'+(i+1)+'" role="button" tabindex="0" aria-label="查看第 '+(i+1)+' 宮"':'')+'>';s+='<path d="M'+xy(p(c,133))+'L'+xy(p(c,224))+'A224,224 0 0,0 '+xy(p(next,224))+'L'+xy(p(next,133))+'A133,133 0 0,1 '+xy(p(c,133))+'" fill="transparent"/>';s+=line(a,b,i%3===0?gold:gold+'88',i%3===0?1.5:.7);s+=text(i+1,p(mid,151),15,gold);s+='</g>';});
  const isPlanet=k=>E.KEYS.includes(k),relevant=chart.aspects.filter(a=>isPlanet(a.a)&&isPlanet(a.b)&&(!selected||a.a===selected||a.b===selected));
  for(const a of relevant)s+=line(p(chart.planets[a.a].longitude,129),p(chart.planets[a.b].longitude,129),[90,180].includes(a.angle)?'#bc7876':a.angle===0?gold:'#7ca7b8',selected?1.6:.8);
  const sorted=Object.values(chart.planets).sort((a,b)=>a.longitude-b.longitude),placed=[];
  for(const b of sorted){let lane=0;while(placed.some(q=>q.lane===lane&&Math.abs(E.diff(q.longitude,b.longitude))<11)&&lane<3)lane++;placed.push({longitude:b.longitude,lane});const pos=p(b.longitude,213-lane*22),anchor=p(b.longitude,233),active=b.key===selected;
   s+='<g'+(interactive?' data-wx-planet="'+b.key+'" role="button" tabindex="0" aria-label="查看'+b.name+' '+b.signName+'"':'')+'>'+line(anchor,pos,gold,.7)+'<circle cx="'+pos[0]+'" cy="'+pos[1]+'" r="13" fill="'+(active?'#a77c3a':light?'#eadcbd':'#14283d')+'" stroke="'+(active?'#f8dca5':gold)+'" stroke-width="'+(active?'1.8':'.65')+'"/>'+text(b.symbol,pos,20,active?'#fff1cf':ink)+'</g>';
  }
  s+=text('✦',[300,288],24,gold)+text(centerLabel===null?(chart.sensitivity.unknownTime?'星位參考':'NATAL'):centerLabel,[300,316],11,gold,'letter-spacing="3"');
  if(chart.houses)for(const k of ['ASC','MC','DSC','IC']){const lon=chart.houses.angles[k];s+=line(p(lon,282),p(lon,292),gold,2);s+=text(k,p(lon,299),10,gold);}
  return s+'</svg>';
 }
 root.JYWesternChart=Object.freeze({wheel});
})(globalThis);
