/* Navagraha ceremony: real extruded kundali and 27 lunar stations.
 * The immutable native chart supplies every planet and destination.
 */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const POS=[[0,.93],[-.96,1.48],[-1.48,.96],[-.93,0],[-1.48,-.96],[-.96,-1.48],[0,-.93],[.96,-1.48],[1.48,-.96],[.93,0],[1.48,.96],[.96,1.48]];
const COLORS=[0xffb951,0xe4f3f5,0xe66449,0x5dd5a5,0xf5d66b,0xf5bcc8,0x8191ed,0xb290cc,0xba9a69];
const ABBR=['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function model(chart){
  const keys=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  return {nakshatra:chart.planets.Moon.nakshatra.index,lagna:chart.lagna?.sign??null,planets:keys.map((key,i)=>{
    const p=chart.planets[key],a=(90-p.longitude)*Math.PI/180,r=1.45+(i%3)*.22,house=p.house;
    const peers=keys.filter(k=>chart.planets[k].house===house),n=peers.indexOf(key),base=house?POS[house-1]:[Math.cos(a)*1.65,Math.sin(a)*1.65];
    return {key,longitude:p.longitude,house,sign:p.sign,ring:[Math.cos(a)*r,Math.sin(a)*r,.25+(i%3)*.09],target:[base[0]+(n-(peers.length-1)/2)*.18,base[1],.15]};
  })};
}
export function create(host,chart){
  const data=model(chart),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,35);camera.position.set(0,0,8.6);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setClearColor(0x0d1024,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.05);scene.environment=env.texture;scene.environmentIntensity=.45;room.dispose();pmrem.dispose();
  const assembly=new THREE.Group(),mandala=new THREE.Group(),kundali=new THREE.Group();scene.add(assembly);assembly.add(mandala,kundali);
  scene.add(new THREE.HemisphereLight(0xffebc0,0x080d26,1.8));const key=new THREE.DirectionalLight(0xffce8f,2.5);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.PointLight(0x7699ff,6,14);rim.position.set(2,-2,3);scene.add(rim);
  const gold=new THREE.MeshStandardMaterial({color:0xbb8841,metalness:.86,roughness:.22}),bright=new THREE.MeshStandardMaterial({color:0xf1cf84,metalness:.78,roughness:.24}),dark=new THREE.MeshStandardMaterial({color:0x0b1527,metalness:.4,roughness:.62});
  const disposable=new Set([gold,bright,dark]),rings=[],stations=[],jewels=[],labels=[];
  function addMesh(parent,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
  function ring(radius,tube,z,mat=gold){const m=addMesh(mandala,new THREE.TorusGeometry(radius,tube,8,144),mat,0,0,z);rings.push(m);return m;}
  ring(2.5,.044,0);ring(2.43,.016,.06,bright);ring(2.24,.038,.09);ring(2.17,.012,.14,bright);ring(1.97,.028,.12);ring(1.12,.014,.02);ring(.88,.02,-.02);
  for(let i=0;i<108;i++){const a=i*Math.PI*2/108,r=2.36;const m=addMesh(mandala,new THREE.BoxGeometry(.013,i%4===0?.13:.044,.018),i%4===0?bright:gold,Math.sin(a)*r,Math.cos(a)*r,.06);m.rotation.z=-a;}
  for(let i=0;i<27;i++){const a=(90-(i+.5)*360/27)*Math.PI/180;const mat=new THREE.MeshStandardMaterial({color:i===data.nakshatra?0xfbe7ba:0x3f6576,metalness:.65,roughness:.18,emissive:0xe7b750,emissiveIntensity:0});disposable.add(mat);const m=addMesh(mandala,new THREE.OctahedronGeometry(i===data.nakshatra?.095:.048,0),mat,2.075*Math.cos(a),2.075*Math.sin(a),.13);stations.push(m);}
  for(let i=0;i<12;i++){const a=i*Math.PI*2/12;const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(-.22,.24,-.17,.57,0,.78);s.bezierCurveTo(.17,.57,.22,.24,0,0);const geo=new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:1,steps:1});const petal=addMesh(mandala,geo,i%2?dark:gold,Math.sin(a)*1.12,Math.cos(a)*1.12,-.08);petal.rotation.z=-a;}
  const base=new THREE.Shape();base.moveTo(-1.9,-1.9);base.lineTo(1.9,-1.9);base.lineTo(1.9,1.9);base.lineTo(-1.9,1.9);base.closePath();addMesh(kundali,new THREE.ExtrudeGeometry(base,{depth:.09,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2}),dark,0,0,-.12);
  function line(points,material=gold){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],.015)),false,'catmullrom',0);return addMesh(kundali,new THREE.TubeGeometry(curve,Math.max(1,points.length-1),.015,7,false),material);}
  line([[-1.9,-1.9],[1.9,-1.9],[1.9,1.9],[-1.9,1.9],[-1.9,-1.9]],bright);line([[-1.9,-1.9],[1.9,1.9]]);line([[-1.9,1.9],[1.9,-1.9]]);line([[0,1.9],[1.9,0],[0,-1.9],[-1.9,0],[0,1.9]],bright);
  function label(text,color='#f8e6bc',scale=.3){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const c=canvas.getContext('2d');c.font='500 30px "Noto Sans TC", sans-serif' ;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(text,64,34);const map=new THREE.CanvasTexture(canvas),mat=new THREE.SpriteMaterial({map,transparent:true,depthTest:false});disposable.add(mat);const sprite=new THREE.Sprite(mat);sprite.scale.set(scale*2,scale,1);assembly.add(sprite);labels.push(sprite);return sprite;}
  if(data.lagna!=null)POS.forEach((p,i)=>{const sign=(data.lagna+i)%12+1,s=label(String(sign),'#d4b67f',.19);s.userData.rashi=true;s.position.set(p[0],p[1]+.25,.12);});
  data.planets.forEach((p,i)=>{const mat=new THREE.MeshPhysicalMaterial({color:COLORS[i],metalness:.32,roughness:.15,clearcoat:1,emissive:COLORS[i],emissiveIntensity:.12});disposable.add(mat);const jewel=addMesh(assembly,i>6?new THREE.OctahedronGeometry(.09,1):new THREE.SphereGeometry(.085,20,14),mat);const text=label(ABBR[i],'#f4dfb4',.19);jewels.push({jewel,label:text,p,index:i});});
  const specks=new THREE.BufferGeometry(),arr=[];for(let i=0;i<70;i++){const a=i*2.399963,r=2.7+(i%9)*.09;arr.push(Math.cos(a)*r,Math.sin(a)*r,-.8+(i%7)*.11);}specks.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const dustMat=new THREE.PointsMaterial({color:0xd7b672,size:.025,transparent:true,opacity:.65});disposable.add(dustMat);scene.add(new THREE.Points(specks,dustMat));
  let disposed=false,last=0;const resize=()=>{if(disposed)return;const w=host.clientWidth,h=host.clientHeight||w;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function render(progress=0){if(disposed)return;last=progress;const t=clamp(progress),unfold=ease((t-.55)/.37),appear=ease((t-.12)/.35);assembly.rotation.x=-.48*(1-unfold);assembly.rotation.y=.15*(1-unfold);assembly.rotation.z=.15*(1-unfold);assembly.position.y=.07;mandala.rotation.z=(1-unfold)*(.12+t*.3);mandala.scale.setScalar(1+.14*unfold);mandala.position.z=-.32*unfold;kundali.scale.setScalar(.06+.94*unfold);kundali.visible=data.lagna!=null&&unfold>.02;
    rings.forEach((r,i)=>r.position.z=(1-unfold)*(.12+Math.sin(t*8+i*.5)*.12));stations.forEach((s,i)=>{s.material.emissiveIntensity=i===data.nakshatra?1.6:((t*27*3)%27>=i?.26:0);});
    jewels.forEach(({jewel,label,p,index})=>{const from=p.ring,to=data.lagna==null?p.ring:p.target,a=appear;const x=from[0]*(1-unfold)+to[0]*unfold,y=from[1]*(1-unfold)+to[1]*unfold,z=from[2]*(1-unfold)+to[2]*unfold;jewel.position.set(x,y,z+(1-a)*(index+1)*.18);jewel.scale.setScalar(.15+.85*a);label.position.set(x,y-.18,z+.03);label.material.opacity=a;});labels.filter(s=>s.userData.rashi).forEach(s=>s.material.opacity=unfold);renderer.render(scene,camera);
  }
  const lost=e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('vedic-scene-lost'));};renderer.domElement.addEventListener('webglcontextlost',lost);render(0);
  return {data,render,resize,dispose(){if(disposed)return;disposed=true;observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{o.geometry?.dispose();});for(const mat of disposable){mat.map?.dispose();mat.dispose();}env.dispose();renderer.dispose();renderer.domElement.remove();},getProgress:()=>last};
}
window.JYVedicScene=Object.freeze({create,model});
