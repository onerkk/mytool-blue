import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createYarrow} from './yarrow-atelier.mjs';

// Real mesh geometry and local PBR lighting. No random values are used here.
const mix=(a,b,t)=>a+(b-a)*t,clamp=v=>Math.min(1,Math.max(0,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function create(host,kind){
 if(kind==='yarrow')return createYarrow(host);
 let disposed=false,raf=0,last=0,motion=null,visible=true,paused=false,contextLost=false,turn=0,target=0,drag=null,state={kind,values:[]};
 const resources=new Set(),keep=x=>(resources.add(x),x),scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,60);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.setClearColor('#080d15',0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');
 const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.42;room.dispose();pm.dispose();
 const body=new T.Group();scene.add(body);
 const mat=(color,metalness,roughness,extra={})=>keep(new T.MeshPhysicalMaterial({color,metalness,roughness,...extra}));
 const gold=mat('#ac7940',.88,.28),bright=mat('#ddba7e',.84,.23),copper=mat('#876e54',.8,.38),dark=mat(kind==='yarrow'?'#0d161a':'#062722',.12,.48,{clearcoat:.35}),rim=mat('#382617',.75,.42),paper=mat('#e7d8b5',.03,.86),ivory=mat('#bd955f',.08,.7),ink=mat('#172528',.18,.5);
 const mesh=(g,m,p=body,x=0,y=0,z=0)=>{const a=new T.Mesh(keep(g),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;p.add(a);return a;};
 const ring=(r,t,y,m=bright,p=body)=>{const a=mesh(new T.TorusGeometry(r,t,10,96),m,p,0,y,0);a.rotation.x=Math.PI/2;return a;};
 const cyl=(r,h,y,m=gold,p=body)=>mesh(new T.CylinderGeometry(r,r,h,96),m,p,0,y,0);
 const label=(text,w,h,color='#a9854a',size=78)=>{const c=document.createElement('canvas');c.width=text.length===1?256:512;c.height=256;const q=c.getContext('2d');q.fillStyle=color;q.font=`500 ${size}px "Noto Serif TC",serif`;q.textAlign='center';q.textBaseline='middle';q.fillText(text,c.width/2,130);const map=keep(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;return keep(new T.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.48,metalness:.2}));};
 // Fine radial machining on the real copper surface, not a painted coin image.
 const grain=document.createElement('canvas');grain.width=grain.height=512;const g=grain.getContext('2d');g.fillStyle='#999';g.fillRect(0,0,512,512);
 for(let i=0;i<280;i++){const r=25+i*.8;g.strokeStyle=i%4?'#858585':'#b0b0b0';g.lineWidth=.4;g.beginPath();g.arc(256,256,r,0,7);g.stroke();}
 const bump=keep(new T.CanvasTexture(grain));copper.bumpMap=bump;copper.bumpScale=.008;copper.roughnessMap=bump;
 scene.add(new T.HemisphereLight('#eaf5ff','#1b1007',.7));
 const key=new T.DirectionalLight('#fff0d9',2.3);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:25});key.shadow.bias=-.0006;key.shadow.normalBias=.025;scene.add(key);
 const fill=new T.DirectionalLight('#bdd8e7',.85);fill.position.set(4,4,-2);scene.add(fill);
 const warm=new T.PointLight('#ffdc9c',12,16);warm.position.set(1,3,4);scene.add(warm);
 const floor=mesh(new T.PlaneGeometry(16,16),keep(new T.ShadowMaterial({opacity:.38})),scene,0,-.47,0);floor.rotation.x=-Math.PI/2;
 const coins=[],sticks=[],bases=[];
 if(kind==='coins'){
   cyl(3.13,.18,-.30,rim);cyl(3.08,.10,-.17,bright);cyl(3.02,.17,-.08,gold);cyl(2.87,.13,.04,dark);ring(2.93,.075,.12);ring(3.10,.027,-.13);ring(2.67,.018,.111,gold);ring(1.93,.013,.111,gold);
   const rimPoints=[new T.Vector2(2.8,.10),new T.Vector2(2.90,.12),new T.Vector2(3.05,.24),new T.Vector2(3.12,.25),new T.Vector2(3.15,.18),new T.Vector2(3.14,.11)];mesh(new T.LatheGeometry(rimPoints,96),gold);ring(3.08,.025,.25,bright);
   for(let i=0;i<80;i++){const a=i*Math.PI/40,o=mesh(new T.BoxGeometry(.024,.018,i%10===0?.13:.07),bright,body,2.78*Math.sin(a),.121,2.78*Math.cos(a));o.rotation.y=a;}
   const bits=[7,3,5,1,0,4,2,6];bits.forEach((v,i)=>{const p=new T.Group(),a=i*Math.PI/4;body.add(p);p.position.set(2.29*Math.sin(a),.12,2.29*Math.cos(a));p.rotation.y=a;for(let j=0;j<3;j++){const yang=(v>>j)&1;for(const side of yang?[0]:[-1,1])mesh(new T.BoxGeometry(yang?.32:.135,.012,.03),gold,p,side*.094,0,(j-1)*.09);}});
   for(let i=0;i<3;i++){
     const p=new T.Group();p.scale.setScalar(1.17);body.add(p);coins.push(p);
     const shape=new T.Shape();shape.absarc(0,0,.72,0,Math.PI*2,false);const hole=new T.Path();hole.moveTo(-.18,-.18);hole.lineTo(-.18,.18);hole.lineTo(.18,.18);hole.lineTo(.18,-.18);hole.closePath();shape.holes.push(hole);
     const geo=new T.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelSegments:3,bevelSize:.018,bevelThickness:.016,curveSegments:80});geo.translate(0,0,-.0425);mesh(geo,copper,p);
     for(const sign of [-1,1]){
       for(const r of [.665,.695])mesh(new T.TorusGeometry(r,.013,8,80),bright,p,0,0,sign*.052);
       const face=new T.Group();p.add(face);face.position.z=sign*.060;if(sign<0)face.rotation.y=Math.PI;
       [['靜',0,.43],['月',0,-.43],['通',-.43,0],['寶',.43,0]].forEach(([ch,x,y])=>{const plate=mesh(new T.PlaneGeometry(.43,.43),label(sign>0?ch:'·',.4,.4,'#2e160b',185),face,x,y,.005);plate.receiveShadow=false;});
       for(const x of [-1,1]){mesh(new T.BoxGeometry(.012,.39,.012),bright,face,x*.201,0,0);mesh(new T.BoxGeometry(.39,.012,.012),bright,face,0,x*.201,0);}
       if(sign<0){const m=mesh(new T.TorusGeometry(.45,.022,8,64),gold,face);m.scale.y=.78;}
     }
     bases.push({x:(i-1)*1.47,z:i===1?-.45:.53,y:i===1?1.46:.95,rz:(i-1)*.22});
   }
 }else{
   const base=mesh(new T.BoxGeometry(6.4,.27,4.35),rim,body,0,-.25,0);mesh(new T.BoxGeometry(6.34,.048,4.29),bright,body,0,-.10,0);mesh(new T.BoxGeometry(6.20,.15,4.15),dark,body,0,0,0);
   for(const x of [-2.7,2.7])for(const z of [-1.65,1.65])mesh(new T.CylinderGeometry(.17,.24,.23,24),gold,body,x,-.45,z);
   const scroll=new T.Group();body.add(scroll);scroll.position.set(0,.11,.72);scroll.rotation.y=-.065;
   mesh(new T.BoxGeometry(5.4,.035,1.5),paper,scroll);for(const x of [-2.67,2.67]){const a=mesh(new T.CylinderGeometry(.13,.13,1.85,24),ivory,scroll,x,.10,0);a.rotation.x=Math.PI/2;for(const z of [-.97,.97]){const b=mesh(new T.CylinderGeometry(.16,.16,.10,24),gold,scroll,x,.1,z);b.rotation.x=Math.PI/2;}}
   const title=mesh(new T.PlaneGeometry(2.3,1.15),label('周 易',2.3,1.15,'#59452c',84),scroll,0,.035,0);title.rotation.x=-Math.PI/2;
   const book=new T.Group();body.add(book);book.position.set(0,1.62,-1.30);book.rotation.x=-.16;
   const sheet=new T.PlaneGeometry(4.5,2.65,40,6),positions=sheet.attributes.position;
   for(let i=0;i<positions.count;i++){const x=positions.getX(i);positions.setZ(i,Math.pow(Math.abs(x)/2.25,4)*.16);}sheet.computeVertexNormals();
   const page=document.createElement('canvas');page.width=1024;page.height=640;const pc=page.getContext('2d'),pg=pc.createLinearGradient(0,0,1024,0);pg.addColorStop(0,'#96855f');pg.addColorStop(.13,'#e1d2ac');pg.addColorStop(.45,'#f0e5c7');pg.addColorStop(.83,'#ded0aa');pg.addColorStop(1,'#93835f');pc.fillStyle=pg;pc.fillRect(0,0,1024,640);
   for(let i=0;i<1600;i++){pc.fillStyle=i%2?'#8367410d':'#fff4d210';pc.fillRect((i*79)%1024,(i*151)%640,1+(i%13),1);}
   pc.strokeStyle='#85704c';pc.lineWidth=2;pc.strokeRect(46,35,932,570);pc.strokeStyle='#ad986c';pc.strokeRect(56,45,912,550);pc.fillStyle='#44382b';pc.textAlign='center';pc.font='500 120px "Noto Serif TC",serif';pc.fillText('周',520,257);pc.fillText('易',520,407);pc.font='30px "Noto Serif TC",serif';['與','時','偕','行'].forEach((ch,i)=>pc.fillText(ch,746,210+i*61));pc.fillStyle='#765b34';pc.font='20px serif';pc.fillText('THE BOOK OF CHANGES',510,529);
   const pageMap=keep(new T.CanvasTexture(page));pageMap.colorSpace=T.SRGBColorSpace;const pageMat=mat('#fff4d8',.01,.85,{map:pageMap,side:T.DoubleSide});mesh(sheet,pageMat,book);
   for(const y of [-1.33,1.33]){const roll=mesh(new T.CylinderGeometry(.105,.105,4.87,32),ivory,book,0,y,.03);roll.rotation.z=Math.PI/2;for(const x of [-2.5,2.5]){const cap=mesh(new T.CylinderGeometry(.13,.13,.17,24),gold,book,x,y,.03);cap.rotation.z=Math.PI/2;}}
   // Stalks have tapered stems, nodes and subtle alternating natural coloration.
   const colors=[ivory,mat('#d8bd80',.04,.76),mat('#a98550',.04,.75)];
   for(let i=0;i<50;i++){
     const p=new T.Group();body.add(p);sticks.push(p);const len=2.03+(i%7)*.032;
     const stem=mesh(new T.CylinderGeometry(.025,.039,len,7),colors[i%3],p);stem.rotation.x=Math.PI/2;
     for(const z of [-.57,.25,.72]){const node=mesh(new T.CylinderGeometry(.038,.038,.026,7),colors[(i+1)%3],p,0,0,z);node.rotation.x=Math.PI/2;}
   }
   // Stone resting block for the permanently set-aside stalk.
   mesh(new T.BoxGeometry(.23,.10,2.5),rim,body,-2.72,.15,-.54);
 }
 // A restrained engraved aureole sits BEHIND the physical instruments.
 const halo=new T.Group();if(kind==='coins')body.add(halo);halo.position.set(0,.7,-1.22);halo.rotation.x=.12;
 for(const r of [3.23,3.36])mesh(new T.TorusGeometry(r,.010,6,112),rim,halo);
 const ticks=new T.InstancedMesh(keep(new T.BoxGeometry(.015,.075,.018)),gold,64),dummy=new T.Object3D();for(let i=0;i<64;i++){const a=i*Math.PI/32;dummy.position.set(Math.sin(a)*3.30,Math.cos(a)*3.30,0);dummy.rotation.z=-a;dummy.updateMatrix();ticks.setMatrixAt(i,dummy.matrix);}halo.add(ticks);
 function poseCoins(time){
   coins.forEach((c,i)=>{const b=bases[i],record=state.record,settled=!!record&&!motion,idle=!record;let y=settled?.235:b.y,rx=settled?(record.coins[i]==='back'?Math.PI/2:-Math.PI/2):-.65,rz=b.rz;
     if(motion){const p=clamp((time-motion.start-i*70)/1400),land=record.coins[i]==='back'?Math.PI/2:-Math.PI/2;
       if(p<.71){const a=p/.71;y=.24+Math.sin(a*Math.PI)*2.45;rx=-.7+(land+Math.PI*6+.7)*a;rz=b.rz+Math.sin(a*Math.PI)*.5;}
       else{const q=(p-.71)/.29;y=.235+Math.abs(Math.sin(q*Math.PI*2))*.22*(1-q);rx=land+Math.PI*6+Math.sin(q*Math.PI*3)*.17*(1-q);}
     }else if(idle&&!state.reduced)y+=Math.sin(time*.00065+i)*.08;
     c.position.set(b.x,y,b.z);c.rotation.set(rx,0,rz);
   });
 }
 function stalkTarget(i,progress=1){
   if(i===49)return{x:-2.72,y:.23,z:-.58,r:0};
   const ch=state.change;if(!ch)return{x:(i%13-6)*.058,y:.18+Math.floor(i/13)*.07,z:-.54+(i%3)*.014,r:(i%13-6)*.018};
   const p=progress,remain=ch.remaining;let x,y,z,r=0;
   if(i>=ch.total){x=2.43+(i%3)*.052;y=.17+Math.floor((i-ch.total)/3)*.055;z=.15;}
   else if(p<.58){const left=i<ch.left,j=left?i:i-ch.left;x=(left?-1:1)+((j%12)-5.5)*.063;y=.19+Math.floor(j/12)*.06;z=-.65;r=left?-.13:.13;}
   else if(i<remain){x=(i%12-5.5)*.077;y=.19+Math.floor(i/12)*.06;z=-.63;r=(i%3-1)*.012;}
   else{x=1.84+((i-remain)%4)*.105;y=.19+Math.floor((i-remain)/4)*.055;z=-.25;r=.15;}
   const a=ease(Math.min(p/.55,1));return{x:mix((i%13-6)*.058,x,a),y:mix(.18+Math.floor(i/13)*.07,y,a)+Math.sin(p*Math.PI)*.19,z:mix(-.54,z,a),r:r*a};
 }
 function poseStalks(time){let p=motion?clamp((time-motion.start)/1700):1;sticks.forEach((s,i)=>{const v=stalkTarget(i,p);s.position.set(v.x,v.y,v.z);s.rotation.y=v.r;});}
 function render(time=performance.now()){
   if(disposed)return;if(!visible||paused||document.hidden){raf=0;return;}
   if(time-last>30||state.reduced||motion){last=time;turn=mix(turn,target,.085);body.rotation.y=turn;if(kind==='coins')poseCoins(time);else poseStalks(time);renderer.render(scene,camera);}
   if(motion&&time-motion.start>motion.duration){const done=motion.done;motion=null;done?.();}
   if(motion||Math.abs(turn-target)>.002||(kind==='coins'&&!state.reduced&&!state.record))raf=requestAnimationFrame(render);else raf=0;
 }
 function wake(){if(!raf&&!disposed)raf=requestAnimationFrame(render);}
 function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.position.set(0,kind==='coins'?5.4:5.8,kind==='coins'?9.0:10.2);camera.lookAt(0,.65,0);camera.fov=camera.aspect<.95?43:37;camera.updateProjectionMatrix();renderer.setSize(w,h,false);wake();}
 const resizeObserver=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;wake();});
 function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,t:target,id:e.pointerId};host.setPointerCapture?.(e.pointerId);}
 function move(e){if(!drag)return;target=Math.max(-.4,Math.min(.4,drag.t+(e.clientX-drag.x)*.003));wake();}
 function up(){drag=null;}
 function visibility(){wake();}
 function lost(e){e.preventDefault();host.dataset.render='fallback';contextLost=true;paused=true;cancelAnimationFrame(raf);raf=0;}
 renderer.domElement.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
 function detach(){resizeObserver.disconnect();intersection.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);}
 function attach(next){detach();host=next;host.appendChild(renderer.domElement);host.dataset.render=contextLost?'fallback':'webgl';host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);resizeObserver.observe(host);intersection.observe(host);paused=contextLost;resize();}
 attach(host);
 return {kind,attach,update(next){state={...next};wake();},animate(done){motion={start:performance.now(),duration:kind==='coins'?1600:1740,done};wake();},finish(){motion=null;wake();},pause(){paused=true;cancelAnimationFrame(raf);raf=0;},dispose(){disposed=true;cancelAnimationFrame(raf);detach();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);resources.forEach(r=>r.dispose?.());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();},get mode(){return host.dataset.render;}};
}
window.JYGuaScene={create};
