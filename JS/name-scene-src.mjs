import * as THREE from 'three';

function mount(host, initialName){
  const fallback=host.querySelector('img');let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){return {setName(){},dispose(){}};}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.setClearColor(0x000000,0);
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(.2,5.8,6.6);camera.lookAt(0,.25,0);
  const book=new THREE.Group();scene.add(book);book.rotation.y=-.15;
  scene.add(new THREE.HemisphereLight(0xe8e9ef,0x1a2334,2));
  const light=new THREE.DirectionalLight(0xffe4b0,4);light.position.set(-3,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5});light.shadow.bias=-.002;scene.add(light);
  const rim=new THREE.DirectionalLight(0x88a9c5,1.5);rim.position.set(4,3,-4);scene.add(rim);
  const paper=document.createElement('canvas');paper.width=1024;paper.height=768;const ctx=paper.getContext('2d'),texture=new THREE.CanvasTexture(paper);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  function drawName(name){
    name=String(name||'名字').slice(0,12);const gradient=ctx.createLinearGradient(0,0,1024,768);gradient.addColorStop(0,'#ead9b5');gradient.addColorStop(.5,'#f5e7c9');gradient.addColorStop(1,'#ceae78');ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,768);
    ctx.strokeStyle='#aa89554f';ctx.lineWidth=2;ctx.strokeRect(65,65,894,638);ctx.strokeRect(75,75,874,618);
    ctx.textAlign='center';ctx.fillStyle='#886e49';ctx.font='22px serif';ctx.fillText('J I N G Y U E   ·   N A M E   A T E L I E R',512,150);
    const letters=Array.from(name),size=Math.min(180,650/Math.max(letters.length,2));ctx.font='500 '+size+'px "Noto Serif TC", "Songti TC", serif';ctx.fillStyle='#2e343e';ctx.fillText(name,512,440,780);
    ctx.fillStyle='#ac6657';ctx.fillRect(767,540,66,71);ctx.strokeStyle='#e7c99c';ctx.lineWidth=2;ctx.strokeRect(773,546,54,59);ctx.font='30px serif';ctx.fillStyle='#e9cea6';ctx.fillText('月',799,585);
    ctx.font='24px serif';ctx.fillStyle='#877957';ctx.fillText('一字一意   ·   看見你的期待',512,641);texture.needsUpdate=true;
  }
  drawName(initialName);
  function mesh(geometry,material,x,y,z){const item=new THREE.Mesh(geometry,material);item.position.set(x,y,z);item.castShadow=true;item.receiveShadow=true;book.add(item);return item;}
  const wood=new THREE.MeshStandardMaterial({color:0x3a302b,roughness:.46,metalness:.12}),gold=new THREE.MeshStandardMaterial({color:0xbca374,roughness:.33,metalness:.8}),ink=new THREE.MeshStandardMaterial({color:0x0e1722,roughness:.4,metalness:.18});
  const desk=mesh(new THREE.BoxGeometry(5.25,.14,3.75),new THREE.MeshStandardMaterial({color:0x16212d,roughness:.7,metalness:.18}),0,-.1,0);desk.receiveShadow=true;
  const scroll=mesh(new THREE.PlaneGeometry(3.58,2.68,48,1),new THREE.MeshStandardMaterial({map:texture,roughness:.86,side:THREE.DoubleSide}),-.22,.08,.05);scroll.rotation.x=-Math.PI/2;
  const pos=scroll.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,Math.max(0,Math.abs(x)-1.35)**2*.5);}scroll.geometry.computeVertexNormals();
  for(const x of [-2.03,1.59]){const rod=mesh(new THREE.CylinderGeometry(.095,.095,2.91,20),wood,x,.18,.05);rod.rotation.x=Math.PI/2;for(const z of [-1.45,1.55]){const end=mesh(new THREE.CylinderGeometry(.13,.13,.12,20),gold,x,.18,z);end.rotation.x=Math.PI/2;}}
  const stone=mesh(new THREE.CylinderGeometry(.32,.35,.14,40),ink,2.07,.08,-.98);stone.scale.z=1.32;
  mesh(new THREE.CylinderGeometry(.245,.245,.015,40),new THREE.MeshStandardMaterial({color:0x050a11,roughness:.16,metalness:.5}),2.07,.16,-.98).scale.z=1.32;
  const brush=new THREE.Group();brush.position.set(2.05,.22,.2);brush.rotation.y=-.35;book.add(brush);
  function brushPart(geo,mat,z){const part=new THREE.Mesh(geo,mat);part.rotation.x=Math.PI/2;part.position.z=z;part.castShadow=true;brush.add(part);return part;}
  brushPart(new THREE.CylinderGeometry(.043,.043,1.58,16),wood,0);brushPart(new THREE.CylinderGeometry(.055,.055,.25,16),gold,.83);brushPart(new THREE.ConeGeometry(.09,.45,20),new THREE.MeshStandardMaterial({color:0xceb893,roughness:.95}),1.13).rotation.x=-Math.PI/2;
  const seal=mesh(new THREE.BoxGeometry(.29,.31,.29),new THREE.MeshStandardMaterial({color:0x80554b,roughness:.5}),1.94,.15,1.35);seal.rotation.y=.3;
  const resources=new Set();scene.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>resources.add(m));});resources.add(texture);
  let disposed=false,visible=true,raf=0,target=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function render(){if(disposed)return;renderer.render(scene,camera);}
  function tick(){raf=0;if(disposed||document.hidden||!visible)return;book.rotation.y+=((-.15+target)-book.rotation.y)*.035;render();if(!reduced.matches&&Math.abs((-.15+target)-book.rotation.y)>.00005)raf=requestAnimationFrame(tick);}
  function start(){if(!disposed&&!document.hidden&&visible){if(!raf)raf=requestAnimationFrame(tick);}}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function resize(){if(disposed)return;const rect=host.getBoundingClientRect();if(rect.width<1||rect.height<1)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();render();}
  const observer=new ResizeObserver(resize);observer.observe(host);const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop();},{threshold:.02});visibility.observe(host);
  const onVisibility=()=>document.hidden?stop():start(),onMotion=()=>{stop();start();},onPointer=e=>{if(!reduced.matches){target=(e.clientX/innerWidth-.5)*.14;start();}},onLost=e=>{e.preventDefault();stop();host.classList.remove('nm-webgl');};
  document.addEventListener('visibilitychange',onVisibility);document.addEventListener('pointermove',onPointer,{passive:true});reduced.addEventListener('change',onMotion);canvas.addEventListener('webglcontextlost',onLost);
  resize();host.classList.add('nm-webgl');start();
  return {setName(name){if(disposed)return;drawName(name);render();},dispose(){if(disposed)return;disposed=true;stop();observer.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('pointermove',onPointer);reduced.removeEventListener('change',onMotion);canvas.removeEventListener('webglcontextlost',onLost);resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();host.classList.remove('nm-webgl');}};
}
window.JYNameScene=Object.freeze({mount});
