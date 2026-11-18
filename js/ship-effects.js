import * as THREE from 'three';

// Small attitude-control nozzles react to actual camera-relative vessel turning.
// All effects share the main scene clock and stop with the animation control.
export function createShipEffects({vessel,engines,materials}){
 const group=new THREE.Group();group.name='wa-attitude-control';engines.add(group);
 const geometry=new THREE.CylinderGeometry(.052,.018,.32,10,1,true),jets=[],nozzleGeometry=new THREE.CylinderGeometry(.052,.043,.09,10);
 const configs=[];
 for(const z of [-2.65,2.4])for(const side of [-1,1]){
  configs.push({position:[side*.86,-.15,z],direction:[side,0,0],axis:'yaw',sign:-side*Math.sign(z)});
  configs.push({position:[side*.54,.43,z],direction:[0,1,0],axis:'pitch',sign:Math.sign(z)});
 }
 const nozzles=new THREE.InstancedMesh(nozzleGeometry,materials.dark,configs.length),transform=new THREE.Object3D();nozzles.name='wa-rcs-nozzles';group.add(nozzles);
 configs.forEach((config,i)=>{
  const direction=new THREE.Vector3(...config.direction),point=new THREE.Vector3(...config.position);
  transform.position.copy(point);transform.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);transform.updateMatrix();nozzles.setMatrixAt(i,transform.matrix);
  const material=new THREE.MeshBasicMaterial({color:0x8ac7e8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const jet=new THREE.Mesh(geometry,material);jet.name='wa-rcs-jet-'+i;jet.position.copy(point).addScaledVector(direction,.19);jet.quaternion.copy(transform.quaternion);group.add(jet);jets.push({jet,...config});
 });
 nozzles.instanceMatrix.needsUpdate=true;
 return{update({time,moving,turnRate,pitchRate,quality}){
  for(const {jet,axis,sign} of jets){const rate=axis==='yaw'?turnRate:pitchRate,strength=moving&&Math.sign(rate)===sign?Math.min(Math.abs(rate)*1.5,1):0;
   jet.visible=strength>.025&&quality!=='low';jet.material.opacity=strength*(.24+Math.sin(time*39)*.045);jet.scale.y=.65+strength*.65;
  }
 }};
}
