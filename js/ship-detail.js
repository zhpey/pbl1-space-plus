import * as THREE from 'three';

// Original modular structure: pressure vessels, load paths and service housings.
export function createShipDetail({vessel,modules,materials,mesh,box,tube,ring,shell,instances}){
 const {power,engine,bridge}=modules;
 const body=new THREE.Group();body.name='wa-structural-frame';vessel.add(body);
 function brace(parent,a,b,r=.035){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from),o=mesh(parent,new THREE.CylinderGeometry(r,r,direction.length(),8),materials.silver,from.add(to).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return o;}
 // A raised service spine gives the deck a stepped silhouette and a visible power unit.
 shell(power,[[-.3,-.85],[.3,-.85],[.42,.42],[.24,1],[-.24,1],[-.42,.42]],.34,materials.hull,[0,.82,-.35]);
 const core=mesh(power,new THREE.PlaneGeometry(.26,.83),new THREE.MeshPhysicalMaterial({color:0x153441,emissive:0x50aebc,emissiveIntensity:.12,metalness:.35,roughness:.22,clearcoat:1}),[0,.862,-.35],[-Math.PI/2,0,0]);core.name='wa-power-core';
 const grilles=[];for(let j=0;j<9;j++)grilles.push([0,.874,-.7+j*.087]);instances(power,'wa-core-guards',new THREE.BoxGeometry(.3,.018,.019),materials.dark,grilles);
 const flankVents=[];for(const side of [-1,1])for(let j=0;j<6;j++)flankVents.push([side*.402,.66,-.65+j*.16]);instances(power,'wa-service-vents',new THREE.BoxGeometry(.02,.13,.055),materials.dark,flankVents);
 for(const side of [-1,1]){
  tube(body,.18,.18,2.7,materials.silver,[side*.4,-.56,-.4]);
  for(const z of [-1.48,-.35,.65])ring(body,.19,.025,materials.dark,[side*.4,-.56,z]);
  // External diagonal beams visibly carry each engine instead of floating pods.
  for(const z of [-.25,1.3]){brace(engine,[side*.72,-.14,z],[side*1.38,.16,z+.25],.055);brace(engine,[side*.72,-.38,z+.3],[side*1.38,-.13,z+.25],.035);}
  shell(engine,[[side*1.42,-.8],[side*1.83,-.42],[side*2.02,1.45],[side*1.55,1.8]],.1,materials.dark,[0,.55,0]);
  box(engine,.31,.1,.55,materials.hull,[side*1.71,.65,.28],[.1,0,side*.08]);
  for(let j=0;j<4;j++)box(engine,.23,.012,.035,materials.orange,[side*1.71,.712,.07+j*.11]);
  // Forward sensor recesses and a chamfered fairing around the flight deck.
  tube(bridge,.075,.11,.15,materials.dark,[side*.3,-.03,-1.25]);
  mesh(bridge,new THREE.CircleGeometry(.064,16),materials.glass,[side*.3,-.03,-1.335],[0,Math.PI,0]);
  shell(bridge,[[side*.47,-1.14],[side*.61,-.78],[side*.66,.48],[side*.46,.56]],.14,materials.hull,[0,.03,0]);
  brace(body,[side*.64,-.28,-2.1],[side*.46,-.38,-3.1],.034);
 }
 return{update({time,values,moving}){core.material.emissiveIntensity=.12+values.power*(.78+(moving?Math.sin(time*1.8)*.07:0));}};
}
