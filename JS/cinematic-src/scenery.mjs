import * as T from 'three';
import {clamp,ease} from './choreography.mjs';

// Physical set pieces. These symbols describe a room, never a calculated chart.
export function buildScenery({kind,rig,keep,gold,accent,reduced}){
 const world=new T.Group();rig.add(world);
 const moving=[],gates=[],lights=[];
 const enamel=keep(new T.MeshStandardMaterial({color:kind==='lenormand'?'#153a30':kind==='oracle'?'#361d23':'#142132',metalness:.7,roughness:.32}));
 const glow=keep(new T.MeshBasicMaterial({color:accent,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending}));
 function mesh(geometry,mat=gold,parent=world){const node=new T.Mesh(keep(geometry),mat);parent.add(node);return node;}
 function torus(radius,parent=world,width=.018){return mesh(new T.TorusGeometry(radius,width,6,64),gold,parent);}
 function lantern(x,y,z,i){
  const group=new T.Group();group.position.set(x,y,z);world.add(group);
  mesh(new T.CylinderGeometry(.13,.19,.4,6),enamel,group);
  for(const h of [-.22,.22]){const ring=mesh(new T.CylinderGeometry(.21,.21,.045,6),gold,group);ring.position.y=h;}
  const core=mesh(new T.OctahedronGeometry(.10),glow,group);core.position.z=.15;
  moving.push({node:group,type:'lantern',index:i,y:y});lights.push(core);
 }
 function gate(x,z,width,height,index){
  for(const side of [-1,1]){
   const hinge=new T.Group();hinge.position.set(x+side*width/2,-2.4,z);world.add(hinge);
   const leaf=new T.Group();leaf.position.set(-side*width/4,height/2,0);hinge.add(leaf);
   const panel=mesh(new T.BoxGeometry(width/2,height,.09),enamel,leaf);
   const trim=new T.LineSegments(keep(new T.EdgesGeometry(panel.geometry)),keep(new T.LineBasicMaterial({color:'#e2bd7c',transparent:true,opacity:.8})));leaf.add(trim);
   for(let j=0;j<3;j++){const arch=torus(width*(.11+j*.022),leaf,.006);arch.scale.y=1.8;arch.position.z=.057;}
   for(const y of [-height*.34,height*.34]){const stud=mesh(new T.OctahedronGeometry(.045),gold,leaf);stud.position.set(0,y,.09);}
   gates.push({node:hinge,side,index});
  }
 }
 // A real foreground threshold creates parallax during the entrance dolly.
 if(kind==='tarot'){
  gate(0,2.3,3.7,5.6,0);for(let i=0;i<4;i++)lantern(i%2?2.25:-2.25,.2-i*.22,-.4-Math.floor(i/2)*1.5,i);
 }
 if(kind==='ootk'){
  for(let i=0;i<5;i++){gate(0,.7-i*1.8,3.8-i*.10,5.5,i);const ring=torus(.13,world);ring.position.set(0,1.8,.9-i*1.8);}
 }
 if(kind==='bazi'){
  for(let i=0;i<4;i++){
   const dial=new T.Group();dial.position.set((i-1.5)*1.12,.15,-1.5-Math.abs(i-1.5)*.55);world.add(dial);
   torus(.49,dial);torus(.42,dial,.006);
   for(let j=0;j<12;j++){const a=j*Math.PI/6,tick=mesh(new T.BoxGeometry(.012,.04,.015),gold,dial);tick.position.set(Math.sin(a)*.46,Math.cos(a)*.46,0);tick.rotation.z=-a;}
   const hand=mesh(new T.BoxGeometry(.012,.38,.018),gold,dial);hand.position.y=.15;moving.push({node:dial,type:'dial',index:i});
  }
 }
 if(kind==='compat'){
  for(let i=0;i<2;i++){
   const group=new T.Group();group.position.set(i?1.65:-1.65,.1,-1.7);world.add(group);
   for(let j=0;j<3;j++){const ring=torus(.72+j*.045,group,.009);ring.rotation.y=j*.25;}
   moving.push({node:group,type:'twin',index:i});
  }
 }
 if(kind==='ziwei'){
  const nodes=[];
  for(let i=0;i<36;i++){
   const a=i*2.399963,z=-3-(i%4)*.6,node=mesh(new T.OctahedronGeometry(i%3?.022:.04),glow);
   node.position.set(Math.sin(a)*(1.9+i%3*.3),Math.cos(a)*(2.1+i%5*.08),z);nodes.push(node.position.clone());lights.push(node);
  }
  const line=new T.LineSegments(keep(new T.BufferGeometry().setFromPoints(nodes)),keep(new T.LineBasicMaterial({color:accent,transparent:true,opacity:.12})));world.add(line);
  for(let i=0;i<3;i++){const ring=torus(2.4+i*.32,world,.006);ring.position.z=-3-i*.5;ring.rotation.x=i*.19;moving.push({node:ring,type:'sky',index:i});}
 }
 if(kind==='meihua'||kind==='lenormand'){
  for(const side of [-1,1]){
   const branch=mesh(new T.CylinderGeometry(.022,.045,3.1,7),enamel);branch.position.set(side*2.0,-.1,-.8);branch.rotation.z=side*-.3;
   for(let i=0;i<9;i++){
    const flower=new T.Group();flower.position.set(side*(1.48+i*.075),.05+i*.2,-.65+(i%3)*.1);world.add(flower);
    for(let p=0;p<5;p++){const petal=mesh(new T.SphereGeometry(.08,8,6),kind==='meihua'?glow:gold,flower);petal.scale.set(.6,1,.25);petal.position.set(Math.cos(p*Math.PI*.4)*.085,Math.sin(p*Math.PI*.4)*.085,0);petal.rotation.z=p*Math.PI*.4;}
    moving.push({node:flower,type:'flower',index:i+ (side>0?9:0),x:flower.position.x,y:flower.position.y,z:flower.position.z});
   }
  }
  if(kind==='lenormand')for(let i=0;i<4;i++)lantern(i%2?1.75:-1.75,1.4-Math.floor(i/2)*1.0,-1.6,i);
 }
 if(kind==='oracle'){
  for(let i=0;i<6;i++)lantern(i%2?1.6:-1.6,1.4-Math.floor(i/2)*.8,-1-Math.floor(i/2)*1.2,i);
  const altar=mesh(new T.BoxGeometry(3.4,.11,1.3),enamel);altar.position.set(0,-2.0,.35);
  for(const side of [-1,1]){const stem=mesh(new T.CylinderGeometry(.025,.025,.7,8),gold);stem.position.set(side*1.36,-1.6,.35);const flame=mesh(new T.OctahedronGeometry(.08),glow);flame.position.set(side*1.36,-1.19,.35);flame.scale.y=1.8;lights.push(flame);}
 }
 return {update(state){
  const t=reduced?0:state.time,enter=reduced?1:ease(state.since/2.6),energy=state.phase>=2?1:state.power;
  gates.forEach(g=>{const opened=state.phase===0?enter:1;g.node.rotation.y=g.side*(.13+opened*1.30);if(kind==='ootk')g.node.visible=g.index>=(state.operation||0);});
  moving.forEach(item=>{const n=item.node;
   if(item.type==='lantern'){n.rotation.z=reduced?0:Math.sin(t*.7+item.index)*.075;n.position.y=item.y+(reduced?0:Math.sin(t*.6+item.index)*.035);}
   if(item.type==='dial'){n.rotation.z=(reduced?0:t*.07*(item.index%2?-1:1))+energy*(item.index+1)*.15;n.scale.setScalar(1+((state.lit||0)>item.index?.13:0));}
   if(item.type==='sky')n.rotation.z=t*.02*(item.index%2?-1:1);
   if(item.type==='twin'){n.rotation.y=Math.sin(t*.3+item.index)*.14;n.scale.setScalar(1+energy*.12);}
   if(item.type==='flower'){
    const fall=state.phase===2&&!reduced?clamp((state.since-item.index*.12)/4):0;
    n.position.set(item.x+Math.sin(t*.7+item.index)*.025+fall*Math.sin(item.index)*.6,item.y-fall*2.8,item.z+fall*.7);
    n.rotation.z=reduced?0:Math.sin(t*.4+item.index)*.14+fall*2;n.scale.setScalar(1-fall*.65);
   }
  });
  glow.opacity=.4+energy*.26+(reduced?0:Math.sin(t*.6)*.04);
 }};
}
