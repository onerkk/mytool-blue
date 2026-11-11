import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/* 靜月塔羅・立體牌桌 第二版（2026-11-12）
 * 第一版被使用者退回：牌桌只是一片藍色平面、牌很小、洗牌是牌自己繞圈，動作不像真的在讀牌。
 * 這一版照實際讀牌的手順做，每一步牌走的都是真的會走的路：
 *   洗牌＝牌攤滿桌面，手指推到哪、哪裡的牌就被推開、滑動、轉向（沒有碰的牌不會自己動；不動手時由兩隻看不見的手代洗）
 *   收牌＝往中間攏成一堆，再敲齊成一疊　切牌＝上三分之一抬起放左邊、中間三分之一再放更左，然後反著疊回去
 *   開牌＝整疊放在左邊，一路往右推開成弧　選牌＝那張牌先往自己這邊抽出來，再放到牌陣上它該在的位置
 *   翻牌＝掀起、沿長邊翻面、落下
 * 畫面：圓桌、絨布與金線、金邊圓角有厚度的牌、柔和的真陰影、殿內背景。抽到哪張與正逆位仍由原塔羅程式決定。
 * 效能：單一 WebGL 畫布、無後製；開場量幾十格，太慢就自動關掉陰影並降低解析度。
 */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);},easeOut=t=>1-Math.pow(1-clamp(t),3);
