import * as T from 'three';
import {cardPose,actorPose,cameraPose,instrumentPose,CAST,clamp,ease} from './choreography.mjs';
import {buildScenery} from './scenery.mjs';
import {buildPresence} from './presence.mjs';
import {buildCraft} from './craft.mjs';

// One renderer per ceremony. This module owns presentation only: no RNG, birth
// calculation, card selection, storage, or interpretation is permitted here.
export function mountStage(host,kind,options={}){
 const cfg=CAST[kind]||CAST.tarot;
 const state={phase:0,power:0,lit:0,time:0,since:0,turn:0,story:!!options.story,shot:'arrival',shotSince:0,operation:options.operation||0};
 let shotAt=0,covered=false;
 let dead=false,lost=false,paused=false,raf=0,last=0,phaseAt=0,elapsed=0,frames=0,cost=0;
 let renderer,observer,actorMaterial,actor,previousPose=0,targetPose=0,blendAt=0;
 const resources=new Set(),textures=new Set(),loaders=new Set(),animated=[],pointer={x:0,y:0},aim={x:0,y:0};
 const reduced=!!options.reduced,input=host.parentElement||host;
 const keep=x=>(resources.add(x),x);
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(39,1,.1,40);camera.position.set(0,.2,7.2);
 const rig=new T.Group();scene.add(rig);
 const accent=new T.Color(cfg.accent);
 const ambient=new T.HemisphereLight('#d9e6ff','#080d20',2.5);scene.add(ambient);
 const key=new T.DirectionalLight('#fff0ce',4);key.position.set(-3,5,5);scene.add(key);
 const rim=new T.PointLight(accent,13,9,2);rim.position.set(2,1,2);scene.add(rim);
 const pulse=new T.PointLight(accent,0,5,2);pulse.position.set(0,-.6,2);scene.add(pulse);
 const gold=keep(new T.MeshPhysicalMaterial({color:'#d3b17b',metalness:.87,roughness:.23,clearcoat:.5,clearcoatRoughness:.18}));
 const dark=keep(new T.MeshPhysicalMaterial({color:'#153540',metalness:.4,roughness:.24,clearcoat:.8,clearcoatRoughness:.2}));
 const light=keep(new T.MeshStandardMaterial({color:accent,metalness:.35,roughness:.2,emissive:accent,emissiveIntensity:.35}));
 const objects=new T.Group();objects.position.set(0,-.86,.75);rig.add(objects);
 function mesh(geometry,material=gold,parent=objects){const m=new T.Mesh(keep(geometry),material);parent.add(m);return m;}
 function ring(radius,width=.013,parent=objects){return mesh(new T.TorusGeometry(radius,width,8,80),gold,parent);}
 function loadTexture(url,done){
  if(dead||lost)return;
  const loader=new T.TextureLoader();loaders.add(loader);
  loader.load(url,texture=>{loaders.delete(loader);if(dead||lost){texture.dispose();return;}textures.add(texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());done(texture);renderOnce();},undefined,()=>{loaders.delete(loader);});
 }
 function dispose(){
  if(dead)return;dead=true;cancelAnimationFrame(raf);raf=0;
  observer?.disconnect();document.removeEventListener('visibilitychange',visibility);
  input.removeEventListener('pointermove',follow);input.removeEventListener('pointerleave',leave);
  window.removeEventListener('resize',resize);
  // Context loss can also make renderer/resource disposal throw. Release each
  // independently so one broken resource cannot leave a canvas or reading lock.
  const release=x=>{try{x.dispose();}catch(error){console.warn('[JYCinema dispose]',error);}};
  if(renderer){renderer.domElement.removeEventListener('webglcontextlost',contextLost);release(renderer);renderer.domElement.remove();renderer=null;}
  resources.forEach(release);textures.forEach(release);resources.clear();textures.clear();scene.clear();
  host.classList.remove('jr-gpu-ready','jr-actor-ready');
 }
 function contextLost(event){event.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;host.classList.remove('jr-gpu-ready','jr-actor-ready');host.setAttribute('data-renderer','fallback');options.onFallback?.();}
 try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:!reduced,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0,0);
  renderer.domElement.className='jr-stage-canvas';renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  host.prepend(renderer.domElement);host.setAttribute('data-renderer','webgl2');
 }catch(error){dispose();host.setAttribute('data-renderer','fallback');return {dispose(){},setPhase(){},setPower(){},setLit(){},setTurn(){},setShot(){}};}

 // Illustrated, articulated portrait, not a filmed or fully rigged 3D person.
 // Face and hands stay rigid; breathing, head inclination and side hair move
 // through soft neck/shoulder weights instead of stretching facial features.
 const uniforms={atlas:{value:null},fromPose:{value:0},toPose:{value:0},mixPose:{value:1},clock:{value:0},motion:{value:reduced?0:1},glow:{value:0},gaze:{value:new T.Vector2()}};
 actorMaterial=keep(new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,
  vertexShader:`varying vec2 vUv;uniform float clock,motion;uniform vec2 gaze;
   void main(){vUv=uv;vec3 p=position;
    float head=smoothstep(.53,.72,uv.y),side=smoothstep(.17,.34,abs(uv.x-.5));
    float robe=(1.-smoothstep(.35,.75,uv.y))*side;
    float hair=smoothstep(.38,.60,uv.y)*(1.-smoothstep(.86,.98,uv.y))*side;
    float breath=sin(clock*1.05)*.014*motion;
    float tilt=(sin(clock*.38)*.005-gaze.x*.009)*motion*head;
    vec2 neck=p.xy-vec2(0.,.6);p.xy=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*neck+vec2(0.,.6);
    p.y+=breath*smoothstep(.3,.65,uv.y);
    p.x+=(sin(clock*.8+uv.y*6.)*.031*robe+sin(clock*.63+uv.y*8.)*.018*hair)*motion;
    p.z+=(sin(clock*.65+uv.x*4.)*.035*robe+gaze.x*p.x*.025*head)*motion;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
   }`,
  fragmentShader:`uniform sampler2D atlas;uniform float fromPose,toPose,mixPose,glow;varying vec2 vUv;vec4 pose(float n){vec2 u=vec2((clamp(vUv.x,.003,.997)+n)/4.0,vUv.y);return texture2D(atlas,u);}void main(){vec4 c=mix(pose(fromPose),pose(toPose),mixPose);c.a*=smoothstep(0.0,.13,vUv.y);if(c.a<.01)discard;c.rgb*=1.0+glow*.1;gl_FragColor=c;#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')
 }));
 actor=mesh(new T.PlaneGeometry(3.05,6.10,20,32),actorMaterial,rig);actor.position.set(0,-.58,-.65);actor.visible=false;actor.renderOrder=1;
 loadTexture('assets/ui/'+cfg.actor+'.webp',texture=>{uniforms.atlas.value=texture;actor.visible=true;host.classList.add('jr-actor-ready');});

 const craft=buildCraft({keep,gold,accent,doc:host.ownerDocument||document});
 // A bevelled, inlaid object with a visible thickness replaces the plain disc.
 craft.table(objects);
 // Physical portal ribs and enamel inlays provide depth behind the illustrated
 // actor. No full-screen postprocessing or animation-dependent navigation.
 const architecture=new T.Group();rig.add(architecture);
 const enamel=craft.enamel;
 for(let i=0;i<3;i++){
  const gate=new T.Group();architecture.add(gate);gate.position.set(0,.38,-1.8-i*1.7);
  const arc=mesh(new T.TorusGeometry(2.05,.038,8,80,Math.PI),gold,gate);arc.position.y=.85;
  for(const side of [-1,1]){
   const shaft=mesh(new T.CylinderGeometry(.06,.095,4.2,12),enamel,gate);shaft.position.set(side*2.05,-1.25,0);
   const edge=mesh(new T.CylinderGeometry(.012,.012,4.2,6),gold,gate);edge.position.set(side*2.01,-1.25,.075);
   for(const y of [-3.35,.84]){const cap=mesh(new T.CylinderGeometry(.12,.12,.07,12),gold,gate);cap.position.set(side*2.05,y,0);}
  }
 }
 const zodiacHalo=new T.Group();rig.add(zodiacHalo);zodiacHalo.position.set(0,.3,-1.18);
 const halo=ring(1.86,.009,zodiacHalo);halo.rotation.z=.3;
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12,tick=mesh(new T.BoxGeometry(.009,i%2?.035:.07,.014),gold,zodiacHalo);
  tick.position.set(Math.sin(a)*1.86,Math.cos(a)*1.86,0);tick.rotation.z=-a;
 }
 const bridge=[];
 const traces=[];
 for(let i=0;i<3;i++){
  const mat=keep(new T.MeshBasicMaterial({color:accent,transparent:true,opacity:.08,depthWrite:false,blending:T.AdditiveBlending}));
  const r=mesh(new T.TorusGeometry(1.12,.004,5,96),mat);r.rotation.x=Math.PI/2;r.position.y=-.69+i*.012;traces.push(r);
 }
 const deck=[];
 if(kind==='tarot'||kind==='lenormand'||kind==='ootk'){
  if(options.mode!=='cards'){
   const back=keep(new T.MeshStandardMaterial({color:'#d9cead',roughness:.58,metalness:.1}));
   const geom=keep(new T.BoxGeometry(.66,1.07,.014));
   for(let i=0;i<15;i++){const g=new T.Group();objects.add(g);const body=new T.Mesh(geom,gold);g.add(body);const face=new T.Mesh(keep(new T.PlaneGeometry(.636,1.045)),back);face.position.z=.008;g.add(face);deck.push(g);}
   loadTexture('assets/ui/tarot-back-moon-gold.jpg',texture=>{back.map=texture;back.color.set('#ffffff');back.needsUpdate=true;});
  }
 }else if(kind==='ziwei'){
  const instrument=new T.Group();objects.add(instrument);instrument.position.y=.07;
  [0,.8,1.5].forEach((a,i)=>{const r=craft.bezel(instrument,.9+i*.08);r.rotation.set(a,.45+i*.65,.3);animated.push({type:'orbit',node:r,index:i,rate:(i%2?-.12:.15)});});
  const core=mesh(new T.IcosahedronGeometry(.17,1),craft.jewel,instrument);
  animated.push({type:'core',node:core});
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const star=mesh(new T.OctahedronGeometry(.057),light,instrument);star.position.set(Math.cos(a)*1.04,Math.sin(a)*1.04,0);animated.push({type:'star',node:star,index:i});}
 }else if(kind==='bazi'){
  for(let i=0;i<4;i++){const pillar=new T.Group();pillar.position.x=(i-1.5)*.68;objects.add(pillar);
   craft.decoratePillar(pillar);
   for(let j=0;j<6;j++){const a=j*Math.PI/3;const inlay=mesh(new T.BoxGeometry(.008,.76,.008),gold,pillar);inlay.position.set(Math.sin(a)*.151,0,Math.cos(a)*.151);}
   [-.43,.43].forEach(y=>{const c=mesh(new T.CylinderGeometry(.185,.185,.055,24),gold,pillar);c.position.y=y;});
   const top=mesh(new T.OctahedronGeometry(.15),light,pillar);top.position.y=.59;
   const line=ring(.19,.012,pillar);line.rotation.x=Math.PI/2;line.position.y=.25;
   animated.push({type:'pillar',node:pillar,index:i,gem:top});
  }
 }else if(kind==='compat'){
  for(let i=0;i<2;i++){const orb=new T.Group();orb.position.x=i?.6:-.6;objects.add(orb);
   const material=keep(new T.MeshPhysicalMaterial({color:i?'#a8c8e5':'#e2b9c5',metalness:.35,roughness:.14,clearcoat:1,clearcoatRoughness:.08,emissive:i?'#50799e':'#aa687b',emissiveIntensity:.3}));
   mesh(new T.IcosahedronGeometry(.23,1),material,orb);
   [0,1].forEach(j=>{const r=craft.bezel(orb,.44+j*.07);r.rotation.set(j*.72,j*.83,j*.3);});
   animated.push({type:'partner',node:orb,index:i});
  }
  for(let i=0;i<3;i++){
   const curve=new T.CatmullRomCurve3([new T.Vector3(-.64,0,0),new T.Vector3(-.23,.28+i*.08,.15),new T.Vector3(.23,-.22-i*.05,.18),new T.Vector3(.64,0,0)]);
   const mat=keep(new T.MeshBasicMaterial({color:i%2?'#bad7ef':'#e8becf',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));
   bridge.push(mesh(new T.TubeGeometry(curve,32,.007,5,false),mat));
  }
 }else if(kind==='meihua'){
  // Six light coordinates await the actual cast. Never depict an invented hexagram.
  for(let i=0;i<6;i++){const r=ring(.32+i*.095,.011);r.rotation.set(1.03,.2+i*.2,.1);r.position.y=i*.10-.26;animated.push({type:'seed',node:r,index:i});}
  mesh(new T.IcosahedronGeometry(.12,2),light).position.y=.45;
  const blossom=new T.Group();objects.add(blossom);blossom.position.y=.42;
  for(let i=0;i<5;i++){
   const petal=new T.Group();blossom.add(petal);petal.rotation.z=i*Math.PI*2/5;
   const leaf=craft.petal(petal);leaf.rotation.y=.2;
   const vein=mesh(new T.CylinderGeometry(.006,.006,.32,6),gold,petal);vein.position.set(0,.21,.035);
   animated.push({type:'petal',node:petal,index:i});
  }
 }else if(kind==='oracle'){
  craft.cup(objects);
  const vermilion=keep(new T.MeshStandardMaterial({color:'#933e39',metalness:.12,roughness:.38}));
  for(let i=0;i<13;i++){const a=i*2.3999,r=.075+Math.sqrt(i)*.041;const stick=new T.Group();objects.add(stick);mesh(new T.BoxGeometry(.035,.88,.018),craft.wood,stick);mesh(new T.BoxGeometry(.036,.15,.020),vermilion,stick).position.y=.366;stick.position.set(Math.cos(a)*r,.1+(i%3)*.035,Math.sin(a)*r);stick.rotation.z=Math.cos(a)*.11;animated.push({type:'stick',node:stick,index:i,base:stick.position.y});}
 }
 // Shared spark field is deterministic decoration, unrelated to the reading RNG.
 const particles=128,positions=new Float32Array(particles*3),seeds=[];
 for(let i=0;i<particles;i++){const a=i*2.399963;seeds.push(a);positions[i*3]=Math.sin(a)*2.8;positions[i*3+1]=((i*37)%109)/109*6-3;positions[i*3+2]=-1+(i%9)*.4;}
 const pgeo=keep(new T.BufferGeometry());pgeo.setAttribute('position',new T.BufferAttribute(positions,3));
 const pmat=keep(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{t:{value:0},color:{value:accent},energy:{value:0},motion:{value:reduced?0:1}},
  vertexShader:`uniform float t,energy,motion;varying float alpha;void main(){vec3 p=position;p.y=mod(p.y+3.0+t*.07*motion,6.0)-3.0;p.x+=sin(t*.3+p.y)*.03*motion;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=min(9.0,(8.0+energy*10.0)/(-mv.z));alpha=.32+energy*.42;}`,
  fragmentShader:`uniform vec3 color;varying float alpha;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(color,smoothstep(.5,.04,d)*alpha);}`
 }));scene.add(new T.Points(pgeo,pmat));
 const scenery=state.story?buildScenery({kind,rig,keep,gold,accent,reduced,craft}):null;
 const presence=state.story?buildPresence({kind,rig,keep,accent,reduced}):null;

 function resize(){if(dead||lost)return;const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderOnce();}
 function follow(event){if(reduced)return;const r=host.getBoundingClientRect();aim.x=clamp((event.clientX-r.left)/r.width*2-1,-1,1);aim.y=clamp((event.clientY-r.top)/r.height*2-1,-1,1);}
 function leave(){aim.x=aim.y=0;}
 function visibility(){paused=document.hidden||covered;last=0;cancelAnimationFrame(raf);raf=0;if(!paused&&!dead&&!lost){renderOnce();if(!reduced)raf=requestAnimationFrame(tick);}}
 function transform(dt){
  const smooth=reduced?1:1-Math.exp(-dt*5);pointer.x+=(aim.x-pointer.x)*smooth;pointer.y+=(aim.y-pointer.y)*smooth;
  rig.rotation.y=reduced?0:pointer.x*.055;rig.rotation.x=reduced?0:pointer.y*.022;
  state.time=reduced?0:elapsed;state.since=elapsed-phaseAt;state.shotSince=elapsed-shotAt;
  const view=cameraPose(kind,{...state,since:reduced?6:state.since,shotSince:reduced?3:state.shotSince},camera.aspect);
  camera.position.lerp(new T.Vector3(view.x,view.y,view.z),reduced?1:smooth);
  camera.lookAt(0,view.targetY,0);
  const energy=state.phase>=2?1:state.power;
  pulse.intensity=energy*8;rim.intensity=13+energy*5;
  objects.rotation.y=reduced?0:state.turn*.24;
  zodiacHalo.rotation.z=reduced?0:state.time*.025+state.turn*.04;
  bridge.forEach((thread,i)=>{thread.material.opacity=state.phase>=2?.36:.04+state.power*.18;thread.rotation.x=reduced?0:Math.sin(state.time*.55+i)*.2;});
  const s=(state.phase===0?.77:1)*clamp(camera.aspect*1.22,.8,1.5);objects.scale.lerp(new T.Vector3(s,s,s),smooth);
  if(actor){actor.position.y=-.58+(reduced?0:Math.sin(elapsed*.85)*.009);const scale=state.phase===0?1.025:state.phase>=2?.95:1;actor.scale.lerp(new T.Vector3(scale,scale,scale),smooth);actor.position.x+=( (state.phase>=1?-.12:0)-actor.position.x)*smooth;}
  uniforms.clock.value=state.time;uniforms.glow.value=energy;uniforms.gaze.value.set(pointer.x,pointer.y);
  uniforms.mixPose.value=reduced?1:ease((elapsed-blendAt)/.65);
  deck.forEach((g,i)=>{const p=cardPose(i,deck.length,{...state,since:reduced?3:state.since});g.position.set(p.x,p.y,p.z);g.rotation.set(p.rx,p.ry,p.rz);});
  animated.forEach(item=>{const n=item.node,t=state.time;
   const pose=instrumentPose(item.type,item.index||0,{...state,since:reduced?3:state.since});
   if(item.type==='orbit')n.rotation.z=(reduced?0:t*item.rate)+pose.angle;
   if(item.type==='core')n.rotation.y=t*.35;
   if(item.type==='star')n.scale.setScalar(1+((state.phase>=2||state.power>(item.index/12))?.5:0));
   if(item.type==='pillar'){n.position.y=pose.rise+(reduced?0:Math.sin(t+item.index)*.018);n.rotation.z=pose.tilt;item.gem.rotation.y=t*.25;item.gem.scale.setScalar(.7+pose.glow*.6);}
   if(item.type==='partner'){const a=(item.index?0:Math.PI)+pose.angle;n.rotation.y=t*(item.index?-.12:.12);n.position.x=Math.cos(a)*pose.radius;n.position.z=Math.sin(a)*.3;n.position.y=pose.rise+(reduced?0:Math.sin(t+item.index*Math.PI)*.04);}
   if(item.type==='seed'){n.rotation.z=t*(item.index%2?.12:-.13)+pose.angle;n.scale.setScalar(pose.spread);}
   if(item.type==='petal'){const opening=state.phase>=2?ease((reduced?3:state.since)/1.8):state.power*.35;n.rotation.x=1.35*(1-opening);n.scale.setScalar(.75+opening*.35);}
   if(item.type==='stick'){n.position.y=item.base+pose.rise;n.rotation.z=pose.tilt;}
  });
  traces.forEach((r,i)=>{const q=state.phase===2?clamp(state.since/2.65-i*.1):state.power*.45;
   r.scale.setScalar(1+q*(.35+i*.15));r.material.opacity=.045+Math.sin(q*Math.PI)*.24;});
  pmat.uniforms.t.value=state.time;pmat.uniforms.energy.value=energy;
  scenery?.update({...state,since:reduced?6:state.since});
  presence?.update({...state,since:reduced?6:state.since});
 }
 function renderOnce(){if(dead||lost||paused)return;try{transform(1/30);renderer.render(scene,camera);host.classList.add('jr-gpu-ready');}catch(error){contextLost({preventDefault(){}});}}
 function tick(now){if(dead||lost||paused||reduced)return;raf=requestAnimationFrame(tick);if(last&&now-last<31)return;
  const dt=last?Math.min((now-last)/1000,.08):1/30;last=now;elapsed+=dt;const begin=performance.now();transform(dt);
  try{renderer.render(scene,camera);}catch(error){contextLost({preventDefault(){}});return;}
  cost+=performance.now()-begin;frames++;
  if(frames===45){if(cost/frames>19&&renderer.getPixelRatio()>1)renderer.setPixelRatio(1);frames=0;cost=0;}
 }
 observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(host);
 window.addEventListener('resize',resize);input.addEventListener('pointermove',follow,{passive:true});input.addEventListener('pointerleave',leave);
 document.addEventListener('visibilitychange',visibility);resize();renderOnce();if(!reduced)raf=requestAnimationFrame(tick);
 return {
  dispose,
  setPhase(phase){if(dead)return;state.phase=phase;phaseAt=elapsed;previousPose=targetPose;targetPose=actorPose(phase);uniforms.fromPose.value=previousPose;uniforms.toPose.value=targetPose;blendAt=elapsed;renderOnce();},
  setPower(value){state.power=clamp(value);if(reduced)renderOnce();},
  setLit(value){state.lit=Math.max(0,value);if(reduced)renderOnce();},
  setTurn(value){state.turn=clamp(value,-10,10);if(reduced)renderOnce();},
  contact(point){if(dead||lost||reduced||!presence)return;const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;const x=Number.isFinite(point?.clientX)?(point.clientX-rect.left)/rect.width*2-1:0,y=Number.isFinite(point?.clientY)?(point.clientY-rect.top)/rect.height*2-1:0;presence.contact(x,y,elapsed);},
  setShot(value){if(dead||!value)return;state.story=!!options.story;state.shot=value.name;shotAt=elapsed;renderOnce();},
  setCovered(value){if(dead)return;covered=!!value;visibility();}
 };
}
