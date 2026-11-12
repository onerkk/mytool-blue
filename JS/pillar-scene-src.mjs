import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/* 靜月八字・立體四柱殿（2026-11-12 全新製作）
 * 原本的過場是平面圖片疊在一起（人物、四塊牌位、文字），使用者實機錄影顯示會破圖、卡頓，也不像真的在「立柱」。
 * 這裡改成真的立體場景：一座刻著十二地支與十天干的石盤，上面立著年、月、日、時四根柱。
 * 使用者一根一根點亮：柱身升起、該柱的天干地支燒進柱面、地上的干支盤轉到對應的位置；四柱亮齊後，四道光匯到中央的日主。
 * 柱上的干支是 bazi 程式算好後傳進來的，這裡只負責演出。單一 WebGL 畫布、無後製；太慢會自動關陰影並降解析度。
 */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const ZHI='子丑寅卯辰巳午未申酉戌亥',GAN='甲乙丙丁戊己庚辛壬癸',NAMES=['年','月','日','時'];
export function create(host,opts){
  opts=opts||{};const res=new Set(),keep=x=>(res.add(x),x),vals=(opts.pillars||[]).map(v=>String(v||''));
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
  {const gl=renderer.getContext&&renderer.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){try{renderer.dispose();}catch(_){}throw new Error('webgl-unavailable');}}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const el=renderer.domElement;el.className='pil3d-canvas';host.appendChild(el);let onLost=null;el.addEventListener('webglcontextlost',e=>{e.preventDefault();if(onLost)onLost();});
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,80);
  {const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.2;keep(env.texture);pm.dispose();}
  scene.add(new T.HemisphereLight(0xbfd0ff,0x08060e,.42));
  const key=new T.SpotLight(0xfff1dc,70,34,.7,.6,1.3);key.position.set(-2.4,10,6);key.target.position.set(0,1,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0006;key.shadow.radius=5;scene.add(key,key.target);
  const serif='"Noto Serif TC","Songti TC","PMingLiU",serif';
  // ── 石盤：外圈十二地支、內圈十天干、刻度與金線 ──
  const dc=document.createElement('canvas');dc.width=dc.height=2048;{const g=dc.getContext('2d'),C=1024,r=g.createRadialGradient(C,C,80,C,C,C);r.addColorStop(0,'#232a3f');r.addColorStop(.6,'#161b2c');r.addColorStop(1,'#0a0d18');g.fillStyle=r;g.fillRect(0,0,2048,2048);
    let sd=5;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<26000;i++){g.fillStyle='rgba('+(rnd()>.5?'255,255,255':'0,0,0')+','+(.02+rnd()*.035)+')';g.fillRect(rnd()*2048,rnd()*2048,1+rnd()*2,1+rnd()*2);}
    const au=a=>'rgba(224,188,108,'+a+')';for(const [rr,lw,al] of [[990,8,.9],[870,3,.7],[690,3,.7],[520,2,.55],[300,2,.5]]){g.strokeStyle=au(al);g.lineWidth=lw;g.beginPath();g.arc(C,C,rr,0,7);g.stroke();}
    g.textAlign='center';g.textBaseline='middle';
    for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2;g.save();g.translate(C+Math.cos(a)*780,C+Math.sin(a)*780);g.rotate(a+Math.PI/2);g.fillStyle=au(.92);g.font='600 150px '+serif;g.fillText(ZHI[i],0,0);g.restore();const b=a+Math.PI/12;g.strokeStyle=au(.55);g.lineWidth=3;g.beginPath();g.moveTo(C+Math.cos(b)*690,C+Math.sin(b)*690);g.lineTo(C+Math.cos(b)*870,C+Math.sin(b)*870);g.stroke();}
    for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2;g.save();g.translate(C+Math.cos(a)*605,C+Math.sin(a)*605);g.rotate(a+Math.PI/2);g.fillStyle=au(.8);g.font='500 104px '+serif;g.fillText(GAN[i],0,0);g.restore();}
    for(let i=0;i<60;i++){const a=i*Math.PI/30;g.strokeStyle=au(i%5?.3:.7);g.lineWidth=i%5?1.5:3;g.beginPath();g.moveTo(C+Math.cos(a)*930,C+Math.sin(a)*930);g.lineTo(C+Math.cos(a)*(i%5?952:968),C+Math.sin(a)*(i%5?952:968));g.stroke();}
    g.strokeStyle=au(.5);g.lineWidth=3;g.beginPath();g.arc(C,C,150,Math.PI/2,Math.PI*1.5);g.arc(C,C-75,75,-Math.PI/2,Math.PI/2);g.arc(C,C+75,75,-Math.PI/2,Math.PI/2,true);g.stroke();g.beginPath();g.arc(C,C,150,0,7);g.stroke();}
  const discTex=keep(new T.CanvasTexture(dc));discTex.colorSpace=T.SRGBColorSpace;discTex.wrapS=T.RepeatWrapping;discTex.repeat.x=-1;discTex.offset.x=1;discTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const R=4.6,disc=new T.Mesh(keep(new T.CylinderGeometry(R,R+.12,.22,96)),[keep(new T.MeshStandardMaterial({color:0x1a1f30,roughness:.7,metalness:.25})),keep(new T.MeshStandardMaterial({map:discTex,roughness:.72,metalness:.18})),keep(new T.MeshStandardMaterial({color:0x10131f,roughness:.8}))]);disc.position.y=-.11;disc.receiveShadow=true;scene.add(disc);
  const rim=new T.Mesh(keep(new T.TorusGeometry(R+.02,.06,12,120)),keep(new T.MeshStandardMaterial({color:0xc9a04f,roughness:.3,metalness:.92})));rim.rotation.x=Math.PI/2;rim.position.y=.0;scene.add(rim);
  // ── 四根柱：墨玉柱身、金框、柱頂寫年月日時；柱面的干支一開始是暗的，點亮才燒出來 ──
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,240,200,1)');r.addColorStop(.3,'rgba(255,200,116,.5)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const PW=.92,PH=2.5,PD=.3,geo=keep(new T.BoxGeometry(PW,PH,PD)),side=keep(new T.MeshStandardMaterial({color:0x10171c,roughness:.38,metalness:.35})),capMat=keep(new T.MeshStandardMaterial({color:0xc9a04f,roughness:.3,metalness:.9}));
  const pillars=[];
  for(let i=0;i<4;i++){const x=(i-1.5)*1.18,z=-.35+Math.abs(i-1.5)*.16,v=vals[i]||'';
    const bc=document.createElement('canvas');bc.width=368;bc.height=1000;{const g=bc.getContext('2d'),gr=g.createLinearGradient(0,0,0,1000);gr.addColorStop(0,'#16262a');gr.addColorStop(.5,'#0d181c');gr.addColorStop(1,'#091013');g.fillStyle=gr;g.fillRect(0,0,368,1000);g.strokeStyle='rgba(216,180,98,.95)';g.lineWidth=8;g.strokeRect(14,14,340,972);g.lineWidth=2;g.strokeRect(30,30,308,940);g.fillStyle='rgba(224,190,112,.95)';g.font='500 58px '+serif;g.textAlign='center';g.textBaseline='middle';g.fillText(NAMES[i]+'柱',184,96);g.strokeStyle='rgba(216,180,98,.6)';g.beginPath();g.moveTo(70,150);g.lineTo(298,150);g.stroke();
      g.fillStyle='rgba(120,128,132,.16)';g.font='600 250px '+serif;const ch=v.length>=2?[v[0],v[1]]:v?[v]:[NAMES[i]];ch.forEach((c,k)=>g.fillText(c,184,ch.length===2?(390+k*310):560));}
    const ec=document.createElement('canvas');ec.width=368;ec.height=1000;{const g=ec.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,368,1000);g.fillStyle='#fff';g.font='600 250px '+serif;g.textAlign='center';g.textBaseline='middle';const ch=v.length>=2?[v[0],v[1]]:v?[v]:[NAMES[i]];ch.forEach((c,k)=>g.fillText(c,184,ch.length===2?(390+k*310):560));g.font='500 58px '+serif;g.fillText(NAMES[i]+'柱',184,96);}
    const bt=keep(new T.CanvasTexture(bc)),et=keep(new T.CanvasTexture(ec));bt.colorSpace=T.SRGBColorSpace;bt.anisotropy=et.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const face=keep(new T.MeshStandardMaterial({map:bt,emissive:0xffcf7a,emissiveMap:et,emissiveIntensity:0,roughness:.35,metalness:.3}));
    const m=new T.Mesh(geo,[side,side,side,side,face,side]);m.castShadow=true;m.receiveShadow=true;m.position.set(x,PH/2-1.25,z);m.rotation.y=-(i-1.5)*.13;m.userData.i=i;scene.add(m);
    const cap=new T.Mesh(keep(new T.BoxGeometry(PW+.1,.1,PD+.1)),capMat);cap.position.y=PH/2+.05;m.add(cap);const base=new T.Mesh(keep(new T.BoxGeometry(PW+.16,.14,PD+.16)),capMat);base.position.y=-PH/2+.07;m.add(base);
    const lamp=new T.PointLight(0xffc878,0,6,1.6);lamp.position.set(0,.2,.9);m.add(lamp);
    const beam=new T.Mesh(keep(new T.CylinderGeometry(.34,.5,7,20,1,true)),keep(new T.MeshBasicMaterial({map:glowTex,color:0xffd58a,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide})));beam.position.y=PH/2+3.4;m.add(beam);
    const halo=new T.Sprite(keep(new T.SpriteMaterial({map:glowTex,color:0xffcf80,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending})));halo.scale.set(3.2,3.2,1);halo.position.set(0,.1,.3);m.add(halo);
    pillars.push({m,face,lamp,beam,halo,x,z,lit:0,litAt:-1,rise:0,branch:ZHI.indexOf(v[1]||''),bx:x});}
  // 中央的日主：四柱亮齊後才出現
  const orb=new T.Sprite(keep(new T.SpriteMaterial({map:glowTex,color:0xfff0c8,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending})));orb.position.set(0,3.5,.1);orb.scale.set(.1,.1,1);scene.add(orb);
  const orbLight=new T.PointLight(0xffe2a8,0,12,1.4);orbLight.position.copy(orb.position);scene.add(orbLight);
  const links=pillars.map(p=>{const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));const l=new T.Line(g,keep(new T.LineBasicMaterial({color:0xffd98a,transparent:true,opacity:0,blending:T.AdditiveBlending})));scene.add(l);return l;});
  // ── 狀態 ──
  let now=0,raf=0,running=false,disposed=false,W=1,H=1,frameK=1,gx=0,gy=0,spin=0,spinTo=0,doneAt=-1,frames=0,slow=0,degraded=false,shake=0;
  const cam={pos:new T.Vector3(0,3.6,9),look:new T.Vector3(0,1.0,0)},camTo={pos:new T.Vector3(0,3.6,9),look:new T.Vector3(0,1.0,0)},tmp=new T.Vector3();
  function resize(){const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);camera.aspect=W/H;frameK=Math.max(1,Math.min(2,.72/(W/H)));camera.updateProjectionMatrix();}
  function frame(ms){raf=0;if(disposed||!running)return;const t=ms/1000,dt=Math.min(.05,Math.max(.001,t-(now||t)));now=t;
    if(!degraded&&frames<140){frames++;if(frames>20&&dt>.034)slow++;if(frames===140&&slow>55){degraded=true;renderer.shadowMap.enabled=false;key.castShadow=false;renderer.setPixelRatio(1);resize();renderer.render(scene,camera);scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}}
    spin=mix(spin,spinTo,1-Math.pow(.04,dt));disc.rotation.y=spin+t*.02;shake=Math.max(0,shake-dt*3);
    cam.pos.lerp(camTo.pos,1-Math.pow(.04,dt));cam.look.lerp(camTo.look,1-Math.pow(.04,dt));tmp.copy(cam.pos).sub(cam.look).multiplyScalar(frameK).add(cam.look);camera.position.set(tmp.x+gx*.4+Math.sin(t*57)*.04*shake,tmp.y+gy*.25+Math.cos(t*49)*.04*shake,tmp.z);camera.lookAt(cam.look);
    let all=true;for(const p of pillars){if(p.litAt<0){all=false;p.m.position.y=mix(p.m.position.y,PH/2-1.25,.1);p.halo.material.opacity=.1+.08*Math.sin(t*2.4+p.x);continue;}
      const u=clamp((now-p.litAt)/1.15),k=ease(u);p.m.position.y=mix(PH/2-1.25,PH/2,k)+Math.sin(clamp((now-p.litAt-1.15)/.35)*Math.PI)*-.05;p.face.emissiveIntensity=mix(0,1.35,ease((now-p.litAt-.35)/.9))*(.92+.08*Math.sin(t*3+p.x));p.lamp.intensity=10*k;p.beam.material.opacity=Math.max(0,Math.sin(clamp((now-p.litAt)/1.8)*Math.PI))*.55+.06*k;p.halo.material.opacity=.3*k;if(u<1)all=false;}
    if(all&&doneAt<0){doneAt=now;camTo.pos.set(0,4.6,9.6);camTo.look.set(0,1.2,.3);if(opts.onAllLit)opts.onAllLit();}
    if(doneAt>=0){const u=ease((now-doneAt)/1.6);orb.material.opacity=u*.85;orb.scale.setScalar(.1+u*1.15*(.95+.05*Math.sin(t*4)));orbLight.intensity=9*u;links.forEach((l,i)=>{const a=l.geometry.attributes.position.array,p=pillars[i];a[0]=p.x;a[1]=PH-.05;a[2]=p.z+.2;a[3]=mix(p.x,orb.position.x,u);a[4]=mix(PH-.05,orb.position.y,u);a[5]=mix(p.z+.2,orb.position.z,u);l.geometry.attributes.position.needsUpdate=true;l.material.opacity=.75*u;});}
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
  function start(){if(disposed)return;running=true;if(!raf)raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(ro)ro.observe(host);window.addEventListener('resize',resize);resize();
  const onVis=()=>{if(document.hidden)stop();else start();};document.addEventListener('visibilitychange',onVis);
  function light(i){const p=pillars[i];if(!p||p.litAt>=0)return false;p.litAt=now;shake=.6;if(p.branch>=0)spinTo=(Math.PI/6)*p.branch-Math.atan2(p.x,3.4);else spinTo+=Math.PI/2;camTo.pos.set(p.x*.35,3.3,8.4);camTo.look.set(p.x*.5,1.25,0);return true;}
  const ray=new T.Raycaster(),v2=new T.Vector2();
  el.addEventListener('pointerup',e=>{const r=el.getBoundingClientRect();v2.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(v2,camera);const h=ray.intersectObjects(pillars.map(p=>p.m),false);let i=h.length?h[0].object.userData.i:-1;
    if(i<0){let bd=1e9;pillars.forEach((p,k)=>{tmp.copy(p.m.position).project(camera);const sx=(tmp.x*.5+.5)*r.width+r.left,d=Math.abs(sx-e.clientX);if(d<bd&&Math.abs((-tmp.y*.5+.5)*r.height+r.top-e.clientY)<r.height*.3){bd=d;i=k;}});if(bd>r.width*.16)i=-1;}
    if(i>=0&&light(i)&&opts.onLight)opts.onLight(i,pillars.filter(p=>p.litAt>=0).length);});
  start();
  return {start,stop,resize,onLost(fn){onLost=fn;},light(i){if(light(i)&&opts.onLight)opts.onLight(i,pillars.filter(p=>p.litAt>=0).length);},next(){const i=pillars.findIndex(p=>p.litAt<0);if(i>=0)this.light(i);return i;},litCount(){return pillars.filter(p=>p.litAt>=0).length;},tilt(x,y){gx=clamp(x,-1,1);gy=clamp(y,-1,1);},
    dispose(){disposed=true;stop();if(ro)ro.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);res.forEach(x=>{try{x.dispose&&x.dispose();}catch(_){}});renderer.dispose();if(el.parentNode)el.parentNode.removeChild(el);}};
}
