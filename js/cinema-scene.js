import * as THREE from 'three';

// An opt-in camera performance. It owns no renderer and never changes routes.
export function createCinemaDirector({camera,bodies,invalidate}) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let performance=null,lastBucket=-1;
  const duration=13;
  const ease=t=>t*t*t*(t*(t*6-15)+10);
  const titles=[
    ['序章 / INTO THE QUIET','在寂静中，听见宇宙。','离开熟悉的尺度，靠近一束遥远的光。'],
    ['01 / THE PALE BLUE DOT','一层薄薄的大气，就是家。','白昼、云影与城市的灯火，分享同一个世界。'],
    ['02 / A DANCE OF GRAVITY','让引力，写下一道弧线。','穿过土星环的光，继续向深处航行。'],
    ['03 / BEYOND THE BLUE','越过深蓝，还有未知。','每一颗星球，都通往一种新的好奇。'],
    ['终章 / YOUR JOURNEY','接下来，由你选择目的地。','五颗主题星球，五个等待探索的世界。'],
  ];
  function emit(active,progress=0,reason='') {
    const phase=Math.min(4,Math.floor(progress*5)),copy=titles[phase];
    document.dispatchEvent(new CustomEvent('space-cinema-update',{detail:{active,progress,phase,title:copy[1],subtitle:copy[2],label:copy[0],reason,duration}}));
  }
  function cancel(reason='cancelled') {
    if(!performance)return false;
    const snapshot=performance.snapshot;
    camera.position.copy(snapshot.position);camera.quaternion.copy(snapshot.quaternion);camera.fov=snapshot.fov;camera.updateProjectionMatrix();
    performance=null;lastBucket=-1;
    delete document.body.dataset.spaceCinema;
    document.body.style.removeProperty('--space-cinema-progress');
    emit(false,reason==='completed'?1:0,reason);invalidate();return true;
  }
  function play() {
    if(reduced.matches){emit(false,0,'reduced-motion');return false;}
    cancel('restarted');
    const position=camera.position.clone(),quaternion=camera.quaternion.clone(),fov=camera.fov;
    const earth=bodies[0].getWorldPosition(new THREE.Vector3()),saturn=bodies[4].getWorldPosition(new THREE.Vector3()),neptune=bodies[3].getWorldPosition(new THREE.Vector3());
    const er=bodies[0].scale.x;
    const overviewLook=new THREE.Vector3(0,0,0);
    const shots=[
      {p:position.clone(),look:overviewLook,fov},
      {p:new THREE.Vector3(.12,.08,10.6),look:overviewLook,fov:40},
      {p:earth.clone().add(new THREE.Vector3(er*.75,er*.23,er*3.05)),look:earth,fov:43},
      {p:saturn.clone().add(new THREE.Vector3(.65,-.68,1.90)),look:saturn,fov:44},
      {p:neptune.clone().add(new THREE.Vector3(-.32,.16,1.7)),look:neptune,fov:42},
      {p:new THREE.Vector3(0,.1,11),look:overviewLook,fov:40},
    ];
    performance={started:globalThis.performance.now(),snapshot:{position,quaternion,fov},shots};
    document.body.dataset.spaceCinema='true';emit(true,0);invalidate();return true;
  }
  function update(delta,{paused=false,dialog=false}={}) {
    if(!performance)return false;
    if(reduced.matches){cancel('reduced-motion');return false;}
    if(dialog){cancel('dialog');return false;}
    if(paused){cancel('paused');return false;}
    const progress=Math.min(1,(globalThis.performance.now()-performance.started)/(duration*1000)),phase=Math.min(4,Math.floor(progress*5)),local=Math.min(1,progress*5-phase),t=ease(Math.min(1,local/.76));
    const a=performance.shots[phase],b=performance.shots[phase+1];
    const arc=new THREE.Vector3(phase%2?-.24:.32,.18,phase===0?.18:.34).multiplyScalar(Math.sin(Math.min(1,local/.76)*Math.PI));
    camera.position.lerpVectors(a.p,b.p,t).add(arc);
    camera.lookAt(new THREE.Vector3().lerpVectors(a.look,b.look,t));
    camera.fov=THREE.MathUtils.lerp(a.fov,b.fov,t)+Math.sin(local*Math.PI)*1.5;camera.updateProjectionMatrix();
    document.body.style.setProperty('--space-cinema-progress',String(progress));
    const bucket=Math.floor(progress*50);
    if(bucket!==lastBucket){lastBucket=bucket;emit(true,progress);}
    if(progress>=1){cancel('completed');return false;}
    return true;
  }
  return {play,cancel,update,get active(){return !!performance;}};
}
