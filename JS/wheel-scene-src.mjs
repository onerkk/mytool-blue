import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/* 靜月・立體星盤與卦盤（2026-11-12 全新製作；取代紫微與梅花原本的平面過場）
 * 紫微：一座石臺上的十二宮方盤（地支位置固定：巳午未申在上、寅丑子亥在下），星從天上落進各宮，宮名與主星在宮面亮起——用的是已排好的真實命盤。
 * 梅花：後天八卦盤，花瓣落下；上卦、下卦依起卦的數亮起，六根爻在盤心一根根立起來，動爻最後發光變爻。
 * 這裡只負責演出；宮位、星曜、卦象都由各自的程式算好後傳入。單一 WebGL 畫布、無後製；太慢會自動關陰影並降解析度。
 */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const serif='"Noto Serif TC","Songti TC","PMingLiU",serif';
export function create(host,opts){
  opts=opts||{};const kind=opts.kind==='meihua'?'meihua':'ziwei',res=new Set(),keep=x=>(res.add(x),x);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
  {const gl=renderer.getContext&&renderer.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){try{renderer.dispose();}catch(_){}throw new Error('webgl-unavailable');}}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const el=renderer.domElement;el.className='pil3d-canvas';host.appendChild(el);let onLost=null;el.addEventListener('webglcontextlost',e=>{e.preventDefault();if(onLost)onLost();});
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,90);
  {const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.48;keep(env.texture);pm.dispose();}
  scene.add(new T.HemisphereLight(kind==='ziwei'?0xc6c8ff:0xffe6ee,0x08060e,.5));
  const key=new T.SpotLight(0xfff1dc,78,36,.72,.6,1.3);key.position.set(-2.6,10.5,6);key.target.position.set(0,.3,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0006;key.shadow.radius=5;scene.add(key,key.target);
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return keep(new T.CanvasTexture(c));})();
  const goldM=keep(new T.MeshStandardMaterial({color:0xc9a04f,roughness:.3,metalness:.92})),stone=keep(new T.MeshStandardMaterial({color:0x141a2a,roughness:.7,metalness:.25}));
  const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  // 真實石材：Poly Haven 大理石貼圖（CC0），用在紫微石臺與梅花盤身
  {const tl=new T.TextureLoader(),rp=t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);return keep(t);};tl.load('assets/3d/tex/marble_01_diffuse.jpg',t=>{if(disposed)return;t.colorSpace=T.SRGBColorSpace;stone.map=rp(t);stone.color.setHex(0x59607a);stone.needsUpdate=true;});tl.load('assets/3d/tex/marble_01_rough.jpg',t=>{if(disposed)return;stone.roughnessMap=rp(t);stone.roughness=1;stone.needsUpdate=true;});}
  // 夜空裡的星
  {const n=420,p=new Float32Array(n*3);let sd=9;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<n;i++){const a=rnd()*6.283,h=2+rnd()*14,r=14+rnd()*10;p[i*3]=Math.cos(a)*r;p[i*3+1]=h;p[i*3+2]=-Math.abs(Math.sin(a)*r)-4;}const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.BufferAttribute(p,3));const pts=new T.Points(g,keep(new T.PointsMaterial({color:0xdfe6ff,size:.16,map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.9})));scene.add(pts);}
  // 光裡的浮塵與一道斜光：讓空間有空氣感
  const dust=(()=>{const n=150,p=new Float32Array(n*3);let sd=17;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<n;i++){p[i*3]=(rnd()-.5)*9;p[i*3+1]=.3+rnd()*5.5;p[i*3+2]=(rnd()-.5)*8;}const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.BufferAttribute(p,3));const m=new T.Points(g,keep(new T.PointsMaterial({color:0xffe6c0,size:.05,map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.55})));scene.add(m);return m;})();
  const shaft=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,236,200,.55)');gr.addColorStop(1,'rgba(255,236,200,0)');g.fillStyle=gr;g.fillRect(0,0,64,256);const t=keep(new T.CanvasTexture(c));const m=new T.Mesh(keep(new T.CylinderGeometry(.5,3.4,11,28,1,true)),keep(new T.MeshBasicMaterial({map:t,transparent:true,opacity:.07,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide})));m.position.set(-1.2,5.2,1.6);m.rotation.z=-.16;m.rotation.x=.2;scene.add(m);return m;})();
  const items=[],motes=[];let hud=null;
  let now=0,raf=0,running=false,disposed=false,W=1,H=1,frameK=1,gx=0,gy=0,frames=0,slow=0,degraded=false,shake=0,doneAt=-1,stepIndex=0,spin=0;
  const cam={pos:new T.Vector3(0,8.4,8.2),look:new T.Vector3(0,.2,.2)},camTo={pos:cam.pos.clone(),look:cam.look.clone()},tmp=new T.Vector3();
  const tileTex=(draw,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new T.CanvasTexture(c));t.anisotropy=aniso;return t;};
  const mote=(x,y,z,tx,ty,tz,color,delay)=>{const s=new T.Sprite(keep(new T.SpriteMaterial({map:glowTex,color,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0})));s.scale.setScalar(.55);scene.add(s);motes.push({s,x,y,z,tx,ty,tz,t0:now+delay,d:.95});};
  let steps=[];
  if(kind==='ziwei'){
    // ── 紫微：十二宮方盤 ──
    const ZHI='子丑寅卯辰巳午未申酉戌亥',POS={巳:[0,0],午:[1,0],未:[2,0],申:[3,0],酉:[3,1],戌:[3,2],亥:[3,3],子:[2,3],丑:[1,3],寅:[0,3],卯:[0,2],辰:[0,1]},CS=1.34,GAP=.07;
    const palaces=(opts.palaces||[]).reduce((m,p)=>{if(p&&p.branch)m[p.branch]=p;return m;},{});
    const base=new T.Mesh(keep(new T.BoxGeometry(CS*4+.7,.4,CS*4+.7)),stone);base.position.y=-.2;base.receiveShadow=true;scene.add(base);
    const rimG=keep(new T.BoxGeometry(CS*4+.78,.06,.08));for(const [x,z,ry] of [[0,(CS*4+.7)/2,0],[0,-(CS*4+.7)/2,0],[(CS*4+.7)/2,0,Math.PI/2],[-(CS*4+.7)/2,0,Math.PI/2]]){const r=new T.Mesh(rimG,goldM);r.position.set(x,.02,z);r.rotation.y=ry;scene.add(r);}
    const well=new T.Mesh(keep(new T.PlaneGeometry(CS*2-GAP,CS*2-GAP)),keep(new T.MeshStandardMaterial({map:tileTex((g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.7);r.addColorStop(0,'#2a1d4e');r.addColorStop(1,'#0a0916');g.fillStyle=r;g.fillRect(0,0,w,h);g.strokeStyle='rgba(222,186,104,.75)';g.lineWidth=6;g.strokeRect(10,10,w-20,h-20);g.fillStyle='rgba(232,206,150,.92)';g.textAlign='center';g.textBaseline='middle';g.font='600 96px '+serif;g.fillText('紫微斗數',w/2,h/2-30);g.font='400 44px '+serif;g.fillStyle='rgba(232,206,150,.7)';g.fillText(String(opts.caption||'十二宮'),w/2,h/2+70);},512,512),roughness:.6,metalness:.2})));well.material.map.colorSpace=T.SRGBColorSpace;well.rotation.x=-Math.PI/2;well.position.y=.012;well.receiveShadow=true;scene.add(well);
    const tg=keep(new T.BoxGeometry(CS-GAP,.16,CS-GAP)),sideM=keep(new T.MeshStandardMaterial({color:0x0f141f,roughness:.5,metalness:.35}));
    const order=[];const ming=(opts.palaces||[]).find(p=>p&&/命/.test(p.name||''));let start=ming?ZHI.indexOf(ming.branch):ZHI.indexOf('寅');if(start<0)start=2;for(let k=0;k<12;k++)order.push(ZHI[(start+k)%12]);
    for(const z of ZHI){const [cx,cy]=POS[z],p=palaces[z]||{},x=(cx-1.5)*CS,zz=(cy-1.5)*CS,name=String(p.name||'').replace(/宮$/,''),stars=(p.stars||[]).slice(0,3);
      const bt=tileTex((g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#1a2036');gr.addColorStop(1,'#0e1322');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='rgba(216,180,98,.85)';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);g.fillStyle='rgba(216,180,98,.9)';g.font='500 54px '+serif;g.textAlign='left';g.textBaseline='top';g.fillText(z,26,22);g.fillStyle='rgba(150,158,178,.2)';g.textAlign='center';g.textBaseline='middle';g.font='600 76px '+serif;g.fillText(name||'宮',w/2,h/2+10);},320,320);bt.colorSpace=T.SRGBColorSpace;
      const et=tileTex((g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='600 '+(stars.length?60:76)+'px '+serif;g.fillText(name||'宮',w/2,stars.length?h/2-52:h/2+10);g.font='600 '+(stars.length>2?46:56)+'px '+serif;stars.forEach((s,i)=>g.fillText(String(s).slice(0,4),w/2,h/2+48+i*(stars.length>2?50:60)-(stars.length>2?22:6)));g.font='500 54px '+serif;g.textAlign='left';g.textBaseline='top';g.fillText(z,26,22);},320,320);
      const face=keep(new T.MeshStandardMaterial({map:bt,emissive:/命/.test(name)?0xd8a8ff:0xffd58a,emissiveMap:et,emissiveIntensity:0,roughness:.4,metalness:.3}));
      const m=new T.Mesh(tg,[sideM,sideM,face,sideM,sideM,sideM]);m.position.set(x,.08,zz);m.castShadow=true;m.receiveShadow=true;scene.add(m);
      const lamp=new T.PointLight(/命/.test(name)?0xc89cff:0xffc878,0,3.2,1.6);lamp.position.set(x,.7,zz);scene.add(lamp);
      items.push({key:z,m,face,lamp,x,z:zz,litAt:-1,label:(name?name+'宮':'')+'（'+z+'）'+(stars.length?'：'+stars.join('、'):''),isMing:/命/.test(name),stars});}
    const by=k=>items.find(i=>i.key===k);for(let g=0;g<4;g++)steps.push(order.slice(g*3,g*3+3).map(by));
    camTo.pos.set(0,9.2,7.4);camTo.look.set(0,0,.25);cam.pos.copy(camTo.pos);cam.look.copy(camTo.look);
    hud=it=>it.label;
  }else{
    // ── 梅花：後天八卦盤與六爻 ──
    const TRI={1:['乾','111'],2:['兌','110'],3:['離','101'],4:['震','100'],5:['巽','011'],6:['坎','010'],7:['艮','001'],8:['坤','000']},NUM={乾:1,兌:2,離:3,震:4,巽:5,坎:6,艮:7,坤:8};
    const HOU={離:0,坤:1,兌:2,乾:3,坎:4,艮:5,震:6,巽:7}; // 後天八卦：離在南（上方），順時針坤、兌、乾、坎、艮、震、巽
    const red=n=>{n=Math.round(Number(n)||0);const r=((n%8)+8)%8;return r===0?8:r;},up=red(opts.up),lo=red(opts.lo),dong=(()=>{const n=Math.round(Number(opts.dong)||0),r=((n%6)+6)%6;return r===0?6:r;})();
    const R=4.2,disc=new T.Mesh(keep(new T.CylinderGeometry(R,R+.12,.22,96)),[stone,keep(new T.MeshStandardMaterial({map:tileTex((g,w,h)=>{const C=w/2,r=g.createRadialGradient(C,C,60,C,C,C);r.addColorStop(0,'#2b2233');r.addColorStop(.6,'#1a1722');r.addColorStop(1,'#0c0b12');g.fillStyle=r;g.fillRect(0,0,w,h);const au=a=>'rgba(224,188,108,'+a+')';for(const [rr,lw,al] of [[C-18,7,.9],[C-150,3,.6],[C*.36,3,.6]]){g.strokeStyle=au(al);g.lineWidth=lw;g.beginPath();g.arc(C,C,rr,0,7);g.stroke();}for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;g.strokeStyle=au(.45);g.lineWidth=2;g.beginPath();g.moveTo(C+Math.cos(a)*C*.36,C+Math.sin(a)*C*.36);g.lineTo(C+Math.cos(a)*(C-150),C+Math.sin(a)*(C-150));g.stroke();}
        g.save();g.translate(C,C);g.fillStyle='rgba(236,226,206,.9)';g.beginPath();g.arc(0,0,C*.3,0,7);g.fill();g.fillStyle='#17131f';g.beginPath();g.arc(0,0,C*.3,-Math.PI/2,Math.PI/2);g.arc(0,C*.15,C*.15,Math.PI/2,-Math.PI/2,true);g.arc(0,-C*.15,C*.15,Math.PI/2,-Math.PI/2);g.fill();g.fillStyle='rgba(236,226,206,.9)';g.beginPath();g.arc(0,C*.15,C*.04,0,7);g.fill();g.fillStyle='#17131f';g.beginPath();g.arc(0,-C*.15,C*.04,0,7);g.fill();g.restore();},1024,1024),roughness:.7,metalness:.2})),stone]);disc.material[1].map.colorSpace=T.SRGBColorSpace;disc.position.y=-.11;disc.receiveShadow=true;scene.add(disc);
    const rim=new T.Mesh(keep(new T.TorusGeometry(R+.02,.06,12,120)),goldM);rim.rotation.x=Math.PI/2;scene.add(rim);
    const tg=keep(new T.BoxGeometry(1.5,.14,1.15)),sideM=keep(new T.MeshStandardMaterial({color:0x14111b,roughness:.5,metalness:.35}));
    for(const nm of Object.keys(HOU)){const bits=TRI[NUM[nm]][1],a=HOU[nm]*Math.PI/4,x=Math.sin(a)*3.05,z=-Math.cos(a)*3.05;
      const draw=(g,w,h,em)=>{if(em){g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';}else{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#241d2c');gr.addColorStop(1,'#14101a');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='rgba(216,180,98,.85)';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);g.fillStyle='rgba(170,160,150,.22)';}
        for(let k=0;k<3;k++){const y=64+(2-k)*52,yang=bits[k]==='1';if(yang)g.fillRect(70,y,w-140,26);else{g.fillRect(70,y,(w-140)/2-22,26);g.fillRect(w/2+22,y,(w-140)/2-22,26);}}g.textAlign='center';g.textBaseline='middle';g.font='600 60px '+serif;g.fillText(nm,w/2,h-52);};
      const bt=tileTex((g,w,h)=>draw(g,w,h,false),384,300);bt.colorSpace=T.SRGBColorSpace;const et=tileTex((g,w,h)=>draw(g,w,h,true),384,300);
      const face=keep(new T.MeshStandardMaterial({map:bt,emissive:0xffc8d6,emissiveMap:et,emissiveIntensity:0,roughness:.4,metalness:.3}));
      const m=new T.Mesh(tg,[sideM,sideM,face,sideM,sideM,sideM]);m.position.set(x,.07,z);m.rotation.y=-a;m.castShadow=true;m.receiveShadow=true;scene.add(m);
      const lamp=new T.PointLight(0xffc0d0,0,3.4,1.6);lamp.position.set(x,.8,z);scene.add(lamp);items.push({key:nm,m,face,lamp,x,z,litAt:-1,label:nm,num:NUM[nm]});}
    // 六根爻：立在盤心上方，由下往上；陽爻一根長的，陰爻兩根短的
    const bitsAll=(TRI[lo][1]+TRI[up][1]).split('').map(c=>c==='1'),barM=()=>keep(new T.MeshStandardMaterial({color:0xe9dcc0,emissive:0xffd9a0,emissiveIntensity:.25,roughness:.4,metalness:.4})),lines=[];
    for(let k=0;k<6;k++){const g=new T.Group(),mat=barM(),yang=bitsAll[k];const mk=(w,x)=>{const b=new T.Mesh(keep(new T.BoxGeometry(w,.2,.26)),mat);b.position.x=x;b.castShadow=true;g.add(b);return b;};
      const parts=yang?[mk(2.3,0)]:[mk(1,-.65),mk(1,.65)];g.position.set(0,-.6,.1);g.visible=false;scene.add(g);lines.push({g,mat,yang,parts,y:.75+k*.42,at:-1,changeAt:-1});}
    const by=n=>items.find(i=>i.num===n);
    steps=[[Object.assign(by(up),{label:'上卦：'+TRI[up][0],act:()=>{[3,4,5].forEach((k,i)=>{lines[k].at=now+.5+i*.28;});}})],[Object.assign(by(lo)===by(up)?{litAt:-1,m:by(lo).m,face:by(lo).face,lamp:by(lo).lamp,x:by(lo).x,z:by(lo).z,same:true}:by(lo),{label:'下卦：'+TRI[lo][0],act:()=>{[0,1,2].forEach((k,i)=>{lines[k].at=now+.5+i*.28;});}})],[{virtual:true,litAt:-1,label:'動爻：第 '+dong+' 爻'+(bitsAll[dong-1]?'（陽變陰）':'（陰變陽）'),act:()=>{lines[dong-1].changeAt=now+.4;}}]];
    scene.userData.lines=lines;
    // 花瓣
    const PN=70,pg=keep(new T.PlaneGeometry(.16,.2)),pm=keep(new T.MeshBasicMaterial({color:0xffc6d8,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false})),petals=new T.InstancedMesh(pg,pm,PN),pd=[],dm=new T.Object3D();let sd=3;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let i=0;i<PN;i++)pd.push({x:(rnd()-.5)*9,z:(rnd()-.5)*7-.5,y:rnd()*9,v:.5+rnd()*.7,ph:rnd()*6,sw:.4+rnd()*.6});scene.add(petals);scene.userData.petals={petals,pd,dm};
    camTo.pos.set(0,7.2,8.6);camTo.look.set(0,1.1,0);cam.pos.copy(camTo.pos);cam.look.copy(camTo.look);
    hud=it=>it.label;
  }
  function resize(){const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);camera.aspect=W/H;frameK=Math.max(1,Math.min(2,(kind==='ziwei'?.78:.74)/(W/H)));camera.updateProjectionMatrix();}
  function frame(ms){raf=0;if(disposed||!running)return;const t=ms/1000,dt=Math.min(.05,Math.max(.001,t-(now||t)));now=t;
    if(!degraded&&frames<140){frames++;if(frames>20&&dt>.034)slow++;if(frames===140&&slow>55){degraded=true;renderer.shadowMap.enabled=false;key.castShadow=false;renderer.setPixelRatio(1);resize();renderer.render(scene,camera);scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}}
    dust.rotation.y=t*.025;dust.position.y=Math.sin(t*.23)*.12;shaft.material.opacity=.06+.015*Math.sin(t*.6);
    shake=Math.max(0,shake-dt*3);cam.pos.lerp(camTo.pos,1-Math.pow(.05,dt));cam.look.lerp(camTo.look,1-Math.pow(.05,dt));tmp.copy(cam.pos).sub(cam.look).multiplyScalar(frameK).add(cam.look);camera.position.set(tmp.x+gx*.4+Math.sin(t*57)*.04*shake,tmp.y+Math.cos(t*49)*.04*shake,tmp.z+gy*.3);camera.lookAt(cam.look);
    for(const it of items){if(it.litAt<0)continue;const u=ease((now-it.litAt)/.9);it.face.emissiveIntensity=1.45*u*(.93+.07*Math.sin(t*3+it.x));it.lamp.intensity=(it.isMing?9:5.5)*u;it.m.position.y=(kind==='ziwei'?.08:.07)+Math.sin(clamp((now-it.litAt)/.5)*Math.PI)*.14+(it.isMing?.06*u:0);}
    for(let i=motes.length-1;i>=0;i--){const m=motes[i],u=(now-m.t0)/m.d;if(u<0)continue;if(u>=1){scene.remove(m.s);motes.splice(i,1);continue;}const k=u*u;m.s.position.set(mix(m.x,m.tx,k),mix(m.y,m.ty,k),mix(m.z,m.tz,k));m.s.material.opacity=Math.sin(u*Math.PI)*.95+.05;m.s.scale.setScalar(.35+.5*(1-u));}
    if(kind==='meihua'){const L=scene.userData.lines,P=scene.userData.petals;for(const l of L){if(l.at<0||now<l.at)continue;l.g.visible=true;const u=ease((now-l.at)/.7);l.g.position.y=mix(-.4,l.y,u);l.mat.emissiveIntensity=.25+.9*Math.sin(clamp((now-l.at)/1.2)*Math.PI);
        if(l.changeAt>0&&now>l.changeAt){const c=clamp((now-l.changeAt)/1.3);l.mat.emissiveIntensity=.4+1.6*Math.sin(c*Math.PI)+.5*c;l.mat.emissive.setHex(0xff9fb8);if(c>.5&&!l.flipped){l.flipped=true;if(l.yang){l.parts[0].scale.x=.435;l.parts[0].position.x=-.65;const b=l.parts[0].clone();b.position.x=.65;l.g.add(b);}else{l.parts[0].scale.x=2.3;l.parts[0].position.x=0;l.parts[1].visible=false;}}}}
      for(let i=0;i<P.pd.length;i++){const p=P.pd[i];p.y-=p.v*dt*(1+shake*2);if(p.y<.02){p.y=7+((i*37)%30)/10;}P.dm.position.set(p.x+Math.sin(t*p.sw+p.ph)*.5,p.y,p.z+Math.cos(t*p.sw*.7+p.ph)*.3);P.dm.rotation.set(t*p.sw+p.ph,t*.7*p.sw,p.ph);P.dm.updateMatrix();P.petals.setMatrixAt(i,P.dm.matrix);}P.petals.instanceMatrix.needsUpdate=true;}
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
  function start(){if(disposed)return;running=true;if(!raf)raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(ro)ro.observe(host);window.addEventListener('resize',resize);resize();
  const onVis=()=>{if(document.hidden)stop();else start();};document.addEventListener('visibilitychange',onVis);
  function next(){
    if(stepIndex>=steps.length)return -1;const group=steps[stepIndex++],texts=[];shake=.5;
    group.forEach((it,i)=>{if(!it)return;if(!it.virtual){if(it.same){/* 上下卦同一個八卦：再亮一次 */}const real=items.find(x=>x.m===it.m)||it;real.litAt=now+i*.32;for(let k=0;k<4;k++)mote((real.x||0)+(k-1.5)*.5,9+k*.6,(real.z||0)-3,real.x||0,.4,real.z||0,kind==='ziwei'?(real.isMing?0xd8a8ff:0xffe0a0):0xffc6d8,i*.32+k*.07);}if(it.act)setTimeout(()=>{if(!disposed)it.act();},i*320);texts.push(hud(it));});
    if(opts.onStep)opts.onStep(stepIndex,steps.length,texts);
    if(stepIndex>=steps.length){doneAt=now;setTimeout(()=>{if(disposed)return;if(kind==='ziwei'){camTo.pos.set(0,10.4,6.2);camTo.look.set(0,0,.1);}else{camTo.pos.set(0,5.6,8.2);camTo.look.set(0,1.7,0);}if(opts.onDone)opts.onDone();},1700);}
    return stepIndex;}
  el.addEventListener('pointerup',()=>{if(doneAt<0)next();});
  start();
  return {start,stop,resize,next,onLost(fn){onLost=fn;},total(){return steps.length;},tilt(x,y){gx=clamp(x,-1,1);gy=clamp(y,-1,1);},
    dispose(){disposed=true;stop();if(ro)ro.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);res.forEach(x=>{try{x.dispose&&x.dispose();}catch(_){}});renderer.dispose();if(el.parentNode)el.parentNode.removeChild(el);}};
}
