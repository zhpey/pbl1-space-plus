import * as THREE from 'three';
import {planets} from './data.js';
import {destinations,odysseyAsset} from './odyssey-data.js';
import {createFilmDirector} from './film-director.js';
import {createBridgeScene} from './bridge-scene.js';
import {createShipScene} from './ship-scene.js';
import {configureMoon,createMarsRim,createEuropa,configureJupiter,createBlackHole} from './odyssey-optics.js';

// One scene, one WebGL context. Distances and camera paths are composed for
// storytelling; the astronomical source imagery is kept separate from them.
export function createOdysseyScene({scene,camera,makePlanet,invalidate,mainLight,renderer}){
 const root=new THREE.Group();root.name='odyssey';root.visible=false;scene.add(root);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stages=new Map(),ownedTextures=[];let current=null,index=Math.max(0,destinations.findIndex(d=>d.id===document.body.dataset.odysseyStation)),enabled=false,touring=false,hold=0,flight=null,dialog=false,paused=false,lastTick=performance.now();
 const flightDuration=1.85;
 const moonLights=[new THREE.Vector3(-.23,.19,1),new THREE.Vector3(-1,.25,.04),new THREE.Vector3(-.78,.19,-.79)];
 const marsView=[6.11,.72,5.94];
 const marsStudyLight=new THREE.Vector3(-.3,.25,1);
 const approachAngle=(angle,target,amount)=>angle+Math.atan2(Math.sin(target-angle),Math.cos(target-angle))*amount;
 const moonPosition=new THREE.Vector3(),scopeTarget=new THREE.Vector3();
 const scopeViews={
  nebula:[[.53,.54,1],[.57,.51,1.85],[.53,.50,1]],
  deepfield:[[.50,.50,1],[.60,.27,2.95],[.43,.38,2.45]]
 };
 const observationSun=new THREE.Vector3(),saturnView=new THREE.Vector3(),saturnUp=new THREE.Vector3();
 const worldUp=new THREE.Vector3(0,1,0),ringUp=new THREE.Vector3();
 const earthLights=[new THREE.Vector3(-.55,.37,1.2),new THREE.Vector3(-1,.31,-.085),new THREE.Vector3(-.32,.28,-1.1)];
 const ringElevations=[.82,.42,.025];
 const saturnObservationLight=new THREE.Vector3(-1,.6,-.19);
 let observation=null,observationBlend=0,ringElevation=ringElevations[0],moonLight=new THREE.Vector3(),studyPose=0;
 let bridgeProps=null,bridgeEnabled=false,quality='auto',foreground=false,shipyard=null,shipMode=false;
 const bridgeLook={fade:0,warmth:-.025,exposure:1.02,bloom:.24,grain:.003};
 const shipLook={fade:0,warmth:.006,exposure:.94,bloom:.12,grain:.0015};
 const loader=new THREE.TextureLoader();
 function texture(file,colorSpace=THREE.SRGBColorSpace){const t=loader.load(odysseyAsset(file),invalidate,undefined,()=>{document.body.dataset.odysseyImageError='true';invalidate();});t.colorSpace=colorSpace;t.wrapS=THREE.RepeatWrapping;ownedTextures.push(t);return t;}
 function body(id){return makePlanet(planets.find(p=>p.id===id)||{id:'moon',texture:'moon',color:'#c8c9cb'});}
 let seed=80917;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const positions=[],colors=[],sizes=[];
 for(let i=0;i<3200;i++){positions.push((random()-.5)*100,(random()-.5)*70,-12-random()*65);const c=new THREE.Color(['#b6d2ee','#f2e3c9','#8599b7','#e8bda3'][i%4]).multiplyScalar(.35+random()*.65);colors.push(c.r,c.g,c.b);sizes.push(i%61===0?3.6: .65+random()*1.25);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
 const starMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uHeight:{value:innerHeight}},vertexShader:`attribute float aSize;varying vec3 vColor;uniform float uHeight;void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aSize*uHeight*.028/-p.z,.7,5.);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vColor;void main(){float r=length(gl_PointCoord-.5)*2.;float a=exp(-r*r*6.)*(1.-smoothstep(.5,1.,r));gl_FragColor=vec4(vColor,a*.9);}`});
 const stars=new THREE.Points(geometry,starMaterial);root.add(stars);
 const nearPositions=[],nearColors=[],nearSizes=[];
 for(let i=0;i<190;i++){
  nearPositions.push((random()-.5)*36,(random()-.5)*24,-3-random()*8);
  const tint=new THREE.Color(i%5===0?'#d5c1a8':'#9ebcd7').multiplyScalar(.34+random()*.28);
  nearColors.push(tint.r,tint.g,tint.b);
  nearSizes.push(.48+random()*.8);
 }
 const nearGeometry=new THREE.BufferGeometry();
 nearGeometry.setAttribute('position',new THREE.Float32BufferAttribute(nearPositions,3));
 nearGeometry.setAttribute('color',new THREE.Float32BufferAttribute(nearColors,3));
 nearGeometry.setAttribute('aSize',new THREE.Float32BufferAttribute(nearSizes,1));
 const nearStars=new THREE.Points(nearGeometry,starMaterial.clone());
 root.add(nearStars);
 const streakPositions=[];
 for(let i=0;i<150;i++){const a=random()*Math.PI*2,r=1.8+random()*11,z=-3-random()*9;const x=Math.cos(a)*r,y=Math.sin(a)*r;streakPositions.push(x,y,z,x*1.3,y*1.3,z+2.8);}
 const streakGeometry=new THREE.BufferGeometry();streakGeometry.setAttribute('position',new THREE.Float32BufferAttribute(streakPositions,3));
 const streaks=new THREE.LineSegments(streakGeometry,new THREE.LineBasicMaterial({color:'#b1d1e9',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(streaks);
 function imagePlane(file,w,h,z){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture(file),depthWrite:false,toneMapped:false}));mesh.position.z=z;mesh.renderOrder=-2;return mesh;}
 function createScope(id,background){
  const view=id==='nebula'?scopeViews.nebula:scopeViews.deepfield;
  const scope=new THREE.Group();scope.visible=false;
  const frame=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#172537',toneMapped:false}));
  frame.scale.set(1.009,1.012,1);frame.position.z=-.025;scope.add(frame);
  const scopePlane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:background.material.map,toneMapped:false}));
  scope.add(scopePlane);
  const guideGeometry=new THREE.BufferGeometry().setFromPoints([
   [-.058,0],[-.029,0],[.029,0],[.058,0],
   [0,-.058],[0,-.029],[0,.029],[0,.058]
  ].map(([x,y])=>new THREE.Vector3(x,y,.008)));
  const guide=new THREE.LineSegments(guideGeometry,new THREE.LineBasicMaterial({color:'#f7d6a6',transparent:true,opacity:.82,depthTest:false,toneMapped:false}));
  guide.renderOrder=2;
  scope.add(guide);
  const uv=scopePlane.geometry.getAttribute('uv');
  const pose=new THREE.Vector3(...view[0]);
  let composite;
  scope.userData.update=(mode,smoothing)=>{
   const alternate=id==='nebula'&&mode===2;
   if(alternate&&!composite)composite=texture('cliffs-composite.jpg');
   const map=alternate&&composite.image?composite:background.material.map;
   scopePlane.material.map=map;
   scopeTarget.set(...view[mode]);pose.lerp(scopeTarget,smoothing);
   guide.visible=mode!==0&&!alternate;
   const ratio=map===composite?1280/444:id==='nebula'?1.727:.98;
   const width=Math.min(1,1/pose.z),height=width;
   const left=THREE.MathUtils.clamp(pose.x-width*.5,0,1-width);
   const top=THREE.MathUtils.clamp(pose.y-height*.5,0,1-height);
   uv.setXY(0,left,1-top);uv.setXY(1,left+width,1-top);
   uv.setXY(2,left,1-top-height);uv.setXY(3,left+width,1-top-height);uv.needsUpdate=true;
   return ratio;
  };
  return scope;
 }
 function getStage(i){if(stages.has(i))return stages.get(i);const g=new THREE.Group();const id=destinations[i].id;g.userData.id=id;
  if(['earth','moon','mars','jupiter','saturn'].includes(id)){
   const planet=body(id);g.add(planet);g.userData.planet=planet;
   if(id==='earth'){
    const moon=body('moon');
    moon.userData.surface.rotation.y=4.76;
    moon.userData.surface.material.shininess=1;
    moon.visible=false;
    g.add(moon);
    g.userData.distantMoon=moon;
   }
   if(id==='moon'){configureMoon(planet,texture('moon-relief.jpg',THREE.NoColorSpace));planet.userData.surface.rotation.y=4.76;const earth=body('earth');earth.scale.setScalar(.23);earth.position.set(2.6,1.7,-4);g.add(earth);g.userData.companion=earth;}
   if(id==='mars'){
    g.userData.marsColor=planet.userData.surface.material.map;
    g.userData.marsRim=createMarsRim(mainLight);planet.add(g.userData.marsRim);planet.userData.surface.rotation.y=6.11;
   }
   if(id==='jupiter'){
    planet.userData.surface.rotation.y=5.29;
    const europa=createEuropa();g.add(europa);g.userData.foregroundMoon=europa;
    g.userData.jupiterUniforms=configureJupiter(planet,mainLight);
    const points=Array.from({length:161},(_,k)=>{
     const angle=k/160*Math.PI*2;
     return new THREE.Vector3(Math.cos(angle),Math.sin(angle)*.11,Math.sin(angle)*.27);
    });
    const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#c2a489',transparent:true,opacity:.22,depthWrite:false}));
    g.add(orbit);g.userData.orbitLine=orbit;
   }
  }else if(id==='nebula'){
   const background=imagePlane('cosmic-cliffs.jpg',34,19.69,-13);background.position.x=2;g.add(background);g.userData.background=background;
   const ps=[],cs=[];for(let j=0;j<180;j++){ps.push((random()-.5)*24,(random()-.5)*15,-2-random()*8);const c=new THREE.Color(j%3?'#d9ac79':'#a7d6f5');cs.push(c.r,c.g,c.b);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));const dust=new THREE.Points(geo,new THREE.PointsMaterial({size:.022,vertexColors:true,transparent:true,opacity:.62,depthWrite:false,blending:THREE.AdditiveBlending}));g.add(dust);g.userData.dust=dust;
  }else if(id==='blackhole'){const hole=createBlackHole();g.add(hole);g.userData.hole=hole;
  }else{const bg=imagePlane('deepfield.jpg',23.52,24,-17);bg.position.x=2;g.add(bg);g.userData.background=bg;}
  if(g.userData.background){g.userData.scope=createScope(id,g.userData.background);g.add(g.userData.scope);}
  g.visible=false;root.add(g);stages.set(i,g);return g;
 }
 function notify(){document.dispatchEvent(new CustomEvent('space-odyssey-update',{detail:{index,touring,progress:hold/9}}));}
 function apply(i){if(current)current.visible=false;if(i!==index)observationBlend=0;index=i;current=getStage(i);current.visible=true;notify();}
 const film=createFilmDirector({root,camera,getStage,onStation(i){touring=false;flight=null;hold=0;document.body.style.setProperty('--od-flight','0');apply(i);},mainLight,invalidate});
 function select(i){i=(i+destinations.length)%destinations.length;if(i===index&&!flight){hold=0;notify();return;}hold=0;if(reduced.matches||!enabled||paused){flight=null;apply(i);document.body.style.setProperty('--od-flight','0');} else {
  flight={index:i,time:0,switched:false};
  const label=document.querySelector('[data-od-flight-target]');
  if(label)label.textContent=`${destinations[index].name} → ${destinations[i].name}`;
 }
 invalidate();}
 function stop(){touring=false;hold=0;notify();}
 function command(event){const d=event.detail||{};if(d.action==='ship-mode'){
  shipMode=!!d.enabled;
  if(shipMode&&enabled){
   shipyard??=createShipScene({scene,camera,makePlanet,invalidate,renderer,mainLight});
   if(touring)stop();
  }else if(!shipMode){shipyard?.hide();}
 }if(d.action==='observation'){
  if(d.mode===null){observation=null;}
  else{
   touring=false;hold=0;flight=null;
   document.body.style.setProperty('--od-flight','0');
   if(d.station!==index)apply(d.station);
   if(observation===null&&observationBlend===0){
    ringElevation=ringElevations[d.mode];observationSun.copy(earthLights[d.mode]);
    moonLight.copy(moonLights[d.mode]);studyPose=d.mode;
   }
   observation=d.mode;
  }
 }if(d.action==='select'){touring=false;select(d.index);}if(d.action==='tour'){touring=!!d.active&&!reduced.matches;if(touring&&index===7)select(0);hold=0;notify();}if(d.action==='dialog')dialog=!!d.open;if(d.action==='bridge')bridgeEnabled=!!d.enabled;if(d.action==='quality')quality=d.quality;invalidate();}
 document.addEventListener('space-odyssey-command',command);
 function reducedChange(){if(reduced.matches){stop();if(flight){apply(flight.index);flight=null;}document.body.style.setProperty('--od-flight','0');}invalidate();}
 reduced.addEventListener('change',reducedChange);
 function setActive(value,state){if(!value&&film.active)film.stop('navigation');paused=state.paused;if(paused&&flight){apply(flight.index);flight=null;document.body.style.setProperty('--od-flight','0');}const changed=enabled!==value;enabled=value;root.visible=value;if(!value){observation=null;observationBlend=0;bridgeProps?.update({visible:false});shipyard?.hide();}if(value&&!current)apply(index);if(changed&&!value){stop();flight=null;document.body.style.setProperty('--od-flight','0');camera.position.set(0,0,10);camera.lookAt(0,0,0);}invalidate();}
 function update(delta,elapsed,dragX,dragY,zoom,foregroundVisible,scrollPixels){
  const now=performance.now(),wallDelta=Math.min((now-lastTick)/1000,.25);lastTick=now;if(!enabled)return false;root.visible=foregroundVisible;
  foreground=foregroundVisible;
  if(film.active){
   bridgeProps?.update({visible:false});
   shipyard?.hide();
   nearStars.visible=false;
   const earthStage=stages.get(0);
   if(earthStage?.userData.distantMoon)earthStage.userData.distantMoon.visible=false;
   return film.update(wallDelta,!dialog&&foregroundVisible&&!document.hidden);
  }
  const moving=!paused&&!dialog&&!reduced.matches&&foregroundVisible;
  if(shipMode){
   bridgeProps?.update({visible:false});if(current)current.visible=false;
   if(flight){apply(flight.index);flight=null;if(current)current.visible=false;document.body.style.setProperty('--od-flight','0');}
   shipyard??=createShipScene({scene,camera,makePlanet,invalidate,renderer,mainLight});
   return shipyard.update({visible:foregroundVisible,moving,delta,scrollPixels,index,quality});
  }
  shipyard?.hide();if(current)current.visible=true;
  let flyBy=0,warp=0,transit=0,arrivalShift=0;
  if(flight&&(moving||reduced.matches)){
   flight.time+=wallDelta;
   const progress=Math.min(1,flight.time/flightDuration);
   const departure=THREE.MathUtils.smootherstep(progress,.02,.47);
   const arrival=1-THREE.MathUtils.smootherstep(progress,.46,.98);
   warp=departure*arrival;
   transit=departure*arrival;
   document.body.style.setProperty('--od-flight',String(warp));
   if(progress>=.5&&!flight.switched){flight.switched=true;apply(flight.index);}
   const handoff=THREE.MathUtils.smoothstep(progress,.37,.62);
   flyBy=THREE.MathUtils.lerp(-6*departure,10*arrival,handoff);
   arrivalShift=THREE.MathUtils.lerp(.18*departure,-.26*arrival,handoff);
   if(progress>=1){flight=null;document.body.style.setProperty('--od-flight','0');}
  }
  if(touring&&moving&&!flight){hold+=wallDelta;document.documentElement.style.setProperty('--od-tour-progress',String(hold/9));if(hold>=9){if(index===7)stop();else select(index+1);}}
  const mobile=innerWidth<760,aspect=innerWidth/innerHeight;
  camera.position.set(arrivalShift,.10*warp,10+flyBy*.08);
  const roll=arrivalShift*.16;
  camera.up.set(Math.sin(roll),Math.cos(roll),0);
  camera.lookAt(0,0,0);
  camera.fov=40+flyBy;
  camera.updateProjectionMatrix();
  const smoothing=moving?1-Math.exp(-wallDelta*5.8):1;
  const blendTarget=observation===null?0:1;
  observationBlend=THREE.MathUtils.lerp(observationBlend,blendTarget,smoothing);
  if(Math.abs(observationBlend-blendTarget)<.001)observationBlend=blendTarget;
  if(observation!==null){
   observationSun.lerp(earthLights[observation],smoothing);
   ringElevation=THREE.MathUtils.lerp(ringElevation,ringElevations[observation],smoothing);
   moonLight.lerp(moonLights[observation],smoothing);
   studyPose=THREE.MathUtils.lerp(studyPose,observation,smoothing);
  }
  const worldH=2*Math.tan(THREE.MathUtils.degToRad(20))*10,worldW=worldH*aspect,scrollOffset=scrollPixels/(innerHeight/worldH);
  const t=reduced.matches?0:elapsed;
  const studying=observation!==null;
  if(current){
   const id=current.userData.id,planet=current.userData.planet;
   const ring=id==='saturn';
   const x=mobile?worldW*.035:worldW*((ring?.217:.235)-.032*observationBlend);
   const stationCenter=THREE.MathUtils.clamp(innerHeight*.69,552,610);
   const lessonCenter=THREE.MathUtils.clamp(innerHeight*.7,525,585);
   const mobileCenter=THREE.MathUtils.lerp(stationCenter,lessonCenter,observationBlend);
   const y=mobile?worldH*(.5-mobileCenter/innerHeight):worldH*.04;
   current.position.set(0,scrollOffset,0);current.rotation.set(0,0,0);current.scale.setScalar(1);
   if(planet){
    const {surface}=planet.userData;
    const base=mobile?(ring?worldW*.198:worldW*.365):(ring?Math.min(worldH*.235,worldW*.119):worldH*.34);
    planet.position.set(x+Math.sin(t*.045)*.055,y,0);
    const lessonScale=mobile?.88:.91;
    planet.scale.setScalar(base*THREE.MathUtils.lerp(zoom,lessonScale,observationBlend));
    const free=1-observationBlend;
    planet.rotation.set(dragY*.12*free,dragX*.16*free,0);
    if(id==='earth'){
     mainLight.position.set(-1,.55,.21).lerp(observationSun,observationBlend);
     const moon=current.userData.distantMoon;
     moon.visible=!studying&&!bridgeEnabled;
     moon.position.set(mobile?worldW*.38:-worldW*.051, mobile?y+base*.91:worldH*.39,-4.5);
     moon.position.x+=Math.sin(t*.065)*worldW*.012+dragX*.055;
     moon.scale.setScalar(Math.min(worldW*.078,worldH*.083));
    }
    if(id==='moon'){
     mainLight.position.set(-.9,.27,.58).lerp(moonLight,observationBlend);
     if(studying)surface.rotation.y=approachAngle(surface.rotation.y,4.76,smoothing);
    }
    if(id==='mars'){
     mainLight.position.set(-.68,.42,.82).lerp(marsStudyLight,observationBlend);
     const topo=studying&&observation>0;
     if(topo&&!current.userData.elevation)current.userData.elevation=texture('mars-elevation.jpg');
     surface.material.map=topo&&current.userData.elevation.image?current.userData.elevation:current.userData.marsColor;
     current.userData.marsRim.userData.strength.value=topo?.15:1;
     if(studying)surface.rotation.y=approachAngle(surface.rotation.y,marsView[observation],smoothing);
    }
    if(ring){
     planet.rotation.set(.14+dragY*.23*free,dragX*.16*free,-.31);
     const equator=planet.userData.equator;
     equator.rotation.set(.54+Math.sin(t*.19)*.06*free,0,0);
     mainLight.position.set(-1,-.17,.57).lerp(saturnObservationLight,observationBlend);
     if(observationBlend>0){
      // Set elevation relative to the actual line of sight, including on mobile.
      saturnView.copy(camera.position).sub(planet.position).sub(current.position).normalize();
      saturnUp.copy(worldUp).addScaledVector(saturnView,-worldUp.dot(saturnView)).normalize();
      saturnUp.applyAxisAngle(saturnView,-.29).multiplyScalar(Math.cos(ringElevation));
      saturnUp.addScaledVector(saturnView,Math.sin(ringElevation));
      ringUp.copy(worldUp).applyQuaternion(equator.quaternion).applyQuaternion(planet.quaternion);
      ringUp.lerp(saturnUp,observationBlend).normalize();
      equator.rotation.set(0,0,0);
      planet.quaternion.setFromUnitVectors(worldUp,ringUp);
     }
    }
    if(moving){surface.rotation.y+=delta*(id==='jupiter'?.026:.014)*free;if(planet.userData.clouds)planet.userData.clouds.rotation.y+=delta*.017*free;}
    if(current.userData.companion){
     const earth=current.userData.companion;
     earth.position.set(mobile?worldW*.39:-worldW*.07,mobile?y+base*.84:worldH*.36,-4);
     earth.scale.setScalar(mobile?.19:.38);earth.visible=!studying;
    }
    if(id==='jupiter'){
     mainLight.position.set(-.7,.26,1);
     const {foregroundMoon:europa,orbitLine,jupiterUniforms:uniforms}=current.userData;
     const launchAngle=.95+t*.095;
     const ambientX=Math.cos(launchAngle)*1.47,ambientZ=Math.sin(launchAngle)*.66;
     if(studying)surface.rotation.y=approachAngle(surface.rotation.y,5.29,smoothing);
     const beforeTransit=studyPose<=1;
     const phase=beforeTransit?studyPose:studyPose-1;
     const transitX=beforeTransit?THREE.MathUtils.lerp(-1.31,-.14,phase):THREE.MathUtils.lerp(-.14,-.86,phase);
     const transitY=beforeTransit?-.19:THREE.MathUtils.lerp(-.19,.76,phase);
     const transitZ=beforeTransit?THREE.MathUtils.lerp(.4,1.25,phase):THREE.MathUtils.lerp(1.25,.13,phase);
     moonPosition.set(
      THREE.MathUtils.lerp(ambientX,transitX,observationBlend),
      THREE.MathUtils.lerp(-.17+ambientX*.10,transitY,observationBlend),
      THREE.MathUtils.lerp(ambientZ,transitZ,observationBlend)
     ).multiplyScalar(base).add(planet.position);
     europa.position.copy(moonPosition);europa.rotation.y=t*.08;
     europa.scale.setScalar(base*THREE.MathUtils.lerp(.074,.125,observationBlend));europa.visible=true;
     orbitLine.position.copy(planet.position);orbitLine.scale.setScalar(base*1.51);orbitLine.visible=!studying;
     current.localToWorld(uniforms.uMoon.value.copy(moonPosition));
     uniforms.uMoonRadius.value=base*.125*observationBlend;
     uniforms.uCloudTime.value=t;
    }
   }else if(id==='blackhole'){
    const h=current.userData.hole;h.position.set(x,y,0);h.scale.setScalar((mobile?worldW*.14:.68)*zoom);h.rotation.z=-.11+dragX*.04*(1-observationBlend);h.userData.clock.value=t;
    h.userData.tilt.value=THREE.MathUtils.lerp(.225,.23*Math.exp(-Math.pow(studyPose,2)*1.45)+.047,observationBlend);
    h.userData.ring.value=observationBlend*THREE.MathUtils.smoothstep(studyPose,1,2);
   }else{
    const {background:bg,dust,scope}=current.userData;
    const z=id==='nebula'?-13:-17;
    const visibleH=2*Math.tan(THREE.MathUtils.degToRad(20))*(10-z);
    const imageRatio=id==='nebula'?1.727:.98;
    const neededW=Math.max(visibleH*aspect,visibleH*imageRatio)*1.22;
    bg.scale.set(neededW/(id==='nebula'?34:23.52),neededW/imageRatio/(id==='nebula'?19.69:24),1);
    bg.position.set((mobile?0:visibleH*.052)+Math.sin(t*.11)*.21+dragX*.26,.18+dragY*.22,z);
    bg.material.color.setScalar(THREE.MathUtils.lerp(1,.11,observationBlend));
    if(dust){dust.visible=!studying;dust.position.set(dragX*.62+Math.sin(t*.09)*.30,dragY*.43+Math.sin(t*.08)*.16,0);}
    scope.visible=studying;
    if(studying){
     const ratio=scope.userData.update(observation,smoothing);
     const width=Math.min(mobile?worldW*.85:worldW*.49,worldH*(mobile?.27:.63)*ratio);
     scope.scale.set(width,width/ratio,1);scope.position.set(x,y,0);
    }
   }
  }
  stars.rotation.y=dragX*.012+Math.sin(t*.025)*.003;stars.rotation.x=dragY*.012;stars.position.z=transit*4;starMaterial.uniforms.uHeight.value=innerHeight;
  nearStars.material.uniforms.uHeight.value=innerHeight;
  nearStars.visible=quality!=='low'&&!studying;
  nearStars.rotation.set(dragY*.027,dragX*.027,0);
  nearStars.position.set(dragX*.015,dragY*.015,transit*1.8);
  streaks.material.opacity=warp*.75;streaks.visible=!!flight;streaks.position.z=warp*4;streaks.rotation.z=t*.012;
  if(!bridgeProps)bridgeProps=createBridgeScene({scene,camera,invalidate});
  bridgeProps.update({visible:foregroundVisible,moving,delta,index,scrollPixels,bridge:bridgeEnabled&&observation===null,quality});
  document.body.dataset.odysseyTour=String(touring);
  return moving||!!flight;
 }
 return {setActive,update,get shipActive(){return enabled&&shipMode&&!film.active;},shipPointer(type,e){shipyard?.pointer(type,e);},shipZoom(value){shipyard?.zoom(value);},get filmActive(){return film.active;},get filmLook(){return film.look;},get bridgeActive(){return enabled&&foreground&&((bridgeEnabled&&observation===null)||shipMode)&&!film.active;},get bridgeLook(){return shipMode?shipLook:bridgeLook;},dispose(){film.dispose();bridgeProps?.dispose();shipyard?.dispose();document.removeEventListener('space-odyssey-command',command);reduced.removeEventListener('change',reducedChange);root.removeFromParent();root.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return; // Shared sphere geometry belongs to the universe renderer.
    if(o.geometry?.type!=='SphereGeometry')o.geometry?.dispose();for(const m of [].concat(o.material||[]))m.dispose();});ownedTextures.forEach(t=>t.dispose());}};
}
