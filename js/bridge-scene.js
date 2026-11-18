import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';

// Original expedition ship/deck, plus NASA's ISS model; see assets/models/SOURCES.md.
export function createBridgeScene({scene,camera,invalidate}){
 const world=new THREE.Group();world.name='expedition-flight';scene.add(world);
 const deck=new THREE.Group();deck.name='observation-deck';camera.add(deck);scene.add(camera);
 const textures=[];let seed=9347,clock=0,station=null,disposed=false,stationRequested=false;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 function texture(size,draw){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
 const panels=texture(512,(c,s)=>{c.fillStyle='#a6adac';c.fillRect(0,0,s,s);for(let i=0;i<13000;i++){const v=100+random()*85;c.fillStyle=`rgba(${v},${v},${v},.12)`;c.fillRect(random()*s,random()*s,random()*4,1);}for(let x=0;x<4;x++)for(let y=0;y<6;y++){c.fillStyle=['#8d979b','#adb4b0','#9aa3a4'][(x+y)%3];c.fillRect(x*128+3,y*85+3,122,79);c.strokeStyle='#52616a';c.lineWidth=2;c.strokeRect(x*128+3,y*85+3,122,79);for(const dx of [9,116]){c.fillStyle='#40505a';c.fillRect(x*128+dx,y*85+10,3,3);c.fillRect(x*128+dx,y*85+72,3,3);}}});
 const glow=texture(128,(c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(235,254,255,1)');g.addColorStop(.07,'rgba(255,255,255,.95)');g.addColorStop(.2,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(30,100,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);});
 const envFaces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=i===2?'#9ba5ae':i===3?'#10141c':'#28303b';g.fillRect(0,0,64,64);if(i!==3){g.fillStyle=i===2?'#e1e8ed':'#7b8b97';g.fillRect(5,8,54,7);g.fillStyle='#bdc4bf';g.fillRect(48,20,8,35);}return c;});
 const environment=new THREE.CubeTexture(envFaces);environment.colorSpace=THREE.SRGBColorSpace;environment.needsUpdate=true;textures.push(environment);
 const metal=new THREE.MeshStandardMaterial({color:0xa6b1b6,map:panels,metalness:.58,roughness:.62,bumpMap:panels,bumpScale:.012});
 const ivory=new THREE.MeshStandardMaterial({color:0xd4d9d1,map:panels,metalness:.35,roughness:.55});
 const graphite=new THREE.MeshStandardMaterial({color:0x18212d,metalness:.75,roughness:.53});
 const rim=new THREE.MeshStandardMaterial({color:0x3b4b5b,metalness:.7,roughness:.4});
 const orange=new THREE.MeshStandardMaterial({color:0xc87937,metalness:.4,roughness:.7});
 const glass=new THREE.MeshStandardMaterial({color:0x162936,metalness:.6,roughness:.19,emissive:0x0c3242,emissiveIntensity:.6});
 const light=new THREE.MeshBasicMaterial({color:new THREE.Color(.35,1.55,2.5),toneMapped:false});
 const warmLight=new THREE.MeshBasicMaterial({color:new THREE.Color(2.5,.65,.15),toneMapped:false});
 for(const material of [metal,ivory,graphite,rim,orange,glass]){material.envMap=environment;material.envMapIntensity=.65;}
 const ship=new THREE.Group();ship.name='wayfarer';world.add(ship);
 function mesh(parent,geometry,material,pos,rotation){const m=new THREE.Mesh(geometry,material);if(pos)m.position.set(...pos);if(rotation)m.rotation.set(...rotation);parent.add(m);return m;}
 const boxes=new Map();
 function box(parent,w,h,d,mat,pos,rotation){const key=[w,h,d].join('/');if(!boxes.has(key)){const geo=new THREE.BoxGeometry(w,h,d,3,3,3),p=geo.attributes.position,r=Math.min(w,h,d)*.16,point=new THREE.Vector3(),inside=new THREE.Vector3();for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i);inside.set(THREE.MathUtils.clamp(point.x,-w/2+r,w/2-r),THREE.MathUtils.clamp(point.y,-h/2+r,h/2-r),THREE.MathUtils.clamp(point.z,-d/2+r,d/2-r));point.sub(inside).normalize().multiplyScalar(r).add(inside);p.setXYZ(i,point.x,point.y,point.z);}geo.computeVertexNormals();boxes.set(key,geo);}return mesh(parent,boxes.get(key),mat,pos,rotation);}
 function hull(parent,points,depth,mat,pos){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1,steps:1});geo.rotateX(Math.PI/2);return mesh(parent,geo,mat,pos);}
 hull(ship,[[-.55,-2.5],[.55,-2.5],[.85,-.7],[.68,1.6],[-.68,1.6],[-.85,-.7]],.6,metal,[0,.12,0]);
 hull(ship,[[-.32,-2.9],[.32,-2.9],[.52,-1.1],[-.52,-1.1]],.27,ivory,[0,.3,0]);
 box(ship,.84,.42,.95,graphite,[0,.44,-1.15]);box(ship,.74,.035,.64,glass,[0,.67,-1.3],[.08,0,0]);
 box(ship,.45,.05,.32,glass,[0,.65,-1.85],[.3,0,0]);
 box(ship,1.3,.22,1.6,ivory,[0,.27,.45]);box(ship,.72,.12,1.2,graphite,[0,.43,.6]);
 for(const side of [-1,1]){
  const pod=new THREE.Group();pod.position.set(side*1.45,-.02,.35);ship.add(pod);
  box(ship,.95,.17,.57,graphite,[side*.95,-.07,.15]);
  hull(ship,[[0,-.6],[side*1.25,-.15],[side*1.45,1.35],[0,.9]],.13,ivory,[side*.65,.16,0]);
  mesh(pod,new THREE.CylinderGeometry(.31,.4,2.7,24),metal,[0,0,.05],[Math.PI/2,0,0]);
  for(const z of [-1.05,-.4,.4,1.1])mesh(pod,new THREE.TorusGeometry(.35,.04,5,12),graphite,[0,0,z]);
  box(pod,.42,.16,1.35,ivory,[0,.32,-.08]);box(pod,.35,.09,.3,orange,[0,.43,.02]);
  mesh(pod,new THREE.CylinderGeometry(.28,.37,.38,12),graphite,[0,0,1.52],[Math.PI/2,0,0]);
  mesh(pod,new THREE.CircleGeometry(.235,24),light,[0,0,1.72]);
  mesh(pod,new THREE.TorusGeometry(.253,.032,5,24),rim,[0,0,1.74]);
  for(let i=0;i<6;i++)box(pod,.04,.04,.47,graphite,[Math.cos(i*Math.PI/3)*.3,Math.sin(i*Math.PI/3)*.3,1.55]);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0x8cdbff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.5}));halo.position.set(0,0,1.8);halo.scale.set(1.8,1.8,1);pod.add(halo);
  for(let i=0;i<7;i++)box(ship,.08,.07,.7,graphite,[side*.76,-.14,-1.1+i*.34]);
  for(let i=0;i<5;i++)box(ship,.035,.018,.27,light,[side*(1.23+i*.09),.43,-.32]);
  box(ship,.14,.06,.52,orange,[side*.51,.4,-.48]);
  const fin=box(ship,.07,.6,.9,graphite,[side*1.45,.52,.75],[0,0,side*-.3]);
  box(ship,.08,.035,.33,light,[side*1.54,.84,.75],[0,0,side*-.3]);
  box(ship,.08,.03,.11,side===1?warmLight:light,[side*2.01,.12,1.15]);
 }
 const dish=mesh(ship,new THREE.SphereGeometry(.22,18,8,0,Math.PI*2,0,.8),ivory,[.38,.55,.95],[.3,0,-.3]);
 box(ship,.035,.45,.035,rim,[.38,.61,.95]);box(ship,.025,.75,.025,graphite,[-.35,.7,.92]);
 for(let i=0;i<9;i++)box(ship,.52,.025,.03,graphite,[0,.57,.08+i*.14]);
 const label=texture(256,(c,s)=>{c.fillStyle='#c2cecb';c.fillRect(0,0,s,s);c.fillStyle='#233444';c.font='bold 31px monospace';c.fillText('WAYFARER',17,100);c.font='19px monospace';c.fillText('EXPEDITION / 01',20,139);c.fillStyle='#b8783c';c.fillRect(20,162,214,10);});
 mesh(ship,new THREE.PlaneGeometry(.66,.66),new THREE.MeshStandardMaterial({map:label,metalness:.25,roughness:.6}),[0,.403,.36],[-Math.PI/2,0,0]);
 const escort=ship.clone();escort.name='escort';world.add(escort);
 function loadStation(){
 if(stationRequested||disposed)return;stationRequested=true;document.body.dataset.bridgeModel='loading';
 const modelLoader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 modelLoader.load(new URL('../assets/models/iss-web.glb',import.meta.url).href,gltf=>{
  const model=gltf.scene;const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  model.position.sub(center);station=new THREE.Group();station.name='nasa-iss';station.add(model);station.scale.setScalar(1.4/Math.max(size.x,size.y,size.z));station.visible=false;
  model.traverse(o=>{for(const m of [].concat(o.material||[])){m.envMap=environment;m.envMapIntensity=.3;}});
  if(disposed){const abandonedTextures=new Set();model.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){for(const value of Object.values(m))if(value?.isTexture&&value!==environment)abandonedTextures.add(value);m.dispose();}});abandonedTextures.forEach(t=>t.dispose());return;}
  world.add(station);document.body.dataset.bridgeModel='loaded';invalidate();
 },undefined,()=>{if(!disposed){document.body.dataset.bridgeModel='fallback';invalidate();}});
 }
 const hazeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}void main(){vec2 p=vUv*12.;float f=noise(p)*.5+noise(p*2.1)*.25+noise(p*4.3)*.125+noise(p*8.7)*.0625;float band=exp(-pow((vUv.y-.24-vUv.x*.4+(f-.5)*.15)*8.,2.));vec3 color=mix(vec3(.009,.014,.023),vec3(.017,.015,.012),smoothstep(.2,.8,f))*band*f;gl_FragColor=vec4(color,1.);}`});
 const haze=mesh(world,new THREE.PlaneGeometry(135,95),hazeMat,[0,0,-52]);haze.renderOrder=-3;
 const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffd5a0,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));sun.position.set(-2.5,4.8,-12);sun.scale.set(5,5,1);world.add(sun);
 // Geometry at the camera gives the observation window an actual foreground.
 const frameMat=new THREE.MeshStandardMaterial({color:0x0d141e,metalness:.55,roughness:.52});
 function frame(points){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSize:.003,bevelThickness:.004,bevelSegments:1});mesh(deck,geometry,frameMat,[0,0,0]);}
 for(const side of [-1,1]){
  frame([[side*.52,.55],[side*.41,.55],[side*.335,.30],[side*.37,.28],[side*.49,.48]]);
  frame([[side*.52,-.54],[side*.52,-.18],[side*.445,-.28],[side*.36,-.50]]);
  box(deck,.004,.27,.008,rim,[side*.47,-.36,.023],[0,0,side*.48]);
  box(deck,.0016,.2,.004,light,[side*.469,-.35,.03],[0,0,side*.48]);
  box(deck,.003,.09,.004,orange,[side*.435,.415,.028],[0,0,-side*.28]);
 }
 frame([[-.5,-.54],[-.35,-.48],[.35,-.48],[.5,-.54]]);
 const tint=mesh(deck,new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x365477,transparent:true,opacity:.018,depthWrite:false,blending:THREE.AdditiveBlending}),[0,0,-.006]);
 world.visible=deck.visible=false;
 return {update({visible,moving,delta,index,scrollPixels,bridge,quality}){
  world.visible=visible;deck.visible=visible&&bridge&&innerWidth>=760;if(!visible)return;
  if(moving)clock+=Math.min(delta,.05);const t=clock,portrait=innerWidth<760;
  if(index===0&&!portrait&&quality!=='low'&&bridge)loadStation();
  const h=2*Math.tan(THREE.MathUtils.degToRad(20))*10,scrollOffset=scrollPixels/(innerHeight/h);
  const showStation=!!station&&index===0&&!portrait&&quality!=='low'&&bridge;
  world.position.y=scrollOffset;ship.visible=bridge&&!showStation;escort.visible=bridge&&!portrait&&quality!=='low';sun.visible=index!==5&&index!==7;
  // Keep the entire station in front of the globe, including its rear solar arrays.
  if(station){station.visible=showStation;station.position.set(.65+Math.sin(t*.035)*.12,-.1+Math.sin(t*.055)*.04,5.4);station.rotation.set(.52,-.38+Math.sin(t*.03)*.04,.66);}
  const nextModel=showStation?'iss':'wayfarer';if(document.body.dataset.bridgeObject!==nextModel)document.body.dataset.bridgeObject=nextModel;
  ship.position.set(portrait?-.42:.1+Math.sin(t*.055)*.4,portrait?-1.1:-.55+Math.sin(t*.08)*.07,portrait?3:5.4+Math.sin(t*.06)*.15);ship.scale.setScalar(portrait?.16:.22);ship.rotation.set(.18+Math.sin(t*.05)*.025,-.48+Math.sin(t*.045)*.09,-.11+Math.sin(t*.065)*.025);
  escort.position.set(-2.6+Math.sin(t*.035)*.3,1.15,-5);escort.scale.setScalar(.075);escort.rotation.set(.1,-.3,-.05);
  const d=1.15,screenH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*d;
  deck.position.set(0,scrollPixels*screenH/innerHeight,-d);deck.scale.set(screenH*camera.aspect,screenH,1);
  if(bridge){camera.position.x+=Math.sin(t*.085)*.09;camera.position.y+=Math.sin(t*.062)*.045;camera.lookAt(Math.sin(t*.035)*.06,.02,0);}
 },get clock(){return clock;},dispose(){disposed=true;world.removeFromParent();deck.removeFromParent();const geos=new Set(),mats=new Set();for(const g of [world,deck])g.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [].concat(o.material||[]))mats.add(m);});geos.forEach(g=>g.dispose());mats.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture&&value!==environment)textures.push(value);m.dispose();});new Set(textures).forEach(t=>t.dispose());}};
}
