import * as THREE from 'three';
import {destinations} from './odyssey-data.js';
import {createFlightState,crossedFlightGate} from './flight-physics.js';

// The three rings change bearing along with the destination. Coordinates are
// in the same world units as the flight model, with negative Z forward.
const routes={
 earth:{gates:[[0,0],[5,2],[-4,-1]],body:[-37,19,29,0]},
 moon:{gates:[[0,0],[-5,1],[4,3]],body:[34,18,27,.12]},
 mars:{gates:[[1,0],[7,-3],[-5,2]],body:[-31,19,34,-.16]},
 jupiter:{gates:[[0,0],[-8,3],[5,0]],body:[35,26,44,-.2]},
 saturn:{gates:[[0,0],[7,2],[-5,4]],body:[-28,28,30,-.36]},
 nebula:{gates:[[-1,0],[-7,-2],[6,4]]},
 blackhole:{gates:[[1,0],[8,4],[-6,1]]},
 deepfield:{gates:[[0,0],[-6,4],[7,-3]]},
};
const depths=[-27,-63,-103];
const aperture=6.3;
const white=new THREE.Color(0xffffff),starlight=new THREE.Color(0xe0edff);
const rocks=[[-15,4,-14,1.5],[16,-6,-34,2],[-13,-7,-45,1.4],[15,7,-58,2.2],[-10,10,-71,1.7],[-17,3,-84,2],[13,-8,-98,1.6],[15,8,-111,2.1]];

export function createFlightField(root){
 const group=new THREE.Group();group.name='wa-flight-range';root.add(group);
 const rimGeometry=new THREE.TorusGeometry(aperture,.12,8,64);
 const glowGeometry=new THREE.TorusGeometry(aperture,.31,6,64);
 const markerGeometry=new THREE.SphereGeometry(.17,8,6);
 const gates=depths.map(z=>{
  const frame=new THREE.Group();frame.position.z=z;group.add(frame);
  const material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false});
  frame.add(new THREE.Mesh(rimGeometry,material));
  const glow=new THREE.Mesh(glowGeometry,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  frame.add(glow);
  for(let i=0;i<12;i++){
   const angle=i*Math.PI/6;
   const marker=new THREE.Mesh(markerGeometry,material);
   marker.position.set(Math.cos(angle)*(aperture+.35),Math.sin(angle)*(aperture+.35),0);
   frame.add(marker);
  }
  return {frame,material,glow,z,x:0,y:0,radius:aperture};
 });
 const rockGeometry=new THREE.IcosahedronGeometry(1,1);
 const rockMaterial=new THREE.MeshStandardMaterial({color:0x69666a,roughness:1});
 const obstacles=rocks.map(([x,y,z,radius],i)=>{
  const mesh=new THREE.Mesh(rockGeometry,rockMaterial);
  mesh.scale.set(radius,radius*.75,radius*1.15);mesh.rotation.set(i*.71,i*.43,i*.28);group.add(mesh);
  return {mesh,x,y,z,radius};
 });
 const dustGeometry=new THREE.BufferGeometry(),positions=[];
 let seed=34513;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<1400;i++)positions.push((random()-.5)*118,(random()-.5)*76,-228+random()*259);
 dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xb9d1e6,size:.14,transparent:true,opacity:.68,depthWrite:false}));
 group.add(dust);
 const previous=new THREE.Vector3();
 const accent=new THREE.Color();
 let gate=0,collisions=0,misses=0,lastCollision=-Infinity,route=routes.moon;

 function highlight(){
  gates.forEach(({frame,material,glow},i)=>{
   frame.visible=i>=gate;
   material.color.copy(accent).lerp(white,i===gate?.35:0);
   material.opacity=i===gate?1:.3;
   glow.material.color.copy(accent);
   glow.material.opacity=i===gate?.28:0;
  });
 }
 function reset(state,index){
  const destination=destinations[index];
  route=routes[destination.id];accent.set(destination.accent);
  gate=collisions=misses=0;lastCollision=-Infinity;
  gates.forEach((g,i)=>{[g.x,g.y]=route.gates[i];g.frame.position.set(g.x,g.y,g.z);});
  obstacles.forEach((o,i)=>{
   const [x,y,z]=rocks[i];
   o.x=x*(index%2?-1:1);
   o.y=y+Math.sin(index+i)*2;
   o.mesh.position.set(o.x,o.y,z);
   o.mesh.visible=index<5&&(index===4||i%2===0);
  });
  rockMaterial.color.copy(accent).lerp(white,index===4?.55:.08).multiplyScalar(.42);
  dust.material.color.copy(accent).lerp(starlight,.65);
  dust.material.opacity=index<5?.68:.26;
  previous.copy(state.position);highlight();
 }
 function update(state,now){
  const {position,velocity}=state;
  const next=gates[gate];
  if(!next)return null;
  if(crossedFlightGate(previous,position,next)){
   gate++;previous.copy(position);highlight();return 'gate';
  }
  if(position.z<=next.z){
   const checkpoint=gates[gate-1];
   const restart=createFlightState();
   if(checkpoint)Object.assign(restart.position,{x:checkpoint.x,y:checkpoint.y,z:checkpoint.z-2});
   Object.assign(state,restart,{active:true,cockpit:state.cockpit});
   misses++;previous.copy(state.position);return 'miss';
  }
  let result=null;
  for(const {mesh,x,y,z,radius} of obstacles){
   if(!mesh.visible)continue;
   if(Math.abs(position.z-z)>radius+1||now-lastCollision<.7)continue;
   if(Math.hypot(position.x-x,(position.y-y)*1.2)>radius+.65)continue;
   lastCollision=now;collisions++;velocity.z*=.48;result='impact';break;
  }
  previous.copy(position);return result;
 }
 return {group,reset,update,get gate(){return gate;},get next(){return gates[gate];},
  get total(){return gates.length;},get complete(){return gate===gates.length;},
  get collisions(){return collisions;},get misses(){return misses;},get composition(){return route.body;}};
}
