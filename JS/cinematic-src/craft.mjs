import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Original, procedural ornament: no remote assets, video service or reading data.
// Shared textures and batched metalwork keep five pairs of doors practical on mobile.
export function buildCraft({keep,gold,accent,doc}){
 const cache=new Map();
 const material=p=>keep(new T.MeshPhysicalMaterial(p));
 function texture(type){
  let canvas,ctx;
  try{canvas=doc.createElement('canvas');canvas.width=512;canvas.height=type==='door'?1024:512;ctx=canvas.getContext('2d');}catch(e){return null;}
  if(!ctx||!ctx.createLinearGradient)return null;
  const w=canvas.width,h=canvas.height;
  const ground=ctx.createLinearGradient(0,0,w,h);ground.addColorStop(0,type==='wood'?'#684631':'#263344');ground.addColorStop(.48,type==='wood'?'#39281f':'#132335');ground.addColorStop(1,type==='wood'?'#77543a':'#30424d');ctx.fillStyle=ground;ctx.fillRect(0,0,w,h);
  // Fine woodgrain / mineral veins / woven enamel, deterministic and repeatable.
  for(let i=0;i<150;i++){
   ctx.beginPath();const y=i*h/150;ctx.moveTo(0,y);
   for(let x=0;x<=w;x+=8)ctx.lineTo(x,y+Math.sin(x*.013+i*.83)*(type==='wood'?2.5:7)+Math.sin(x*.051+i)*1.8);
   ctx.strokeStyle=i%5?'rgba(229,206,154,.034)':'rgba(244,213,158,.12)';ctx.lineWidth=i%5?.6:1.1;ctx.stroke();
  }
  if(type!=='wood'){
   const foil=ctx.createLinearGradient(0,0,w,h);foil.addColorStop(0,'#897045');foil.addColorStop(.28,'#efdcb1');foil.addColorStop(.52,'#ab8450');foil.addColorStop(.78,'#f5dfaa');foil.addColorStop(1,'#a17e48');ctx.strokeStyle=foil;
   for(const margin of [17,23,38]){ctx.lineWidth=margin===23?2:1;ctx.strokeRect(margin,margin,w-margin*2,h-margin*2);}
   function scroll(x,y,sx,sy){
    ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);ctx.lineWidth=1.35;
    for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(60,18,16,98,76,104);ctx.bezierCurveTo(122,102,106,45,83,67);ctx.bezierCurveTo(67,88,95,89,94,75);ctx.stroke();ctx.translate(15,16);ctx.scale(.77,.77);}
    for(let i=0;i<7;i++){const a=i*.19,x=42+Math.sin(a)*22,y=28+i*9;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+17,y-17,x+31,y+3,x+3,y+4);ctx.stroke();}
    ctx.restore();
   }
   scroll(42,42,1,1);scroll(w-42,42,-1,1);scroll(42,h-42,1,-1);scroll(w-42,h-42,-1,-1);
   if(type==='door'){
    // Arabesque lattice, intentionally not an astrological chart.
    ctx.save();ctx.globalAlpha=.24;ctx.lineWidth=.7;
    for(let y=185;y<h-160;y+=42)for(let x=72;x<w-50;x+=42){ctx.beginPath();ctx.moveTo(x,y-21);ctx.bezierCurveTo(x+28,y-8,x+28,y+8,x,y+21);ctx.bezierCurveTo(x-28,y+8,x-28,y-8,x,y-21);ctx.stroke();}
    ctx.restore();
    for(const y of [h*.30,h*.70]){ctx.beginPath();ctx.moveTo(w*.3,y);ctx.bezierCurveTo(w*.45,y-45,w*.55,y-45,w*.7,y);ctx.bezierCurveTo(w*.55,y+45,w*.45,y+45,w*.3,y);ctx.stroke();}
   }else{
    ctx.globalAlpha=.38;ctx.lineWidth=.8;
    for(let i=0;i<24;i++){const x=60+i*17;ctx.beginPath();ctx.moveTo(x,42);ctx.lineTo(x+6,49);ctx.lineTo(x,56);ctx.lineTo(x-6,49);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(x,h-42);ctx.lineTo(x+6,h-49);ctx.lineTo(x,h-56);ctx.lineTo(x-6,h-49);ctx.closePath();ctx.stroke();}
   }
  }
  const map=keep(new T.CanvasTexture(canvas));map.colorSpace=T.SRGBColorSpace;map.anisotropy=2;map.name='jy-'+type+'-engraving';return map;
 }
 const doorMap=texture('door'),stoneMap=texture('stone'),woodMap=texture('wood');
 const enamel=material({color:'#536777',map:doorMap,metalness:.3,roughness:.34,clearcoat:.8,clearcoatRoughness:.18,emissive:'#203548',emissiveIntensity:.13});
 const stone=material({color:'#556c70',map:stoneMap,metalness:.16,roughness:.36,clearcoat:.6});
 const wood=material({color:'#bda48a',map:woodMap,metalness:.04,roughness:.48,clearcoat:.45});
 const bronze=material({color:'#796044',metalness:.62,roughness:.34});
 const ivory=material({color:'#d7c6a0',metalness:.3,roughness:.38});
 const jewel=material({color:accent,metalness:.2,roughness:.14,clearcoat:1,emissive:accent,emissiveIntensity:.12});
 function geo(key,create){if(!cache.has(key))cache.set(key,keep(create()));return cache.get(key);}
 function mesh(g,m,parent){const n=new T.Mesh(g,m);parent.add(n);return n;}
 function slab(w,h,d,cut=.12){
  return geo(['slab',w,h,d,cut].join(':'),()=>{
   const x=w/2,y=h/2,c=Math.min(cut,x/3,y/3),s=new T.Shape();
   s.moveTo(-x+c,-y);s.lineTo(x-c,-y);s.lineTo(x,-y+c);s.lineTo(x,y-c);s.lineTo(x-c,y);s.lineTo(-x+c,y);s.lineTo(-x,y-c);s.lineTo(-x,-y+c);s.closePath();
   const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.014,bevelSize:.016,bevelSegments:2,steps:1});g.translate(0,0,-d/2);
   // Local [0..1] UVs put the complete engraving on each face.
   const pos=g.attributes.position,uv=g.attributes.uv;
   for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+x)/w,(pos.getY(i)+y)/h);
   return g;
  });
 }
 function rod(a,b,r,parent,mat=gold){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
  const n=mesh(geo('rod:'+r+':'+delta.length().toFixed(4),()=>new T.CylinderGeometry(r,r,delta.length(),8)),mat,parent);
  n.position.copy(start.add(end).multiplyScalar(.5));n.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return n;
 }
 function curve(points,r,parent,mat=gold){return mesh(keep(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,6,false)),mat,parent);}
 function gem(parent,x,y,z,size=.04){const g=mesh(geo('gem:'+size,()=>new T.OctahedronGeometry(size)),jewel,parent);g.position.set(x,y,z);return g;}
 function batch(group){
  // Build pieces at the origin, then combine by material before positioning them.
  group.updateMatrixWorld(true);const buckets=new Map();
  group.traverse(n=>{if(n.isMesh){if(!buckets.has(n.material))buckets.set(n.material,[]);let g=n.geometry.clone();if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}g.applyMatrix4(n.matrixWorld);buckets.get(n.material).push(g);}});
  const merged=[];
  for(const [mat,parts] of buckets){const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(g)merged.push(new T.Mesh(keep(g),mat));else return group;}
  group.clear();merged.forEach(n=>group.add(n));return group;
 }
 function door(w,h){
  const g=new T.Group();g.name='carved-door-leaf';
  mesh(slab(w,h,.16,.10),bronze,g);
  mesh(slab(w-.06,h-.07,.105,.12),gold,g).position.z=.065;
  mesh(slab(w-.15,h-.17,.10,.16),enamel,g).position.z=.10;
  // A recessed arch surrounded by a sculpted, raised frame.
  mesh(slab(w*.69,h*.68,.052,.28),bronze,g).position.z=.168;
  mesh(slab(w*.63,h*.65,.035,.29),enamel,g).position.z=.20;
  for(const side of [-1,1]){
   rod([side*w*.41,-h*.43,.175],[side*w*.41,h*.43,.175],.017,g);
   for(const sy of [-1,1]){
    const x=side*w*.30,y=sy*h*.35;
    curve([[x,y,.23],[x-side*.22,y-sy*.12,.26],[x-side*.25,y-sy*.34,.25],[x-side*.06,y-sy*.36,.22]],.012,g);
    gem(g,side*w*.39,sy*h*.41,.21,.048);
    mesh(slab(w*.53,.08,.025,.03),gold,g).position.set(0,sy*h*.28,.24);
   }
  }
  // A dimensional moon cameo, collar and hanging handle.
  const disc=geo('cameo',()=>new T.CylinderGeometry(.24,.27,.07,40));
  const cameo=mesh(disc,gold,g);cameo.rotation.x=Math.PI/2;cameo.position.z=.27;
  const inset=mesh(geo('cameo-inset',()=>new T.SphereGeometry(.211,24,14)),enamel,g);inset.scale.z=.20;inset.position.z=.326;
  const moon=mesh(geo('moon',()=>new T.SphereGeometry(.123,24,14)),ivory,g);moon.scale.z=.25;moon.position.set(-.018,0,.365);
  const shade=mesh(geo('moon-shade',()=>new T.SphereGeometry(.110,24,14)),enamel,g);shade.scale.z=.3;shade.position.set(.038,.025,.379);
  const handle=mesh(geo('handle',()=>new T.TorusGeometry(.071,.014,8,28)),gold,g);handle.position.set(w*.31,-.18,.235);
  for(const y of [-h*.36,0,h*.36]){const hinge=mesh(geo('hinge',()=>new T.CylinderGeometry(.028,.038,.21,10)),gold,g);hinge.position.set(-w*.48,y,.04);}
  return batch(g);
 }
 function table(parent){
  const g=new T.Group();g.name='inlaid-reading-table';
  function layer(w,d,thick,y,mat){const n=mesh(slab(w,d,thick,.24),mat,g);n.rotation.x=-Math.PI/2;n.position.y=y;}
  layer(2.79,1.63,.16,-.78,bronze);layer(2.84,1.68,.045,-.69,gold);layer(2.71,1.54,.055,-.654,stone);layer(2.55,1.40,.013,-.612,enamel);
  for(const side of [-1,1])for(const end of [-1,1]){
   gem(g,side*1.20,-.613,end*.53,.065);
   rod([side*1.06,-.83,end*.43],[side*.92,-1.05,end*.37],.048,g,bronze);
   rod([side*1.06,-.83,end*.43],[side*.92,-1.05,end*.37],.012,g,gold);
  }
  batch(g);parent.add(g);return g;
 }
 function cup(parent){
  const profile=[[.235,-.59],[.29,-.59],[.30,-.56],[.28,-.51],[.29,-.04],[.34,.065],[.34,.10],[.29,.10],[.26,.045],[.235,-.52]].map(p=>new T.Vector2(...p));
  const n=mesh(keep(new T.LatheGeometry(profile,48)),wood,parent);n.name='carved-oracle-vessel';
  for(const y of [-.53,-.47,.06]){const band=mesh(geo('cup-band:'+y,()=>new T.TorusGeometry(y>0?.32:.288,.012,8,48)),gold,parent);band.rotation.x=Math.PI/2;band.position.y=y;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([Math.sin(a)*.288,-.45,Math.cos(a)*.288],[Math.sin(a)*.31,.045,Math.cos(a)*.31],.007,parent);}
  return n;
 }
 function decoratePillar(parent){
  const body=mesh(geo('jade-pillar',()=>new T.LatheGeometry([[.13,-.41],[.18,-.40],[.18,-.35],[.147,-.31],[.147,.30],[.18,.35],[.18,.40],[.13,.43]].map(p=>new T.Vector2(...p)),32)),stone,parent);body.name='engraved-jade-column';
  for(const y of [-.38,-.29,.29,.38]){const c=mesh(geo('pillar-collar',()=>new T.TorusGeometry(.168,.013,8,32)),gold,parent);c.rotation.x=Math.PI/2;c.position.y=y;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;gem(parent,Math.sin(a)*.153,0,Math.cos(a)*.153,.025);}
 }
 function pillarCrown(parent){
  // A faceted jewel in an open, raised setting. Batch the fixed metalwork;
  // keep the jewel separate for the existing light/rotation choreography.
  const setting=new T.Group();setting.name='filigree-time-crown';
  for(const [r,y] of [[.18,.46],[.15,.50],[.105,.56]]){
   const collar=mesh(geo('crown-collar:'+r,()=>new T.TorusGeometry(r,.011,8,32)),gold,setting);collar.rotation.x=Math.PI/2;collar.position.y=y;
  }
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3,s=Math.sin(a),c=Math.cos(a);
   curve([[s*.17,.46,c*.17],[s*.20,.52,c*.20],[s*.145,.63,c*.145],[s*.115,.68,c*.115]],.009,setting);
   gem(setting,s*.182,.51,c*.182,.022);
  }
  const halo=mesh(geo('crown-halo',()=>new T.TorusGeometry(.245,.006,6,48)),gold,setting);halo.position.set(0,.67,-.055);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const n=mesh(geo('crown-bead',()=>new T.SphereGeometry(.012,6,4)),ivory,setting);n.position.set(Math.sin(a)*.245,.67+Math.cos(a)*.245,-.055);}
  batch(setting);parent.add(setting);
  const cut=geo('time-crystal',()=>{
   const g=new T.LatheGeometry([[0,-.15],[.13,-.035],[.13,.025],[.078,.105],[0,.14]].map(p=>new T.Vector2(...p)),8);
   const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();return flat;
  });
  const crystal=mesh(cut,jewel,parent);crystal.position.y=.66;crystal.name='cut-time-crystal';return crystal;
 }
 function bezel(parent,radius){
  const g=new T.Group();g.name='engraved-armillary-band';
  const belt=mesh(geo('belt:'+radius,()=>new T.CylinderGeometry(radius,radius,.047,64,1,true)),bronze,g);belt.rotation.x=Math.PI/2;
  for(const z of [-.03,.03])mesh(geo('bezel:'+radius,()=>new T.TorusGeometry(radius,.012,8,64)),gold,g).position.z=z;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;const tick=mesh(geo('bezel-tick',()=>new T.BoxGeometry(.012,.044,.06)),i%3?gold:ivory,g);tick.position.set(Math.sin(a)*radius,Math.cos(a)*radius,0);tick.rotation.z=-a;}
  batch(g);parent.add(g);return g;
 }
 function petal(parent){
  const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(-.18,.13,-.17,.39,0,.43);s.bezierCurveTo(.17,.39,.18,.13,0,0);
  const g=geo('petal',()=>{const g=new T.ExtrudeGeometry(s,{depth:.013,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2,steps:1,curveSegments:12});const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+Math.pow(p.getY(i),2)*.25);g.computeVertexNormals();return g;});
  return mesh(g,jewel,parent);
 }
 return {door,table,cup,decoratePillar,pillarCrown,bezel,petal,rod,curve,gem,wood,stone,enamel,bronze,ivory,jewel};
}
