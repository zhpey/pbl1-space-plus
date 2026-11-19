import * as THREE from 'three';
import {planets} from './data.js';
import {destinations,odysseyAsset} from './odyssey-data.js';
import {createShipDetail} from './ship-detail.js';
import {createShipSurfaces} from './ship-surfaces.js';
import {createShipLighting} from './ship-lighting.js';
import {createShipAtmosphere} from './ship-atmosphere.js';
import {createShipEffects} from './ship-effects.js';
import {batchStaticHull} from './ship-batch.js';
import {createShipCupola} from './ship-cupola.js';
import {createShipThermal} from './ship-thermal.js';
import {createShipFlightDeck} from './ship-flight-deck.js';
import {shipOrbits} from './ship-orbits.js';
import {createShipGuidance} from './ship-guidance.js';
import {createFlightState,stepFlight,assistFlightInput} from './flight-physics.js';
import {createFlightField} from './flight-field.js';

// Original fictional spacecraft. Each selectable assembly is actual scene geometry.
export function createShipScene({scene,camera,makePlanet,invalidate,renderer,mainLight}){
 const root=new THREE.Group();root.name='ship-operations';scene.add(root);
 const vessel=new THREE.Group();vessel.name='wa01-vessel';root.add(vessel);
 const modules={},surfaces=new Map(),textures=[],backgrounds=new Map();
 const flight=createFlightState(),normalCameraFar=camera.far;
 const neutralInput={thrust:false,brake:false,boost:false,yaw:0,pitch:0,roll:0};
 let flightInput={...neutralInput},flightField=null,lastFlightStatus=0,flightTarget=1,flightMessage='等待起飞';
 let selected=null,hovered=null,visible=false,paused=false,time=0,stationIndex=0,warp=null,drag=null,yaw=0,pitch=0,shownYaw=0,shownPitch=0,zoom=1,inspection=false,lamps=true,orbit=false,deck=false,angle='default',settling=true,anchors=[],lastMotion='';
 const active=Object.fromEntries(['bridge','engine','radar','power','lab','bay'].map(id=>[id,false]));
 const values={...Object.fromEntries(Object.keys(active).map(id=>[id,0]))};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function canvasTexture(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.push(t);return t;}
 let seed=9931;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const arrayMap=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#101d2a';c.fillRect(0,0,w,h);for(let x=0;x<8;x++)for(let y=0;y<12;y++){const px=x*64,py=y*42.66;c.fillStyle=(x+y)%3===0?'#3a4c68':'#243954';c.fillRect(px+2,py+2,60,39);c.strokeStyle='#b9a67c88';c.lineWidth=.8;c.strokeRect(px+4,py+4,56,35);c.fillStyle='#748da046';for(let k=1;k<5;k++)c.fillRect(px+4,py+4+k*6,56,.7);}});
 const livery=canvasTexture(1024,256,(c,w,h)=>{c.fillStyle='#aab6bf';c.fillRect(0,0,w,h);c.fillStyle='#1a2a35';c.font='bold 82px sans-serif';c.fillText('WAYFARER',45,112);c.font='25px monospace';c.fillText('WA — 01    /    DEEP SPACE RESEARCH',48,172);c.fillStyle='#ad633e';c.fillRect(48,200,930,13);});
 const glowMap=canvasTexture(128,128,(c,w)=>{const g=c.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'#fff');g.addColorStop(.13,'#d8f6ff');g.addColorStop(.35,'#8dcef060');g.addColorStop(1,'#72bbff00');c.fillStyle=g;c.fillRect(0,0,w,w);});
 const materials={
  hull:new THREE.MeshStandardMaterial({color:0xc2c0b7,metalness:.62,roughness:.82}),
  dark:new THREE.MeshStandardMaterial({color:0x1b272d,metalness:.58,roughness:.6}),
  silver:new THREE.MeshStandardMaterial({color:0x7c97a5,metalness:.82,roughness:.35}),
  orange:new THREE.MeshStandardMaterial({color:0xa95c32,metalness:.35,roughness:.67}),
  glass:new THREE.MeshPhysicalMaterial({color:0x102b39,metalness:0,roughness:.4,clearcoat:.08,clearcoatRoughness:.4,specularIntensity:.15,emissive:0x153e4a,emissiveIntensity:.13}),
  solar:new THREE.MeshStandardMaterial({map:arrayMap,color:0x8196b5,metalness:.62,roughness:.36,side:THREE.DoubleSide}),
  label:new THREE.MeshStandardMaterial({map:livery,metalness:.3,roughness:.7}),
  light:new THREE.MeshBasicMaterial({color:new THREE.Color(.6,1.9,2.8),toneMapped:false}),
  amber:new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,.8,.2),toneMapped:false})
 };
 const surfacesPBR=createShipSurfaces({canvasTexture,random});materials.hull.map=surfacesPBR.albedo;materials.hull.roughnessMap=surfacesPBR.roughness;materials.hull.bumpMap=surfacesPBR.height;materials.hull.bumpScale=.016;materials.hull.roughness=.82;materials.silver.roughnessMap=surfacesPBR.brushed;materials.silver.roughness=.58;materials.orange.metalness=.6;materials.orange.roughness=.46;materials.solar.color.set(0x5c7386);materials.glass.envMapIntensity=.8;
 const fillLight=new THREE.DirectionalLight(0x9ac9ee,.75);fillLight.name='wa-cold-rim';fillLight.position.set(5,3,-5);root.add(fillLight,fillLight.target);
 function module(id){const group=new THREE.Group();group.name='ship-part-'+id;group.userData.shipPart=id;modules[id]=group;vessel.add(group);surfaces.set(id,new Map());return group;}
 const bridge=module('bridge'),engines=module('engine'),radar=module('radar'),power=module('power'),lab=module('lab'),bay=module('bay');
 const boxGeometries=new Map();
 function materialFor(parent,material){let g=parent;while(g&&!g.userData.shipPart)g=g.parent;if(!g||!material.isMeshStandardMaterial)return material;const collection=surfaces.get(g.userData.shipPart);if(!collection.has(material)){const m=material.clone();m.userData.originalEmissive=m.emissive.clone();m.userData.originalIntensity=m.emissiveIntensity;collection.set(material,m);}return collection.get(material);}
 function mesh(parent,geometry,material,pos,rot){const o=new THREE.Mesh(geometry,materialFor(parent,material));if(pos)o.position.set(...pos);if(rot)o.rotation.set(...rot);parent.add(o);return o;}
 function box(parent,w,h,d,material,pos,rot){const key=[w,h,d].join();if(!boxGeometries.has(key)){const g=new THREE.BoxGeometry(w,h,d,2,2,2),p=g.attributes.position,r=Math.min(w,h,d)*.11,a=new THREE.Vector3(),b=new THREE.Vector3();for(let i=0;i<p.count;i++){a.fromBufferAttribute(p,i);b.set(THREE.MathUtils.clamp(a.x,-w/2+r,w/2-r),THREE.MathUtils.clamp(a.y,-h/2+r,h/2-r),THREE.MathUtils.clamp(a.z,-d/2+r,d/2-r));a.sub(b).normalize().multiplyScalar(r).add(b);p.setXYZ(i,a.x,a.y,a.z);}g.computeVertexNormals();boxGeometries.set(key,g);}return mesh(parent,boxGeometries.get(key),material,pos,rot);}
 function tube(parent,r1,r2,length,material,pos,rot=[Math.PI/2,0,0],segments=24){return mesh(parent,new THREE.CylinderGeometry(r1,r2,length,segments),material,pos,rot);}
 function ring(parent,r,t,material,pos,rot){return mesh(parent,new THREE.TorusGeometry(r,t,6,32),material,pos,rot);}
 function shell(parent,points,depth,material,pos){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:2,steps:1});geo.rotateX(Math.PI/2);geo.computeBoundingBox();const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,b=geo.boundingBox,s=b.getSize(new THREE.Vector3());for(let i=0;i<p.count;i++){if(Math.abs(n.getY(i))>.6)uv.setXY(i,(p.getX(i)-b.min.x)/s.x,(p.getZ(i)-b.min.z)/s.z);else uv.setXY(i,Math.abs(n.getX(i))>.6?(p.getZ(i)-b.min.z)/s.z:(p.getX(i)-b.min.x)/s.x,(p.getY(i)-b.min.y)/s.y);}return mesh(parent,geo,material,pos);}
 function instances(parent,name,geometry,material,positions){const o=new THREE.InstancedMesh(geometry,materialFor(parent,material),positions.length),matrix=new THREE.Matrix4();positions.forEach((p,i)=>{matrix.makeTranslation(...p);o.setMatrixAt(i,matrix);});o.name=name;o.instanceMatrix.needsUpdate=true;parent.add(o);return o;}
 shell(vessel,[[-.34,-3.9],[.34,-3.9],[.74,-2.3],[.88,1.9],[.55,2.75],[-.55,2.75],[-.88,1.9],[-.74,-2.3]],.75,materials.hull,[0,.35,0]);
 box(vessel,1.23,.28,4.1,materials.dark,[0,-.46,-.15]);box(vessel,.48,.17,3.1,materials.orange,[0,-.63,.15]);
 for(const side of [-1,1]){
  for(let j=0;j<10;j++){box(vessel,.16,.17,.28,materials.silver,[side*.79,-.21,-2.1+j*.42]);box(vessel,.19,.035,.19,materials.dark,[side*.74,.41,-1.95+j*.35]);}
  shell(vessel,[[side*.6,-.25],[side*2.15,.2],[side*2.2,1.8],[side*.6,1.3]],.18,materials.hull,[0,.05,0]);
  tube(vessel,.08,.08,1.22,materials.silver,[side*.94,-.26,-1.5]);
  box(vessel,.026,.026,3.3,materials.amber,[side*.69,.41,-.5]);
 }
 mesh(vessel,new THREE.PlaneGeometry(.8,.2),materials.label,[0,.398,.1],[-Math.PI/2,0,0]);
 for(const side of [-1,1]){
  for(let j=0;j<4;j++){const z=-.65+j*.63;box(vessel,.31,.025,.47,materials.hull,[side*.41,.391,z]);box(vessel,.21,.008,.026,materials.dark,[side*.41,.409,z-.12]);}
  tube(vessel,.026,.026,2.45,materials.silver,[side*.59,.435,.2]);
  for(let j=0;j<3;j++)box(vessel,.095,.055,.07,materials.orange,[side*.59,.434,-.8+j*.8]);
 }
 // Layered armor, inset flank panels and instanced fasteners break up the flat deck.
 shell(vessel,[[-.27,-3.78],[.27,-3.78],[.55,-2.62],[-.55,-2.62]],.12,materials.dark,[0,.44,0]);
 const flankPanels=[],fasteners=[],radiators=[];
 for(const side of [-1,1]){
  for(let j=0;j<7;j++){const z=-1.6+j*.57;flankPanels.push([side*.865,-.12,z]);for(const y of [-.25,.02])fasteners.push([side*.912,y,z-.17]);}
  for(let j=0;j<19;j++)radiators.push([side*.43,-.65,-1.55+j*.17]);
  for(let j=0;j<9;j++)for(const x of [.19,.51])fasteners.push([side*x,.447,-1.55+j*.43]);
  box(vessel,.07,.08,3.8,materials.dark,[side*.64,.46,.12]);
  mesh(vessel,new THREE.PlaneGeometry(1.5,.25),materials.label,[side*.911,-.12,.65],[0,side*Math.PI/2,0]);
 }
 instances(vessel,'wa-flank-armor',new THREE.BoxGeometry(.07,.28,.44),materials.hull,flankPanels);
 instances(vessel,'wa-hull-fasteners',new THREE.SphereGeometry(.014,6,4),materials.silver,fasteners);
 instances(vessel,'wa-radiator-fins',new THREE.BoxGeometry(.29,.08,.06),materials.dark,radiators);
 const runningLights=new THREE.Group();runningLights.name='wa-running-lights';vessel.add(runningLights);
 const warmLamp=new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,.85,.33),toneMapped:false});
 const coolLamp=new THREE.MeshBasicMaterial({color:new THREE.Color(.32,.85,1.35),toneMapped:false});
 const warmStrips=[],coolStrips=[];for(const side of [-1,1])for(let j=0;j<7;j++)(j%3===0?warmStrips:coolStrips).push([side*.64,.51,-1.4+j*.47]);
 const stripGeometry=new THREE.BoxGeometry(.035,.018,.12);instances(runningLights,'wa-warm-strips',stripGeometry,warmLamp,warmStrips);instances(runningLights,'wa-cool-strips',stripGeometry,coolLamp,coolStrips);
 for(const side of [-1,1]){box(runningLights,.018,.05,.32,warmLamp,[side*.922,-.08,2.15]);box(runningLights,.12,.03,.03,side<0?new THREE.MeshBasicMaterial({color:0xe36f55}):new THREE.MeshBasicMaterial({color:0x80bdab}),[side*2.14,.18,1.72]);}
 // Articulated flight deck and a local holographic navigation display.
 bridge.position.set(0,.38,-1.95);
 box(bridge,1.12,.25,1.25,materials.dark,[0,.1,0]);
 const canopy=new THREE.Group();canopy.name='wa-canopy';canopy.position.set(0,.17,.48);bridge.add(canopy);
 shell(canopy,[[-.38,-1.35],[.38,-1.35],[.5,-.08],[-.5,-.08]],.25,materials.glass,[0,.1,0]);
 for(const x of [-.44,0,.44])box(canopy,.035,.045,1.02,materials.silver,[x,.13,-.65]);
 box(canopy,.96,.06,.04,materials.hull,[0,.08,-.22]);
 for(const x of [-.23,.23]){box(bridge,.25,.22,.4,materials.dark,[x,.16,-.17]);box(bridge,.22,.2,.08,materials.orange,[x,.35,.02],[-.2,0,0]);}
 const cabinLight=new THREE.PointLight(0xffbc79,.7,2.5,1);cabinLight.name='wa-cabin-light';cabinLight.position.set(0,.55,-.3);bridge.add(cabinLight);
 const cabinWindows=new THREE.Group();cabinWindows.name='wa-cabin-windows';canopy.add(cabinWindows);
 const windows=[];for(const side of [-1,1])for(let j=0;j<3;j++)windows.push([side*(.47-j*.035),-.03,-.3-j*.23]);instances(cabinWindows,'wa-lit-windows',new THREE.BoxGeometry(.025,.07,.16),warmLamp,windows);
 const holo=new THREE.Group();holo.position.set(0,.6,-.3);bridge.add(holo);
 const hologramMaterial=new THREE.MeshBasicMaterial({color:0x72d9eb,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
 for(const radius of [.16,.34,.53])ring(holo,radius,.007,hologramMaterial,[0,0,0],[Math.PI/2,0,0]);
 mesh(holo,new THREE.SphereGeometry(.06,12,8),materials.light,[.15,.02,.24]);
 // Two independently detailed engines. Nozzles and actual plume geometry are visible.
 const plumes=[],halos=[],engineCores=[],engineLights=[];
 for(const side of [-1,1]){
  const pod=new THREE.Group();pod.position.set(side*1.7,-.03,.75);engines.add(pod);
  tube(pod,.39,.51,2.75,materials.silver,[0,0,0]);
  for(const z of [-1.15,-.72,.45,1.15])ring(pod,z>0?.49:.42,.055,materials.dark,[0,0,z]);
  for(let j=0;j<9;j++){const a=j*Math.PI*2/9;box(pod,.075,.075,1.8,materials.dark,[Math.cos(a)*.42,Math.sin(a)*.42,-.15]);}
  box(pod,.49,.16,1.8,materials.hull,[0,.42,-.1]);box(pod,.36,.08,.3,materials.orange,[0,.55,-.1]);
  tube(pod,.46,.35,.55,materials.dark,[0,0,1.55]);ring(pod,.46,.045,materials.silver,[0,0,1.82]);
  tube(pod,.29,.36,.25,materials.orange,[0,0,1.79]);
  const coreMaterial=new THREE.MeshBasicMaterial({color:0x162c3b,map:glowMap,transparent:true,depthWrite:false,toneMapped:false});engineCores.push(coreMaterial);mesh(pod,new THREE.CircleGeometry(.29,32),coreMaterial,[0,0,1.94]);
  for(let j=0;j<12;j++){const a=j*Math.PI/6;box(pod,.04,.04,.44,materials.silver,[Math.cos(a)*.36,Math.sin(a)*.36,1.57]);}
  const flameMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},power:{value:0}},vertexShader:'varying vec2 uvv;varying vec3 norm;varying vec3 view;void main(){uvv=uv;vec4 p=modelViewMatrix*vec4(position,1.);norm=normalize(normalMatrix*normal);view=-p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:`varying vec2 uvv;varying vec3 norm;varying vec3 view;uniform float time;uniform float power;
   void main(){float y=uvv.y;float flow=sin(y*49.-time*19.+sin(uvv.x*39.+time*3.)*1.8)*.5+.5;
    float tendrils=.7+.3*sin(uvv.x*71.+y*32.-time*3.5);float taper=pow(1.-y,1.1)*smoothstep(0.,.045,y);
    float edge=pow(abs(dot(normalize(norm),normalize(view))),1.5);float shocks=pow(max(0.,cos(y*34.-.5)),15.)*.22*(1.-y);
    vec3 color=mix(vec3(.08,.35,.85),vec3(.65,.92,1.2),exp(-y*7.));
    gl_FragColor=vec4(color,power*taper*edge*(.27+flow*.22+shocks)*tendrils);}`});
  const profile=[[.22,-.82],[.255,-.62],[.205,-.3],[.15,.12],[.085,.57],[.025,1.04],[.001,1.22]].map(([x,y])=>new THREE.Vector2(x,y));
  const plume=mesh(pod,new THREE.LatheGeometry(profile,32),flameMat,[0,0,2.77],[Math.PI/2,0,0]);plume.name='wa-plume-'+side;plumes.push(plume);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:0x81caff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(0,0,2);halo.scale.set(1.45,1.45,1);pod.add(halo);halos.push(halo);
  const spill=new THREE.PointLight(0x74beff,0,3.2,1);spill.name='wa-engine-light-'+side;spill.position.set(0,0,2.08);pod.add(spill);engineLights.push(spill);
  box(pod,.065,.75,.8,materials.hull,[side*.35,.58,.35],[0,0,side*-.3]);
 }
 // Hinged photovoltaic wings: the hinge moves, rather than swapping pictures.
 const wings=[];
 for(const side of [-1,1]){
  const hinge=new THREE.Group();hinge.name='wa-array-'+side;hinge.position.set(side*.84,.12,-.45);power.add(hinge);wings.push({hinge,side});
  tube(hinge,.075,.075,1.6,materials.silver,[side*.8,0,0],[0,0,Math.PI/2]);
  for(let j=0;j<2;j++){const x=side*(.8+j*1.08);box(hinge,1.02,.065,1.72,materials.dark,[x,0,0]);box(hinge,.95,.012,1.65,materials.solar,[x,.042,0]);for(const z of [-.85,.85])box(hinge,1.05,.025,.025,materials.silver,[x,.06,z]);box(hinge,.025,.025,1.72,materials.silver,[x,.06,0]);}
 }
 // Directional dish and a visible scanning wave.
 radar.position.set(.33,.39,.9);tube(radar,.065,.065,.75,materials.silver,[0,.34,0],[0,0,0]);
 const antenna=new THREE.Group();antenna.name='wa-antenna';antenna.position.set(0,.74,0);radar.add(antenna);
 mesh(antenna,new THREE.SphereGeometry(.46,28,12,0,Math.PI*2,0,.72),materials.hull,[0,0,0],[.55,0,.2]);
 ring(antenna,.303,.023,materials.silver,[0,.345,.2],[Math.PI/2+.55,0,0]);tube(antenna,.018,.018,.5,materials.dark,[0,.28,.15],[-.55,0,0]);
 const scan=new THREE.Mesh(new THREE.RingGeometry(.48,.495,64),new THREE.MeshBasicMaterial({color:0x83e5da,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));radar.add(scan);scan.rotation.x=-Math.PI/2;
 // Extending optical payload and split protective shutters.
 lab.position.set(-.76,.12,-1.15);
 tube(lab,.25,.25,1.03,materials.hull,[0,0,0]);ring(lab,.257,.025,materials.silver,[0,0,-.43]);
 const telescope=tube(lab,.19,.2,.6,materials.dark,[0,0,-.55]);telescope.name='wa-optics';
 const lens=mesh(lab,new THREE.CircleGeometry(.17,32),materials.glass,[0,0,-.86],[0,Math.PI,0]);
 const shutters=[];for(const side of [-1,1]){const o=box(lab,.26,.14,.65,materials.hull,[side*.14,.16,-.43]);shutters.push({o,side});}
 // Rear cargo hatch and a probe that leaves the bay, then returns.
 bay.position.set(0,-.04,2.8);
 box(bay,1,.08,.95,materials.dark,[0,-.32,0]);box(bay,1,.08,.95,materials.dark,[0,.32,0]);
 for(const side of [-1,1])box(bay,.07,.6,.95,materials.dark,[side*.47,0,0]);box(bay,.95,.6,.07,materials.dark,[0,0,-.44]);
 for(const side of [-1,1])box(bay,.025,.025,.7,warmLamp,[side*.39,.24,0]);
 const doors=[];for(const side of [-1,1]){const o=box(bay,.47,.65,.09,materials.hull,[side*.25,0,.48]);o.name='wa-bay-door-'+side;doors.push({o,side});box(o,.3,.04,.01,materials.orange,[0,0,.05]);}
 const probe=new THREE.Group();probe.name='wa-probe';bay.add(probe);box(probe,.34,.28,.4,materials.silver,[0,0,0]);mesh(probe,new THREE.SphereGeometry(.1,12,8),materials.glass,[0,0,.23]);
 const probeWings=[];for(const side of [-1,1]){const hinge=new THREE.Group();hinge.name='wa-probe-wing-'+side;hinge.position.set(side*.18,.03,0);probe.add(hinge);probeWings.push({hinge,side});box(hinge,.32,.025,.28,materials.solar,[side*.18,0,0]);tube(probe,.018,.018,.3,materials.silver,[side*.18,0,0],[0,0,Math.PI/2]);}
 const probeMast=box(probe,.02,.33,.02,materials.silver,[.1,.25,0]);probeMast.name='wa-probe-mast';
 // Low-density stars continue through the viewport; warp gives them real velocity.
 const detail=createShipDetail({vessel,modules,materials,mesh,box,tube,ring,shell,instances});
 createShipCupola({bridge,canopy,materials,mesh,box});
 createShipThermal({modules,materials,mesh,box,canvasTexture,random});
 const effects=createShipEffects({vessel,engines,materials});
 batchStaticHull(vessel);
 const lighting=createShipLighting({renderer,root,vessel,mainLight});fillLight.intensity=.32;
 const atmosphere=createShipAtmosphere({root,camera,glowMap});
 const flightDeck=createShipFlightDeck({root,camera,environment:lighting.environment});
 for(const m of Object.values(materials))if(m.isMeshStandardMaterial){m.envMap=lighting.environment;m.envMapIntensity=m===materials.glass?.12:.5;}
 for(const collection of surfaces.values())for(const [source,m] of collection){m.envMap=lighting.environment;m.envMapIntensity=source===materials.glass?.12:.5;}
 const streakPositions=[],starSeeds=[];for(let i=0;i<220;i++){const x=(random()-.5)*75,y=(random()-.5)*55,z=-55+random()*60;starSeeds.push({x,y,z});streakPositions.push(x,y,z,x,y,z-.04);}
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(streakPositions,3));
 const streaks=new THREE.LineSegments(starGeometry,new THREE.LineBasicMaterial({color:0x9cc6e2,transparent:true,opacity:.4,depthWrite:false}));root.add(streaks);
 function backdrop(index){if(!backgrounds.has(index)){const d=destinations[index];let o;if(['earth','moon','mars','jupiter','saturn'].includes(d.id)){o=makePlanet(planets.find(p=>p.id===d.id)||{id:'moon',color:'#aaaaaa',texture:'moon'});o.scale.setScalar(d.id==='saturn'?3.3:5.2);}else{const map=new THREE.TextureLoader().load(odysseyAsset(d.image),invalidate);map.colorSpace=THREE.SRGBColorSpace;textures.push(map);o=new THREE.Mesh(new THREE.PlaneGeometry(18,13),new THREE.MeshBasicMaterial({map,transparent:true,opacity:.4,depthWrite:false}));}o.position.set(-12,-2,-18);o.name='ship-destination-'+d.id;root.add(o);backgrounds.set(index,o);}return backgrounds.get(index);}
 backdrop(0);
 const aim=new THREE.Vector3(),cameraPosition=new THREE.Vector3(9,7,11.5),focus=new THREE.Vector3();
 const anchorPoints={bridge:new THREE.Vector3(0,.8,-2.25),engine:new THREE.Vector3(1.7,.3,2.2),radar:new THREE.Vector3(.33,1.5,.9),power:new THREE.Vector3(-2.6,.2,-.45),lab:new THREE.Vector3(-1,.15,-1.8),bay:new THREE.Vector3(0,-.1,3.35)};
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const guidance=createShipGuidance({step:detail=>document.dispatchEvent(new CustomEvent('space-ship-guided-step',{detail})),state:detail=>document.dispatchEvent(new CustomEvent('space-ship-guided-state',{detail}))});
 function hit(e){
  if(deck)return flightDeck.pick(e);
  const rect=document.querySelector('#universe').getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
  const first=ray.intersectObject(vessel,true).find(h=>{if(!h.object.isMesh)return false;for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});
  if(!first)return null;let p=first.object;while(p&&!p.userData.shipPart)p=p.parent;if(p)return p.userData.shipPart;
  // Hull armor belongs to the nearest compartment too: there are no dead panels.
  const local=vessel.worldToLocal(first.point.clone());
  return Object.keys(anchorPoints).reduce((a,b)=>local.distanceToSquared(anchorPoints[a])<local.distanceToSquared(anchorPoints[b])?a:b);
 }
 function command(e){const d=e.detail||{};
  if(d.action==='state'&&guidance.active&&!d.guided)guidance.stop();
  if(d.action==='guided'){setOrbit(false);if(d.active&&!deck&&!reduced.matches)guidance.start();else guidance.stop();}
  if(['reset','orbit','warp','angle'].includes(d.action))guidance.stop();
  if(d.action==='state'){selected=d.selected;inspection=!!d.inspection&&!!selected;const nextDeck=!!d.deck;if(deck!==nextDeck){yaw=pitch=shownYaw=shownPitch=0;}deck=nextDeck;if(selected||deck)setOrbit(false);lamps=d.lamps!==false;runningLights.visible=cabinWindows.visible=lamps;cabinLight.intensity=lamps?.7:0;Object.assign(active,d.active);lastMotion='';settling=true;}
  if(d.action==='reset'){setOrbit(false);yaw=pitch=0;zoom=1;selected=null;inspection=false;settling=true;}
  if(d.action==='orbit'){setOrbit(!!d.active&&!reduced.matches);settling=true;}
  if(d.action==='angle'){angle=['default','side','aft','top'].includes(d.value)?d.value:'default';settling=true;}
  if(d.action==='cancel-warp'){warp=null;settling=true;}
  if(d.action==='warp'&&!warp){setOrbit(false);warp={index:d.index,time:0};settling=true;}
  invalidate();
 }
 function stopFlight(){
  if(!flight.active)return;
  Object.assign(flight,createFlightState(),{cockpit:false});
  flightInput={...neutralInput};
  flightField.group.visible=false;
  camera.up.set(0,1,0);
  camera.far=normalCameraFar;camera.updateProjectionMatrix();
 }
 function flightCommand(e){
  const {action,cockpit,index,assist}=e.detail||{};
  if(action==='assist'&&flight.active)flight.assist=!!assist;
  if(action==='stop')stopFlight();
  if(action==='start'||(action==='reset'&&flight.active)){
   Object.assign(flight,createFlightState(),{active:true,cockpit:action==='reset'&&flight.cockpit,assist:!!assist});
   flightInput={...neutralInput};
   if(destinations[index])flightTarget=index;
   backdrop(flightTarget);
   flightField??=createFlightField(root);
   flightField.reset(flight,flightTarget);
   flightField.group.visible=true;
   flightMessage='按住 W 或「推进」，朝发光航标飞行。';
   lastFlightStatus=-Infinity;
   warp=null;setOrbit(false);guidance.stop();
  }
  if(action==='camera'&&flight.active)flight.cockpit=!!cockpit;
  invalidate();
 }
 function flightInputChange(e){if(flight.active){flightInput={...neutralInput,...e.detail};invalidate();}}
 document.addEventListener('space-ship-command',command);
 document.addEventListener('space-flight-command',flightCommand);document.addEventListener('space-flight-input',flightInputChange);
 function hide(){
  root.visible=visible=false;
  guidance.stop();setOrbit(false);stopFlight();lighting.hide();
  warp=null;drag=null;hovered=null;selected=null;
  document.querySelector('#universe').style.removeProperty('cursor');
  deck=inspection=false;angle='default';
  yaw=pitch=shownYaw=shownPitch=0;zoom=1;
  time=0;lastMotion='';anchors=[];
  focus.set(0,0,0);cameraPosition.set(0,0,10);
  for(const id of Object.keys(values))values[id]=0;
 }
 function setOrbit(value){if(orbit===value)return;orbit=value;document.dispatchEvent(new CustomEvent('space-ship-orbit',{detail:{active:orbit}}));}
 root.visible=false;
 function update({visible:show,moving,delta,scrollPixels,index,quality='auto'}){
  visible=show;root.visible=show;if(!show){lighting.hide();return false;}paused=!moving;lighting.update({quality,index,deck});
  if(index!==stationIndex){stationIndex=index;backdrop(index);}
  const dt=Math.min(delta,.05),snap=reduced.matches||!moving,f=snap?1:1-Math.exp(-dt*4);
  vessel.visible=!deck;
  if(moving)time+=dt;settling=false;
  guidance.update(dt,moving);
  if(reduced.matches&&orbit)setOrbit(false);if(orbit&&moving){yaw+=dt*.19;pitch=.045*Math.sin(time*.17);}
  for(const id of Object.keys(values)){values[id]=THREE.MathUtils.lerp(values[id],active[id]?1:0,f);if(Math.abs(values[id]-(active[id]?1:0))>.002)settling=true;}
  detail.update({time,values,moving});
  const mobile=innerWidth<760;
  const previousYaw=shownYaw,previousPitch=shownPitch,follow=snap?1:1-Math.exp(-dt*14);shownYaw=THREE.MathUtils.lerp(shownYaw,yaw,follow);shownPitch=THREE.MathUtils.lerp(shownPitch,pitch,follow);if(Math.abs(shownYaw-yaw)+Math.abs(shownPitch-pitch)>.001)settling=true;
  effects.update({time,moving,turnRate:(shownYaw-previousYaw)/Math.max(dt,.001),pitchRate:(shownPitch-previousPitch)/Math.max(dt,.001),quality});
  const scale=mobile?1:1.05;vessel.scale.setScalar(scale);vessel.rotation.set(.035*Math.sin(time*.13)+shownPitch,shownYaw+.12*Math.sin(time*.045),-.035);
  vessel.position.set(0,Math.sin(time*.22)*.035,0);
  canopy.rotation.x=values.bridge*.72;const projection=THREE.MathUtils.smoothstep(values.bridge,.28,1);holo.visible=projection>.02;holo.scale.setScalar(projection);holo.rotation.y=time*.13;
  runningLights.visible=cabinWindows.visible=lamps;cabinLight.intensity=lamps?.7:0;
  const enginePower=flight.active?values.engine*(flightInput.thrust&&!flightInput.brake&&!flightField.complete?(flightInput.boost?1:.72):.13):values.engine;
  for(const p of plumes){p.visible=enginePower>.015;p.scale.y=.2+enginePower*(.8+Math.sin(time*23)*.012);p.position.z=1.95+.82*p.scale.y;p.material.uniforms.time.value=time;p.material.uniforms.power.value=enginePower;}
  halos.forEach(h=>h.material.opacity=enginePower*.24);engineCores.forEach(m=>m.color.setRGB(.04+enginePower*.32,.09+enginePower*.92,.13+enginePower*1.45));engineLights.forEach(light=>light.intensity=enginePower*2.1);
  wings.forEach(({hinge,side})=>hinge.rotation.z=side*(1-values.power)*1.36);
  antenna.rotation.y=values.radar*time*.65;antenna.rotation.x=values.radar*.12;
  const sweep=(time*.4)%1;scan.visible=values.radar>.02;scan.position.set(0,.8+sweep*2.5,0);scan.scale.setScalar(.5+sweep*3.4);scan.material.opacity=values.radar*(1-sweep)*.3;
  const optics=THREE.MathUtils.smoothstep(values.lab,.25,1);telescope.position.z=-.55-optics*.5;lens.position.z=-.86-optics*.5;shutters.forEach(({o,side})=>{o.position.x=side*(.14+values.lab*.22);o.rotation.z=side*values.lab*.75;});
  const hatch=THREE.MathUtils.smoothstep(values.bay,0,.5),deployment=THREE.MathUtils.smoothstep(values.bay,.25,1);
  doors.forEach(({o,side})=>o.position.x=side*(.25+hatch*.43));probe.position.set(Math.sin(time*.5)*.1*deployment,THREE.MathUtils.smoothstep(deployment,.25,1)*1.1,.1+deployment*2.7);probe.rotation.y=deployment*time*.08;
  const probeUnfold=THREE.MathUtils.smoothstep(deployment,.35,.8);probeWings.forEach(({hinge,side})=>hinge.rotation.y=side*(1-probeUnfold)*Math.PI/2);probeMast.scale.y=.1+probeUnfold*.9;probeMast.position.y=.14+.165*probeMast.scale.y;
  if(selected){const value=values[selected],moving=Math.abs(value-(active[selected]?1:0))>.015,key=[selected,Math.round(value*40),active[selected],moving].join(':');if(key!==lastMotion){lastMotion=key;document.dispatchEvent(new CustomEvent('space-ship-mechanism',{detail:{id:selected,value,active:active[selected],moving}}));}}else lastMotion='';
  for(const [id,collection]of surfaces)for(const m of collection.values()){const intensity=id===hovered?.18:id===selected?.105:0;m.emissive.copy(m.userData.originalEmissive);m.emissiveIntensity=m.userData.originalIntensity;if(intensity){m.emissive.add(new THREE.Color(0x5a99b2).multiplyScalar(intensity));m.emissiveIntensity=Math.max(1,m.emissiveIntensity);}}
  if(flight.active){
   if(moving&&!flightField.complete){
    const input=flight.assist?assistFlightInput(flight,flightInput,flightField.next):flightInput;
    stepFlight(flight,input,dt);
    const result=flightField.update(flight,time);
    if(result==='gate')flightMessage=flightField.complete?'航道已通过，可以前往目的地。':'本段通过，请对准下一道航标。';
    if(result==='miss')flightMessage='已回到上一检查点，保留已通过的航标。';
    if(result==='impact')flightMessage='擦碰碎石，推进速度已降低。';
    if(flightField.complete){
     Object.assign(flight.velocity,{x:0,y:0,z:0});flight.speed=0;
    }
   }
   vessel.position.copy(flight.position);
   vessel.rotation.set(flight.pitch,flight.yaw,flight.roll,'YXZ');
   vessel.visible=!flight.cockpit;root.position.set(0,0,0);
   camera.up.set(0,1,0);
   camera.fov=mobile?73:60;camera.far=510;
   const chaseOffset=flight.cockpit?0:.11;
   camera.position.set(flight.position.x-flight.velocity.x*chaseOffset,
    flight.position.y+(flight.cockpit?.25:3.3)-flight.velocity.y*chaseOffset,
    flight.position.z+(flight.cockpit?0:10.5));
   aim.set(flight.position.x,flight.position.y+(flight.cockpit?.25:2),flight.position.z-24);
   camera.lookAt(aim);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   for(const [i,object] of backgrounds){
    object.visible=i===flightTarget;
    if(!object.visible)continue;
    const composition=flightField.composition;
    if(composition){
     const [x,y,radius,tilt]=composition;
     object.position.set(x*(mobile?.43:1),y,-194);
     object.scale.setScalar(radius*(mobile?.86:1));object.rotation.set(0,0,tilt);
     if(moving)object.userData.surface.rotation.y+=dt*.035;
    }else{
     object.position.set(0,0,-234);object.rotation.set(0,0,0);
     const height=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*260;
     object.scale.setScalar(Math.max(height/13,height*camera.aspect/18)*1.08);
     object.material.opacity=.81;
    }
   }
   atmosphere.update({time,quality,moving});
   flightDeck.update({active:flight.cockpit,lamps,quaternion:camera.quaternion,values,selected,hovered,index:flightTarget});
   root.updateMatrixWorld(true);
   if(time-lastFlightStatus>.09||lastFlightStatus===-Infinity){
    lastFlightStatus=time;
    const next=flightField.next;
    const offset=next?{x:next.x-flight.position.x,y:next.y-flight.position.y}:null;
    document.dispatchEvent(new CustomEvent('space-flight-status',{detail:{
     index:flightTarget,speed:flight.speed,gate:flightField.gate,total:flightField.total,
     complete:flightField.complete,collisions:flightField.collisions,misses:flightField.misses,
     distance:next?Math.max(0,Math.ceil(flight.position.z-next.z)):0,offset,message:flightMessage,
    }}));
   }
   settling=false;return moving;
  }
  const targetFocus=!deck&&selected?anchorPoints[selected].clone().applyEuler(vessel.rotation).multiplyScalar(inspection?scale:.3):new THREE.Vector3();targetFocus.x-=inspection||mobile||deck?0:.55;targetFocus.y+=inspection||deck?0:mobile?.3:.1;
  const hero=document.querySelector('#od-hero'),heroRect=hero.getBoundingClientRect(),viewport=hero.querySelector('.ship-scene-viewport').getBoundingClientRect();
  const canvasRect=document.querySelector('#universe').getBoundingClientRect();
  focus.lerp(targetFocus,f);
  const surge=warp?Math.sin(Math.min(warp.time/3,1)*Math.PI):0,fov=(deck?64:mobile?44:40)+surge*5,tangent=2*Math.tan(THREE.MathUtils.degToRad(fov/2));
  const fitDistance=Math.max(12,5.8/tangent*canvasRect.height/Math.max(viewport.height,120),7.2/tangent*canvasRect.height/Math.max(viewport.width,180));
  const directions={default:[.63,.47,.8],side:[1,.16,.12],aft:[.1,.22,1],top:[.1,1,.05]},distance=fitDistance*zoom*(inspection?.64:1),desired=new THREE.Vector3(...directions[inspection?angle:'default']).normalize().multiplyScalar(distance).add(focus);cameraPosition.lerp(desired,f);
  if(cameraPosition.distanceTo(desired)>.01||focus.distanceTo(targetFocus)>.01)settling=true;
  camera.up.set(0,1,0);camera.position.copy(cameraPosition);camera.fov=fov;camera.updateProjectionMatrix();aim.copy(focus);camera.lookAt(aim);camera.updateMatrixWorld(true);
  // Place the vessel in its layout box using camera axes, including document scroll.
  // A world-Y scroll offset is incorrect with this oblique camera.
  const worldPerPixel=tangent*cameraPosition.distanceTo(focus)/canvasRect.height;
  const offsetX=viewport.left+viewport.width/2-canvasRect.left-canvasRect.width/2;
  const offsetY=canvasRect.top+canvasRect.height/2-viewport.top-viewport.height/2;
  root.position.set(offsetX*worldPerPixel,offsetY*worldPerPixel,0).applyQuaternion(camera.quaternion);
  atmosphere.update({time,quality,moving});
  for(const [i,o]of backgrounds){
   o.visible=i===stationIndex;if(!o.visible)continue;
   const planet=!!o.userData.surface;
   const composition=shipOrbits[i]||shipOrbits[0];
   o.position.set(planet?composition.x*(mobile?.45:1):0,planet?composition.y*(mobile?.75:1):0,planet?-64:-66).applyQuaternion(camera.quaternion).add(camera.position).sub(root.position);
   if(planet){o.scale.setScalar(composition.scale*(mobile?.83:1));o.rotation.z=composition.tilt;if(moving)o.userData.surface.rotation.y+=dt*.004;}
   else{o.quaternion.copy(camera.quaternion);const h=tangent*66;o.scale.setScalar(Math.max(h/13,h*camera.aspect/18)*1.16);o.material.opacity=deck?.85:.7;}
  }
  flightDeck.update({active:deck,lamps,quaternion:camera.quaternion,values,selected,hovered,index});
  if(deck){camera.rotateY(shownYaw*.65);camera.rotateX(shownPitch*.6);camera.updateMatrixWorld(true);}
  if(warp){warp.time+=reduced.matches?4:(moving?dt:0);const p=Math.min(warp.time/3,1),boost=Math.sin(p*Math.PI);vessel.position.z-=boost*1.8;vessel.rotation.z-=boost*.045;const positions=starGeometry.attributes.position;for(let i=0;i<starSeeds.length;i++){const s=starSeeds[i],z=((s.z+warp.time*50)%65+65)%65-45;positions.setXYZ(i*2,s.x,s.y,z);positions.setXYZ(i*2+1,s.x,s.y,z-1-boost*13);}positions.needsUpdate=true;streaks.material.opacity=.35+boost*.65;const step=Math.floor(p*80);if(warp.step!==step){warp.step=step;document.dispatchEvent(new CustomEvent('space-ship-transit',{detail:{progress:p.toFixed(3),surge:boost.toFixed(3),phase:p<.22?'推进充能':p<.79?'跃迁航道':'目的地接近'}}));}if(p>=1){const next=warp.index;warp=null;document.dispatchEvent(new CustomEvent('space-ship-arrival',{detail:{index:next}}));}settling=true;
  }else{const positions=starGeometry.attributes.position;for(let i=0;i<starSeeds.length;i++){const s=starSeeds[i];positions.setXYZ(i*2,s.x,s.y,s.z);positions.setXYZ(i*2+1,s.x,s.y,s.z-.035);}positions.needsUpdate=true;streaks.material.opacity=.4;}
  root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  if(!anchors.length||!anchors[0].isConnected)anchors=[...document.querySelectorAll('[data-ship-anchor]')];
  const taken=[],compact=innerHeight<700&&innerWidth>=760,offsets={bridge:[40,-48],engine:[35,28],radar:[58,-62],power:[-90,-38],lab:[-105,8],bay:[-90,32]};
  for(const e of anchors){
   const id=e.dataset.shipAnchor,point=anchorPoints[id].clone();vessel.localToWorld(point);point.project(camera);
   const px=canvasRect.left+(point.x*.5+.5)*canvasRect.width-heroRect.left,py=canvasRect.top+(-point.y*.5+.5)*canvasRect.height-heroRect.top;
   const factor=mobile?.45:compact?.45:1,offset=offsets[id];let x=px+offset[0]*factor,y=py+offset[1]*factor;
   const width=mobile?81:compact?82:107;x=THREE.MathUtils.clamp(x,Math.max(12,viewport.left-heroRect.left-15),Math.min(heroRect.width-width-12,viewport.right-heroRect.left-width+35));
   for(const other of taken)if(Math.abs(x-other.x)<width&&Math.abs(y-other.y)<27)y=other.y+28;taken.push({x,y});
   const show=(!inspection||id===selected)&&point.z<1&&x>8&&y>80&&y<heroRect.height-70;
   e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;e.style.visibility=show?'visible':'hidden';
   const line=hero.querySelector(`[data-ship-leader="${id}"]`),pin=hero.querySelector(`[data-ship-pin="${id}"]`),endX=x+(offset[0]<0?width-8:7),endY=y+13;
   if(line){line.setAttribute('d',`M${px.toFixed(1)} ${py.toFixed(1)} L${((px+endX)/2).toFixed(1)} ${endY.toFixed(1)} L${endX.toFixed(1)} ${endY.toFixed(1)}`);line.style.visibility=show?'visible':'hidden';line.dataset.selected=String(id===selected);}
   if(pin){pin.setAttribute('cx',px.toFixed(1));pin.setAttribute('cy',py.toFixed(1));pin.style.visibility=show?'visible':'hidden';pin.dataset.selected=String(id===selected);}
  }
  return (moving||settling)&&!document.hidden;
 }
 return {update,pointer(type,e){if(!visible||flight.active||warp)return;if(type==='leave'){if(hovered){hovered=null;document.dispatchEvent(new CustomEvent('space-ship-hover',{detail:{id:null}}));invalidate();}return;}if(type==='down'){guidance.stop();setOrbit(false);drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};return;}
  if(type==='move'){if(drag){const threshold=e.pointerType==='touch'?12:7;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>threshold)drag.moved=true;if(drag.moved){yaw=deck?THREE.MathUtils.clamp(yaw+(e.clientX-drag.lastX)*.005,-.75,.75):yaw+(e.clientX-drag.lastX)*.008;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.lastY)*.005,-.55,.6);settling=true;invalidate();}drag.lastX=e.clientX;drag.lastY=e.clientY;}else{const id=hit(e);if(id!==hovered){hovered=id;document.querySelector('#universe').style.cursor=id?'pointer':'grab';document.dispatchEvent(new CustomEvent('space-ship-hover',{detail:{id}}));invalidate();}}return;}
  if(type==='up'){if(drag&&!drag.moved){const id=hit(e);document.dispatchEvent(new CustomEvent(id?'space-ship-pick':'space-ship-miss',{detail:{id}}));}drag=null;return;}if(type==='cancel')drag=null;
 },zoom(amount){zoom=THREE.MathUtils.clamp(zoom+amount*.07,.62,1.5);settling=true;invalidate();},hide,dispose(){lighting.dispose();root.removeFromParent();document.removeEventListener('space-ship-command',command);document.removeEventListener('space-flight-command',flightCommand);document.removeEventListener('space-flight-input',flightInputChange);const geos=new Set(boxGeometries.values()),mats=new Set(Object.values(materials));root.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [].concat(o.material||[]))mats.add(m);});geos.forEach(g=>g.dispose());mats.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)textures.push(v);m.dispose();});new Set(textures).forEach(t=>t.dispose());}};
}
