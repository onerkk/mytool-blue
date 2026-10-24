import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// Geometry is a view of the native chart. Gestures never rotate its data.
const TAU=Math.PI*2, RAD=Math.PI/180;
const COLORS={木:'#99c9aa',火:'#dc9584',土:'#ddc69a',金:'#e0e4e0',水:'#92c3d4'};
const wrap=n=>((n+180)%360+360)%360-180;
const mod=(n,m)=>((n%m)+m)%m;
const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
const polar=(r,b,y=0)=>new THREE.Vector3(-Math.sin(b*Math.PI/6)*r,y,Math.cos(b*Math.PI/6)*r);

function mount(host,chart,options={}){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
  const resources=new Set(),own=x=>(resources.add(x),x),scene=new THREE.Scene();
  let disposed=false,lost=false,visible=true,raf=0,last=0,activeUntil=0;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),pointers=new Map();
  const canvas=renderer.domElement;
  canvas.className='lr-instrument-canvas';canvas.tabIndex=0;canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','立體六壬天地盤。左右鍵轉動，上下鍵選宮，Enter查看，Home歸正。');
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x060f12,1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(canvas);
  const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
  const envTarget=pmrem.fromScene(environment,.055);scene.environment=envTarget.texture;scene.environmentIntensity=1.05;
  environment.dispose();pmrem.dispose();
  const camera=new THREE.OrthographicCamera(-3.12,3.12,3.12,-3.12,.1,40);
  const orbit=new THREE.Group(),earth=new THREE.Group(),sky=new THREE.Group(),generals=new THREE.Group();
  scene.add(orbit);orbit.add(earth,sky,generals);sky.position.y=.105;generals.position.y=.165;
  // 真正的金屬與琺瑯：高金屬度、低粗糙度的金，深藍綠琺瑯帶透明漆層，玉面帶絲光。
  const bronze=own(new THREE.MeshPhysicalMaterial({color:0xd2a656,metalness:.97,roughness:.3,envMapIntensity:1.0,clearcoat:.2,clearcoatRoughness:.35}));
  const darkBronze=own(new THREE.MeshStandardMaterial({color:0x5a4a33,metalness:.9,roughness:.36,envMapIntensity:1.1}));
  const enamel=own(new THREE.MeshPhysicalMaterial({color:0x06202a,metalness:.1,roughness:.22,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.2,emissive:0x02131a,emissiveIntensity:.22}));
  const jade=own(new THREE.MeshPhysicalMaterial({color:0x0f3a38,metalness:.05,roughness:.3,clearcoat:.8,clearcoatRoughness:.25,sheen:.35,sheenColor:0x7fd4c0,envMapIntensity:1.0,emissive:0x05201e,emissiveIntensity:.12}));
  const goldLine=own(new THREE.MeshBasicMaterial({color:0xe6c88c,transparent:true,opacity:.85}));
  const goldGlow=own(new THREE.MeshStandardMaterial({color:0xf0cf86,metalness:.9,roughness:.22,emissive:0x5a3d12,emissiveIntensity:.55}));
  scene.add(new THREE.HemisphereLight(0xdbe8e6,0x1a1612,.8));
  const key=new THREE.DirectionalLight(0xfff0d8,2.6);key.position.set(-4,6,3);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.001;key.shadow.normalBias=.025;
  Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:15});scene.add(key);
  const rim=new THREE.DirectionalLight(0x9ad6d0,1.5);rim.position.set(4,3,-4);scene.add(rim);
  const sweep=new THREE.PointLight(0xffd8a0,.5,7,2);sweep.position.set(0,2.6,0);scene.add(sweep);
  const glint=new THREE.PointLight(0xf7c681,0,8,2);scene.add(glint);
  function mesh(parent,geometry,material,y=0){const m=new THREE.Mesh(own(geometry),material);m.position.y=y;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function ring(parent,r,t,y,material=bronze){const m=mesh(parent,new THREE.TorusGeometry(r,t,10,128),material,y);m.rotation.x=-Math.PI/2;return m;}
  function annulus(parent,inner,outer,y,material){const m=mesh(parent,new THREE.RingGeometry(inner,outer,96),material,y);m.rotation.x=-Math.PI/2;return m;}
  mesh(earth,new THREE.CylinderGeometry(2.69,2.73,.17,128),darkBronze,-.09);
  mesh(earth,new THREE.CylinderGeometry(2.62,2.65,.11,128),bronze,-.015);
  mesh(earth,new THREE.CylinderGeometry(2.53,2.53,.04,128),enamel,.055);
  ring(earth,2.64,.05,.08);ring(earth,2.55,.02,.085);ring(earth,2.36,.014,.094);
  mesh(earth,new THREE.CylinderGeometry(2.86,2.92,.12,128),darkBronze,-.16);ring(earth,2.84,.03,-.08,bronze);
  const hair=own(new THREE.MeshBasicMaterial({color:0xffe3a8,transparent:true,opacity:.35}));ring(earth,2.735,.006,.1,hair);ring(earth,2.455,.005,.1,hair);ring(earth,1.2,.005,.1,hair);
  annulus(earth,.76,1.19,.084,jade);ring(earth,1.18,.012,.088);
  // Bevelled rims give each plate a real edge when lifted or viewed obliquely.
  function plateBody(parent,inner,outer){const profile=[[inner,-.075],[outer-.02,-.075],[outer,-.048],[outer,0],[outer-.016,.014],[inner+.016,.014],[inner,-.01],[inner,-.075]].map(p=>new THREE.Vector2(...p));return mesh(parent,new THREE.LatheGeometry(profile,96),darkBronze);}
  plateBody(sky,1.205,1.79);plateBody(generals,1.84,2.32);
  annulus(sky,1.205,1.79,.018,enamel);ring(sky,1.21,.021,.012);ring(sky,1.78,.025,.012);
  annulus(generals,1.84,2.32,.018,jade);ring(generals,1.84,.017,.013);ring(generals,2.31,.021,.013);
  // Engraved radial rules, jewel pins and fine brass graduations.
  const graduations=new THREE.InstancedMesh(own(new THREE.BoxGeometry(1,1,1)),bronze,120),dummy=new THREE.Object3D();
  own(graduations);graduations.castShadow=true;graduations.receiveShadow=true;earth.add(graduations);
  for(let i=0;i<120;i++){
    const major=i%10===0,r=major?2.465:2.49;
    dummy.position.copy(polar(r,i/10,.12));dummy.rotation.y=-i*Math.PI/60;dummy.scale.set(major?.016:.008,.009,major?.115:.042);dummy.updateMatrix();graduations.setMatrixAt(i,dummy.matrix);
  }
  const rulePoints=[];
  for(let b=0;b<12;b++){
    const a=polar(.77,b-.5,.095),c=polar(2.32,b-.5,.095);
    rulePoints.push(a,c);
  }
  earth.add(new THREE.LineSegments(own(new THREE.BufferGeometry().setFromPoints(rulePoints)),goldLine));
  for(let b=0;b<4;b++){
    const pin=mesh(earth,new THREE.SphereGeometry(.025,12,8),bronze,.12);pin.position.copy(polar(2.585,b*3,.12));
  }
  // 桌面：深玉色向外暗去的絨面，盤子像放在一張暗桌上；泛光後製需要不透明底，這層就是底。
  const tableTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const rg=g.createRadialGradient(128,128,10,128,128,128);rg.addColorStop(0,'#123a3a');rg.addColorStop(.45,'#0b2326');rg.addColorStop(.8,'#07161a');rg.addColorStop(1,'#060f12');g.fillStyle=rg;g.fillRect(0,0,256,256);const t=own(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;return t;})();
  const table=mesh(scene,new THREE.CircleGeometry(5.2,96),own(new THREE.MeshBasicMaterial({map:tableTex})),-.26);table.rotation.x=-Math.PI/2;table.castShadow=false;table.receiveShadow=false;
  const floor=mesh(scene,new THREE.CircleGeometry(4.4,96),own(new THREE.ShadowMaterial({opacity:.4})),-.23);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const upright=[],hitTargets=[],textures=[];
  const qX=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2),qY=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
  function label(parent,value,r,b,y,w,height,color,size=83){
    // 刻字：兩倍解析度繪製；細暗邊＋金屬漸層，只留一點貼字的落影，不加彩色外暈（外暈會讓整圈字糊成光霧）。
    const S=2,c=document.createElement('canvas');c.width=(Array.from(value).length===1?128:256)*S;c.height=128*S;const ctx=c.getContext('2d');
    ctx.scale(S,S);ctx.font='600 '+size+'px "Noto Serif TC", "Noto Sans CJK TC", serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const cw=c.width/S;
    ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=3;ctx.shadowOffsetY=1.5;ctx.fillStyle='#000';ctx.fillText(value,cw/2,69,cw-10);
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.lineWidth=2;ctx.strokeStyle='rgba(40,28,10,.55)';ctx.strokeText(value,cw/2,68,cw-10);
    const g=ctx.createLinearGradient(0,30,0,106);g.addColorStop(0,'#fbefcf');g.addColorStop(.5,color);g.addColorStop(1,'#8c6c3a');
    ctx.fillStyle=color==='#c9c3ac'?'#e6dfc6':g;ctx.fillText(value,cw/2,68,cw-10);
    const texture=own(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(texture);
    const material=own(new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    const m=mesh(parent,new THREE.PlaneGeometry(w,height),material,y);m.position.copy(polar(r,b,y));m.castShadow=false;
    upright.push({mesh:m,parent});return m;
  }
  function hit(parent,inner,outer,b,earthIndex,y){
    const mat=own(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
    const m=mesh(parent,new THREE.RingGeometry(inner,outer,12,1,-Math.PI/2-b*Math.PI/6-Math.PI/12,Math.PI/6),mat,y);
    m.rotation.x=-Math.PI/2;m.castShadow=false;m.userData.earth=earthIndex;m.layers.set(1);hitTargets.push(m);
  }
  chart.plate.forEach((p,b)=>{
    label(earth,p.earth,1.00,b,.10,.34,.34,'#c9c3ac',96);
    label(generals,p.general,2.08,b,.029,.63,.34,'#ded2b0',96);
    const marks=chart.transmissions.filter(t=>t.earthIndex===b).map(t=>['初','中','末'][t.index-1]).join('·');
    if(marks){label(earth,marks,2.455,b,.14,.39,.14,'#f3dca2',52);const jewel=mesh(earth,new THREE.SphereGeometry(.042,16,12),goldGlow,.13);jewel.position.copy(polar(2.58,b,.13));jewel.castShadow=false;}
    hit(earth,.8,1.18,b,b,.15);hit(earth,2.32,2.66,b,b,.16);hit(generals,1.84,2.32,b,b,.04);
  });
  const puckMat={};Object.entries(COLORS).forEach(([el,hex])=>{puckMat[el]=own(new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending}));});
  const landed=new Set(chart.transmissions.map(t=>t.earthIndex));
  Array.from('子丑寅卯辰巳午未申酉戌亥').forEach((z,b)=>{
    const p=chart.plate[mod(b-chart.rotation,12)];
    const puck=mesh(sky,new THREE.CircleGeometry(.3,32),puckMat[p.element],.022);puck.position.copy(polar(1.51,b,.022));puck.rotation.x=-Math.PI/2;puck.castShadow=false;puck.receiveShadow=false;
    label(sky,z,1.51,b,.027,.53,.56,COLORS[p.element],100);
    if(p.empty)label(sky,'空',1.75,b+.24,.029,.13,.12,'#d5bb8a',74);
    hit(sky,1.205,1.79,b,mod(b-chart.rotation,12),.04);
  });
  // The central seal is fixed upright and separate from the spinning rings.
  const sealGroup=new THREE.Group();earth.add(sealGroup);
  mesh(sealGroup,new THREE.CylinderGeometry(.756,.76,.08,64),enamel,.125);ring(sealGroup,.724,.016,.17);
  const seal=document.createElement('canvas');seal.width=512;seal.height=512;const sc=seal.getContext('2d');
  sc.textAlign='center';sc.textBaseline='middle';sc.fillStyle='#ddc997';sc.font='44px serif';sc.fillText('✧',256,90);
  sc.font='500 125px "Noto Serif TC", "Noto Sans CJK TC", serif';sc.fillText(chart.method.gate,256,210,420);
  sc.font='53px "Noto Serif TC", "Noto Sans CJK TC", serif';sc.fillText(chart.method.type,256,300);
  sc.fillStyle='#8fa99f';sc.font='32px serif';sc.fillText(chart.day.ganzhi+' · '+(chart.daytime?'晝':'夜')+'占',256,373);
  const sealTexture=own(new THREE.CanvasTexture(seal));sealTexture.colorSpace=THREE.SRGBColorSpace;
  const sealMesh=mesh(sealGroup,new THREE.PlaneGeometry(1.39,1.39),own(new THREE.MeshBasicMaterial({map:sealTexture,transparent:true,depthWrite:false})),.177);
  upright.push({mesh:sealMesh,parent:earth});
  const selection=annulus(orbit,.8,2.335,.205,own(new THREE.MeshBasicMaterial({color:0xccb67c,transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide})));
  selection.geometry.dispose();resources.delete(selection.geometry);
  selection.geometry=own(new THREE.RingGeometry(.8,2.335,20,1,-Math.PI/2-Math.PI/12,Math.PI/6));
  const beacon=ring(orbit,2.40,.014,.21,own(new THREE.MeshBasicMaterial({color:0xdfc491,transparent:true,opacity:.9})));
  beacon.geometry.dispose();resources.delete(beacon.geometry);beacon.geometry=own(new THREE.TorusGeometry(2.4,.018,8,30,Math.PI/6));
  const courseLine=new THREE.Line(own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()])),own(new THREE.LineBasicMaterial({color:0xead19c,transparent:true,opacity:.8})));orbit.add(courseLine);
  const paths=[],pathGroup=new THREE.Group();orbit.add(pathGroup);
  for(let i=0;i<2;i++){
    const start=chart.transmissions[i].earthIndex,end=chart.transmissions[i+1].earthIndex;
    // These connectors follow the calculated transmission landing places.
    const delta=mod(end-start+6,12)-6;
    const points=Array.from({length:41},(_,j)=>{const t=j/40;return delta===0?polar(2.415+Math.sin(t*Math.PI)*.07,start+Math.sin(t*TAU)*.25,.225+Math.sin(t*Math.PI)*.2):polar(2.415,start+delta*t,.225+Math.sin(t*Math.PI)*.34);});
    const curve=new THREE.CatmullRomCurve3(points);paths.push(curve);
    const line=mesh(pathGroup,new THREE.TubeGeometry(curve,48,.014,8,false),own(new THREE.MeshBasicMaterial({color:0xffdf9a,transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false})));line.castShadow=false;
    const halo=mesh(pathGroup,new THREE.TubeGeometry(curve,48,.045,8,false),own(new THREE.MeshBasicMaterial({color:0xffc86a,transparent:true,opacity:.06,blending:THREE.AdditiveBlending,depthWrite:false})));halo.castShadow=false;
  }
  const traveler=mesh(pathGroup,new THREE.SphereGeometry(.05,14,12),own(new THREE.MeshBasicMaterial({color:0xfff2cc})));traveler.visible=false;traveler.castShadow=false;
  // 盤面上方的金塵：加法混色的細點，緩慢上升、繞盤漂移，給空氣感。
  const DUST=140,dustPos=new Float32Array(DUST*3),dustSeed=new Float32Array(DUST);
  for(let i=0;i<DUST;i++){const r=.9+Math.random()*1.9,a=Math.random()*TAU;dustPos[i*3]=Math.cos(a)*r;dustPos[i*3+1]=.15+Math.random()*1.1;dustPos[i*3+2]=Math.sin(a)*r;dustSeed[i]=Math.random();}
  const dustGeo=own(new THREE.BufferGeometry());dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
  const dustTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const rg=g.createRadialGradient(16,16,0,16,16,16);rg.addColorStop(0,'rgba(255,236,190,1)');rg.addColorStop(.4,'rgba(255,214,140,.55)');rg.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=rg;g.fillRect(0,0,32,32);const t=own(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;return t;})();
  const dust=new THREE.Points(dustGeo,own(new THREE.PointsMaterial({size:.032,map:dustTex,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true})));orbit.add(dust);
  // 不做全畫面泛光：泛光會把金邊與刻字一起暈開。華麗感改由真實金屬反光、細金線與少量金塵呈現，畫面保持銳利。
  const composer=null,bloom=null;
  let angle=Number(options.angle)||0,targetAngle=angle,velocity=0,pitch=Number(options.pitch)||0,targetPitch=pitch,zoom=Number(options.zoom)||1,targetZoom=zoom,idleT=0;
  let exploded=!!options.exploded,lift=exploded?1:0,selected=Number(options.selected)||0,focusKind=options.focusKind||'palace',focusIndex=Number(options.focusIndex)||0;
  let phase=4,phaseStart=performance.now(),traceStart=null,traceStep=-1,flash=0,gesture=null,tapTime=0,tapPoint=null;
  const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();raycaster.layers.set(1);
  function rayPick(e){
    const rect=canvas.getBoundingClientRect();ndc.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    if(phase<4)return null;raycaster.setFromCamera(ndc,camera);return raycaster.intersectObjects(hitTargets.filter(o=>o.parent.visible),false)[0]?.object.userData.earth;
  }
  function notifyAngle(){options.onAngle?.(wrap(angle));}
  function pose(){const breathe=motion.matches?0:Math.sin(idleT*.35)*.035;const viewPitch=Math.min(1,pitch+(1-pitch)*lift*.65+.22+breathe);camera.position.set(Math.sin(idleT*.21)*(motion.matches?0:.18),8-viewPitch*1.35,3.35+viewPitch*3.1);camera.lookAt(0,.12+lift*.25,0);camera.zoom=zoom*(lift>.05?1-lift*.1:1);camera.updateProjectionMatrix();}
  function draw(now,dt){
    const quiet=motion.matches,blend=quiet?1:1-Math.exp(-dt*11);
    if(gesture){angle=targetAngle;}
    else if(Math.abs(velocity)>.4&&!quiet){angle+=velocity*dt;velocity*=Math.exp(-dt*5.2);targetAngle=angle;notifyAngle();}
    else{velocity=0;angle+=(targetAngle-angle)*blend;}
    pitch+=(targetPitch-pitch)*blend;zoom+=(targetZoom-zoom)*blend;lift+=((exploded?1:0)-lift)*blend;
    orbit.rotation.y=-angle*RAD;
    const elapsed=(now-phaseStart)/1000,progress=quiet?1:ease(elapsed/.9);
    earth.position.y=phase===0?-.34*(1-progress):0;earth.scale.setScalar(phase===0?.88+.12*progress:1);
    sky.visible=phase>=1;generals.visible=phase>=2;
    sky.position.y=.105+lift*.43+(phase===1?(1-progress)*1.25:0);
    const settle=phase===1?(1-progress)*Math.PI*1.6+(quiet?0:Math.sin(progress*Math.PI)*.12*(1-progress)):0;
    sky.rotation.y=chart.rotation*Math.PI/6+settle;
    generals.position.y=.165+lift*.92+(phase===2?(1-progress)*1.35:0);generals.rotation.y=phase===2?(1-progress)*-.42:0;
    upright.forEach(item=>{const rotation=orbit.rotation.y+(item.parent===sky?sky.rotation.y:item.parent===generals?generals.rotation.y:0);item.mesh.quaternion.copy(qY.setFromAxisAngle(axis,-rotation)).multiply(qX);});
    selection.rotation.z=-selected*Math.PI/6;selection.material.opacity=.10+flash*.055;
    beacon.rotation.z=-Math.PI/2-selected*Math.PI/6-Math.PI/12;beacon.position.y=.235+lift*.92;
    courseLine.visible=focusKind==='course'&&phase>=3;
    const cr=chart.courses[focusIndex]||chart.courses[0];
    courseLine.geometry.setFromPoints([polar(1,cr.lowerBranch,.17),polar(1.51,cr.lowerBranch,.21+lift*.43)]);
    pathGroup.visible=phase===4&&focusKind==='transmission';
    pathGroup.position.y=lift*.92;traveler.visible=traceStart!==null&&!quiet;
    if(traceStart!==null){
      const t=Math.max(0,(now-traceStart)/2600),step=t>=1?2:t>=.5?1:0;
      if(step!==traceStep){traceStep=step;options.onTraceStep?.(step);}
      if(t>=1){traceStart=null;traveler.visible=false;options.onTraceEnd?.();}
      else traveler.position.copy(paths[Math.min(1,Math.floor(t*2))].getPoint(Math.min(1,t*2%1)));
    }
    flash=Math.max(0,flash-dt*.8);glint.position.copy(polar(2,selected,1.4));glint.intensity=flash*1.8;
    idleT+=dt;sweep.position.set(Math.cos(idleT*.5)*2.4,2.4,Math.sin(idleT*.5)*2.4);sweep.intensity=quiet?.42:.48+Math.sin(idleT*1.7)*.1+(phase<4?.45*(1-progress):0);
    if(!quiet){const arr=dustGeo.attributes.position.array;for(let i=0;i<DUST;i++){arr[i*3+1]+=dt*(.05+dustSeed[i]*.06);if(arr[i*3+1]>1.35)arr[i*3+1]=.12;const a=Math.atan2(arr[i*3+2],arr[i*3])+dt*(.03+dustSeed[i]*.04),r=Math.hypot(arr[i*3],arr[i*3+2]);arr[i*3]=Math.cos(a)*r;arr[i*3+2]=Math.sin(a)*r;}dustGeo.attributes.position.needsUpdate=true;}
    dust.material.opacity=.24+.1*Math.sin(idleT*.9)*(quiet?0:1)+(phase<4?.14:0);
    sealMesh.material.opacity=.92+(quiet?0:Math.sin(idleT*1.3)*.08);
    pose();renderer.render(scene,camera);
  }
  function tick(now){raf=0;if(disposed||lost||!visible||document.hidden)return;const dt=Math.min(.05,Math.max(.001,(now-(last||now-16))/1000));last=now;draw(now,dt);
    const pending=Math.abs(angle-targetAngle)>.02||Math.abs(pitch-targetPitch)>.003||Math.abs(zoom-targetZoom)>.003||Math.abs(lift-(exploded?1:0))>.003;
    if((!motion.matches&&(now<activeUntil||velocity||traceStart!==null||flash>.01))||pending)raf=requestAnimationFrame(tick);
  }
  function start(duration=2600){activeUntil=performance.now()+duration;if(!disposed&&!lost&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function resize(){if(disposed||lost)return;const rect=host.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
    renderer.setSize(rect.width,rect.height,false);if(composer)composer.setSize(rect.width,rect.height);const aspect=rect.width/rect.height;camera.left=-3.12*aspect;camera.right=3.12*aspect;camera.top=3.12;camera.bottom=-3.12;camera.updateProjectionMatrix();start();}
  function focus(b,kind='palace',i=0){selected=mod(Number(b),12);focusKind=kind;focusIndex=Number(i);flash=motion.matches?0:1;start();canvas.setAttribute('aria-label','立體天地盤：地'+chart.plate[selected].earth+'、天'+chart.plate[selected].sky+'、'+chart.plate[selected].general+'。左右轉盤，上下選宮，Home歸正。');}
  function down(e){if(e.button!==0)return;options.onInteract?.();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});velocity=0;
    const pts=[...pointers.values()],rect=canvas.getBoundingClientRect();gesture={x:e.clientX,y:e.clientY,angle,start:Math.atan2(e.clientY-rect.top-rect.height/2,e.clientX-rect.left-rect.width/2),rect,moved:false,last:e.timeStamp,previous:angle,pitch,zoom};
    gesture.lastPolar=gesture.start;gesture.total=0;if(pts.length===2){gesture.distance=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);gesture.centerY=(pts[0].y+pts[1].y)/2;}start();}
  function move(e){
    if(!pointers.has(e.pointerId)){if(e.pointerType==='mouse'){const picked=rayPick(e);canvas.style.cursor=picked==null?'grab':'pointer';options.onHover?.(picked);}return;}
    e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gesture)return;const pts=[...pointers.values()];
    if(pts.length===2&&gesture.distance){gesture.moved=true;targetPitch=Math.max(0,Math.min(1,gesture.pitch+((pts[0].y+pts[1].y)/2-gesture.centerY)/150));targetZoom=Math.max(.85,Math.min(1.25,gesture.zoom*Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)/Math.max(1,gesture.distance)));options.onPose?.(targetPitch,targetZoom);start();return;}
    if(pts.length!==1)return;if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>5)gesture.moved=true;if(!gesture.moved)return;
    const a=Math.atan2(e.clientY-gesture.rect.top-gesture.rect.height/2,e.clientX-gesture.rect.left-gesture.rect.width/2);
    const delta=wrap((a-gesture.lastPolar)/RAD);gesture.total+=delta;gesture.lastPolar=a;angle=targetAngle=gesture.angle+gesture.total;
    const dt=Math.max(8,e.timeStamp-gesture.last)/1000;velocity=Math.max(-450,Math.min(450,.55*velocity+.45*(angle-gesture.previous)/dt));gesture.previous=angle;gesture.last=e.timeStamp;notifyAngle();start();}
  function end(e){
    if(!pointers.has(e.pointerId))return;const clicked=gesture&&!gesture.moved&&pointers.size===1&&e.type==='pointerup';
    pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(clicked){velocity=0;const now=e.timeStamp;if(now-tapTime<300&&tapPoint&&Math.hypot(e.clientX-tapPoint.x,e.clientY-tapPoint.y)<24){tapTime=0;options.onReset?.();}else{tapTime=now;tapPoint={x:e.clientX,y:e.clientY};const picked=rayPick(e);if(picked!=null)options.onPick?.(picked);}}
    if(e.type==='pointercancel'){velocity=0;}
    if(pointers.size===1){const p=[...pointers.values()][0],rect=canvas.getBoundingClientRect();gesture={x:p.x,y:p.y,angle,start:Math.atan2(p.y-rect.top-rect.height/2,p.x-rect.left-rect.width/2),rect,moved:true,last:e.timeStamp,previous:angle,pitch,zoom};gesture.lastPolar=gesture.start;gesture.total=0;velocity=0;}
    else if(!pointers.size){gesture=null;if(motion.matches)velocity=0;start(1400);}
  }
  function keyboard(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();
    if(e.key==='Home')options.onReset?.();else if(e.key==='ArrowLeft'||e.key==='ArrowRight')options.onTurn?.(wrap(targetAngle+(e.key==='ArrowLeft'?-15:15)));else if(e.key==='ArrowUp'||e.key==='ArrowDown')options.onPick?.(mod(selected+(e.key==='ArrowUp'?1:-1),12));else options.onPick?.(selected);}
  function contextLost(e){e.preventDefault();lost=true;velocity=0;gesture=null;pointers.clear();stop();canvas.tabIndex=-1;canvas.hidden=true;host.classList.remove('lr-webgl');options.onFallback?.();}
  function contextRestored(){if(disposed)return;lost=false;canvas.hidden=false;canvas.tabIndex=0;host.classList.add('lr-webgl');resize();options.onReady?.();}
  function motionChange(){velocity=0;traceStart=null;gesture=null;pointers.clear();options.onTraceEnd?.();start();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{velocity=0;stop();}},{threshold:.02});intersection.observe(host);
  const visibility=()=>{if(document.hidden){velocity=0;stop();}else start();};document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',motionChange);
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('keydown',keyboard);
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  canvas.addEventListener('pointerleave',()=>options.onHover?.(null));
  host.classList.add('lr-webgl');resize();focus(selected,focusKind,focusIndex);start(9000);
  return {
    setAngle(value,instant=false){velocity=0;targetAngle=angle+wrap(Number(value)-angle);if(instant||motion.matches)angle=targetAngle;start();},
    setPose(p=0,z=1){targetPitch=p;targetZoom=z;start();},
    setExploded(value){exploded=!!value;start();},setFocus:focus,
    setPhase(value,instant=false){phase=Number(value);phaseStart=performance.now()-(instant?2000:0);traceStart=null;velocity=0;if(instant&&!disposed&&!lost&&visible&&!document.hidden)draw(performance.now(),.016);start(9000);},
    trace(){if(motion.matches){options.onTraceStep?.(2);options.onTraceEnd?.();return;}traceStart=performance.now();traceStep=-1;start(2800);},
    stopTrace(){traceStart=null;traveler.visible=false;options.onTraceEnd?.();start();},
    inspect(){return {angle:wrap(angle),pitch,zoom,lift,phase,selected,velocity,active:!!raf,renderer:lost?'svg':'webgl',labelCount:upright.length,resources:resources.size,skyTurnDegrees:sky.rotation.y/RAD,layerHeights:{earth:earth.position.y,sky:sky.position.y,generals:generals.position.y},skyVisible:sky.visible,generalVisible:generals.visible};},
    dispose(){if(disposed)return;disposed=true;stop();resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',motionChange);
      canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);envTarget.dispose();resources.forEach(r=>r.dispose());if(composer)composer.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();host.classList.remove('lr-webgl');pointers.clear();}
  };
}
window.JYLiurenScene=Object.freeze({mount});
