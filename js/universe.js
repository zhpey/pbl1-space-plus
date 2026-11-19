import {createEarthAtmosphere, addSaturnRings} from './planet-optics.js';
import * as THREE from 'three';
import {createPortalScene} from './portal-scene.js';
import {createVoyageScene} from './scene-motion.js';
import {createOdysseyScene} from './odyssey-scene.js';
import {createFilmPost} from './film-post.js';
import {worlds} from './worlds.js';
import {planets,chapters} from './data.js';
import {assetRoot} from './assets.js';

function createStaticStarfield(){
 const sky=document.createElement('div');sky.setAttribute('aria-hidden','true');
 Object.assign(sky.style,{position:'absolute',inset:'0',pointerEvents:'none',backgroundColor:'#030716'});
 const image=document.createElement('canvas');image.width=1400;image.height=1000;
 const ctx=image.getContext('2d');if(!ctx)return sky;
 ctx.fillStyle='#030716';ctx.fillRect(0,0,image.width,image.height);
 for(const [x,y,r,color] of [[950,400,720,'rgba(70,30,135,.45)'],[580,460,600,'rgba(30,66,140,.38)'],[1150,750,550,'rgba(54,21,110,.27)']]){
  const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,color);glow.addColorStop(1,'rgba(3,7,22,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,image.width,image.height);
 }
 let seed=19371;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<2500;i++){const x=random()*1400,y=random()*1000,r=random()>.985?1.1:.25+random()*.55;ctx.fillStyle=`rgba(190,210,255,${.18+random()*.56})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 sky.style.backgroundImage=`url('${image.toDataURL()}')`;sky.style.backgroundSize='cover';sky.style.backgroundPosition='center';return sky;
}

// Separate scene module: both the native and Vue apps call this same renderer.
export function createUniverse(canvas,callbacks={}){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){
  document.body.dataset.portalRenderer='fallback';document.body.dataset.spaceBackdrop='static';canvas.hidden=true;const stage=document.querySelector('#stage'),sky=createStaticStarfield();stage.prepend(sky);const fallback=document.createElement('div');fallback.className='fallback';stage.append(fallback);const note=document.createElement('p');note.className='fallback-note';note.textContent='当前浏览器未启用 WebGL，已切换为静态行星展示。';document.body.append(note);
  let fallbackRoute='universe';
  function syncFallback(){const section=document.querySelector(fallbackRoute==='universe'?'.universe-map':'.page');const visible=!section||section.getBoundingClientRect().bottom>0;document.body.dataset.spaceForeground=visible?'visible':'hidden';fallback.hidden=!visible||['universe','atlas','observatory'].includes(fallbackRoute);fallback.style.transform=`translateY(${-scrollY}px)`;}
  function unavailableCinema(){document.dispatchEvent(new CustomEvent('space-cinema-update',{detail:{active:false,progress:0,phase:0,reason:'webgl-unavailable'}}));return false;}
  function fallbackCinemaCommand(event){if(event.detail?.action==='play')unavailableCinema();}
  addEventListener('scroll',syncFallback,{passive:true});document.addEventListener('space-cinema-command',fallbackCinemaCommand);
  return {setView(s){fallbackRoute=s.route;const id=s.route==='story'?chapters[s.chapter].planet:s.planet;const p=planets.find(x=>x.id===id)||planets[2];fallback.style.backgroundImage=`url('${assetRoot}textures/${p.texture}.jpg')`;syncFallback();},enterWorld(id){const world=worlds.find(w=>w.id===id);if(world)callbacks.onWorld?.(world.route);},zoom(){},reset(){},playCinematic:unavailableCinema,cancelCinematic(){return false;},dispose(){document.removeEventListener('space-cinema-command',fallbackCinemaCommand);removeEventListener('scroll',syncFallback);fallback.remove();sky.remove();note.remove();delete document.body.dataset.portalRenderer;delete document.body.dataset.spaceBackdrop;delete document.body.dataset.spaceForeground;}};
 }
 document.body.dataset.portalRenderer='webgl';renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.4:1.7));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x080c10);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,200);camera.position.set(0,0,10);
 const mainLight=new THREE.DirectionalLight(0xffe9d5,3.2);mainLight.position.set(-5,3,3);scene.add(mainLight,new THREE.AmbientLight(0x668398,.15));
 const rimLight=new THREE.DirectionalLight(0x6dbdff,.4);rimLight.position.set(4,0,-4);scene.add(rimLight);
 const textures=new Map(),failedTextures=new Set();let loadingAssets=false;
 const assetStatus=document.createElement('div');assetStatus.className='scene-status';assetStatus.setAttribute('role','status');assetStatus.hidden=true;document.body.append(assetStatus);
 const assetMessage=document.createElement('span'),retryButton=document.createElement('button');retryButton.type='button';retryButton.textContent='重新加载';assetStatus.append(assetMessage,retryButton);
 function updateAssetStatus(){assetStatus.hidden=['atlas','observatory'].includes(document.body.dataset.route)||(!loadingAssets&&!failedTextures.size);assetMessage.textContent=loadingAssets?'正在加载三维素材…':failedTextures.size?'部分三维素材未加载，已显示简化效果。':'';retryButton.hidden=loadingAssets||!failedTextures.size;}
 const manager=new THREE.LoadingManager();manager.onStart=()=>{loadingAssets=true;updateAssetStatus();};manager.onLoad=()=>{loadingAssets=false;updateAssetStatus();invalidate();};
 manager.onError=url=>{failedTextures.add(url);for(const [name,t] of textures){if(url===textureUrl(name)){const image=document.createElement('canvas');image.width=image.height=32;const context=image.getContext('2d');context.fillStyle='#71828e';context.fillRect(0,0,32,32);t.image=image;t.needsUpdate=true;}}updateAssetStatus();invalidate();};
 const loader=new THREE.TextureLoader(manager);const geometry=new THREE.SphereGeometry(1,96,64);
 function retryTextures(){for(const url of [...failedTextures]){const target=[...textures].find(([name])=>url===textureUrl(name))?.[1];loader.load(url,loaded=>{if(disposed){loaded.dispose();return;}if(target){target.image=loaded.image;target.needsUpdate=true;}loaded.dispose();failedTextures.delete(url);updateAssetStatus();invalidate();},undefined,()=>{});}}
 retryButton.addEventListener('click',retryTextures);
 function texture(name){if(!textures.has(name)){const t=loader.load(textureUrl(name),()=>invalidate(),undefined,()=>{});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);textures.set(name,t);}return textures.get(name);}
 function textureUrl(name){const upgrade={'cinematic/earth-day':'earth-day','cinematic/earth-night':'earth-night','jupiter':'jupiter-map','mars':'mars-map','moon':'moon-map','saturn':'saturn-map'}[name];return upgrade?assetRoot+'odyssey/'+upgrade+'.jpg':name.startsWith('cinematic/')?assetRoot+name+'.jpg':assetRoot+'textures/'+name+'.jpg';}
 const models=new Map();const hero=new THREE.Group();scene.add(hero);
 const atmosphereMaterial=new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,uniforms:{uColor:{value:new THREE.Color('#4d9ace')},uSun:{value:mainLight.position.clone().normalize()}},vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vW;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vW=normalize(mat3(modelMatrix)*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vN;varying vec3 vV;varying vec3 vW;uniform vec3 uColor;uniform vec3 uSun;void main(){float rim=pow(max(0.,1.-abs(dot(vN,vV))),3.5);float sun=max(0.,dot(normalize(vW),normalize(uSun)));vec3 tint=mix(uColor,vec3(.58,.78,1.),sun*.35);gl_FragColor=vec4(tint,rim*(.035+pow(sun,.7)*.52));}`});
 function makePlanet(p){
  const g=new THREE.Group();const material=new THREE.MeshPhongMaterial({map:texture(p.id==='earth'?'cinematic/earth-day':p.texture),shininess:p.id==='earth'?22:3,specular:new THREE.Color(p.id==='earth'?0x263949:0x080808)});
  if(p.id==='earth'){material.bumpMap=texture('earth_bump');material.bumpMap.colorSpace=THREE.NoColorSpace;material.bumpScale=.015;}
  const surface=new THREE.Mesh(geometry,material);surface.rotation.y=p.id==='earth'?4.1:1.8;g.add(surface);g.userData={id:p.id,surface};
  if(p.id==='earth'){
   const sunView={value:new THREE.Vector3()},cloudOffset={value:0};
   material.emissive.set('#ffc58d');material.emissiveIntensity=.85;material.emissiveMap=texture('cinematic/earth-night');
   material.onBeforeCompile=shader=>{
    shader.uniforms.uEarthSun=sunView;shader.uniforms.uCloudOffset=cloudOffset;shader.uniforms.uEarthClouds={value:texture('earth_cloudalpha')};
    shader.fragmentShader='uniform vec3 uEarthSun;uniform float uCloudOffset;uniform sampler2D uEarthClouds;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float earthCloud=texture2D(uEarthClouds,vec2(vMapUv.x+uCloudOffset+.004,vMapUv.y+.002)).g;
      diffuseColor.rgb*=1.-earthCloud*.17;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float earthNight=1.-smoothstep(-.20,.12,dot(normalize(vNormal),normalize(uEarthSun)));
      totalEmissiveRadiance*=earthNight*(1.-earthCloud*.7);`);
   };
   material.customProgramCacheKey=()=> 'earth-day-night-clouds-v1';
   surface.onBeforeRender=(r,s,c)=>{sunView.value.copy(mainLight.position).transformDirection(c.matrixWorldInverse);cloudOffset.value=((g.userData.clouds?.rotation.y||surface.rotation.y)-surface.rotation.y)/(Math.PI*2);};
   const cloudAlpha=texture('earth_cloudalpha');cloudAlpha.colorSpace=THREE.NoColorSpace;
   const clouds=new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color:0xeaf4ff,alphaMap:cloudAlpha,transparent:true,opacity:.62,depthWrite:false,shininess:2}));clouds.scale.setScalar(1.006);clouds.rotation.y=surface.rotation.y;g.add(clouds);g.userData.clouds=clouds;
  }
  if(p.id==='earth')g.add(createEarthAtmosphere(geometry,g,mainLight));
  if(['uranus','neptune','venus'].includes(p.id)){const atmos=new THREE.Mesh(geometry,atmosphereMaterial.clone());atmos.material.uniforms.uColor.value=new THREE.Color(p.color);atmos.onBeforeRender=()=>{atmos.material.uniforms.uSun.value.copy(mainLight.position).normalize();};atmos.scale.setScalar(1.028);g.add(atmos);}
  if(p.id==='saturn'){addSaturnRings(g,surface,mainLight);g.rotation.z=-.36;}
  else if(p.id==='uranus'){g.rotation.z=1.4;}
  return g;
 }
 function getPlanet(id){if(!models.has(id)){const g=makePlanet(planets.find(p=>p.id===id));models.set(id,g);}return models.get(id);}
 let current=null;

 // A far star field with varied natural star colours, no billboard image.
 const starsGeo=new THREE.BufferGeometry(),positions=[],colors=[];
 const palette=[new THREE.Color('#8caec5'),new THREE.Color('#d5d3c1'),new THREE.Color('#71848f'),new THREE.Color('#aa806b')];
 for(let i=0;i<(innerWidth<760?2600:6200);i++){const theta=Math.random()*Math.PI*2,z=(Math.random()-.5)*2,r=45+Math.random()*35,d=Math.sqrt(1-z*z);positions.push(r*d*Math.cos(theta),r*z,r*d*Math.sin(theta));const c=palette[i%4].clone().multiplyScalar(.35+Math.random()*.65);colors.push(c.r,c.g,c.b);}
 starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));starsGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({size:.045,vertexColors:true,transparent:true,opacity:.85,sizeAttenuation:true,depthWrite:false}));scene.add(stars);

 const galaxy=new THREE.Group();const galaxyGeo=new THREE.BufferGeometry();const gPos=[],gColors=[];
 for(let i=0;i<6200;i++){const r=Math.pow(Math.random(),.62)*4.2,a=(i%4)*Math.PI/2+r*1.75+(Math.random()-.5)*(.75/(r+.3));gPos.push(Math.cos(a)*r,(Math.random()-.5)*.25,Math.sin(a)*r);const c=new THREE.Color().lerpColors(new THREE.Color('#ccab89'),new THREE.Color('#536f9f'),r/4.2);c.multiplyScalar(.35+Math.random()*.7);gColors.push(c.r,c.g,c.b);}
 galaxyGeo.setAttribute('position',new THREE.Float32BufferAttribute(gPos,3));galaxyGeo.setAttribute('color',new THREE.Float32BufferAttribute(gColors,3));galaxy.add(new THREE.Points(galaxyGeo,new THREE.PointsMaterial({size:.022,vertexColors:true,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false})));galaxy.rotation.x=.75;scene.add(galaxy);

 const solar=new THREE.Group();const sun=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xffd4a0}));sun.scale.setScalar(.43);solar.add(sun);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const gc=glowCanvas.getContext('2d');const grad=gc.createRadialGradient(64,64,16,64,64,64);grad.addColorStop(0,'rgba(255,183,73,.8)');grad.addColorStop(.35,'rgba(255,130,30,.28)');grad.addColorStop(1,'rgba(255,90,0,0)');gc.fillStyle=grad;gc.fillRect(0,0,128,128);const glowTexture=new THREE.CanvasTexture(glowCanvas);const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(2,2,1);solar.add(glow);
 const solarLight=new THREE.PointLight(0xffe9c5,26,30,1.2);solar.add(solarLight);const solarBodies=[];
 function setupSolarBodies(){
  if(solarBodies.length)return;
  sun.material.map=texture('sun');sun.material.needsUpdate=true;
  planets.forEach((p,i)=>{
  const radius=.85+i*.55;const pts=[];for(let j=0;j<=180;j++){const a=j/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));}
  const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:i<4?0x93735f:0x466271,transparent:true,opacity:.33}));solar.add(path);
  const body=makePlanet(p);const size=i<4?.085+i*.017:(i===4?.3:i===5?.24:.17);body.scale.setScalar(size);body.userData.radius=radius;body.userData.angle=i*.91+.2;body.userData.speed=.16/Math.sqrt(p.orbit);solarBodies.push(body);solar.add(body);
  });
 }
 solar.rotation.set(.45,0,-.12);scene.add(solar);

 const hole=new THREE.Group();const blackCore=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x000001}));blackCore.scale.setScalar(.74);hole.add(blackCore);
 const diskMaterial=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uWhite:{value:0}},vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vP;uniform float uTime;uniform float uWhite;void main(){float r=length(vP);float a=atan(vP.y,vP.x);float sw=sin(r*38.-a*5.+uTime*1.8)*.16+sin(r*91.+a*8.-uTime*2.)*.09;float bright=exp(-(r-.82)*1.05)*(.74+sw);float inner=smoothstep(.76,.88,r);float outer=1.-smoothstep(2.6,3.2,r);vec3 warm=mix(vec3(.62,.16,.025),vec3(1.,.74,.36),min(1.,bright));vec3 cool=mix(vec3(.1,.4,.8),vec3(.8,.93,1.),min(1.,bright));gl_FragColor=vec4(mix(warm,cool,uWhite)*bright*1.4,inner*outer*.85);}`});
 const disk=new THREE.Mesh(new THREE.RingGeometry(.78,3.2,180,40),diskMaterial);disk.rotation.x=1.28;disk.rotation.y=.05;hole.add(disk);
 const lensMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uColor:{value:new THREE.Color('#ffbe72')}},vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vP;uniform vec3 uColor;void main(){float r=length(vP);float sharp=exp(-pow((r-.788)*90.,2.));float glow=exp(-pow((r-.80)*14.,2.))*.26;gl_FragColor=vec4(mix(uColor,vec3(1.,.93,.76),sharp),sharp+glow);}`});
 const lens=new THREE.Mesh(new THREE.RingGeometry(.741,1.1,180,20),lensMaterial);hole.add(lens);scene.add(hole);

 let state=callbacks.initialState||{route:'explore',planet:'earth',paused:false,mystery:'blackhole',chapter:0};let dragX=0,dragY=0,zoomValue=1,targetZoom=1;let pointerStart=null,lastPointer=null,capturedPointer=null;let sceneKey='',transition=1;let frame=0,disposed=false;const clock=new THREE.Clock();let elapsed=0;let layoutDirty=true,sceneBounds=null;
 const portal=createPortalScene({scene,camera,makePlanet,invalidate,onWorld:callbacks.onWorld});
 const voyage=createVoyageScene({scene,camera,makePlanet});
 const odyssey=createOdysseyScene({scene,camera,makePlanet,invalidate,mainLight,renderer});
 let quality='auto',filmPost=null;
 function qualityCommand(e){if(e.detail?.action!=='quality')return;quality=e.detail.quality;resize();}
 document.addEventListener('space-odyssey-command',qualityCommand);
 function invalidate(){if(!disposed&&!frame&&!document.hidden)frame=requestAnimationFrame(animate);}
 function visibility(){clock.getDelta();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();}
 function clearCanvasPointer(){
  pointerStart=null;lastPointer=null;
  if(capturedPointer===null)return;
  if(odyssey.shipActive)odyssey.shipPointer('cancel');
  if(canvas.hasPointerCapture(capturedPointer))canvas.releasePointerCapture(capturedPointer);
  capturedPointer=null;
 }
 function clearPointerOnMode(e){if(e.detail?.action==='ship-mode')clearCanvasPointer();}
 document.addEventListener('space-odyssey-command',clearPointerOnMode);
 function setView(s){
  if(s.route!==state.route)clearCanvasPointer();
  const id=s.route==='story'?chapters[s.chapter].planet:s.planet;const key=s.route+'/'+(s.route==='unknown'?s.mystery:id);
  if(key!==sceneKey){sceneKey=key;transition=.1;dragX=0;dragY=0;targetZoom=1;if(['explore','story'].includes(s.route)){if(current)hero.remove(current);current=getPlanet(id);hero.add(current);}}
  if(s.route==='solar')setupSolarBodies();
  state={...s};portal.setActive(false,state);odyssey.setActive(s.route==='universe',state);layoutDirty=true;hero.visible=['explore','story'].includes(s.route);solar.visible=s.route==='solar';hole.visible=s.route==='unknown'&&['blackhole','whitehole'].includes(s.mystery);galaxy.visible=['atlas','observatory'].includes(s.route)||(s.route==='unknown'&&!['blackhole','whitehole'].includes(s.mystery));
  const white=s.mystery==='whitehole';diskMaterial.uniforms.uWhite.value=white?1:0;blackCore.material.color.set(white?0xb9e7ff:0x000001);lensMaterial.uniforms.uColor.value.set(white?0x9adfff:0xffbe72);updateAssetStatus();invalidate();
 }
 function resize(){layoutDirty=true;renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='low'?1:quality==='high'?2:innerWidth<760?1.4:1.7));renderer.setSize(innerWidth,innerHeight);filmPost?.resize(quality);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();invalidate();}
 function scroll(){if(scrollY>2)portal.cancelCinematic('scroll');invalidate();}
 function zoom(amount){portal.cancelCinematic('interaction');targetZoom=THREE.MathUtils.clamp(targetZoom-amount*.12,.58,state.route==='universe'?1.7:1.42);invalidate();}
 function reset(){portal.cancelCinematic('interaction');dragX=0;dragY=0;targetZoom=1;invalidate();}
 function down(e){if(e.button!==0||odyssey.filmActive||capturedPointer!==null)return;capturedPointer=e.pointerId;if(odyssey.shipActive){odyssey.shipPointer('down',e);canvas.setPointerCapture(e.pointerId);return;}portal.cancelCinematic('interaction');pointerStart={x:e.clientX,y:e.clientY};lastPointer=pointerStart;canvas.setPointerCapture(e.pointerId);}
 function playCinematic(){if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&state.paused)callbacks.onPause?.();return portal.playCinematic();}
 function cinemaCommand(event){if(event.detail?.action==='play')playCinematic();else if(event.detail?.action==='cancel')portal.cancelCinematic('cancelled');}
 function cinemaInteraction(event){if(event.type==='pointerdown'&&event.target.closest('button[data-space-cinema],[data-cinema-controls],.cinema-presentation,[data-action="cinema-start"],[data-action="cinema-stop"],[data-action="cinema-cancel"]'))return;portal.cancelCinematic(event.type==='wheel'?'scroll':'interaction');}
 document.addEventListener('space-cinema-command',cinemaCommand);document.addEventListener('pointerdown',cinemaInteraction,{passive:true});document.addEventListener('wheel',cinemaInteraction,{passive:true});
 function move(e){if(odyssey.shipActive){odyssey.shipPointer('move',e);return;}if(!lastPointer)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;dragX+=dx*.007;dragY=THREE.MathUtils.clamp(dragY+dy*.004,-.65,.65);lastPointer={x:e.clientX,y:e.clientY};invalidate();}
 function onCanvasCaptureLost(e){if(capturedPointer===e.pointerId)clearCanvasPointer();}
 function up(e){
  if(capturedPointer!==e.pointerId)return;
  capturedPointer=null;
  if(odyssey.shipActive){odyssey.shipPointer(e.type==='pointercancel'?'cancel':'up',e);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);return;}
  if(e.type!=='pointercancel'&&pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<6&&state.route==='universe')portal.pick(e,true);
  if(e.type!=='pointercancel'&&pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<6&&state.route==='solar'){
   const p=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(p,camera);const hits=ray.intersectObjects(solarBodies,true);if(hits.length){let g=hits[0].object;while(g&&!g.userData.id)g=g.parent;if(g?.userData.id)callbacks.onPlanet?.(g.userData.id);}
  }pointerStart=null;lastPointer=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 }
 function wheel(e){if(odyssey.shipActive){if(e.shiftKey&&!e.ctrlKey){e.preventDefault();odyssey.shipZoom(Math.sign(e.deltaY));}return;}if(!e.ctrlKey||innerWidth<760||['atlas','observatory'].includes(state.route))return;e.preventDefault();zoom(Math.sign(e.deltaY));}
 function key(e){if(state.route==='universe'&&['ArrowLeft','ArrowRight'].includes(e.key))return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=',' ','0'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')dragX-=.13;if(e.key==='ArrowRight')dragX+=.13;if(e.key==='ArrowUp')dragY-=.08;if(e.key==='ArrowDown')dragY+=.08;if(e.key==='+'||e.key==='=')zoom(-1);if(e.key==='-')zoom(1);if(e.key==='0')reset();if(e.key===' ')callbacks.onPause?.();invalidate();}
 function leave(e){if(odyssey.shipActive)odyssey.shipPointer('leave',e);}
 canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',onCanvasCaptureLost);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',key);addEventListener('resize',resize);addEventListener('scroll',scroll,{passive:true});
 function animate(){
  frame=0;if(disposed||document.hidden)return;const delta=Math.min(clock.getDelta(),.05);const active=!state.paused&&!state.dialog&&!document.body.dataset.odysseyDialog&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(active)elapsed+=delta;
  const mobile=innerWidth<760;const k=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-delta*5);transition=THREE.MathUtils.lerp(transition,1,k);zoomValue=THREE.MathUtils.lerp(zoomValue,targetZoom,k);
  const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;const x=mobile?0:worldHeight*camera.aspect*.205;const y=mobile?worldHeight*(.5-275/innerHeight):.1;
  // Each page reserves its own visual area; measure after the UI has rendered.
  if(layoutDirty){const selector={solar:'.orbital-viewport',unknown:'.theory-visual',story:'.letter-destination'}[state.route];const el=selector&&document.querySelector(selector);const r=el?.getBoundingClientRect();sceneBounds=r?{x:r.left+r.width/2,y:r.top+scrollY+(state.route==='story'?130:r.height/2),width:r.width,height:state.route==='story'?220:r.height}:null;layoutDirty=false;}
  const pixelsPerUnit=innerHeight/worldHeight;const scrollOffset=scrollY/pixelsPerUnit;const sceneX=sceneBounds?(sceneBounds.x-innerWidth/2)/pixelsPerUnit:x;const sceneY=sceneBounds?(innerHeight/2-sceneBounds.y)/pixelsPerUnit+scrollOffset:y+scrollOffset;
  const heroSection=document.querySelector(state.route==='universe'?'.universe-map':'.page');const foregroundVisible=!heroSection||heroSection.getBoundingClientRect().bottom>0;
  document.body.dataset.spaceForeground=foregroundVisible?'visible':'hidden';
  hero.visible=foregroundVisible&&['explore','story'].includes(state.route);solar.visible=foregroundVisible&&state.route==='solar';hole.visible=foregroundVisible&&state.route==='unknown'&&['blackhole','whitehole'].includes(state.mystery);galaxy.visible=foregroundVisible&&(['atlas','observatory'].includes(state.route)||(state.route==='unknown'&&!['blackhole','whitehole'].includes(state.mystery)));
  hero.position.set(x,y+scrollOffset,0);const ringed=current?.userData.id==='saturn';hero.scale.setScalar((mobile?(ringed?.78:1.12):(ringed?1.5:2.15))*zoomValue*(.85+.15*transition));hero.rotation.set(dragY,dragX,0);
  if(state.route==='story'&&sceneBounds){hero.position.set(sceneX,sceneY,0);hero.scale.setScalar(Math.min(sceneBounds.width*.9,190)/pixelsPerUnit/(ringed?4.4:2)*zoomValue*(.85+.15*transition));}
  solar.position.set(sceneX,sceneY,0);solar.scale.setScalar((sceneBounds?Math.min(sceneBounds.width*.9/10,sceneBounds.height*.9/7)/pixelsPerUnit:(mobile?.32:.69))*zoomValue);solar.rotation.y=dragX;solar.rotation.x=.55+dragY;
  hole.position.set(sceneX,sceneY,0);hole.scale.setScalar((sceneBounds?Math.min(sceneBounds.width/6.4,sceneBounds.height/3.5)*.85/pixelsPerUnit:(mobile?.6:1.12))*zoomValue*(.85+.15*transition));hole.rotation.set(dragY*.5,dragX*.35,-.12);
  galaxy.position.set(state.route==='unknown'?sceneX:(mobile?0:x),state.route==='unknown'?sceneY:(mobile?y+scrollOffset:-.1+scrollOffset),-2);galaxy.scale.setScalar(state.route==='unknown'&&sceneBounds?Math.min(sceneBounds.width,sceneBounds.height*1.5)/pixelsPerUnit/8.4:(mobile?.5:1.12));galaxy.rotation.y=elapsed*.015+dragX;
  if(active){if(current?.visible&&hero.visible)current.userData.surface.rotation.y+=delta*.045;if(hero.visible&&current?.userData.clouds)current.userData.clouds.rotation.y+=delta*.053;sun.rotation.y+=delta*.1;for(const body of solarBodies)body.userData.angle+=delta*body.userData.speed*(state.orbitSpeed??1);diskMaterial.uniforms.uTime.value=elapsed;stars.rotation.y=elapsed*.0015;}
  for(const body of solarBodies){const d=body.userData;body.position.set(Math.cos(d.angle)*d.radius,0,Math.sin(d.angle)*d.radius);}
  const portalAnimating=portal.update(delta,elapsed,dragX,dragY,zoomValue,foregroundVisible,scrollY);
  const voyageState=voyage.update(delta,{enabled:state.route==='universe'&&!document.body.dataset.portalFlight&&!portal.cinematicActive,paused:state.paused,dialog:state.dialog});portal.setVoyage(voyageState);
  mainLight.position.set(-5,3,state.route==='universe'?.45:3);stars.visible=state.route!=='universe';scene.getObjectByName('persistent-starfield').visible=state.route!=='universe';
  const odysseyAnimating=odyssey.update(delta,elapsed,dragX,dragY,zoomValue,foregroundVisible,scrollY);
  if(odyssey.filmActive||odyssey.bridgeActive){renderer.setClearColor(0x000000);if(!filmPost){filmPost=createFilmPost(renderer,scene,camera);filmPost.resize(quality);}filmPost.render(delta,odyssey.filmActive?odyssey.filmLook:odyssey.bridgeLook,elapsed);}else{renderer.setClearColor(0x080c10);renderer.render(scene,camera);}if(odysseyAnimating||portalAnimating||voyageState.settling||(active&&!odyssey.filmActive&&(state.route!=='universe'||foregroundVisible))||Math.abs(transition-1)>.001||Math.abs(zoomValue-targetZoom)>.001)invalidate();
 }
 document.addEventListener('visibilitychange',visibility);setView(state);
 return {setView,zoom,reset,enterWorld:portal.enterWorld,playCinematic,cancelCinematic:portal.cancelCinematic,dispose(){disposed=true;clearCanvasPointer();document.removeEventListener('space-odyssey-command',clearPointerOnMode);odyssey.dispose();filmPost?.dispose();document.removeEventListener('space-odyssey-command',qualityCommand);document.removeEventListener('space-cinema-command',cinemaCommand);document.removeEventListener('pointerdown',cinemaInteraction);document.removeEventListener('wheel',cinemaInteraction);voyage.dispose();portal.dispose();cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);assetStatus.remove();removeEventListener('resize',resize);removeEventListener('scroll',scroll);delete document.body.dataset.spaceForeground;canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',onCanvasCaptureLost);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',key);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});for(const t of textures.values())t.dispose();glowTexture.dispose();renderer.dispose();}};
}
