import * as THREE from 'three';
import {filmShots,filmDuration} from './film-shots.js';
import {createFilmProps} from './film-props.js';

export function createFilmDirector({root,camera,getStage,onStation,mainLight,invalidate}){
 let active=false,paused=false,ended=false,time=0,shotIndex=-1,props=null,lastNotice=-1;
 const curves=filmShots.map(s=>({position:new THREE.CatmullRomCurve3(s.camera.map(p=>new THREE.Vector3(...p))),target:new THREE.CatmullRomCurve3(s.target.map(p=>new THREE.Vector3(...p)))}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const look={fade:0,warmth:0,exposure:1.1,bloom:.5,grain:.008};
 function notice(force=false,reason){if(!force&&Math.abs(time-lastNotice)<.12)return;lastNotice=time;document.dispatchEvent(new CustomEvent('space-film-update',{detail:{active,paused,ended,time,duration:filmDuration,shotIndex:Math.max(0,shotIndex),reason}}));}
 function ensureProps(){if(!props){props=createFilmProps();root.add(props.group);}return props;}
 function stop(reason='exit'){
  if(!active)return;active=false;paused=false;ended=false;
  if(props)props.group.visible=false;
  for(let i=0;i<8;i++){const s=getStage(i);s.visible=false;s.position.set(0,0,0);s.rotation.set(0,0,0);s.scale.setScalar(1);const bg=s.userData.background;if(bg){bg.material.color.set('#ffffff');bg.rotation.set(0,0,0);}if(s.userData.orbitLine)s.userData.orbitLine.visible=true;}
  camera.up.set(0,1,0);camera.position.set(0,0,10);camera.lookAt(0,0,0);camera.fov=40;camera.updateProjectionMatrix();mainLight.color.set(0xffe9d5);mainLight.intensity=3.2;
  onStation(filmShots[Math.max(0,shotIndex)].station);notice(true,reason);invalidate();
 }
 function play(){
  if(reduced.matches||document.body.dataset.portalRenderer!=='webgl'||document.body.dataset.route!=='universe'){notice(true,reduced.matches?'reduced-motion':'unavailable');return;}
  ensureProps();for(let i=0;i<8;i++)getStage(i).visible=false;
  active=true;paused=false;ended=false;time=0;shotIndex=-1;lastNotice=-1;notice(true);invalidate();
 }
 function command(event){const d=event.detail||{};
  if(d.action==='play')play();
  if(d.action==='exit')stop();
  if(d.action==='pause'&&active){paused=!paused;notice(true);invalidate();}
  if(d.action==='seek'&&active&&Number.isFinite(d.time)){time=THREE.MathUtils.clamp(d.time,0,filmDuration-.01);shotIndex=-1;ended=false;invalidate();}
 }
 document.addEventListener('space-film-command',command);
 function reducedChange(){if(reduced.matches)stop('reduced-motion');}
 reduced.addEventListener('change',reducedChange);
 function update(delta,canRun){
  if(!active)return false;
  if(!paused&&!ended&&canRun)time=Math.min(filmDuration,time+delta);
  if(time>=filmDuration&&!ended){time=filmDuration;ended=true;notice(true);}
  const next=filmShots.findIndex(s=>time<s.end);const n=next===-1?filmShots.length-1:next;
  if(n!==shotIndex){if(shotIndex>=0)getStage(filmShots[shotIndex].station).visible=false;shotIndex=n;onStation(filmShots[n].station);notice(true);}
  const shot=filmShots[n],u=THREE.MathUtils.clamp((time-shot.start)/shot.duration,0,1),ease=u*u*(3-2*u),p=.75*u+.25*ease;
  const stage=getStage(shot.station);stage.visible=shot.kind!=='prologue';stage.position.set(0,0,0);stage.rotation.set(0,0,0);stage.scale.setScalar(1);
  const {scope,dust,marsColor,marsRim,jupiterUniforms}=stage.userData;
  if(scope)scope.visible=false;
  if(dust){dust.visible=true;dust.position.set(Math.sin(time*.14)*.30,0,0);}
  if(jupiterUniforms){jupiterUniforms.uMoonRadius.value=0;jupiterUniforms.uCloudTime.value=time;}
  const planet=stage.userData.planet;const portrait=innerWidth/innerHeight<.85;
  if(planet){
   const poses={limb:[0,-.55,0,3.2],probe:[0,-.25,-.5,3],moon:[0,-4.1,-.3,4.4],mars:[0,-.65,0,3.25],jupiter:[1.8,.15,-1,3.8],saturn:[0,0,0,2.3],ice:[4,1,-4,2.05],home:[0,-.3,0,2.65],prologue:[0,0,0,3]};
   const pose=poses[shot.kind]||poses.home;planet.position.set(...pose.slice(0,3));planet.scale.setScalar(pose[3]);planet.rotation.set(0,0,shot.station===4?-.23:0);
   if(shot.station===4){planet.userData.equator.rotation.set(.54,0,0);planet.rotation.x=shot.kind==='ice'?-.48:.23;}if(shot.kind==='ice')planet.rotation.z=-.08;
   const longitude=shot.station===0?4.1:shot.station===1?4.6:shot.station===2?5.65:1.8;
   planet.userData.surface.rotation.y=longitude+time*(shot.station===3?.019:.012);
   if(marsColor){planet.userData.surface.material.map=marsColor;marsRim.userData.strength.value=1;}
   if(planet.userData.clouds)planet.userData.clouds.rotation.y=4.1+time*.014;
   if(stage.userData.companion){const earth=stage.userData.companion;earth.visible=true;earth.position.set(-1.9+u*.2, .75+u*.4,-6);earth.scale.setScalar(.65);earth.userData.surface.rotation.y=4.4+time*.008;}
   if(stage.userData.foregroundMoon){stage.userData.foregroundMoon.position.set(-2.8+u*.65,-.7+u*.2,3.3);stage.userData.foregroundMoon.scale.setScalar(.36);}
   if(stage.userData.orbitLine)stage.userData.orbitLine.visible=false;
  }
  if(stage.userData.hole){const hole=stage.userData.hole;hole.position.set(0,0,0);hole.scale.setScalar(1.04);hole.rotation.set(0,0,-.08);hole.userData.clock.value=time;hole.userData.tilt.value=.245-u*.065;hole.userData.ring.value=0;}
  if(stage.userData.background){const bg=stage.userData.background;bg.position.set(shot.kind==='galaxy'?0:2,0,shot.kind==='galaxy'?-20:-15);bg.scale.setScalar(shot.kind==='galaxy'?Math.max(3,innerWidth/innerHeight*1.8):Math.max(1.35,innerWidth/innerHeight*.9));bg.rotation.set(0,0,0);bg.material.color.setScalar(shot.kind==='galaxy'?.08:.88);}
  const fx=ensureProps();fx.group.visible=true;fx.probe.visible=shot.kind==='probe';fx.ice.visible=shot.kind==='ice';fx.dust.visible=shot.kind==='nebula';fx.galaxy.visible=shot.kind==='galaxy';fx.sun.visible=['limb','probe','home'].includes(shot.kind);
  fx.sun.position.set(shot.kind==='limb'?10:-7,shot.kind==='limb'?2:3.2,-7);fx.probe.position.set(-2.4+u*1.8,-.6+u*.2,5.5+u*.7);fx.probe.rotation.set(-.17+u*.1,.36+u*.22,-.18-u*.12);fx.probe.scale.setScalar(portrait?.27:.45);fx.update(time);
  fx.warp.visible=shot.cut==='warp'&&u<.12;fx.warp.material.opacity=fx.warp.visible?Math.sin(Math.PI*u/.12)*.65:0;fx.warp.position.z=8+u*15;
  const cam=curves[n].position.getPoint(p),target=curves[n].target.getPoint(p);
  if(portrait){const factor=['limb','mars','moon','jupiter','ice'].includes(shot.kind)?1.2:1.65;cam.sub(target).multiplyScalar(factor).add(target);}
  camera.position.copy(cam);camera.up.set(Math.sin(shot.roll*(.7+u*.3)),Math.cos(shot.roll*(.7+u*.3)),0);camera.lookAt(target);camera.fov=shot.fov;camera.updateProjectionMatrix();
  mainLight.position.set(...shot.light);mainLight.color.set(shot.kind==='mars'?0xffd3b0:shot.kind==='hole'?0xffe5c1:0xffedda);mainLight.intensity=shot.kind==='limb'?3.8:3.1;
  look.fade=shot.cut==='black'?1-THREE.MathUtils.smoothstep(time-shot.start,0,.8):0;
  if(n===0)look.fade=Math.max(look.fade,1-THREE.MathUtils.smoothstep(time,0,1.8));
  look.warmth=shot.warmth;look.exposure=shot.exposure;look.bloom=shot.kind==='hole'?.46:shot.kind==='limb'?.64:.42;
  notice();return !paused&&!ended&&canRun;
 }
 return {update,stop,get active(){return active;},get paused(){return paused;},get look(){return look;},dispose(){stop('dispose');document.removeEventListener('space-film-command',command);reduced.removeEventListener('change',reducedChange);props?.dispose();}};
}
