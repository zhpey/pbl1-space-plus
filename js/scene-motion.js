import * as THREE from 'three';
import { planets } from './data.js';

// Scroll is always native. This group only reads document positions and shares
// the existing renderer, camera, texture cache, and surface geometry.
export function createVoyageScene({scene,camera,makePlanet}) {
  const group = new THREE.Group();
  group.name = 'voyage-showcase';
  group.visible = false;
  scene.add(group);
  const ids = ['earth','mars','venus','neptune','saturn'];
  const bodies = ids.map(id => {
    const body = makePlanet(planets.find(p => p.id === id));
    for(const child of body.children) {
      if(child.material?.uniforms?.uColor)child.scale.setScalar(id==='earth'?1.014:1.025);
    }
    body.userData.voyageTilt = body.rotation.z;
    body.visible = false;
    group.add(body);
    return body;
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let root = null, steps = [], visual = null, progress = 0, intensity = 0, turn = 0;
  let lastChapter = -1, lastProgress = -1, lastPresence = null;
  const clamp = THREE.MathUtils.clamp;
  const smooth = value => {const t=clamp(value,0,1);return t*t*(3-2*t);};
  const result = {progress:0,intensity:0,chapter:0,settling:false};

  function reflect(chapter) {
    const present = intensity > .001;
    if (present !== lastPresence) {
      document.body.dataset.voyageActive = String(present);
      lastPresence = present;
    }
    if (!root) return;
    if (lastChapter !== chapter) {
      document.body.dataset.voyageChapter = String(chapter);
      steps.forEach((step,index) => step.classList.toggle('is-current',index===chapter));
      lastChapter = chapter;
    }
    const rounded = Math.round(progress*1000)/1000;
    if (rounded !== lastProgress) {
      root.style.setProperty('--voyage-progress',String(rounded/4));
      root.dataset.progress = String(rounded/4);
      document.body.dataset.voyageProgress = String(rounded/4);
      lastProgress = rounded;
    }
  }

  function update(delta,{enabled,paused,dialog}) {
    const nextRoot = enabled ? document.querySelector('[data-voyage]') : null;
    if (root !== nextRoot) {
      root = nextRoot;
      steps = root ? [...root.querySelectorAll('.chapter-step[data-chapter]')].sort((a,b)=>Number(a.dataset.chapter)-Number(b.dataset.chapter)) : [];
      visual = root?.querySelector('[data-voyage-visual]');
      lastChapter=-1;lastProgress=-1;
    }
    let targetProgress = progress, targetIntensity = 0;
    if (root && steps.length) {
      const bounds = root.getBoundingClientRect(), anchor=innerHeight*.52;
      if (bounds.top<innerHeight && bounds.bottom>0) {
        targetIntensity = smooth((innerHeight*.9-bounds.top)/(innerHeight*.68))*smooth(bounds.bottom/(innerHeight*.68));
        const centers = steps.map(step=>{const r=step.getBoundingClientRect();return r.top+r.height*.5;});
        targetProgress = 0;
        for(let i=0;i<centers.length-1;i++) {
          if(anchor>=centers[i]) targetProgress = i+clamp((anchor-centers[i])/Math.max(1,centers[i+1]-centers[i]),0,1);
        }
        targetProgress=clamp(targetProgress,0,4);
      }
    }
    if(!enabled){targetIntensity=0;intensity=0;}
    const k=motion.matches?1:1-Math.exp(-delta*9);
    if(!dialog){progress=THREE.MathUtils.lerp(progress,targetProgress,k);intensity=THREE.MathUtils.lerp(intensity,targetIntensity,k);}
    const chapter=clamp(Math.round(progress),0,4);
    result.progress=progress;result.intensity=intensity;result.chapter=chapter;
    result.settling=!dialog&&(Math.abs(progress-targetProgress)>.0005||Math.abs(intensity-targetIntensity)>.0005);
    group.visible=enabled&&intensity>.001;
    reflect(chapter);
    if(!group.visible)return result;
    if(!paused&&!dialog&&!motion.matches)turn+=delta*.04;
    camera.updateMatrixWorld();
    const isMobile=innerWidth<760;
    const r=visual?.getBoundingClientRect();
    const centerX=r?.width?r.left+r.width*.5:innerWidth*(isMobile?.73:.76);
    const centerY=r?.height?r.top+r.height*(isMobile?.46:.49):innerHeight*(isMobile?.36:.50);
    const diameter=r?.width&&r?.height?Math.min(r.width,r.height)*(isMobile?.70:.82):Math.min(innerWidth*(isMobile?.5:.34),innerHeight*.49);
    const planeHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
    const pixelsPerUnit=innerHeight/planeHeight;
    const viewRight=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const viewUp=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const viewForward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    for(let i=0;i<bodies.length;i++) {
      const body=bodies[i],distance=i-progress;
      const blend=motion.matches?(i===chapter?1:0):Math.max(0,Math.cos(clamp(Math.abs(distance),0,1)*Math.PI*.5));
      body.visible=blend*intensity>.001;
      if(!body.visible)continue;
      const drift=motion.matches?0:distance*innerWidth*(isMobile?.16:.18);
      const rise=motion.matches?0:Math.sin(distance*Math.PI*.5)*innerHeight*.08+(1-intensity)*innerHeight*.12;
      const depth=motion.matches?0:Math.abs(distance)*1.4;
      body.position.copy(camera.position).addScaledVector(viewForward,camera.position.z+depth);
      body.position.addScaledVector(viewRight,(centerX-innerWidth*.5+drift)/pixelsPerUnit);
      body.position.addScaledVector(viewUp,(innerHeight*.5-centerY-rise)/pixelsPerUnit);
      const ringFactor=ids[i]==='saturn'?1.75:1;
      body.scale.setScalar(diameter*.5/pixelsPerUnit/ringFactor*Math.pow(blend,isMobile?1.8:1.6)*smooth(intensity));
      body.rotation.z=body.userData.voyageTilt+(motion.matches?0:Math.sin(distance)*.08);
      body.userData.surface.rotation.y=(ids[i]==='earth'?2.8:1.8)+turn+(motion.matches?0:progress*.14);
      if(body.userData.clouds)body.userData.clouds.rotation.y=body.userData.surface.rotation.y+turn*.12;
    }
    return result;
  }

  return {update,dispose(){
    group.visible=false;
    delete document.body.dataset.voyageActive;
    delete document.body.dataset.voyageChapter;
    delete document.body.dataset.voyageProgress;
  }};
}
