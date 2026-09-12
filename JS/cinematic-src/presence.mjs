import * as T from 'three';
import {clamp,ease} from './choreography.mjs';

// Local, deterministic stage decoration. No network, reading data, RNG or timers.
export function presencePoint(kind,index,count,state){
 const q=index/Math.max(1,count),lane=index%4,t=state.time||0;
 const power=clamp(state.power||0),open=state.phase>=2?ease((state.since||0)/2):power*.55;
 const a=q*Math.PI*2+t*.15+(state.turn||0)*.12,r=.8+open*.55;
 if(kind==='bazi')return {x:(lane-1.5)*.68+Math.sin(a*3)*.12,y:-1.6+((q*4+t*.18)%1)*(1.2+open*.6),z:.6+Math.cos(a*3)*.14};
 if(kind==='compat'){const side=index%2?1:-1;return {x:side*.58+Math.cos(a*2)*(.45+open*.15),y:-.88+Math.sin(a*2)*.56,z:.7+Math.sin(a*2+side)*.32};}
 if(kind==='ziwei')return {x:Math.cos(a*2)*r,y:-.75+Math.sin(a*2)*r*.65,z:.35+Math.sin(a*3)*.65};
 if(kind==='meihua')return {x:Math.cos(a)*r*(.7+.25*Math.cos(a*5)),y:-.95+Math.sin(a)*r*.6,z:.45+Math.sin(a*5+t*.3)*.28};
 if(kind==='oracle')return {x:Math.sin(a*3)*(.26+q*.55),y:-1.65+((q+t*.09)%1)*(1.6+open*.5),z:.55+Math.cos(a*3)*.35};
 if(kind==='lenormand')return {x:(index%3-1)*.72+Math.cos(a*3)*.28,y:-1.12+Math.sin(a*3)*.18+open*.12,z:.85+Math.sin(a*2)*.17};
 if(kind==='ootk')return {x:Math.cos(a)*r,y:-.45+Math.sin(a)*r*.85,z:.6+Math.cos(a*2)*.35};
 return {x:Math.cos(a)*r*1.18,y:-1.18+Math.sin(a)*.3,z:.8+Math.sin(a)*.45};
}

