import * as THREE from 'three';

// Original faceted observation module, informed by pressure-window construction.
export function createShipCupola({bridge,canopy,materials,mesh,box}){
 for(const child of canopy.children)if(child.isMesh)child.visible=false;
 const body=new THREE.Group();body.name='wa-observation-cupola';bridge.add(body);body.position.set(0,.13,-.57);
 const glass=new THREE.MeshPhysicalMaterial({color:0x284453,metalness:0,roughness:.25,clearcoat:.12,transparent:true,opacity:.88,side:THREE.DoubleSide,specularIntensity:.22,emissive:0x12252d,emissiveIntensity:.15});
 function beam(parent,a,b,r=.018){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),o=mesh(parent,new THREE.CylinderGeometry(r,r,from.distanceTo(to),8),materials.silver,from.clone().add(to).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());}
 const bottom=[],top=[];for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;bottom.push([Math.cos(a)*.51,.02,Math.sin(a)*.51]);top.push([Math.cos(a)*.34,.37,Math.sin(a)*.34]);}
 for(let i=0;i<6;i++){
  const j=(i+1)%6,points=[bottom[i],bottom[j],top[j],bottom[i],top[j],top[i]],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();
  const window=mesh(body,g,glass);window.name='wa-cupola-window-'+i;beam(body,bottom[i],bottom[j],.026);beam(body,top[i],top[j]);beam(body,bottom[i],top[i],.024);
 }
 const roof=mesh(body,new THREE.CircleGeometry(.34,6),glass,[0,.37,0],[-Math.PI/2,0,Math.PI/6]);roof.name='wa-cupola-zenith';
 mesh(body,new THREE.CylinderGeometry(.52,.55,.13,6),materials.hull,[0,-.045,0],[0,Math.PI/6,0]);
 for(const side of [-1,1]){box(bridge,.08,.1,.23,materials.orange,[side*.49,.08,-.5]);beam(canopy,[side*.36,0,0],[side*.36,.34,-1.03],.025);}
 const cover=mesh(canopy,new THREE.CylinderGeometry(.54,.54,.035,6),new THREE.MeshStandardMaterial({color:0x3a4346,roughness:.98,metalness:.05}),[0,.37,-1.05],[0,Math.PI/6,0]);cover.name='wa-cupola-shutter';
 box(canopy,.26,.016,.05,materials.orange,[0,.395,-1.05]);
 return body;
}
