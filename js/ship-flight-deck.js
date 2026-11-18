import * as THREE from 'three';
import {createShipInstruments} from './ship-instruments.js';

// A real 3D cabin around the viewing position, sharing the external scene.
export function createShipFlightDeck({root,camera,environment}){
 const group=new THREE.Group();group.name='wa-flight-deck-view';root.add(group);group.visible=false;
 const frame=new THREE.MeshStandardMaterial({color:0x313a3d,metalness:.5,roughness:.76,envMap:environment,envMapIntensity:.35});
 const padding=new THREE.MeshStandardMaterial({color:0x111b20,metalness:.12,roughness:.96,envMap:environment,envMapIntensity:.2});
 const seal=new THREE.MeshBasicMaterial({color:0x080e14});
 const warm=new THREE.MeshBasicMaterial({color:0xc3aa79,toneMapped:false});
 function box(w,h,d,material,position,rotation){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(...position);if(rotation)o.rotation.set(...rotation);group.add(o);return o;}
 function bar(a,b,r=.055,material=frame){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,from.distanceTo(to),10),material);o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());group.add(o);return o;}
 for(const side of [-1,1]){
  bar([side*2.35,-1.25,-2.2],[side*1.65,1.48,-2.6],.12,padding);
  bar([side*.95,-.58,-2.5],[side*.64,1.4,-2.8],.045);
  bar([side*2.2,1.4,-2.7],[side*.64,1.4,-2.8],.08);
  bar([side*2.3,-.68,-2.2],[side*.9,-.68,-2.5],.07);
  box(.035,.9,.025,warm,[side*2.17,.1,-2.25],[0,0,side*.25]);
  box(.66,.7,.15,padding,[side*1.34,-.98,-1.75],[.25,side*.18,0]);
  for(let j=0;j<5;j++)box(.31,.022,.045,frame,[side*1.35,-1.1+j*.065,-1.65]);
 }
 bar([-.64,1.4,-2.8],[.64,1.4,-2.8],.08);
 box(6,.6,.4,padding,[0,1.73,-2.9]);box(6,.15,.3,seal,[0,1.44,-2.9]);
 const console=box(2.35,.68,.3,frame,[0,-.94,-1.8],[.18,0,0]);console.name='wa-deck-console';
 box(2.1,.55,.025,seal,[0,-.88,-1.57],[.18,0,0]);
 const light=new THREE.PointLight(0xffd7a3,.55,5,1);light.position.set(0,.2,-.5);group.add(light);
 const instruments=createShipInstruments({group,camera});
 return{group,pick(e){return group.visible?instruments.pick(e):null;},update({active,lamps,quaternion,values,selected,hovered,index}){group.visible=active;if(!active)return;group.position.copy(camera.position).sub(root.position);group.quaternion.copy(quaternion);light.intensity=lamps?.55:.08;instruments.update({values,selected,hovered,index});}};
}