const CW=.7,CL=1.2,CT=.011,N=78;
function cardGeometry(){
  const s=new T.Shape(),w=CW/2,h=CL/2,r=.055;
  s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);
  let g=new T.ExtrudeGeometry(s,{depth:CT,bevelEnabled:false,curveSegments:5});g.translate(0,0,-CT/2);g.rotateX(-Math.PI/2);if(g.index){const ng=g.toNonIndexed();g.dispose();g=ng;}
  const p=g.attributes.position,n=g.attributes.normal,B=[[],[],[]];
  for(let t=0;t<p.count;t+=3){const ny=(n.getY(t)+n.getY(t+1)+n.getY(t+2))/3,b=ny>.5?0:ny<-.5?1:2;for(let k=0;k<3;k++){const i=t+k,x=p.getX(i),z=p.getZ(i);let u=(x+w)/CW;const v=(-z+h)/CL;if(b===1)u=1-u;B[b].push(x,p.getY(i),z,n.getX(i),n.getY(i),n.getZ(i),u,v);}}
  const all=B[0].concat(B[1],B[2]),cnt=all.length/8,pos=new Float32Array(cnt*3),nor=new Float32Array(cnt*3),uv=new Float32Array(cnt*2);
  for(let i=0;i<cnt;i++){pos.set(all.slice(i*8,i*8+3),i*3);nor.set(all.slice(i*8+3,i*8+6),i*3);uv.set(all.slice(i*8+6,i*8+8),i*2);}
  const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('uv',new T.BufferAttribute(uv,2));
  const a=B[0].length/8,b2=B[1].length/8,c=B[2].length/8;out.addGroup(0,a,0);out.addGroup(a,b2,1);out.addGroup(a+b2,c,2);g.dispose();return out;
}
// 各牌陣在桌上真正的擺法（單位：一張牌的寬與高；x 向右、y 向使用者）。沒有登記的牌陣依張數排成一到兩排。
const LAYOUTS={
  three_card:[[-1.1,0],[0,0],[1.1,0]],
  five_card:[[0,0],[-1.15,0],[1.15,0],[0,1.08],[0,-1.08]],
  either_or:[[0,1.08],[-1.15,0],[1.15,0],[-1.15,-1.08],[1.15,-1.08]],
  celtic_cross:[[-.95,0],[-.95,0,1],[-.95,1.1],[-2.1,0],[-.95,-1.1],[.2,0],[1.55,1.65],[1.55,.55],[1.55,-.55],[1.55,-1.65]]
};
export function create(host,opts){
  opts=opts||{};const res=new Set(),keep=x=>(res.add(x),x);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
  {const gl=renderer.getContext&&renderer.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){try{renderer.dispose();}catch(_){}throw new Error('webgl-unavailable');}}
  let pr=Math.min(window.devicePixelRatio||1,1.6);renderer.setPixelRatio(pr);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const el=renderer.domElement;el.className='tar3d-canvas';host.appendChild(el);let onLost=null;el.addEventListener('webglcontextlost',e=>{e.preventDefault();if(onLost)onLost();});
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,80),loader=new T.TextureLoader();
  {const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.22;keep(env.texture);room.dispose&&room.dispose();pm.dispose();}
  // ── 光：頂上一盞主燈（投陰影）、月色補光、兩側燭光、翻牌時的金光 ──
  scene.add(new T.HemisphereLight(0xc9d4ff,0x0a0812,.5));
  const key=new T.SpotLight(0xfff0d6,80,30,.72,.55,1.4);key.position.set(-1.6,9.5,4.2);key.target.position.set(0,0,.9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0006;key.shadow.radius=5;key.shadow.camera.near=3;key.shadow.camera.far=20;scene.add(key,key.target);
  const cL=new T.PointLight(0xffa550,16,13,1.6);cL.position.set(-3.6,1.1,-2.3);scene.add(cL);const cR=new T.PointLight(0xffa550,16,13,1.6);cR.position.set(3.6,1.1,-2.3);scene.add(cR);
  const gold=new T.PointLight(0xffe2a2,0,9,1.5);scene.add(gold);
  // ── 圓桌：絨布桌面（細絨紋、漸層、金線繡的邊框與月相）、金屬包邊、桌裙 ──
  const tc=document.createElement('canvas');tc.width=tc.height=2048;{const g=tc.getContext('2d'),C=1024,r=g.createRadialGradient(C,C,60,C,C,C);r.addColorStop(0,'#1d2c5c');r.addColorStop(.55,'#131d42');r.addColorStop(.92,'#0a1026');r.addColorStop(1,'#070a18');g.fillStyle=r;g.fillRect(0,0,2048,2048);
    let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<42000;i++){const x=rnd()*2048,y=rnd()*2048,l=3+rnd()*7;g.strokeStyle='rgba('+(rnd()>.5?'255,255,255':'0,0,0')+','+(.018+rnd()*.03)+')';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*2,y+l);g.stroke();}
    const au=(a)=>'rgba(222,186,104,'+a+')';g.lineCap='round';
    for(const [rr,lw,al] of [[968,7,.9],[946,2,.7],[914,2,.55],[640,2,.5],[618,1.2,.4]]){g.strokeStyle=au(al);g.lineWidth=lw;g.beginPath();g.arc(C,C,rr,0,7);g.stroke();}
    for(let i=0;i<72;i++){const a=i*Math.PI/36,r1=930,r2=i%6===0?892:908;g.strokeStyle=au(i%6===0?.75:.4);g.lineWidth=i%6===0?3:1.4;g.beginPath();g.moveTo(C+Math.cos(a)*r1,C+Math.sin(a)*r1);g.lineTo(C+Math.cos(a)*r2,C+Math.sin(a)*r2);g.stroke();}
    for(let i=0;i<12;i++){const a=i*Math.PI/6+Math.PI/12,x=C+Math.cos(a)*776,y=C+Math.sin(a)*776,ph=(i%8)/8;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.fillStyle=au(.82);g.beginPath();g.arc(0,0,30,0,7);g.fill();g.fillStyle='#111a3c';g.beginPath();g.arc((ph-.5)*66,0,30,0,7);g.fill();g.strokeStyle=au(.8);g.lineWidth=2;g.beginPath();g.arc(0,0,30,0,7);g.stroke();g.restore();
      const b=a+Math.PI/12;g.fillStyle=au(.7);g.save();g.translate(C+Math.cos(b)*776,C+Math.sin(b)*776);g.rotate(b);g.beginPath();for(let k=0;k<8;k++){const q=k*Math.PI/4,rad=k%2?4:13;g.lineTo(Math.cos(q)*rad,Math.sin(q)*rad);}g.closePath();g.fill();g.restore();}
    g.strokeStyle=au(.16);g.lineWidth=1.5;for(let i=0;i<24;i++){const a=i*Math.PI/12;g.beginPath();g.moveTo(C+Math.cos(a)*120,C+Math.sin(a)*120);g.lineTo(C+Math.cos(a)*618,C+Math.sin(a)*618);g.stroke();}
    g.strokeStyle=au(.22);g.lineWidth=2;g.beginPath();g.arc(C,C,120,0,7);g.stroke();g.beginPath();g.arc(C,C,330,0,7);g.stroke();}
  const clothTex=keep(new T.CanvasTexture(tc));clothTex.colorSpace=T.SRGBColorSpace;clothTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const R=5.2,table=new T.Mesh(keep(new T.CircleGeometry(R,96)),keep(new T.MeshStandardMaterial({map:clothTex,roughness:.96,metalness:0})));table.rotation.x=-Math.PI/2;table.receiveShadow=true;scene.add(table);
  const rim=new T.Mesh(keep(new T.TorusGeometry(R+.03,.075,14,120)),keep(new T.MeshStandardMaterial({color:0xc9a04f,roughness:.3,metalness:.92})));rim.rotation.x=Math.PI/2;rim.position.y=-.03;scene.add(rim);
  const skirt=new T.Mesh(keep(new T.CylinderGeometry(R+.02,R-.25,1.6,96,1,true)),keep(new T.MeshStandardMaterial({color:0x0b1026,roughness:.9,side:T.DoubleSide})));skirt.position.y=-.86;scene.add(skirt);
  // 燭臺與燭火（放在桌子後緣兩側）
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,238,196,1)');r.addColorStop(.3,'rgba(255,196,110,.5)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const brass=keep(new T.MeshStandardMaterial({color:0xb98f45,roughness:.32,metalness:.9})),wax=keep(new T.MeshStandardMaterial({color:0xefe6d2,roughness:.55})),flames=[];
  for(const sx of[-1,1]){const g=new T.Group();g.position.set(sx*3.6,0,-2.6);scene.add(g);const prof=[[0,0],[.34,0],[.36,.05],[.12,.1],[.07,.5],[.13,.56],[.2,.6],[.2,.64],[0,.64]].map(p=>new T.Vector2(p[0],p[1]));const st=new T.Mesh(keep(new T.LatheGeometry(prof,28)),brass);st.castShadow=true;g.add(st);const cd=new T.Mesh(keep(new T.CylinderGeometry(.085,.09,.62,16)),wax);cd.position.y=.95;g.add(cd);
    const fl=new T.Sprite(keep(new T.SpriteMaterial({map:glowTex,color:0xffd58a,transparent:true,depthWrite:false,blending:T.AdditiveBlending})));fl.position.y=1.36;fl.scale.set(.5,.8,1);g.add(fl);const hl=new T.Sprite(keep(new T.SpriteMaterial({map:glowTex,color:0xffb060,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.4})));hl.position.y=1.36;hl.scale.set(2.6,2.6,1);g.add(hl);flames.push({fl,hl});}
  const halo=new T.Mesh(keep(new T.PlaneGeometry(1,1)),keep(new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0})));halo.rotation.x=-Math.PI/2;scene.add(halo);
  // ── 牌：圓角、有厚度；上面牌背、下面牌面（翻開時才貼上真正抽到的那張）、側邊燙金 ──
  const backTex=keep(loader.load(opts.back||'assets/cards/bright-20261011/tarot/back.webp'));backTex.colorSpace=T.SRGBColorSpace;backTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const backMat=keep(new T.MeshStandardMaterial({map:backTex,roughness:.5,metalness:.12})),blankMat=keep(new T.MeshStandardMaterial({color:0xf3ead6,roughness:.7})),edgeMat=keep(new T.MeshStandardMaterial({color:0xd4ad5c,roughness:.35,metalness:.85}));
  const geo=keep(cardGeometry()),cards=[];
  for(let i=0;i<N;i++){const m=new T.Mesh(geo,[backMat,blankMat,edgeMat]);m.castShadow=true;m.receiveShadow=true;m.userData.i=i;scene.add(m);
    cards.push({m,i,x:0,y:CT/2+i*CT,z:0,ry:0,rz:0,vx:0,vz:0,vr:0,tx:0,ty:CT/2+i*CT,tz:0,try_:0,trz:0,k:7,delay:0,picked:-1,scale:1,ts:1,lift:0,arc:0,arcT:0,arcD:0,h:(i*.6180339)%1});}
  // ── 狀態 ──
  let mode='stack',t0=0,now=0,raf=0,running=false,disposed=false,W=1,H=1,frameK=1,scroll=0,scrollV=0,hover=-1,slots=[],labels=[],revealGlow=0,gx=0,gy=0,hand=null,handPrev=null,lastTouch=0,frames=0,slow=0,degraded=false;
  const order=[];for(let i=0;i<N;i++)order.push(i);
  const cam={pos:new T.Vector3(0,8,7),look:new T.Vector3(0,0,.6)},camTo={pos:new T.Vector3(0,8,7),look:new T.Vector3(0,0,.6)};
  const view=(px,py,pz,lx,ly,lz)=>{camTo.pos.set(px,py,pz);camTo.look.set(lx,ly,lz);};
  const remaining=()=>order.filter(i=>cards[i].picked<0);
  const arcTo=(c,x,y,z,h,d)=>{c.ax=c.x;c.ay=c.y;c.az=c.z;c.bx=x;c.by=y;c.bz=z;c.arc=h;c.arcT=now+(c.delay||0);c.arcD=d;c.tx=x;c.ty=y;c.tz=z;};
  function label(text){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.font='500 46px "Noto Serif TC","Songti TC",serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(236,210,150,.95)';{let s2=String(text||'').replace(/^\s*\d+\s*[\.、．]\s*/,'');if(s2.length>7)s2=s2.slice(0,6)+'…';g.fillText(s2,256,50);}const t=keep(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(keep(new T.PlaneGeometry(1.3,.245)),keep(new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:0})));m.rotation.x=-Math.PI/2;scene.add(m);return m;}
  function layoutSlots(n,id,names){labels.forEach(l=>scene.remove(l));labels=[];let raw=LAYOUTS[id]&&LAYOUTS[id].length===n?LAYOUTS[id]:null;
    if(!raw){raw=[];const cols=n<=5?n:Math.ceil(n/2),rows=Math.ceil(n/cols);for(let i=0;i<n;i++){const r=Math.floor(i/cols),inRow=r===rows-1?n-cols*(rows-1):cols,c=i%cols;raw.push([(c-(inRow-1)/2)*1.12,(r-(rows-1)/2)*1.12]);}}
    let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;for(const p of raw){minx=Math.min(minx,p[0]-.5);maxx=Math.max(maxx,p[0]+.5);miny=Math.min(miny,p[1]-.5);maxy=Math.max(maxy,p[1]+.5);}
    const sc=Math.min(1.25,4.5/((maxx-minx)*CW),3.5/((maxy-miny)*(CL+.2))),cx=(minx+maxx)/2,cy=(miny+maxy)/2;
    slots=raw.map((p,i)=>({x:(p[0]-cx)*CW*sc*1.06,z:2.05+(p[1]-cy)*(CL+.2)*sc,s:sc,cross:!!p[2]}));
    slots.forEach((s,i)=>{const l=label(names&&names[i]||'');l.scale.setScalar(s.s);l.position.set(s.x,.004,s.z+(s.cross?CW:CL)*s.s/2+.17*s.s);labels.push(l);});}
  function ribbonTarget(idx){const cnt=remaining().length,u=idx-scroll,x=u*.4;return {x,y:CT/2+.002+idx*.0021,z:-.55+x*x*.03,ry:-x*.07,vis:Math.abs(u)<11};}
  function setMode(m,info){mode=m;t0=now;info=info||{};
    if(m==='stack'){cards.forEach((c,i)=>{c.tx=0;c.tz=.2;c.ty=CT/2+i*CT;c.try_=0;c.trz=0;c.k=8;c.ts=1.25;});view(0,6.6,6.2,0,.2,.2);}
    else if(m==='wash'){let sd=11;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};cards.forEach((c,i)=>{const a=rnd()*6.283,r=Math.sqrt(rnd())*2.5;c.delay=i*.006;c.vx=0;c.vz=0;c.vr=0;c.ts=1.15;c.spread={x:Math.cos(a)*r*1.05,z:.3+Math.sin(a)*r*.8,ry:(rnd()-.5)*5};c.ty=CT/2+((i*31)%N)*.0022;});view(0,10.5,3.4,0,0,.3);hand=null;handPrev=null;lastTouch=now;}
    else if(m==='gather'){cards.forEach((c,i)=>{const j=(i*29)%N;c.stackIndex=j;c.delay=0;c.ts=1.25;});view(0,6.6,6.2,0,.2,.2);}
    else if(m==='cut'){view(0,6.2,6.6,-.6,.2,.2);}
    else if(m==='ribbon'){layoutSlots(info.count||3,info.id,info.names);scroll=(N-1)/2;scrollV=0;const rem=remaining();rem.forEach((ci,idx)=>{const c=cards[ci];c.delay=idx*.014;c.ts=1.5;c.k=7;c.spreadAt=now+.35+idx*.014;});view(0,5.6,6.6,0,.1,1.0);}
    else if(m==='reveal'){view(0,8.2,5.6,0,.1,2.05);labels.forEach(l=>{l.userData.show=1;});}
    start();}
  const ray=new T.Raycaster(),v2=new T.Vector2(),tmp=new T.Vector3(),plane=new T.Plane(new T.Vector3(0,1,0),0);
  function toTable(cx,cy){const r=el.getBoundingClientRect();v2.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(v2,camera);const p=new T.Vector3();return ray.ray.intersectPlane(plane,p)?p:null;}
  function hit(cx,cy){const r=el.getBoundingClientRect();v2.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(v2,camera);const list=cards.filter(c=>c.picked<0&&c.m.visible).map(c=>c.m),h=ray.intersectObjects(list,false);if(h.length)return h[0].object.userData.i;
    let best=-1,bd=1e9;for(const c of cards){if(c.picked>=0||!c.m.visible)continue;tmp.copy(c.m.position).project(camera);const sx=(tmp.x*.5+.5)*r.width+r.left,sy=(-tmp.y*.5+.5)*r.height+r.top,dy=Math.abs(sy-cy);if(dy>r.height*.1)continue;const d=Math.abs(sx-cx)+dy*.4;if(d<bd){bd=d;best=c.i;}}return bd<r.width*.18?best:-1;}
  function push(hx,hz,dx,dz,rad,str){for(const c of cards){const ex=c.x-hx,ez=c.z-hz,d2=ex*ex+ez*ez;if(d2>rad*rad)continue;const f=(1-Math.sqrt(d2)/rad)*str;c.vx+=dx*f;c.vz+=dz*f;c.vr+=(ex*dz-ez*dx)*f*2.4+(c.h-.5)*f*Math.hypot(dx,dz)*3;}}
  function resize(){const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);camera.aspect=W/H;frameK=Math.max(1,Math.min(2.1,.74/(W/H)));camera.updateProjectionMatrix();}
  function frame(ms){raf=0;if(disposed||!running)return;const t=ms/1000,dt=Math.min(.05,Math.max(.001,t-(now||t)));now=t;const e=t-t0;
    if(!degraded&&frames<140){frames++;if(frames>20&&dt>.034)slow++;if(frames===140&&slow>55){degraded=true;renderer.shadowMap.enabled=false;key.castShadow=false;pr=1;renderer.setPixelRatio(1);resize();renderer.render(scene,camera);scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});}});}}
    const f1=.86+.14*Math.sin(t*8.7)+.07*Math.sin(t*21),f2=.86+.14*Math.sin(t*7.3+1)+.07*Math.sin(t*18);cL.intensity=16*f1;cR.intensity=16*f2;flames[0].fl.scale.set(.5,.8*(.9+.25*f1),1);flames[1].fl.scale.set(.5,.8*(.9+.25*f2),1);flames[0].hl.material.opacity=.4*f1;flames[1].hl.material.opacity=.4*f2;
    revealGlow=Math.max(0,revealGlow-dt*1.25);gold.intensity=revealGlow*16;halo.material.opacity=Math.min(1,revealGlow)*.8;halo.scale.setScalar(1.6+(1-Math.min(1,revealGlow))*2.4);
    cam.pos.lerp(camTo.pos,1-Math.pow(.035,dt));cam.look.lerp(camTo.look,1-Math.pow(.035,dt));tmp.copy(cam.pos).sub(cam.look).multiplyScalar(frameK).add(cam.look);camera.position.set(tmp.x+gx*.35,tmp.y,tmp.z+gy*.25);camera.lookAt(cam.look);
    if(mode==='wash'){
      // 沒有人碰時，兩隻看不見的手在桌上各畫一個圈代為洗牌；有人碰就完全交給他的手
      if(now-lastTouch>1.1){for(const s of[-1,1]){const a=t*1.9*s+(s>0?0:2.4),hx=s*1.05+Math.cos(a)*1.25,hz=.3+Math.sin(a)*1.0,dx=-Math.sin(a)*1.25*1.9*s*dt,dz=Math.cos(a)*1.0*1.9*s*dt;push(hx,hz,dx,dz,1.25,16);}}
      for(const c of cards){if(e<c.delay+.9&&c.spread){const k=easeOut((e-c.delay)/.9);if(e>=c.delay){c.x=mix(0,c.spread.x,k);c.z=mix(.2,c.spread.z,k);c.ry=mix(0,c.spread.ry,k);c.y=mix(c.y,c.ty,.2);}}
        else{c.x+=c.vx*dt;c.z+=c.vz*dt;c.ry+=c.vr*dt;const fr=Math.pow(.012,dt);c.vx*=fr;c.vz*=fr;c.vr*=Math.pow(.02,dt);const d=Math.hypot(c.x,c.z-.3);if(d>3.3){const q=(d-3.3)*5*dt;c.vx-=(c.x/d)*q*8;c.vz-=((c.z-.3)/d)*q*8;}c.y=mix(c.y,c.ty,.25);}
        c.scale=mix(c.scale,c.ts,.12);}
    }else{
      if(mode==='gather'){for(const c of cards){const j=c.stackIndex||0,loose=e<.75;c.tx=loose?(c.h-.5)*.5:0;c.tz=.2+(loose?((c.h*7)%1-.5)*.5:0);c.ty=CT/2+j*CT;c.try_=loose?(c.h-.5)*1.2:0;c.k=loose?5:11;}}
      else if(mode==='cut'){for(const c of cards){const j=c.stackIndex||0,pile=j>=52?0:j>=26?1:2,inP=j-(2-pile)*26;
          // 0～.7 秒上三分之一放左；.5～1.2 秒中間三分之一放更左；1.6 秒後反著疊回去（原本最下面的那疊變成最上面）
          const px=pile===0?-1.15:pile===1?-2.3:0,st=pile===0?.05:pile===1?.55:9,back=pile===1?1.75:pile===0?2.25:9,nj=pile===2?inP+52:pile===0?inP+26:inP;
          if(e<st){c.tx=0;c.ty=CT/2+j*CT;}else if(e<back){const u=ease((e-st)/.6);c.tx=px*u;c.ty=mix(CT/2+j*CT,CT/2+inP*CT,u)+Math.sin(u*Math.PI)*.55;}
          else{const u=ease((e-back)/.6);c.tx=px*(1-u);c.ty=mix(CT/2+inP*CT,CT/2+(pile===1?inP:inP+26)*CT,u)+Math.sin(u*Math.PI)*.6;}
          if(pile===2&&e>1.75){const u=ease((e-1.75)/.5);c.ty=CT/2+mix(j,inP+52,u)*CT+Math.sin(u*Math.PI)*.0;}
          if(e>2.9){c.stackFinal=pile===1?inP:pile===0?inP+26:inP+52;c.ty=CT/2+c.stackFinal*CT;c.tx=0;}
          c.tz=.2;c.try_=0;c.k=16;}}
      else if(mode==='ribbon'||mode==='reveal'){scroll+=scrollV*dt;scrollV*=Math.pow(.02,dt);const rem=remaining();scroll=clamp(scroll,3,Math.max(3,rem.length-4));
        rem.forEach((ci,idx)=>{const c=cards[ci],p=ribbonTarget(idx);if(c.spreadAt&&now<c.spreadAt){c.tx=-3.2;c.tz=-.35;c.ty=CT/2+(rem.length-idx)*CT;c.try_=.5;c.m.visible=true;return;}c.spreadAt=0;c.lift=mix(c.lift,ci===hover?1:0,1-Math.pow(.0005,dt));c.tx=p.x;c.ty=p.y+c.lift*.14;c.tz=p.z+c.lift*.3;c.try_=p.ry;c.m.visible=p.vis;c.k=8;});}
      for(const c of cards){
        if(c.arcD>0){const u=clamp((now-c.arcT)/c.arcD);if(now>=c.arcT){const k=ease(u);c.x=mix(c.ax,c.bx,k);c.z=mix(c.az,c.bz,k);c.y=mix(c.ay,c.by,k)+Math.sin(k*Math.PI)*c.arc;}if(u>=1)c.arcD=0;}
        else{const k=1-Math.pow(.5,dt*c.k*2.2);c.x=mix(c.x,c.tx,k);c.y=mix(c.y,c.ty,k);c.z=mix(c.z,c.tz,k);}
        const kr=1-Math.pow(.5,dt*c.k*2.2);c.ry=mix(c.ry,c.try_,kr);c.rz=mix(c.rz,c.trz,1-Math.pow(.5,dt*13));c.scale=mix(c.scale,c.ts,1-Math.pow(.5,dt*9));}
    }
    for(const c of cards){c.m.position.set(c.x,c.y,c.z);c.m.rotation.set(0,c.ry,c.rz,'YXZ');c.m.scale.setScalar(c.scale);}
    for(const l of labels){l.material.opacity=mix(l.material.opacity,l.userData.show?1:0,.08);}
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
  function start(){if(disposed)return;running=true;if(!raf)raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(ro)ro.observe(host);window.addEventListener('resize',resize);resize();
  const onVis=()=>{if(document.hidden)stop();else start();};document.addEventListener('visibilitychange',onVis);
  // ── 手 ──
  let down=null;
  el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,vx:0};try{el.setPointerCapture(e.pointerId);}catch(_){}if(mode==='wash'){handPrev=toTable(e.clientX,e.clientY);lastTouch=now;}if(mode==='ribbon')hover=hit(e.clientX,e.clientY);});
  el.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);
    if(mode==='wash'){const p=toTable(e.clientX,e.clientY);lastTouch=now;if(p&&handPrev){push(p.x,p.z,(p.x-handPrev.x)*7,(p.z-handPrev.z)*7,1.15,1);if(opts.onStir)opts.onStir();}handPrev=p;}
    else if(mode==='ribbon'){const a=toTable(e.clientX-dx,e.clientY),b=toTable(e.clientX,e.clientY);if(a&&b){const du=(b.x-a.x)/.4;scrollV=0;scroll-=du;down.vx=-du*60;}if(down.moved>10)hover=hit(e.clientX,e.clientY);}});
  const up=e=>{if(!down)return;const d=down;down=null;handPrev=null;if(mode==='ribbon'){if(d.moved<12){const i=hit(e.clientX,e.clientY);hover=-1;if(i>=0&&opts.onPick)opts.onPick(remaining().indexOf(i),i);}else{scrollV=(d.vx||0)*.5;hover=-1;}}};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{down=null;hover=-1;handPrev=null;});
  return {
    mode:setMode,start,stop,resize,onLost(fn){onLost=fn;},
    get state(){return mode;},get degraded(){return degraded;},
    remainingCount(){return remaining().length;},
    // 選中的牌先往使用者這邊抽出來，再沿弧線放到牌陣上它的位置（牌背朝上）
    take(pos,slot,cardIndex){const rem=remaining();const ci=cardIndex!=null&&cards[cardIndex]&&cards[cardIndex].picked<0?cardIndex:rem[clamp(pos,0,rem.length-1)|0];const c=cards[ci],s=slots[slot]||{x:0,z:2,s:1};c.picked=slot;c.lift=0;c.m.visible=true;c.delay=0;c.ts=s.s;c.try_=s.cross?Math.PI/2:0;c.k=9;
      const ox=c.x,oz=c.z;c.x=ox;c.z=oz;arcTo(c,ox,c.y+.05,oz+.75,.08,.22);setTimeout(()=>{if(disposed)return;c.delay=0;arcTo(c,s.x,CT/2+.002+(s.cross?CT*1.5:0),s.z,.75,.62);const l=labels[slot];if(l)l.userData.show=1;},230);return ci;},
    // 翻開：掀起、沿長邊翻面、落下；逆位的牌頭朝使用者
    reveal(slot,url,upright,done){const c=cards.find(x=>x.picked===slot),s=slots[slot]||{};if(!c){if(done)done();return;}
      const fin=tex=>{if(disposed)return;if(tex){tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());keep(tex);const mats=c.m.material.slice();mats[1]=keep(new T.MeshStandardMaterial({map:tex,roughness:.58,metalness:.02}));c.m.material=mats;}
        const base=CT/2+.002+(s.cross?CT*1.5:0);c.k=7;c.ty=base+.62;setTimeout(()=>{c.trz=Math.PI;c.try_=(s.cross?Math.PI/2:0)+(upright?0:Math.PI);},170);setTimeout(()=>{c.k=10;c.ty=base;revealGlow=1;gold.position.set(c.x,.9,c.z);halo.position.set(c.x,.012,c.z);},560);setTimeout(()=>{if(done)done();},930);};
      if(url)loader.load(url,fin,undefined,()=>fin(null));else fin(null);},
    tilt(x,y){gx=clamp(x,-1,1);gy=clamp(y,-1,1);},
    dispose(){disposed=true;stop();if(ro)ro.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);res.forEach(x=>{try{x.dispose&&x.dispose();}catch(_){}});renderer.dispose();if(el.parentNode)el.parentNode.removeChild(el);}
  };
}
