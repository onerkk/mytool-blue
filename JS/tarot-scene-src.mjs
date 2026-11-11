import * as T from 'three';
/* 靜月塔羅・立體牌桌（2026-11-12 全新製作）
 * 一張月下牌桌、七十八張真的有厚度的牌：洗牌（用手在桌上攪）、收牌、切三疊、展成一道弧、伸手選牌、牌飛到牌位、逐張翻開。
 * 這裡只負責「演」與回報使用者點了哪一張；抽到哪張牌、正逆位，仍由原本的塔羅程式決定後交給這裡翻出來。
 * 效能：單一 WebGL 畫布、七十八個共用幾何與材質的網格、無後製、無即時陰影、像素比上限 1.5、不顯示時停止繪製。
 */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const CW=.62,CL=1.06,CT=.012,N=78;
export function create(host,opts){
  opts=opts||{};const res=new Set(),keep=x=>(res.add(x),x);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
  {const gl=renderer.getContext&&renderer.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){try{renderer.dispose();}catch(_){}throw new Error('webgl-unavailable');}}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0x05070f,1);renderer.outputColorSpace=T.SRGBColorSpace;
  const el=renderer.domElement;el.className='tar3d-canvas';host.appendChild(el);let onLost=null;el.addEventListener('webglcontextlost',e=>{e.preventDefault();if(onLost)onLost();});
  const scene=new T.Scene();scene.fog=new T.Fog(0x05070f,16,34);const camera=new T.PerspectiveCamera(40,1,.1,80);
  const loader=new T.TextureLoader();
  // ── 光：冷色月光從上方、兩側暖色燭光、揭牌時的金光 ──
  scene.add(new T.HemisphereLight(0xcfd9ff,0x0a0a14,.75));
  const moon=new T.DirectionalLight(0xdfe6ff,1.35);moon.position.set(-2,9,3);scene.add(moon);
  const cL=new T.PointLight(0xffb060,22,16,1.7);cL.position.set(-4.2,1.4,-1.6);scene.add(cL);
  const cR=new T.PointLight(0xffb060,22,16,1.7);cR.position.set(4.2,1.4,-1.6);scene.add(cR);
  const gold=new T.PointLight(0xffe1a0,0,14,1.5);gold.position.set(0,1.6,1.6);scene.add(gold);
  // ── 牌桌：深藍絨布，上面一圈金線月相紋 ──
  const tc=document.createElement('canvas');tc.width=tc.height=1024;{const g=tc.getContext('2d'),r=g.createRadialGradient(512,512,40,512,512,720);r.addColorStop(0,'#172447');r.addColorStop(.6,'#0d1630');r.addColorStop(1,'#060a18');g.fillStyle=r;g.fillRect(0,0,1024,1024);
    for(let i=0;i<5200;i++){g.fillStyle='rgba(255,255,255,'+(.012+(i%5)*.004)+')';g.fillRect((i*193)%1024,(i*389)%1024,1,2);}
    g.strokeStyle='rgba(214,178,96,.6)';g.lineWidth=3;g.beginPath();g.arc(512,512,360,0,7);g.stroke();g.lineWidth=1.5;g.beginPath();g.arc(512,512,378,0,7);g.stroke();g.beginPath();g.arc(512,512,236,0,7);g.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=512+Math.cos(a)*298,y=512+Math.sin(a)*298,ph=i/8;g.fillStyle='rgba(214,178,96,.85)';g.beginPath();g.arc(x,y,20,0,7);g.fill();g.fillStyle='#0d1630';g.beginPath();g.arc(x+(ph-.5)*44,y,20,0,7);g.fill();g.strokeStyle='rgba(214,178,96,.7)';g.lineWidth=1.5;g.beginPath();g.arc(x,y,20,0,7);g.stroke();}
    for(let i=0;i<24;i++){const a=i*Math.PI/12;g.strokeStyle='rgba(214,178,96,.35)';g.lineWidth=1;g.beginPath();g.moveTo(512+Math.cos(a)*236,512+Math.sin(a)*236);g.lineTo(512+Math.cos(a)*258,512+Math.sin(a)*258);g.stroke();}}
  const tableTex=keep(new T.CanvasTexture(tc));tableTex.colorSpace=T.SRGBColorSpace;
  const table=new T.Mesh(keep(new T.PlaneGeometry(22,22)),keep(new T.MeshStandardMaterial({map:tableTex,roughness:.92,metalness:0})));table.rotation.x=-Math.PI/2;scene.add(table);
  const flames=[];for(const sx of[-1,1]){const body=new T.Mesh(keep(new T.CylinderGeometry(.14,.16,1.1,16)),keep(new T.MeshStandardMaterial({color:0xe9e2d0,roughness:.6})));body.position.set(sx*4.2,.55,-1.9);scene.add(body);const fl=new T.Mesh(keep(new T.SphereGeometry(.09,10,8)),keep(new T.MeshBasicMaterial({color:0xffd27a})));fl.scale.set(1,2,1);fl.position.set(sx*4.2,1.28,-1.9);scene.add(fl);flames.push(fl);}
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,236,190,1)');r.addColorStop(.35,'rgba(255,196,110,.45)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const halo=new T.Mesh(keep(new T.PlaneGeometry(1,1)),keep(new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0})));halo.rotation.x=-Math.PI/2;halo.position.y=.03;scene.add(halo);
  // ── 牌：有厚度的盒形，上面是牌背、下面是牌面（翻開時才貼上真正抽到的那張）──
  const backTex=keep(loader.load(opts.back||'assets/cards/bright-20261011/tarot/back.webp'));backTex.colorSpace=T.SRGBColorSpace;backTex.anisotropy=4;
  const edgeMat=keep(new T.MeshStandardMaterial({color:0xe8dcc0,roughness:.7})),backMat=keep(new T.MeshStandardMaterial({map:backTex,roughness:.55,metalness:.05})),blankMat=keep(new T.MeshStandardMaterial({color:0xf2ead8,roughness:.7}));
  const cardGeo=keep(new T.BoxGeometry(CW,CT,CL));
  const cards=[];for(let i=0;i<N;i++){const m=new T.Mesh(cardGeo,[edgeMat,edgeMat,backMat,blankMat,edgeMat,edgeMat]);m.userData.i=i;scene.add(m);
    cards.push({m,p:new T.Vector3(0,CT/2+i*CT,0),tp:new T.Vector3(0,CT/2+i*CT,0),ry:0,try_:0,rz:0,trz:0,rx:0,k:9,seed:(i*0.618)%1,a:i*2.399963,r:.4+((i*37)%100)/100*1.9,picked:-1,rev:false,lift:0});}
  // ── 狀態 ──
  let mode='stack',t0=0,now=0,raf=0,running=false,disposed=false,W=1,H=1,frameK=1,swirl=0,spin=0,scroll=38.5,scrollV=0,hover=-1,slots=[],revealGlow=0,gx=0,gy=0;
  const order=[];for(let i=0;i<N;i++)order.push(i);   // 展開弧上的順序（只是擺放順序，與抽到什麼牌無關）
  const cam={pos:new T.Vector3(0,9,6),look:new T.Vector3(0,0,.3)},camTo={pos:new T.Vector3(0,9,6),look:new T.Vector3(0,0,.3)};
  const view=(px,py,pz,lx,ly,lz)=>{camTo.pos.set(px,py,pz);camTo.look.set(lx,ly,lz);};
  const remaining=()=>order.filter(i=>cards[i].picked<0);
  function layoutSlots(n){slots=[];const cols=Math.min(n,n<=5?n:Math.ceil(n/2)),rows=Math.ceil(n/cols),sc=cols>=5?.8:1,dx=CW*sc+.14,dz=CL*sc+.16;for(let i=0;i<n;i++){const r=Math.floor(i/cols),c=i%cols,inRow=r===rows-1?n-cols*(rows-1):cols;slots.push({x:(c-(inRow-1)/2)*dx,z:2.35+r*dz,s:sc});}}
  function setMode(m,info){mode=m;t0=now;info=info||{};
    if(m==='stack'){cards.forEach((c,i)=>{c.tp.set(0,CT/2+i*CT,0);c.try_=0;c.trz=0;c.k=7;});view(0,7.5,6.4,0,.3,.2);}
    else if(m==='wash'){swirl=.9;view(0,11,3.2,0,0,0);cards.forEach(c=>{c.k=5;});}
    else if(m==='gather'){cards.forEach((c,i)=>{const j=(i*29)%N;c.tp.set(0,CT/2+j*CT,0);c.try_=0;c.k=6;});view(0,7.5,6.4,0,.3,.2);}
    else if(m==='cut'){view(0,6.6,6.8,0,.2,.2);}
    else if(m==='ribbon'){layoutSlots(info.count||slots.length||3);scroll=38.5;scrollV=0;cards.forEach(c=>{c.k=6;});view(0,6.0,6.6,0,.1,1.25);}
    else if(m==='reveal'){view(0,7.6,6.2,0,.1,2.0);}
    start();}
  function ribbonPose(c,idx,cnt){const u=idx-scroll,x=u*.36,vis=Math.abs(u)<12;c.tp.set(x,CT/2+idx*.002+(c.lift>0?.12*c.lift:0),-.2+x*x*.03-(c.lift>0?.22*c.lift:0));c.try_=-x*.075;c.trz=0;c.m.visible=vis||c.picked>=0;if(c.picked<0)c.m.scale.setScalar(1.5);}
  const ray=new T.Raycaster(),v2=new T.Vector2(),tmp=new T.Vector3();
  function hit(cx,cy){const r=el.getBoundingClientRect();v2.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(v2,camera);const list=cards.filter(c=>c.picked<0&&c.m.visible).map(c=>c.m);const h=ray.intersectObjects(list,false);if(h.length)return h[0].object.userData.i;let best=-1,bd=1e9;for(const c of cards){if(c.picked>=0||!c.m.visible)continue;tmp.copy(c.m.position).project(camera);const sx=(tmp.x*.5+.5)*r.width+r.left,sy=(-tmp.y*.5+.5)*r.height+r.top,dy=Math.abs(sy-cy);if(dy>r.height*.11)continue;const d=Math.abs(sx-cx)+dy*.4;if(d<bd){bd=d;best=c.m.userData.i;}}return bd<r.width*.2?best:-1;}
  function resize(){const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);camera.aspect=W/H;frameK=Math.max(1,Math.min(2.2,.82/(W/H)));camera.updateProjectionMatrix();}
  function frame(ms){raf=0;if(disposed||!running)return;const t=ms/1000,dt=Math.min(.05,Math.max(.001,t-(now||t)));now=t;const e=t-t0;
    const f1=.85+.15*Math.sin(t*8.7)+.07*Math.sin(t*21),f2=.85+.15*Math.sin(t*7.3+1)+.07*Math.sin(t*18);cL.intensity=22*f1;cR.intensity=22*f2;flames[0].scale.y=2*(.9+.2*f1);flames[1].scale.y=2*(.9+.2*f2);
    revealGlow=Math.max(0,revealGlow-dt*1.1);gold.intensity=revealGlow*46;halo.material.opacity=Math.min(1,revealGlow)*.85;halo.scale.setScalar(1.4+(1-Math.min(1,revealGlow))*2.6);
    cam.pos.lerp(camTo.pos,1-Math.pow(.03,dt));cam.look.lerp(camTo.look,1-Math.pow(.03,dt));tmp.copy(cam.pos).sub(cam.look).multiplyScalar(frameK).add(cam.look);camera.position.set(tmp.x+gx*.4,tmp.y,tmp.z+gy*.3);camera.lookAt(cam.look);
    if(mode==='wash'){swirl=Math.max(.55,swirl-dt*.5);spin+=dt*swirl*1.5;cards.forEach((c,i)=>{const a=c.a+spin*(.55+c.seed*.9),r=c.r*(.75+.25*Math.sin(t*1.3+c.a))+.25*Math.sin(t*2.1+i);c.tp.set(Math.cos(a)*r*1.05,CT/2+((i*13)%N)*.0022,Math.sin(a)*r*.82);c.try_=a*1.7+c.seed*6;});}
    else if(mode==='cut'){cards.forEach((c,i)=>{const j=(i*29)%N,pile=j<26?0:j<52?1:2,k=e<.55?ease(e/.55):e<1.15?1:1-ease((e-1.15)/.55),nj=pile===0?j+52:pile===1?j:j-52;c.tp.set((pile-1)*1.25*k,CT/2+(e<1.15?(j-pile*26):mix(j-pile*26,nj,ease((e-1.15)/.55)))*CT,0);if(e>1.72)c.tp.y=CT/2+nj*CT;});}
    else if(mode==='ribbon'||mode==='reveal'){scroll+=scrollV*dt;scrollV*=Math.pow(.02,dt);const rem=remaining();scroll=clamp(scroll,2,Math.max(2,rem.length-3));rem.forEach((ci,idx)=>{const c=cards[ci];c.lift=mix(c.lift,ci===hover?1:0,1-Math.pow(.001,dt));ribbonPose(c,idx,rem.length);});}
    for(const c of cards){const k=1-Math.pow(.5,dt*c.k*2.2);c.p.lerp(c.tp,k);c.ry=mix(c.ry,c.try_,k);c.rz=mix(c.rz,c.trz,1-Math.pow(.5,dt*14));c.m.position.copy(c.p);c.m.rotation.set(c.rx,c.ry,c.rz,'YXZ');}
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
  function start(){if(disposed)return;running=true;if(!raf)raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(ro)ro.observe(host);window.addEventListener('resize',resize);resize();
  const onVis=()=>{if(document.hidden)stop();else start();};document.addEventListener('visibilitychange',onVis);
  // ── 手：洗牌時攪動加速；選牌時左右拖動捲牌，輕點選牌 ──
  let down=null;
  el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,t:performance.now(),moved:0};try{el.setPointerCapture(e.pointerId);}catch(_){}if(mode==='ribbon')hover=hit(e.clientX,e.clientY);});
  el.addEventListener('pointermove',e=>{if(!down){return;}const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);
    if(mode==='wash'){swirl=Math.min(4.2,swirl+(Math.abs(dx)+Math.abs(dy))*.012);if(opts.onStir)opts.onStir(swirl);}
    else if(mode==='ribbon'){const per=(W/(5.2*frameK))*.36;scrollV=0;scroll-=dx/Math.max(8,per*1.9);if(down.moved>10)hover=hit(e.clientX,e.clientY);down.vx=-dx/Math.max(8,per*1.9)*60;}});
  const up=e=>{if(!down)return;const d=down;down=null;if(mode==='ribbon'){if(d.moved<12){const i=hit(e.clientX,e.clientY);hover=-1;if(i>=0&&opts.onPick)opts.onPick(remaining().indexOf(i),i);}else{scrollV=(d.vx||0)*.6;hover=-1;}}};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{down=null;hover=-1;});
  return {
    mode:setMode,start,stop,resize,onLost(fn){onLost=fn;},
    get state(){return mode;},
    remainingCount(){return remaining().length;},
    // 把弧上第 pos 張（或指定的那張）送到第 slot 個牌位，牌背朝上
    take(pos,slot,cardIndex){const rem=remaining();const ci=cardIndex!=null&&cards[cardIndex]&&cards[cardIndex].picked<0?cardIndex:rem[clamp(pos,0,rem.length-1)|0];const c=cards[ci],s=slots[slot]||{x:0,z:2,s:1};c.picked=slot;c.k=4.2;c.lift=0;c.m.visible=true;c.tp.set(s.x,CT/2+.001,s.z);c.try_=0;c.m.scale.setScalar(s.s);c.p.y+=.9;return ci;},
    // 翻開第 slot 個牌位：貼上真正抽到的牌面；逆位就把牌轉一百八十度
    reveal(slot,url,upright,done){const c=cards.find(x=>x.picked===slot);if(!c){if(done)done();return;}const fin=tex=>{if(disposed)return;if(tex){tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;tex.center.set(.5,.5);tex.rotation=Math.PI;keep(tex);const mats=c.m.material.slice();mats[3]=keep(new T.MeshStandardMaterial({map:tex,roughness:.6}));c.m.material=mats;}
        c.k=5;c.tp.y=.7;setTimeout(()=>{c.trz=Math.PI;c.try_=upright?0:Math.PI;},160);setTimeout(()=>{c.tp.y=CT/2+.001;revealGlow=1;halo.position.set(c.tp.x,.03,c.tp.z);c.rev=true;},520);setTimeout(()=>{if(done)done();},900);};
      if(url)loader.load(url,fin,undefined,()=>fin(null));else fin(null);},
    focusSlots(){view(0,8.4,5.4,0,.1,2.3);},
    tilt(x,y){gx=clamp(x,-1,1);gy=clamp(y,-1,1);},
    stir(v){swirl=Math.min(4.2,swirl+v);},
    dispose(){disposed=true;stop();if(ro)ro.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);res.forEach(x=>{try{x.dispose&&x.dispose();}catch(_){}});renderer.dispose();if(el.parentNode)el.parentNode.removeChild(el);}
  };
}
