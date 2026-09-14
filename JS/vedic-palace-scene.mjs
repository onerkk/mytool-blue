import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {buildCraft} from './cinematic-src/craft.mjs';
import {motion,clamp,ease} from './vedic-cinema-motion.mjs';

const COLORS=['#ffc571','#dceef3','#d3714e','#71c6a4','#efc466','#dbc2d5','#899bc9','#8a6baf','#bd956c'];
const ABBR=['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];
const POLYS=[[[0,2],[1,1],[0,0],[-1,1]],[[-2,2],[0,2],[-1,1]],[[-2,2],[-1,1],[-2,0]],[[-2,0],[-1,1],[0,0],[-1,-1]],[[-2,0],[-1,-1],[-2,-2]],[[-2,-2],[-1,-1],[0,-2]],[[0,0],[1,-1],[0,-2],[-1,-1]],[[0,-2],[1,-1],[2,-2]],[[2,0],[2,-2],[1,-1]],[[0,0],[1,1],[2,0],[1,-1]],[[2,2],[2,0],[1,1]],[[0,2],[2,2],[1,1]]];
const CENTERS=[[0,1],[-1,1.55],[-1.55,1],[-1,0],[-1.55,-1],[-1,-1.55],[0,-1],[1,-1.55],[1.55,-1],[1,0],[1.55,1],[1,1.55]];
const PALACE='assets/ui/vedic-palace-20260914.webp';

export function createPalace(host,chart,data){
 let disposed=false,progress=0,time=0,turn=0,targetTurn=0,pointer=null,reflection=true,frames=0,slow=0,lastRenderMs=0;
 const resources=new Set(),keep=x=>(resources.add(x),x),scene=new T.Scene();
 scene.fog=new T.FogExp2('#08131e',.017);
 const camera=new T.PerspectiveCamera(56,1,.1,80);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor('#050e18',0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const pmrem=new T.PMREMGenerator(renderer),envScene=new RoomEnvironment(),env=pmrem.fromScene(envScene,.035);scene.environment=env.texture;scene.environmentIntensity=.68;envScene.dispose();pmrem.dispose();
 const gold=keep(new T.MeshPhysicalMaterial({color:'#b88939',metalness:.9,roughness:.32,clearcoat:.3}));
 const bright=keep(new T.MeshPhysicalMaterial({color:'#d4b06c',metalness:.9,roughness:.28,clearcoat:.3}));
 const craft=buildCraft({keep,gold,accent:'#93bea7',doc:document});
 craft.enamel.color.set('#446c64');craft.enamel.roughness=.46;craft.stone.color.set('#1c343b');craft.stone.roughness=.48;craft.jewel.color.set('#246658');craft.jewel.emissive.set('#123b31');craft.jewel.emissiveIntensity=.05;
 const dark=keep(new T.MeshPhysicalMaterial({color:'#164049',map:craft.stone.map,metalness:.18,roughness:.46,clearcoat:.3,clearcoatRoughness:.24}));
 const bronze=craft.bronze;
 function mesh(geo,mat,parent=scene,x=0,y=0,z=0){const m=new T.Mesh(keep(geo),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function ring(parent,r,tube=.035,z=0,mat=gold){return mesh(new T.TorusGeometry(r,tube,8,88),mat,parent,0,0,z);}
 function cyl(parent,r,h,y,mat=gold,r2=r){return mesh(new T.CylinderGeometry(r,r2,h,48),mat,parent,0,y,0);}
 function instanced(geo,mat,count,parent,place){const m=new T.InstancedMesh(keep(geo),mat,count),dummy=new T.Object3D();for(let i=0;i<count;i++){dummy.position.set(0,0,0);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);place(dummy,i);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function batch(parent){
  parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),buckets=new Map(),meshes=[];
  parent.traverse(n=>{if(n.isMesh&&!n.isInstancedMesh){const material=n.material;if(!buckets.has(material))buckets.set(material,[]);let g=n.geometry.clone();if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}g.applyMatrix4(inverse.clone().multiply(n.matrixWorld));buckets.get(material).push(g);meshes.push(n);}});
  meshes.forEach(n=>n.removeFromParent());for(const [material,parts]of buckets){const geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(geo)mesh(geo,material,parent);}
 }
 function line(parent,a,b,r=.014,mat=gold){return craft.rod(a,b,r,parent,mat);}
 function shape(points){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function plate(parent,points,depth,mat,z=0){return mesh(new T.ExtrudeGeometry(shape(points),{depth,bevelEnabled:true,bevelSize:.035,bevelThickness:.027,bevelSegments:2,curveSegments:8,steps:1}),mat,parent,0,0,z);}
 function label(text,parent,x,y,z,size=.24,color='#efd7a4'){
  const c=document.createElement('canvas');c.width=256;c.height=96;const ctx=c.getContext('2d');ctx.font='500 42px "Noto Sans TC", sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,49);
  const map=keep(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;const mat=keep(new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));
  const n=mesh(new T.PlaneGeometry(size*2.67,size),mat,parent,x,y,z);n.castShadow=false;n.receiveShadow=false;return n;
 }
 function glow(parent,color,size){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,248,212,.8)');g.addColorStop(.14,'rgba(255,222,156,.25)');g.addColorStop(1,'rgba(255,208,125,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const tex=keep(new T.CanvasTexture(c)),mat=keep(new T.SpriteMaterial({map:tex,color,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false})),sprite=new T.Sprite(mat);sprite.scale.setScalar(size);parent.add(sprite);return sprite;}

 // Lighting and an actual reflected floor. The generated palace is scenery,
 // while the instrument, doors, plinth, lamps and their reflections are meshes.
 scene.add(new T.HemisphereLight('#d5e1e6','#192422',.72));
 const key=new T.DirectionalLight('#ffe1b4',1.8);key.position.set(-4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:9,bottom:-5,near:.1,far:28});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
 const rim=new T.PointLight('#8cbed4',28,18);rim.position.set(3,3,-3);scene.add(rim);const warm=new T.PointLight('#ffc879',20,14);warm.position.set(-3,1.2,3);scene.add(warm);
 const floor=new Reflector(keep(new T.PlaneGeometry(40,40)),{clipBias:.004,textureWidth:512,textureHeight:512,color:'#28343b',multisample:0});floor.rotation.x=-Math.PI/2;floor.position.y=-1.73;scene.add(floor);
 const shadow=mesh(new T.PlaneGeometry(18,18),keep(new T.ShadowMaterial({opacity:.24})),scene,0,-1.718,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 const floorInlay=new T.Group();scene.add(floorInlay);floorInlay.position.y=-1.70;floorInlay.rotation.x=-Math.PI/2;
 for(const r of [2.6,2.69,3.3,3.34,4.6])ring(floorInlay,r,.011,0,r>3?bronze:gold);
 instanced(new T.BoxGeometry(.013,.22,.012),gold,72,floorInlay,(o,i)=>{const a=i*Math.PI/36;o.position.set(Math.sin(a)*3.06,Math.cos(a)*3.06,0);o.rotation.z=-a;});
 const backdropMat=keep(new T.MeshBasicMaterial({color:'#d0d7dc',toneMapped:false}));const backdrop=mesh(new T.PlaneGeometry(26,39),backdropMat,scene,0,4,-16);backdrop.castShadow=false;backdrop.receiveShadow=false;
 const loader=new T.TextureLoader();const ready=new Promise(resolve=>loader.load(PALACE,t=>{if(disposed){t.dispose();resolve();return;}keep(t);t.colorSpace=T.SRGBColorSpace;backdropMat.map=t;backdropMat.needsUpdate=true;resolve();},undefined,()=>{backdrop.visible=false;resolve();}));

 // Foreground threshold and two depths of physical columns.
 const threshold=new T.Group();scene.add(threshold);const gates=[];
 for(const side of [-1,1]){
  const hinge=new T.Group();hinge.position.set(side*2.18,-1.7,0);threshold.add(hinge);const leaf=craft.door(2.18,7.4);leaf.position.set(-side*1.09,3.7,0);leaf.scale.x=side<0?1:-1;leaf.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});hinge.add(leaf);gates.push({hinge,side});
 }
 for(const [x,z,scale] of [[-3.4,-1.9,1],[3.4,-1.9,1],[-4.6,-6,1.3],[4.6,-6,1.3]]){
  const column=new T.Group();scene.add(column);column.position.set(x,1.1,z);craft.decoratePillar(column);column.scale.set(2.35*scale,6.4,2.35*scale);batch(column);
  for(const y of [-1.48,3.62]){const b=mesh(new T.CylinderGeometry(.63*scale,.73*scale,.27,12),dark,scene,x,y,z);b.receiveShadow=true;const cap=mesh(new T.CylinderGeometry(.77*scale,.77*scale,.07,12),gold,scene,x,y+.15,z);}
 }
 const lamps=[];
 for(const side of [-1,1]){
  const lamp=new T.Group();lamp.position.set(side*2.72,-1.68,1.0);scene.add(lamp);
  cyl(lamp,.34,.14,.07,bronze);cyl(lamp,.27,.04,.16,gold);cyl(lamp,.08,.75,.56,gold,.13);cyl(lamp,.35,.1,.96,gold,.13);
  const flame=mesh(new T.SphereGeometry(.09,12,8),keep(new T.MeshBasicMaterial({color:'#fff2c7'})),lamp,0,1.08,0);flame.scale.set(.6,1.8,.6);const aura=glow(lamp,'#ffd084',.8);aura.position.y=1.1;lamps.push({flame,aura});
 }
 // A heavy stepped pedestal with fluted sides and raised lotus petals.
 const pedestal=new T.Group();scene.add(pedestal);
 for(const [r,h,y,mat]of [[2.29,.18,-1.58,bronze],[2.35,.06,-1.45,gold],[2.18,.25,-1.31,dark],[2.21,.05,-1.16,bright],[2.08,.13,-1.06,dark],[2.12,.035,-.98,gold]])cyl(pedestal,r,h,y,mat);
 instanced(new T.BoxGeometry(.055,.24,.065),gold,72,pedestal,(o,i)=>{const a=i*Math.PI/36;o.position.set(Math.sin(a)*2.185,-1.30,Math.cos(a)*2.185);o.rotation.y=a;});
 const lotus=new T.Group();pedestal.add(lotus);const petals=[];
 for(let i=0;i<16;i++){const pivot=new T.Group(),a=i*Math.PI/8;pivot.position.set(Math.sin(a)*1.52,-.94,Math.cos(a)*1.52);pivot.rotation.y=a;lotus.add(pivot);const p=craft.petal(pivot);p.scale.set(1.2,1.8,1.2);p.rotation.x=.62;p.material=gold;const inset=craft.petal(pivot);inset.scale.copy(p.scale).multiplyScalar(.82);inset.rotation.copy(p.rotation);inset.position.set(0,.045,.10);inset.material=dark;craft.curve([[0,.04,.04],[0,.30,.12],[0,.63,.27]],.009,pivot,bright);batch(pivot);petals.push(pivot);}
 cyl(pedestal,2.035,.021,-.953,dark);
 const dial=new T.Group();dial.position.y=-.937;dial.rotation.x=-Math.PI/2;pedestal.add(dial);
 for(const r of [1.80,1.85,1.97])ring(dial,r,.011,0,gold);
 instanced(new T.BoxGeometry(.012,.13,.009),gold,48,dial,(o,i)=>{const a=i*Math.PI/24;o.position.set(Math.sin(a)*1.915,Math.cos(a)*1.915,.014);o.rotation.z=-a;});
 const stem=mesh(new T.LatheGeometry([[.42,-.99],[.42,-.85],[.2,-.78],[.14,-.2],[.3,-.08]].map(p=>new T.Vector2(...p)),32),gold,pedestal);

 const instrument=new T.Group();scene.add(instrument);instrument.position.y=1.15;
 const gyro=new T.Group();instrument.add(gyro);const bands=[];
 for(let i=0;i<3;i++){
  const r=2.0+i*.21,group=new T.Group();gyro.add(group);
  const band=mesh(new T.CylinderGeometry(r,r,.13,96,1,true),bronze,group);band.rotation.x=Math.PI/2;
  ring(group,r,.043,-.08,gold);ring(group,r,.032,.08,bright);ring(group,r-.075,.01,.068,bright);
  instanced(new T.BoxGeometry(.014,.10,.028),bright,108,group,(o,n)=>{const a=n*Math.PI/54;o.position.set(Math.sin(a)*(r-.015),Math.cos(a)*(r-.015),.09);o.rotation.z=-a;o.scale.y=n%4?.45:1;});
  instanced(new T.OctahedronGeometry(.048),dark,27,group,(o,n)=>{const a=n*Math.PI*2/27;o.position.set(Math.sin(a)*r,Math.cos(a)*r,.07);});
  bands.push(group);
 }
 const moonStation=new T.Group();bands[2].add(moonStation);const stationAngle=(90-(data.nakshatra+.5)*360/27)*Math.PI/180;moonStation.position.set(Math.cos(stationAngle)*2.42,Math.sin(stationAngle)*2.42,.12);const station=craft.gem(moonStation,0,0,0,.11);const stationGlow=glow(moonStation,'#b6e7db',.65);
 const core=new T.Group();instrument.add(core);const jewelMat=keep(new T.MeshPhysicalMaterial({color:'#f3d39b',metalness:.38,roughness:.13,clearcoat:1,emissive:'#d6a24c',emissiveIntensity:.32}));
 const heart=mesh(new T.IcosahedronGeometry(.38,0),jewelMat,core);const coreGlow=glow(core,'#ffd59b',1.6);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;craft.curve([[Math.sin(a)*.26,-.36,Math.cos(a)*.26],[Math.sin(a)*.45,-.04,Math.cos(a)*.45],[Math.sin(a)*.32,.25,Math.cos(a)*.32]],.016,core,gold);}
 ring(core,.61,.016).rotation.x=1.2;ring(core,.67,.012).rotation.y=1.0;

 // Twelve individually raised houses share the native chart's geometry.
 const kundali=new T.Group();instrument.add(kundali);const board=new T.Group();kundali.add(board);
 const outer=[[-2.20,-2.20],[2.20,-2.20],[2.20,2.20],[-2.20,2.20]];
 plate(board,outer,.17,bronze,-.29);plate(board,outer.map(([x,y])=>[x*.985,y*.985]),.105,gold,-.105);plate(board,outer.map(([x,y])=>[x*.958,y*.958]),.07,dark,0);
 for(const x of [-1,1])for(const y of [-1,1]){const g=craft.gem(board,x*2.02,y*2.02,.17,.12);g.rotation.z=Math.PI/4;ring(board,.16,.018,.09).position.set(x*2.02,y*2.02,.09);}
 const tiles=[],rashis=[];
 for(let i=0;i<12;i++){
  const tile=new T.Group();board.add(tile);const mat=keep(new T.MeshStandardMaterial({color:i%2?'#0a2935':'#071f2c',metalness:.12,roughness:.62}));const center=CENTERS[i],points=POLYS[i].map(([x,y])=>[center[0]+(x-center[0])*.972,center[1]+(y-center[1])*.972]);
  plate(tile,points,.085,mat,.074);for(let j=0;j<points.length;j++){const a=points[j],b=points[(j+1)%points.length];line(tile,[...a,.195],[...b,.195],.014,bright);}batch(tile);tiles.push(tile);
  if(data.lagna!=null)rashis.push(label(String((data.lagna+i)%12+1),tile,center[0],center[1]+.18,.22,.20,'#f1d19a'));
 }
 // Raised arabesque loops run along each edge of the instrument frame.
 const filigree=new T.Group();board.add(filigree);
 for(let edge=0;edge<4;edge++){
  const rail=new T.Group();filigree.add(rail);rail.rotation.z=edge*Math.PI/2;
  line(rail,[-1.97,2.08,.12],[1.97,2.08,.12],.012,bright);
  for(let j=0;j<9;j++){const x=-1.76+j*.44;craft.curve([[x-.16,2.09,.15],[x-.06,2.18,.19],[x+.08,2.12,.20],[x+.16,2.07,.15]],.010,rail,gold);craft.curve([[x-.12,2.08,.15],[x-.01,2.02,.20],[x+.10,2.05,.16]],.007,rail,bright);}
 }
 batch(filigree);
 const nativeMarkers=[];
 data.planets.forEach((p,i)=>{
  const group=new T.Group();instrument.add(group);const mat=keep(new T.MeshPhysicalMaterial({color:COLORS[i],roughness:.19,metalness:.42,clearcoat:1,emissive:COLORS[i],emissiveIntensity:.10}));
  const sphere=mesh(i>6?new T.OctahedronGeometry(.155,1):new T.SphereGeometry(.16+i%3*.018,28,18),mat,group);ring(group,.21,.016,0,gold).rotation.x=Math.PI/2;
  const aura=glow(group,COLORS[i],.64),tag=label(ABBR[i],group,0,-.29,.04,.20);nativeMarkers.push({group,sphere,aura,tag,p,index:i});
 });
 // Slow particles occupy depth, so the lateral camera move reveals parallax.
 const positions=[];for(let i=0;i<160;i++){const a=i*2.399963,r=2.7+i%13*.22;positions.push(Math.cos(a)*r,-.6+(i%23)*.24,-5+(i%11)*.85);}
 const particleGeo=keep(new T.BufferGeometry());particleGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));const dust=new T.Points(particleGeo,keep(new T.PointsMaterial({color:'#e3c48b',size:.024,transparent:true,opacity:.6,depthWrite:false})));scene.add(dust);

 const qStart=new T.Quaternion(),qEnd=new T.Quaternion(),vFrom=new T.Vector3(),vTo=new T.Vector3();
 function resize(){if(disposed)return;const w=host.clientWidth,h=host.clientHeight||w;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=camera.aspect<.72?56:48;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function render(p=progress,clock=p*14.5){
  if(disposed)return;progress=clamp(p);time=clock;turn+=(targetTurn-turn)*.09;const m=motion(progress,camera.aspect,turn);camera.position.set(...m.camera);camera.lookAt(...m.target);
  threshold.position.z=m.gateZ;threshold.visible=progress<.38;gates.forEach(g=>g.hinge.rotation.y=g.side*(.05+1.44*m.gateOpen));
  const lift=m.lift,rev=m.reveal;instrument.rotation.y=turn*.28;gyro.rotation.z=.04*Math.sin(time*.25);bands.forEach((g,i)=>{
   const q=ease((progress-.225-i*.034)/.25);g.position.y=(-1.77+i*.14)*(1-q);g.position.z=-.45*rev;
   qStart.setFromEuler(new T.Euler(Math.PI/2,0,.09*i));qEnd.setFromEuler(new T.Euler([.5,1.03,-.63][i]*(1-rev),[.37,-.60,.79][i]*(1-rev)+.38*rev,m.orbitTurns[i]*(1-rev)+i*.17*rev));g.quaternion.copy(qStart).slerp(qEnd,q);
   g.scale.setScalar(1+rev*.13);g.rotation.z+=(1-rev)*Math.sin(time*.45+i)*.10;
  });
  petals.forEach((p,i)=>{p.rotation.x=-.42*lift+.035*Math.sin(time*.6+i);});
  heart.rotation.set(time*.19,time*.25,0);core.scale.setScalar(Math.max(.001,lift*(1-rev)));coreGlow.material.opacity=.48+.16*Math.sin(time*1.2);stationGlow.material.opacity=.6+.2*Math.sin(time*1.4);
  kundali.visible=data.lagna!=null&&progress>.75;kundali.rotation.set(...m.boardEuler);kundali.position.set(0,.10*rev,.18+rev*.35);kundali.scale.setScalar(.62+.38*rev);
  tiles.forEach((tile,i)=>tile.position.z=(1-m.tileRise[i])*(.4+(i%3)*.13));board.scale.setScalar(.83+.17*rev);
  nativeMarkers.forEach(({group,sphere,tag,aura,p,index:i})=>{
   const a=(90-p.longitude)*Math.PI/180,spin=Math.sin(m.orbit*Math.PI)*(i%2?-.72:.72),radius=1.66+(i%3)*.22;
   vFrom.set(Math.cos(a+spin)*radius,Math.sin(a+spin)*radius*.78,Math.sin(a+spin)*(i%2?.82:-.82));
   if(data.lagna!=null){vTo.set(p.target[0]*1.04,p.target[1]*1.04,.29);vTo.applyEuler(kundali.rotation);vTo.multiplyScalar(kundali.scale.x);vTo.add(kundali.position);}else vTo.copy(vFrom);
   group.position.copy(vFrom).lerp(vTo,rev);group.scale.setScalar((.2+.8*ease((progress-.29-i*.013)/.18))*(1-rev*.38));sphere.rotation.y=time*(.12+i*.01);tag.quaternion.copy(kundali.quaternion);tag.material.opacity=ease((progress-.37)/.2);aura.material.opacity=.42*(1-rev*.7);group.visible=progress>.23;
  });
  dust.rotation.y=time*.015;lamps.forEach(({flame,aura},i)=>{const f=1+Math.sin(time*6+i)*.1;flame.scale.y=1.8*f;aura.material.opacity=.65+.08*Math.sin(time*3+i);});
  rim.intensity=23+lift*7;warm.intensity=18+lift*5;floor.visible=reflection;
  const start=performance.now();renderer.render(scene,camera);lastRenderMs=performance.now()-start;slow+=lastRenderMs;frames++;
  if(frames===40){if(slow/frames>35&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();}frames=0;slow=0;}
 }
 function pointerDown(e){if(e.button>0)return;pointer={id:e.pointerId,x:e.clientX,turn:targetTurn};host.setPointerCapture?.(e.pointerId);}
 function pointerMove(e){if(pointer?.id===e.pointerId)targetTurn=clamp(pointer.turn+(e.clientX-pointer.x)/host.clientWidth*1.2,-.65,.65);}
 function pointerUp(e){if(pointer?.id===e.pointerId){pointer=null;host.releasePointerCapture?.(e.pointerId);}}
 host.addEventListener('pointerdown',pointerDown);host.addEventListener('pointermove',pointerMove);host.addEventListener('pointerup',pointerUp);host.addEventListener('pointercancel',pointerUp);
 const lost=e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('vedic-scene-lost'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // Compile all scene materials before the timed entrance, including the hidden
 // chart and nine markers. It prevents their first reveal from stalling a chapter.
 const prepared=ready.then(async()=>{if(disposed)return;const hidden=[];scene.traverse(n=>{if(!n.visible){hidden.push(n);n.visible=true;}});try{await renderer.compileAsync(scene,camera);}finally{hidden.forEach(n=>n.visible=false);}});
 return {data,ready:prepared,render,resize,getProgress:()=>progress,getDiagnostics:()=>({design:'navagraha-palace-3',progress,renderMs:lastRenderMs,camera:camera.position.toArray(),cameraTarget:motion(progress,camera.aspect,turn).target,chapter:motion(progress,camera.aspect,turn).chapter,doorOpening:motion(progress,camera.aspect).gateOpen,boardEuler:kundali.rotation.toArray().slice(0,3),houseTiles:tiles.length,orbitBands:bands.length,reflection,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,nativePlanets:data.planets.map(p=>({key:p.key,longitude:p.longitude,house:p.house})),turn,pixelRatio:renderer.getPixelRatio()}),dispose(){
  if(disposed)return;disposed=true;observer.disconnect();host.removeEventListener('pointerdown',pointerDown);host.removeEventListener('pointermove',pointerMove);host.removeEventListener('pointerup',pointerUp);host.removeEventListener('pointercancel',pointerUp);renderer.domElement.removeEventListener('webglcontextlost',lost);floor.dispose();env.dispose();for(const r of resources)r.dispose?.();renderer.dispose();renderer.domElement.remove();
 }};
}
