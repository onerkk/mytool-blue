import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Presentation consumes the immutable recorded split. It never supplies entropy.
const clamp=x=>Math.min(1,Math.max(0,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const DURATION=3600;
export function createYarrow(host){
 let dead=false,lost=false,raf=0,last=0,visible=true,paused=false,turn=0,target=-.04,drag=null,motion=null,state={values:[],part:[],reduced:false},phase=-1,afterglow=0;
 const resources=new Set(),keep=x=>(resources.add(x),x),scene=new T.Scene(),world=new T.Group();scene.add(world);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.setClearColor('#090f14',0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');
 const camera=new T.PerspectiveCamera(40,1,.1,55),pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
 const mat=(color,metalness=.1,roughness=.65,extra={})=>keep(new T.MeshStandardMaterial({color,metalness,roughness,...extra}));
 const brass=mat('#b38c51',.83,.29),gold=mat('#f1cf8f',.78,.27),black=mat('#14201f',.25,.42),jade=mat('#305549',.18,.33),paper=mat('#cdbc91',.02,.89),dark=mat('#151415',.08,.71);
 function mesh(g,m,parent=world,x=0,y=0,z=0){const a=new T.Mesh(keep(g),m);a.position.set(x,y,z);a.castShadow=a.receiveShadow=true;parent.add(a);return a;}
 function box(w,h,d,m,parent=world,x=0,y=0,z=0,r=.07){return mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/2,d/2,w/2)),m,parent,x,y,z);}
 function cylinder(r,h,m,parent=world,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(r,r,h,48),m,parent,x,y,z);}
 function ring(r,t,m,parent=world,x=0,y=0,z=0){const a=mesh(new T.TorusGeometry(r,t,8,72),m,parent,x,y,z);return a;}
 function canvasMap(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=keep(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
 const woodMap=canvasMap(512,512,(q,w,h)=>{q.fillStyle='#30231e';q.fillRect(0,0,w,h);for(let i=0;i<300;i++){q.strokeStyle=`rgba(${i%3?118:36},${i%3?79:27},${i%3?47:24},.18)`;q.lineWidth=.4+(i%5)*.25;q.beginPath();for(let y=0;y<=h;y+=8){const x=i*1.9+Math.sin(y*.021+i*.24)*3+Math.sin(y*.004+i)*7;y?q.lineTo(x,y):q.moveTo(x,y);}q.stroke();}});
 const wood=keep(new T.MeshPhysicalMaterial({color:'#a8947c',map:woodMap,bumpMap:woodMap,bumpScale:.045,roughness:.43,clearcoat:.3,clearcoatRoughness:.3}));
 const silkMap=canvasMap(512,512,(q,w,h)=>{q.fillStyle='#29433e';q.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){q.fillStyle=i%4?'#a1b09a12':'#020c091f';q.fillRect(i,0,1,h);q.fillRect(0,i,w,1);}for(let y=20;y<512;y+=48)for(let x=20;x<512;x+=48){q.strokeStyle='#a0a87624';q.lineWidth=.6;q.strokeRect(x,y,18,18);}});
 const silk=mat('#9aaa94',.06,.92,{map:silkMap,bumpMap:silkMap,bumpScale:.025});
 const stemMap=canvasMap(128,512,(q,w,h)=>{q.fillStyle='#c4a36c';q.fillRect(0,0,w,h);for(let i=0;i<115;i++){q.strokeStyle=i%3?'#f6e0a940':'#52331d24';q.lineWidth=.3+(i%3)*.35;q.beginPath();q.moveTo((i*31)%w,0);q.bezierCurveTo((i*31)%w+3,170,(i*31)%w-3,340,(i*31)%w,512);q.stroke();}for(const y of [91,289,463]){q.fillStyle='#745e3325';q.fillRect(0,y,128,3);}});
 const stemMats=['#fff0c6','#e0c395','#f0d4a0','#c7a16d'].map(c=>mat(c,.02,.71,{map:stemMap,bumpMap:stemMap,bumpScale:.025}));
 // Broad, bevelled rosewood work table, sewn silk mat and brass corner joinery.
 box(7.3,.30,5.0,wood,world,0,-.14,0,.11);box(7.21,.045,4.91,brass,world,0,.026,0,.02);box(7.09,.16,4.79,wood,world,0,.10,0,.075);box(5.76,.035,3.35,silk,world,-.05,.20,.40,.016);
 for(const x of [-3.38,3.38])for(const z of [-2.15,2.15]){box(.33,.42,.33,black,world,x,-.45,z);box(.34,.05,.34,brass,world,x,-.34,z,.02);}
 for(const x of [-2.9,2.8])box(.012,.008,3.44,gold,world,x,.223,.40,.002);
 for(const z of [-1.34,2.14])box(5.70,.008,.012,gold,world,-.05,.223,z,.002);
 for(let i=0;i<60;i++)for(const z of [-1.29,2.09])box(.025,.006,.009,brass,world,-2.82+i*.095,.23,z,.002);
 // A low carved screen and a moon window give the desk a room and a horizon.
 const screen=new T.Group();world.add(screen);screen.position.set(0,0,-2.21);
 box(7.1,.14,.18,wood,screen,0,.45,0);for(const x of [-3.3,-2.62,2.62,3.3])box(.09,2.40,.10,wood,screen,x,1.68,0);
 for(const y of [.91,1.62,2.37,2.90]){box(1.0,.044,.055,brass,screen,-2.96,y,0);box(1.0,.044,.055,brass,screen,2.96,y,0);}
 for(const x of [-3.14,-2.78,2.78,3.14]){box(.025,2.03,.04,brass,screen,x,1.81,.018);}
 const moonRing=ring(1.47,.024,brass,screen,0,1.85,-.31);moonRing.scale.y=1.07;
 const back=mesh(new T.CircleGeometry(1.45,80),mat('#172626',.05,1),screen,0,1.85,-.35);back.castShadow=false;
 const crescent=new T.Shape(),outer=.38,inner=.36,shift=.18,ix=(outer*outer-inner*inner+shift*shift)/(2*shift),iy=Math.sqrt(outer*outer-ix*ix),angle=Math.atan2(iy,ix);
 crescent.absarc(0,0,outer,angle,Math.PI*2-angle,false);crescent.absarc(shift,0,inner,Math.atan2(-iy,ix-shift),Math.atan2(iy,ix-shift),true);crescent.closePath();
 const moon=mesh(new T.ExtrudeGeometry(crescent,{depth:.065,bevelEnabled:true,bevelSize:.009,bevelThickness:.012,bevelSegments:3,curveSegments:48}),mat('#ddc18a',.55,.36,{emissive:'#b99458',emissiveIntensity:.09}),screen,.76,2.40,-.12);moon.rotation.z=-.23;
 const calligraphy=canvasMap(512,640,q=>{q.fillStyle='#c9b27f';q.textAlign='center';q.font='400 121px "Noto Serif TC",serif';q.fillText('周',209,278);q.fillText('易',209,419);q.font='20px "Noto Serif TC",serif';['觀','變','知','時'].forEach((t,i)=>q.fillText(t,336,223+i*43));q.fillStyle='#753e2d';q.fillRect(295,427,65,69);q.fillStyle='#e2c79a';q.font='25px serif';q.fillText('靜月',327,473);});
 const title=mesh(new T.PlaneGeometry(2.3,2.60),keep(new T.MeshBasicMaterial({map:calligraphy,transparent:true,depthWrite:false})),screen,-.19,1.83,-.13);title.castShadow=false;
 // Rolled manuscript at the side; instruments, rather than a blank front sheet,
 // occupy the working area. Its texture is deliberately subordinate to stalks.
 const scroll=new T.Group();world.add(scroll);scroll.position.set(2.47,.3,-.85);scroll.rotation.y=-.16;
 const pageMap=canvasMap(512,512,q=>{q.fillStyle='#d4c295';q.fillRect(0,0,512,512);q.fillStyle='#695332';q.font='21px "Noto Serif TC",serif';for(let x=72;x<480;x+=49)for(let y=66;y<480;y+=38)q.fillText('天地之道與時偕行'[(x+y)%8],x,y);q.strokeStyle='#9a7d4a';q.strokeRect(25,20,462,472);});
 const pageMat=mat('#e7d1a2',.01,.92,{map:pageMap});box(1.1,.02,1.98,pageMat,scroll,0,0,0,.005);
 for(const z of [-1.02,1.02]){const roll=cylinder(.13,1.22,paper,scroll,0,.10,z);roll.rotation.z=Math.PI/2;for(const x of [-.65,.65]){const cap=cylinder(.09,.12,brass,scroll,x,.10,z);cap.rotation.z=Math.PI/2;}}
 // Stone ink dish, slender brush and a bronze lamp, all with actual thickness.
 box(.85,.12,.65,black,world,-2.77,.29,-1.48,.12);box(.55,.017,.38,mat('#07110f',.25,.15),world,-2.75,.36,-1.45,.1);
 const brush=cylinder(.026,1.44,wood,world,-2.57,.42,-1.51);brush.rotation.z=1.26;brush.rotation.y=.14;
 const holder=cylinder(.38,.10,black,world,-2.89,.27,.37);ring(.34,.025,brass,world,-2.89,.33,.37).rotation.x=Math.PI/2;
 cylinder(.07,.54,brass,world,-2.89,.55,.37);
 const lampProfile=[[.02,0],[.25,.02],[.37,.10],[.40,.16],[.39,.18],[.33,.16],[.18,.09],[.02,.08]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(lampProfile,48),brass,world,-2.89,.82,.37);
 const ember=mesh(new T.SphereGeometry(.035,12,12),mat('#ffd18a',0,.4,{emissive:'#ffb351',emissiveIntensity:2}),world,-2.89,1.035,.37);
 const lampLight=new T.PointLight('#ffc58a',4.5,5,2);lampLight.position.set(-2.89,1.17,.37);world.add(lampLight);
 // The permanently excluded fiftieth stalk rests in its own jade channel.
 box(.25,.08,2.68,jade,world,-2.14,.27,.35,.04);
 const stalks=[],stalkGeo=keep(new T.CylinderGeometry(.037,.048,2.30,9,4)),nodeGeo=keep(new T.CylinderGeometry(.048,.048,.023,9));
 for(let i=0;i<50;i++){const a=new T.Group();world.add(a);stalks.push(a);const stem=new T.Mesh(stalkGeo,stemMats[i%4]);stem.rotation.x=Math.PI/2;stem.scale.y=1+(i%7-3)*.008;stem.castShadow=stem.receiveShadow=true;a.add(stem);for(const z of [-.7,.12,.88]){const node=new T.Mesh(nodeGeo,stemMats[(i+1)%4]);node.position.z=z;node.rotation.x=Math.PI/2;node.castShadow=true;a.add(node);}}
 const tagMap=canvasMap(768,128,q=>{q.textAlign='center';q.fillStyle='#c3b17e';q.font='26px "Noto Serif TC",serif';q.fillText('虛 一',90,82);q.fillText('分 二 · 揲 四',368,82);q.fillText('歸 餘',650,82);});
 const tags=mesh(new T.PlaneGeometry(5.6,.45),keep(new T.MeshBasicMaterial({map:tagMap,transparent:true,depthWrite:false})),world,0,.24,1.89);tags.rotation.x=-Math.PI/2;tags.castShadow=false;
 // Six tiny inlaid lights correspond to the six already committed lines.
 const progress=[];for(let i=0;i<6;i++){const m=mat('#5f5139',.7,.4,{emissive:'#d6a55e',emissiveIntensity:0});const a=mesh(new T.SphereGeometry(.036,12,8),m,world,(i-2.5)*.22,.17,2.405);progress.push(a);}
 scene.add(new T.HemisphereLight('#d6e6e5','#17100e',1.35));
 const key=new T.DirectionalLight('#ffe4b0',2.8);key.position.set(-3.5,7,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:22});key.shadow.bias=-.0005;key.shadow.normalBias=.025;scene.add(key);
 const rim=new T.DirectionalLight('#b6d7d5',1.25);rim.position.set(4,4,-3);scene.add(rim);
 const ground=mesh(new T.PlaneGeometry(18,18),keep(new T.ShadowMaterial({opacity:.4})),scene,0,-.7,0);ground.rotation.x=-Math.PI/2;
 const particleGeo=keep(new T.BufferGeometry()),pts=new Float32Array(90*3);for(let i=0;i<90;i++){pts[i*3]=Math.sin(i*53.7)*4.1;pts[i*3+1]=(i%23)*.13+.35;pts[i*3+2]=Math.cos(i*21.4)*2.4;}particleGeo.setAttribute('position',new T.BufferAttribute(pts,3));const dust=new T.Points(particleGeo,keep(new T.PointsMaterial({color:'#e5c086',size:.014,transparent:true,opacity:.30,depthWrite:false})));world.add(dust);
 const pose=(x,y,z,r=0,rx=0)=>({x,y,z,r,rx});
 function packed(i,x=0,z=.20,spacing=.092){return pose(x+(i%12-5.5)*spacing,.295+Math.floor(i/12)*.087,z+Math.sin(i*2)*.022,(i%3-1)*.018);}
 function ids(ch){if(!ch)return {keep:[],remove:[]};const keep=[],remove=[];for(let i=0;i<ch.total;i++){const stays=i<ch.left?i<ch.left-ch.leftRemainder:i<ch.total-1-ch.rightRemainder;(stays?keep:remove).push(i);}return {keep,remove};}
 function targetPose(i,step){
  if(i===49)return pose(-2.14,.36,.33,0);
  const ch=state.change;if(!ch)return packed(i,-.02,.22);
  const groups=ids(ch),removedIndex=groups.remove.indexOf(i),keptIndex=groups.keep.indexOf(i),left=i<ch.left,j=left?i:i-ch.left;
  if(i>=ch.total)return pose(1.86+(i%3)*.085,.31+Math.floor((i-ch.total)/3)*.088,.35,.065);
  if(step===0)return packed(i,-.02,.22);
  if(step===1)return packed(j,left?-.85:.85,.10,.087);
  if(step===2&&i===ch.total-1)return pose(.03,.39,1.46,Math.PI/2);
  if(step===2)return packed(j,left?-.85:.85,.10,.087);
  if(step===3){
   if(i===ch.total-1)return pose(.03,.39,1.46,Math.PI/2);
   if(removedIndex>=0)return pose(left?-.89:.88,.34+(removedIndex%4)*.054,.87,left?-.1:.1);
   const local=left?j:j;return pose((left?-1.3:.65)+(Math.floor(local/4)%3)*.30+(local%4)*.068,.31+Math.floor(Math.floor(local/4)/3)*.083,-.30,(local%4-1.5)*.016);
  }
  if(keptIndex>=0)return packed(keptIndex,-.12,.22);
  return pose(1.48+(removedIndex%4)*.089,.31+Math.floor(removedIndex/4)*.087,.34,.065);
 }
 function apply(a,p){a.position.set(p.x,p.y,p.z);a.rotation.set(p.rx, p.r,0);}
 function poseAt(time){
  if(!motion){stalks.forEach((a,i)=>apply(a,targetPose(i,4)));return;}
  const t=clamp((time-motion.start)/DURATION),bounds=[0,.16,.38,.53,.80,1],step=Math.min(4,bounds.findIndex((v,i)=>i>0&&t<v)-1<0?4:bounds.findIndex((v,i)=>i>0&&t<v)-1),local=smooth((t-bounds[step])/(bounds[step+1]-bounds[step]));
  stalks.forEach((a,i)=>{const from=step===0?motion.from[i]:targetPose(i,step-1),to=targetPose(i,step),delay=step===3?(Math.floor(i/4)%6)*.055:step===1?(i%7)*.016:0,part=smooth((local-delay)/(1-delay)),arc=i===49?0:Math.sin(part*Math.PI)*(step===0?.30:step===2?.36:.18);apply(a,pose(lerp(from.x,to.x,part),lerp(from.y,to.y,part)+arc,lerp(from.z,to.z,part),lerp(from.r,to.r,part),lerp(from.rx,to.rx,part)));});
  if(step!==phase){phase=step;host.dataset.ritualStep=String(step);state.onPhase?.(step);if(step===1||step===3)state.onCue?.('stems',step===1?-.2:.2);if(step===2||step===4)state.onCue?.('bamboo',0);}
 }
 function draw(now=performance.now()){
  raf=0;if(dead||lost||paused||!visible||document.hidden)return;
  if(now-last>=32||motion){last=now;turn=lerp(turn,target,.09);world.rotation.y=turn;poseAt(now);if(!state.reduced){dust.rotation.y=Math.sin(now*.00008)*.075;ember.scale.y=1+Math.sin(now*.005)*.17;lampLight.intensity=4.5+Math.sin(now*.004)*.14;}renderer.render(scene,camera);}
  if(motion&&now-motion.start>=DURATION){motion=null;phase=-1;afterglow=now+500;state.onPhase?.(4);}
  if(motion||now<afterglow||Math.abs(turn-target)>.001)wake();
 }
 function wake(){if(!raf&&!dead&&!lost)raf=requestAnimationFrame(draw);}
 function size(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.position.set(0,6.15,7.6);camera.lookAt(0,.77,.04);camera.fov=camera.aspect<.95?46:40;camera.updateProjectionMatrix();renderer.setSize(w,h,false);wake();}
 const ro=new ResizeObserver(size),io=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting!==false;wake();});
 function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,turn:target};host.setPointerCapture?.(e.pointerId);}
 function move(e){if(drag){target=Math.max(-.28,Math.min(.28,drag.turn+(e.clientX-drag.x)*.0028));wake();}}
 function up(){drag=null;}
 function visibility(){if(!document.hidden){if(motion)motion.start=performance.now()-Math.min(DURATION,performance.now()-motion.start);wake();}}
 function contextLost(e){e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;host.dataset.render='fallback';}
 renderer.domElement.addEventListener('webglcontextlost',contextLost);document.addEventListener('visibilitychange',visibility);
 function detach(){ro.disconnect();io.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);}
 function attach(next){detach();host=next;host.appendChild(renderer.domElement);host.dataset.render=lost?'fallback':'webgl';host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);ro.observe(host);io.observe(host);size();}
 attach(host);
 return {kind:'yarrow',attach,update(next){state=next;progress.forEach((a,i)=>{a.material.emissiveIntensity=i<(next.values?.length||0)?.8:0;});wake();},animate(){motion={start:performance.now(),from:stalks.map(a=>pose(a.position.x,a.position.y,a.position.z,a.rotation.y,a.rotation.x))};phase=-1;wake();},finish(){motion=null;phase=-1;wake();},pause(){paused=true;cancelAnimationFrame(raf);raf=0;},dispose(){dead=true;cancelAnimationFrame(raf);detach();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);resources.forEach(r=>r.dispose?.());environment.dispose();renderer.dispose();renderer.domElement.remove();},get mode(){return host.dataset.render;}};
}