export function buildPresence({kind,rig,keep,accent,reduced}){
 const group=new T.Group();group.name='local-presence';rig.add(group);
 let lastPhase=-1,rippleAt=-10,contactAt=-10,contactX=0,contactY=-.8;
 const u={clock:{value:0},energy:{value:0},tint:{value:accent},ripple:{value:new T.Vector4(0,0,10,0)}};
 const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
 const water=keep(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:u,
  vertexShader:vertex,
  fragmentShader:`varying vec2 vUv;uniform float clock,energy;uniform vec3 tint;uniform vec4 ripple;
   void main(){
    vec2 p=(vUv-.5)*vec2(10.,14.);float d=length(p-ripple.xy);
    float front=exp(-pow((d-ripple.z*1.8)*2.8,2.))*exp(-ripple.z*1.3)*ripple.w;
    float wave=sin(p.y*25.+sin(p.x*3.+clock*.6)*1.6-clock*1.7)*.5+.5;
    float moon=exp(-pow(p.x*1.3+sin(p.y*6.-clock*.7)*.1,2.))*wave;
    float rim=exp(-pow(abs(p.x)-2.02+sin(p.y*9.+clock)*.024,2.)*180.);
    float edge=(1.-smoothstep(.26,.5,abs(vUv.x-.5)))*(1.-smoothstep(.28,.5,abs(vUv.y-.5)));
    float light=moon*.12+rim*.19+front*.32;
    gl_FragColor=vec4(mix(vec3(.028,.085,.11),tint,clamp(light,0.,.65)),edge*(.1+light+energy*.035));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 }));
 const floor=new T.Mesh(keep(new T.PlaneGeometry(10,14)),water);floor.name='moon-water';floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.73,-1.2);group.add(floor);

 const beamMat=keep(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:u,vertexShader:vertex,
  fragmentShader:`varying vec2 vUv;uniform float clock,energy;uniform vec3 tint;
   void main(){float x=vUv.x+sin(vUv.y*3.+clock*.2)*.035;
    float streak=pow(max(0.,sin(x*12.+vUv.y*.6)),12.);
    float fade=sin(vUv.y*3.14159)*pow(max(0.,sin(vUv.x*3.14159)),2.);
    gl_FragColor=vec4(tint,streak*fade*(.035+energy*.025));
   }`
 }));
 const beams=new T.Mesh(keep(new T.PlaneGeometry(6.8,5.4)),beamMat);beams.name='moon-rays';beams.position.set(.15,.25,-1.7);group.add(beams);

 const count=reduced?48:192,positions=new Float32Array(count*3),alpha=new Float32Array(count);
 const geo=keep(new T.BufferGeometry());geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('strength',new T.BufferAttribute(alpha,1).setUsage(T.DynamicDrawUsage));
 const spark=keep(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tint:{value:accent}},
  vertexShader:`attribute float strength;varying float alpha;void main(){alpha=strength;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(30./max(.1,-p.z),2.,11.);}`,
  fragmentShader:`uniform vec3 tint;varying float alpha;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float core=exp(-d*d*38.);float cross=exp(-abs(p.x*p.y)*500.)*(1.-smoothstep(.08,.5,d));gl_FragColor=vec4(mix(tint,vec3(1.),core*.5),(core*.6+cross*.23)*alpha);}`
 }));
 const sparks=new T.Points(geo,spark);sparks.name='ritual-current';sparks.frustumCulled=false;group.add(sparks);
 const trailCount=28,trailPos=new Float32Array(trailCount*3),trailAlpha=new Float32Array(trailCount);
 const trailGeo=keep(new T.BufferGeometry());trailGeo.setAttribute('position',new T.BufferAttribute(trailPos,3).setUsage(T.DynamicDrawUsage));trailGeo.setAttribute('strength',new T.BufferAttribute(trailAlpha,1).setUsage(T.DynamicDrawUsage));
 const trail=new T.Points(trailGeo,spark);trail.name='finger-starlight';trail.frustumCulled=false;group.add(trail);
 const ribbon=keep(new T.MeshBasicMaterial({color:accent,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));
 const echo=new T.Mesh(keep(new T.TorusGeometry(.2,.006,6,72)),ribbon);echo.name='touch-echo';group.add(echo);
 return {
  contact(x,y,time){if(reduced)return;contactX=clamp(x,-1,1)*2.1;contactY=-clamp(y,-1,1)*2.25;contactAt=time;rippleAt=time;u.ripple.value.set(contactX,clamp(y,-1,1)*1.3,time,1);},
  update(state){
   const time=reduced?0:state.time,energy=state.phase>=2?.8:clamp(state.power||0);
   if(state.phase!==lastPhase){lastPhase=state.phase;if(state.phase===2&&!reduced){rippleAt=time;u.ripple.value.set(0,0,0,1);}}
   u.clock.value=time;u.energy.value=energy;u.ripple.value.z=Math.max(0,time-rippleAt);
   const age=Math.max(0,time-contactAt),decay=reduced?0:Math.exp(-age*2.8);
   echo.visible=!reduced&&age<1.6;echo.position.set(contactX,contactY,1.5);echo.scale.setScalar(1+age*3);ribbon.opacity=decay*.55;
   for(let i=0;i<count;i++){
    const p=presencePoint(kind,i,count,{...state,time});positions[i*3]=p.x;positions[i*3+1]=p.y;positions[i*3+2]=p.z;
    alpha[i]=(.05+energy*.48)*(.3+.7*(.5+.5*Math.sin(time*1.1+i*2.4)));
   }
   geo.attributes.position.needsUpdate=geo.attributes.strength.needsUpdate=true;
   for(let i=trailCount-1;i>=0;i--){
    if(i===0){trailPos[0]=contactX;trailPos[1]=contactY;trailPos[2]=1.5;}
    else for(let k=0;k<3;k++)trailPos[i*3+k]+=(trailPos[(i-1)*3+k]-trailPos[i*3+k])*.36;
    trailAlpha[i]=decay*Math.pow(1-i/trailCount,1.5)*.65;
   }
   trailGeo.attributes.position.needsUpdate=trailGeo.attributes.strength.needsUpdate=true;
  }
 };
}
