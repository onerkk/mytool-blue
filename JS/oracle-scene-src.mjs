import * as T from 'three';
/* 靜月靈籤・立體廟案（2026-11-12 全新製作）
 * 用真的立體模型取代原本的平面圖片：一張供桌、兩片筊、一個裝滿籤的籤筒，全程同一個鏡頭、同一張畫布。
 * 這裡只負責「演」：筊象、抽到哪一支籤、要不要重求，全部由 oracle.js 原本的規則決定，再把結果交給這裡演出來。
 * 效能：單一 WebGL 畫布、低面數、無後製、無即時陰影（用貼地的假陰影）、像素比上限 1.5、畫面不在時停止繪製。
 */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);},easeOut=t=>1-Math.pow(1-clamp(t),3);
export function supported(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
export function create(host){
  const reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  const res=new Set(),keep=x=>(res.add(x),x);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
  {const gl=renderer.getContext&&renderer.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){try{renderer.dispose();}catch(_){}throw new Error('webgl-unavailable');}}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
  const el=renderer.domElement;el.className='orc3d-canvas';el.setAttribute('aria-hidden','true');host.appendChild(el);
  let onLost=null;el.addEventListener('webglcontextlost',e=>{e.preventDefault();if(onLost)onLost();});
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(36,1,.1,60);
  const std=(color,rough,metal,extra={})=>keep(new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra}));
  const mesh=(g,m,p=scene)=>{const a=new T.Mesh(keep(g),m);p.add(a);return a;};

  // ── 光：兩支燭火（會搖）、一盞頂光、一點環境光、一盞「聖光」平常關著 ──
  scene.add(new T.HemisphereLight(0xffe2b8,0x1a0c05,.55));
  const key=new T.DirectionalLight(0xffe9c8,1.5);key.position.set(-2.5,6,4);scene.add(key);
  const candleL=new T.PointLight(0xffa24a,26,14,1.8);candleL.position.set(-3.1,1.5,-.6);scene.add(candleL);
  const candleR=new T.PointLight(0xffa24a,26,14,1.8);candleR.position.set(3.1,1.5,-.6);scene.add(candleR);
  const holy=new T.PointLight(0xffe2a0,0,18,1.4);holy.position.set(0,2.6,1.2);scene.add(holy);

  // ── 供桌：深色木面，前緣一道金邊；桌面用畫出來的木紋 ──
  const wood=document.createElement('canvas');wood.width=512;wood.height=512;{const g=wood.getContext('2d');const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#2a140a');gr.addColorStop(1,'#3b1d0e');g.fillStyle=gr;g.fillRect(0,0,512,512);for(let i=0;i<150;i++){g.strokeStyle='rgba('+(60+i%40)+','+(28+i%18)+',12,'+(.08+(i%7)*.02)+')';g.lineWidth=1+(i%3);g.beginPath();const y=(i*37)%512;g.moveTo(0,y);g.bezierCurveTo(140,y+((i*13)%22)-11,360,y-((i*7)%20)+10,512,y+((i*5)%14)-7);g.stroke();}}
  const woodTex=keep(new T.CanvasTexture(wood));woodTex.wrapS=woodTex.wrapT=T.RepeatWrapping;woodTex.repeat.set(2,1.4);woodTex.colorSpace=T.SRGBColorSpace;
  const table=mesh(new T.BoxGeometry(9.5,.5,5.6),std(0xffffff,.58,.08,{map:woodTex}));table.position.set(0,-.25,0);
  // 真實材質：Poly Haven 的大理石／深色木材貼圖（CC0）
  {const tl=new T.TextureLoader(),rp=t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2);return keep(t);};tl.load('assets/3d/tex/dark_wood_diffuse.jpg',t=>{if(disposed)return;t.colorSpace=T.SRGBColorSpace;table.material.map=rp(t);table.material.color.setHex(0xb08a6a);table.material.needsUpdate=true;});tl.load('assets/3d/tex/dark_wood_rough.jpg',t=>{if(disposed)return;table.material.roughnessMap=rp(t);table.material.roughness=1;table.material.needsUpdate=true;});}
  const trim=mesh(new T.BoxGeometry(9.6,.09,.09),std(0xc79a4a,.32,.85));trim.position.set(0,-.02,2.83);
  const cloth=mesh(new T.PlaneGeometry(5.2,3.4),std(0x6e1410,.82,.02));cloth.rotation.x=-Math.PI/2;cloth.position.set(0,.004,.5);
  const clothEdge=mesh(new T.RingGeometry(0,1,4),std(0xc79a4a,.4,.7));clothEdge.visible=false;
  // 兩支蠟燭（看得到的燭身與火焰）
  const flames=[];for(const sx of[-1,1]){const base=mesh(new T.CylinderGeometry(.2,.26,.12,20),std(0xb8893c,.35,.85));base.position.set(sx*3.1,.06,-.9);const body=mesh(new T.CylinderGeometry(.13,.14,1,18),std(0x9c1a14,.5,.05));body.position.set(sx*3.1,.62,-.9);const fl=mesh(new T.SphereGeometry(.09,12,10),keep(new T.MeshBasicMaterial({color:0xffd27a})));fl.scale.set(1,1.9,1);fl.position.set(sx*3.1,1.26,-.9);flames.push(fl);}
  // 貼地假陰影
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(0,0,0,.72)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const blob=(w,d)=>{const m=mesh(new T.PlaneGeometry(w,d),keep(new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false})));m.rotation.x=-Math.PI/2;m.position.y=.012;return m;};
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,236,190,1)');r.addColorStop(.35,'rgba(255,196,110,.5)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const glow=mesh(new T.PlaneGeometry(1,1),keep(new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0})));glow.rotation.x=-Math.PI/2;glow.position.set(0,.02,1);
  for(const f of flames){const g2=mesh(new T.PlaneGeometry(1.5,1.5),keep(new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.55})));g2.position.copy(f.position);f.userData.halo=g2;}

  // ── 筊：一面平、一面凸的新月形。用半個橢球加一片平底，再把兩端往內彎成月牙 ──
  const jiaoGeo=(()=>{const dome=new T.SphereGeometry(1,30,14,0,Math.PI*2,0,Math.PI/2),flat=new T.CircleGeometry(1,30);flat.rotateX(Math.PI/2);
    const bend=g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i)*.74,y=p.getY(i)*.2,z=p.getZ(i)*.3;const taper=1-Math.pow(Math.abs(x)/.74,2.2)*.72;z*=Math.max(.18,taper);y*=Math.max(.25,taper);z+=x*x*.62;p.setXYZ(i,x,y,z);}g.computeVertexNormals();return g;};
    return {dome:keep(bend(dome)),flat:keep(bend(flat))};})();
  const lacquer=std(0x9a1810,.3,.08),lacquerFlat=std(0xb5281b,.42,.05);
  const makeJiao=()=>{const g=new T.Group();mesh(jiaoGeo.dome,lacquer,g);mesh(jiaoGeo.flat,lacquerFlat,g);const s=blob(1.9,.9);scene.add(s);g.userData.shadow=s;scene.add(g);return g;};
  const jiao=[makeJiao(),makeJiao()];
  // 凸面朝上＝原樣；平面朝上＝翻過來
  const restQuat=(flatUp,yaw)=>new T.Quaternion().setFromEuler(new T.Euler(flatUp?Math.PI:0,yaw,0,'YXZ'));
  const restY=flatUp=>flatUp?.16:.012;

  // ── 籤筒：車出來的木筒、三道金箍、筒身一圈雲紋；裡面是一支支真的籤 ──
  const tube=new T.Group();scene.add(tube);
  const band=document.createElement('canvas');band.width=512;band.height=256;{const g=band.getContext('2d');g.fillStyle='#3a1c0d';g.fillRect(0,0,512,256);g.strokeStyle='#c99a45';g.lineWidth=5;for(let i=0;i<8;i++){const x=i*64+32;g.beginPath();g.arc(x,128,22,Math.PI*.1,Math.PI*1.75);g.stroke();g.beginPath();g.arc(x+14,118,9,0,Math.PI*1.6);g.stroke();}g.lineWidth=3;g.strokeRect(0,40,512,176);}
  const bandTex=keep(new T.CanvasTexture(band));bandTex.wrapS=T.RepeatWrapping;bandTex.colorSpace=T.SRGBColorSpace;
  const prof=[[.0,0],[.56,0],[.6,.05],[.58,.2],[.6,1.9],[.66,2.0],[.66,2.08],[.56,2.08],[.52,1.96],[.5,.16],[.0,.16]].map(p=>new T.Vector2(p[0],p[1]));
  mesh(new T.LatheGeometry(prof,44),std(0xffffff,.5,.12,{map:bandTex,side:T.DoubleSide}),tube);
  for(const y of[.14,1.05,2.02]){const r=mesh(new T.TorusGeometry(.62,.035,10,44),std(0xd0a04a,.28,.9),tube);r.rotation.x=Math.PI/2;r.position.y=y;}
  const tubeShadow=blob(2.1,2.1);
  const N=38,stickGeo=keep(new T.BoxGeometry(.05,2.5,.018)),lotGeo=keep(new T.BoxGeometry(.12,2.5,.02)),tipGeo=keep(new T.BoxGeometry(.056,.3,.022));
  const sticks=new T.InstancedMesh(stickGeo,std(0xb98a4e,.62,.02),N),tips=new T.InstancedMesh(tipGeo,std(0xd9ad52,.3,.85),N);tube.add(sticks,tips);
  const sd=[],dummy=new T.Object3D();for(let i=0;i<N;i++){const a=i*2.399963,r=.07+.4*Math.sqrt((i+.5)/N);sd.push({x:Math.cos(a)*r,z:Math.sin(a)*r,tx:(Math.sin(i*1.7))*.09,tz:(Math.cos(i*2.3))*.09,ry:i*.9,h:(i%5)*.05,ph:i*1.3});}
  const layoutSticks=(jit,t)=>{for(let i=0;i<N;i++){const d=sd[i],j=jit?Math.sin(t*24+d.ph)*.07*jit:0;dummy.position.set(d.x,1.42+d.h+j,d.z);dummy.rotation.set(d.tz+(jit?Math.sin(t*19+d.ph)*.03*jit:0),d.ry,d.tx);dummy.updateMatrix();sticks.setMatrixAt(i,dummy.matrix);dummy.position.y+=1.1;dummy.updateMatrix();tips.setMatrixAt(i,dummy.matrix);}sticks.instanceMatrix.needsUpdate=true;tips.instanceMatrix.needsUpdate=true;};
  layoutSticks(0,0);
  // 被抽出來的那一支：籤身、金頭、寫著籤號的一面
  const lot=new T.Group();scene.add(lot);mesh(lotGeo,std(0xd8b06a,.5,.02),lot);const lotTip=mesh(tipGeo,std(0xe3b95c,.26,.9),lot);lotTip.position.y=1.1;
  const lc=document.createElement('canvas');lc.width=64;lc.height=512;const lotTex=keep(new T.CanvasTexture(lc));lotTex.colorSpace=T.SRGBColorSpace;
  const lotFace=mesh(new T.PlaneGeometry(.11,2.3),keep(new T.MeshBasicMaterial({map:lotTex,transparent:true})),lot);lotFace.position.set(0,-.05,.0106);lotTip.scale.set(2.3,1,1.1);
  const lotShadow=blob(.5,2.7);lot.visible=false;lotShadow.visible=false;
  const writeLot=text=>{const g=lc.getContext('2d');g.clearRect(0,0,64,512);g.fillStyle='#5a1208';g.font='700 54px "Noto Serif TC",serif';g.textAlign='center';g.textBaseline='middle';const ch=String(text||'').split('');const step=Math.min(64,440/Math.max(1,ch.length));ch.forEach((c,i)=>g.fillText(c,32,256-(ch.length-1)*step/2+i*step));lotTex.needsUpdate=true;};

  // ── 金色火花（聖筊、出籤、三聖筊時才出現）──
  const PN=140,pPos=new Float32Array(PN*3),pVel=new Float32Array(PN*3),pLife=new Float32Array(PN);
  const pGeo=keep(new T.BufferGeometry());pGeo.setAttribute('position',new T.BufferAttribute(pPos,3));
  const sparks=new T.Points(pGeo,keep(new T.PointsMaterial({color:0xffd98a,size:.11,map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0})));sparks.frustumCulled=false;scene.add(sparks);
  let sparkT=0;const burst=(x,y,z,n,power)=>{for(let i=0;i<Math.min(PN,n);i++){const a=i*2.399963,u=(i*.618)%1,s=power*(.4+u);pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;pVel[i*3]=Math.cos(a)*s*.6;pVel[i*3+1]=s*(.9+u);pVel[i*3+2]=Math.sin(a)*s*.6;pLife[i]=1;}for(let i=n;i<PN;i++)pLife[i]=0;sparkT=1;};

  // ── 狀態 ──
  let phase='idle',t0=0,now=0,raf=0,running=false,disposed=false,W=1,H=1,gx=0,gy=0,shake=0,holyPulse=0,dim=0,rock=0,frameK=1;
  const cam={pos:new T.Vector3(0,3.4,8.6),look:new T.Vector3(0,.6,0)},camTo={pos:new T.Vector3(0,3.4,8.6),look:new T.Vector3(0,.6,0)};
  const view=(px,py,pz,lx,ly,lz)=>{camTo.pos.set(px,py,pz);camTo.look.set(lx,ly,lz);};
  const J=jiao.map((g,i)=>({g,sx:i?1:-1,p:new T.Vector3(i?.75:-.75,restY(false),1.3),q:restQuat(false,i?.5:-.4),from:new T.Vector3(),w:new T.Vector3(),mode:'rest',flatUp:false,land:new T.Vector3(),q0:new T.Quaternion(),q1:new T.Quaternion(),tl:0}));
  const tubeHome=new T.Vector3(0,0,-.3),tubeAside=new T.Vector3(-1.55,0,-1.25);
  const st={tube:tubeHome.clone(),tubeTo:tubeHome.clone(),tubeShow:1,jiaoShow:0,lot:'hidden',lotT:0};
  function setPhase(p,info){
    phase=p;t0=now;info=info||{};
    if(p==='ask'){st.tubeTo.copy(tubeAside);st.jiaoShow=1;J.forEach((j,i)=>{j.mode='rest';j.flatUp=false;j.p.set(i?.75:-.75,restY(false),1.25);j.q.copy(restQuat(false,i?.5:-.4));});view(0,3.3,7.2,0,-.5,.8);st.lot=st.lot==='table'?'table':'hidden';}
    else if(p==='toss'){st.jiaoShow=1;J.forEach((j,i)=>{j.mode='air';j.from.copy(j.p);j.w.set(9+i*2.3,(i?-1:1)*5.2,(i?1:-1)*6.4);j.tl=0;});view(0,2.9,7.6,0,.5,.6);}
    else if(p==='land'){const faces=info.faces||[false,false];J.forEach((j,i)=>{j.mode='fall';j.flatUp=!!faces[i];j.from.copy(j.p);j.q0.copy(j.q);j.q1.copy(restQuat(j.flatUp,(i?.7:-.5)+(info.yaw||0)*(i?1:-1)));j.land.set((i?.8:-.8)+(i?.1:-.15),restY(j.flatUp),1.2+(i?.25:-.1));j.tl=now;});view(0,3.9,6.6,0,-.6,1.0);
      const r=info.result;setTimeout(()=>{shake=1;if(r==='holy'){holyPulse=1;burst(0,.2,1.2,90,3.4);}else if(r==='dark'){dim=1;}else if(r==='laugh'){rock=1;}},430);}
    else if(p==='shake'){st.tubeTo.copy(tubeHome);st.jiaoShow=0;st.lot='hidden';view(0,3.0,6.6,0,.5,-.2);}
    else if(p==='rise'){st.tubeTo.copy(tubeHome);st.jiaoShow=0;st.lot='rise';st.lotT=now;writeLot(info.label);view(0,3.3,6.0,0,1.3,-.1);setTimeout(()=>burst(0,3.2,-.2,46,2.2),1050);}
    else if(p==='drawn'){st.tubeTo.copy(tubeAside);st.jiaoShow=1;if(st.lot!=='table'){st.lot='fly';st.lotT=now;}if(info.label)writeLot(info.label);J.forEach((j,i)=>{if(j.mode!=='rest'){j.mode='rest';}j.p.set(i?1.2:-1.2,restY(j.flatUp),1.9);j.q.copy(restQuat(j.flatUp,i?.6:-.5));});view(0,4.6,5.6,0,-.7,.9);}
    else if(p==='finale'){holyPulse=1.8;burst(0,.3,1,140,4.6);view(0,5.2,6.8,0,.6,.6);}
    else if(p==='rest'){view(0,3.4,8.6,0,.6,0);}
    start();
  }
  function resize(){const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);camera.aspect=W/H;camera.fov=W/H<.7?44:36;frameK=Math.max(1,Math.min(2.2,.78/(W/H)));camera.updateProjectionMatrix();}
  const tmp=new T.Vector3(),qa=new T.Quaternion(),e3=new T.Euler();
  function frame(ms){
    raf=0;if(disposed||!running)return;const t=ms/1000,dt=Math.min(.05,Math.max(.001,t-(now||t)));now=t;const el=t-t0;
    // 燭火
    const f1=.82+.18*Math.sin(t*9.1)+.08*Math.sin(t*23.3),f2=.82+.18*Math.sin(t*7.7+1.3)+.08*Math.sin(t*19.9);
    const dm=1-dim*.72;candleL.intensity=26*f1*dm;candleR.intensity=26*f2*dm;key.intensity=1.5*dm;flames[0].scale.y=1.9*(.9+.2*f1);flames[1].scale.y=1.9*(.9+.2*f2);flames.forEach((f,i)=>{f.userData.halo.material.opacity=.45*(i?f2:f1)*dm;f.userData.halo.quaternion.copy(camera.quaternion);});
    dim=Math.max(0,dim-dt*.45);holyPulse=Math.max(0,holyPulse-dt*.7);holy.intensity=holyPulse*70;glow.material.opacity=Math.min(1,holyPulse)*.9;glow.scale.setScalar(2+ (1.8-Math.min(1.8,holyPulse))*5);
    // 鏡頭
    cam.pos.lerp(camTo.pos,1-Math.pow(.02,dt));cam.look.lerp(camTo.look,1-Math.pow(.02,dt));shake=Math.max(0,shake-dt*3.2);
    tmp.copy(cam.pos).sub(cam.look).multiplyScalar(frameK).add(cam.look);camera.position.set(tmp.x+gx*.35+Math.sin(t*61)*.07*shake,tmp.y+gy*.2+Math.cos(t*53)*.06*shake,tmp.z);camera.lookAt(cam.look);
    // 筊
    for(const j of J){const g=j.g,i=j.sx>0?1:0;
      if(j.mode==='air'){const u=el;const up=7.4,grav=9.8;j.p.set(j.from.x+j.sx*.22*u,Math.max(.4,j.from.y+up*u-.5*grav*u*u+ (u>1.35?(u-1.35)*2.2:0)),j.from.z-.55*u);e3.set(j.w.x*u,j.w.y*u,j.w.z*u);j.q.setFromEuler(e3);if(u>1.5){j.p.y=Math.max(j.p.y,2.2+Math.sin(t*5+i)*.25);}}
      else if(j.mode==='fall'){const u=(now-j.tl)/.44;if(u<1){const k=u*u;j.p.lerpVectors(j.from,j.land,k);j.p.y=mix(j.from.y,j.land.y,k);qa.copy(j.q0);e3.set((1-u)*7*j.sx,(1-u)*3,(1-u)*5);j.q.setFromEuler(e3).premultiply(qa).slerp(j.q1,ease(u));}
        else{const b=(now-j.tl-.44);const hop=Math.max(0,Math.sin(b*11))*Math.exp(-b*5.2)*.5;j.p.copy(j.land);j.p.y=j.land.y+hop;const wob=Math.sin(b*15+i)*Math.exp(-b*(rock>0?1.3:4.2))*(rock>0?.5:.32);e3.set(wob,0,wob*.6);j.q.setFromEuler(e3).premultiply(j.q1);if(b>2.6&&rock<=0)j.mode='rest';}}
      g.position.copy(j.p);g.quaternion.copy(j.q);g.visible=st.jiaoShow>0;const s=g.userData.shadow;s.visible=g.visible;s.position.set(j.p.x,.012,j.p.z);const hgt=clamp(1-j.p.y/3.5);s.material.opacity=.15+.7*hgt;s.scale.setScalar(.7+.6*(1-hgt)+.3);}
    rock=Math.max(0,rock-dt*.4);
    // 籤筒
    st.tube.lerp(st.tubeTo,1-Math.pow(.015,dt));tube.position.copy(st.tube);let jit=0;
    if(phase==='shake'&&!reduced){const k=Math.min(1,el/.5),sp=13+el*5;tube.rotation.z=Math.sin(t*sp)*.3*k;tube.rotation.x=Math.cos(t*sp*.83)*.2*k-.12*k;tube.position.y=Math.abs(Math.sin(t*sp))*.2*k;tube.position.x+=Math.sin(t*sp*.5)*.14*k;jit=k;}
    else{tube.rotation.z*=Math.pow(.004,dt);tube.rotation.x*=Math.pow(.004,dt);tube.position.y*=Math.pow(.004,dt);}
    layoutSticks(jit,t);tubeShadow.position.set(tube.position.x,.011,tube.position.z);
    // 抽出的那一支籤
    if(st.lot==='hidden'){lot.visible=false;lotShadow.visible=false;}
    else{lot.visible=true;const u=now-st.lotT;
      if(st.lot==='rise'){const k=easeOut(u/1.7);lot.position.set(tube.position.x,1.3+k*1.75,tube.position.z+.05);lot.rotation.set(0,Math.sin(u*2.2)*.5*(1-k),0);lotShadow.visible=false;}
      else if(st.lot==='fly'){const k=ease(u/.95);tmp.set(mix(0,0,k),mix(3.05,.035,k)+Math.sin(k*Math.PI)*.9,mix(-.25,1.05,k));lot.position.copy(tmp);lot.rotation.set(mix(0,-Math.PI/2,k),0,mix(0,.06,k));lotShadow.visible=k>.5;lotShadow.position.set(0,.011,1.05);lotShadow.material.opacity=k;if(u>.95){st.lot='table';shake=Math.max(shake,.35);}}
      else{lot.position.set(0,.035,1.05);lot.rotation.set(-Math.PI/2,0,.06);lotShadow.visible=true;lotShadow.position.set(0,.011,1.05);lotShadow.material.opacity=1;}}
    // 火花
    if(sparkT>0){let alive=0;for(let i=0;i<PN;i++){if(pLife[i]<=0)continue;alive++;pVel[i*3+1]-=5.2*dt;pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;pLife[i]-=dt*.62;if(pPos[i*3+1]<.02){pPos[i*3+1]=.02;pVel[i*3+1]*=-.35;}}pGeo.attributes.position.needsUpdate=true;sparkT=alive?Math.max(0,sparkT-dt*.5):0;sparks.material.opacity=Math.min(1,sparkT*1.6);}
    renderer.render(scene,camera);
    raf=requestAnimationFrame(frame);
  }
  function start(){if(disposed)return;running=true;if(!raf)raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(ro)ro.observe(host);window.addEventListener('resize',resize);resize();
  const onVis=()=>{if(document.hidden)stop();else if(el.isConnected&&host.offsetParent!==null)start();};document.addEventListener('visibilitychange',onVis);
  return {
    phase:setPhase,start,stop,resize,
    onLost(fn){onLost=fn;},
    tilt(x,y){gx=clamp(x,-1,1);gy=clamp(y,-1,1);},
    attach(h){if(el.parentNode!==h)h.appendChild(el);host=h;resize();},
    get state(){return phase;},
    dispose(){disposed=true;stop();if(ro)ro.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);res.forEach(x=>{try{x.dispose&&x.dispose();}catch(_){}});renderer.dispose();if(el.parentNode)el.parentNode.removeChild(el);}
  };
}
