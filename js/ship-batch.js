import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Merge only immobile, unnamed armor boxes directly on the hull.
// Articulated modules, picking IDs and diagnostic object names stay intact.
export function batchStaticHull(vessel){
 const groups=new Map();
 for(const object of [...vessel.children]){
  if(!object.isMesh||object.isInstancedMesh||object.name||object.geometry.type!=='BoxGeometry'||object.material.transparent)continue;
  if(!groups.has(object.material))groups.set(object.material,[]);groups.get(object.material).push(object);
 }
 let removed=0;
 for(const [material,objects] of groups){if(objects.length<3)continue;
  const parts=objects.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);}),geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
  if(!geometry)continue;const batch=new THREE.Mesh(geometry,material);batch.name='wa-static-armor-'+material.uuid;vessel.add(batch);objects.forEach(o=>o.removeFromParent());removed+=objects.length-1;
 }
 vessel.userData.batchedDraws=removed;return removed;
}
