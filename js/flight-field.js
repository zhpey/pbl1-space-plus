import * as THREE from 'three';
import {planets} from './data.js';
import {crossedFlightGate} from './flight-physics.js';
export const flightGates=[{x:0,y:0,z:-38,radius:6},{x:6,y:2,z:-78,radius:6},{x:-6,y:-1,z:-120,radius:6}];
const rocks=[[-8,3,-20,1.5],[10,-4,-31,2],[-10,-5,-48,1.4],[12,6,-60,2.2],[-1,9,-69,1.7],[-13,4,-91,2],[9,-8,-99,1.6],[12,5,-111,2.1],[0,9,-131,2],[-13,-4,-142,1.5]];
export function createFlightField(root,makePlanet){
 const group=new THREE.Group();group.name='wa-flight-range';root.add(group);
 const ringMaterial=new THREE.MeshBasicMaterial({color:0xa8d5ed,transparent:true,opacity:.62,side:THREE.DoubleSide,depthWrite:false});
 const glowMaterial=new THREE.MeshBasicMaterial({color:0xa6e1ef,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
 flightGates.forEach((g,i)=>{const gate=new THREE.Group();gate.position.set(g.x,g.y,g.z);gate.name=`flight-gate-${i+1}`;const ring=new THREE.Mesh(new THREE.TorusGeometry(g.radius,.12,10,72),ringMaterial);gate.add(ring);const inner=new THREE.Mesh(new THREE.TorusGeometry(g.radius-.6,.035,6,72),glowMaterial);gate.add(inner);const marker=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:0xdac39c}));marker.position.set(g.radius+.4,0,0);gate.add(marker);group.add(gate);});
 const geo=new THREE.IcosahedronGeometry(1,1),rockMat=new THREE.MeshStandardMaterial({color:0x58616a,roughness:1,metalness:.02});
 rocks.forEach(([x,y,z,r],i)=>{const rock=new THREE.Mesh(geo,rockMat);rock.position.set(x,y,z);rock.scale.set(r,r*.75,r*1.15);rock.rotation.set(i*.71,i*.43,i*.28);rock.name=`flight-rock-${i+1}`;group.add(rock);});
 const dustGeometry=new THREE.BufferGeometry(),points=[];let seed=34513;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};for(let i=0;i<950;i++)points.push((rand()-.5)*90,(rand()-.5)*58,-145+rand()*185);dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));group.add(new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xc2d3df,size:.09,transparent:true,opacity:.5,depthWrite:false})));
 const background=makePlanet?.(planets.find(p=>p.id==='earth'));if(background){background.name='flight-range-earth';background.position.set(-39,18,-162);background.scale.setScalar(18);group.add(background);}
 const previous=new THREE.Vector3(),current=new THREE.Vector3();let gate=0,collisions=0,lastCollision=0;
 function reset(s){gate=0;collisions=0;lastCollision=0;previous.set(s.position.x,s.position.y,s.position.z);}
 function update(s,dt,now){current.set(s.position.x,s.position.y,s.position.z);let event=null;
  if(gate<flightGates.length){const g=flightGates[gate];if(crossedFlightGate(previous,current,g)){gate++;event={type:'gate',number:gate};}}
  for(const [i,[x,y,z,r]]of rocks.entries()){if(Math.abs(s.position.z-z)>r+1.4)continue;if(Math.hypot(s.position.x-x,(s.position.y-y)*1.2)<r+.8&&now-lastCollision>.8){lastCollision=now;collisions++;const dx=s.position.x-x,dy=s.position.y-y,d=Math.hypot(dx,dy)||1;s.position.x+=dx/d*(r+1);s.position.y+=dy/d*(r+1);s.velocity.x*=.45;s.velocity.y*=.45;s.velocity.z*=.68;event={type:'impact',rock:i+1};break;}}
  previous.copy(current);return {gate,collisions,event,complete:gate===flightGates.length};}
 return {group,update,reset,get gate(){return gate;},get collisions(){return collisions;}};
}
