import * as THREE from 'three';

export function createShipLighting({renderer,root,vessel,mainLight}){
 const studio=new THREE.Scene();studio.background=new THREE.Color(0x101923);
 const panels=[];function panel(size,position,color){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial({color:new THREE.Color(...color),side:THREE.DoubleSide}));m.position.set(...position);studio.add(m);panels.push(m);}
 panel([9,1,5],[-3,8,-4],[2.7,2.6,2.4]);panel([1,8,5],[7,3,-2],[.3,.4,.48]);panel([1,4,6],[-8,2,3],[.25,.28,.32]);
 const generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(studio,.05);generator.dispose();panels.forEach(p=>{p.geometry.dispose();p.material.dispose();});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const sun=new THREE.DirectionalLight(0xffedcf,2.7);sun.name='wa-key-sun';sun.position.set(-5,9,2);sun.castShadow=true;
 sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5.5,right:5.5,top:5.5,bottom:-5.5,near:.5,far:30});sun.shadow.bias=-.0002;sun.shadow.normalBias=.018;root.add(sun);sun.target=vessel;
 vessel.traverse(o=>{if(o.isMesh&&o.material?.isMeshStandardMaterial){o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new THREE.Vector3());o.castShadow=!o.material.transparent&&o.geometry.type!=='TorusGeometry'&&Math.min(size.x,size.y,size.z)>.055&&Math.max(size.x,size.y,size.z)>.38;o.receiveShadow=true;}});
 let applied=false,previousIntensity=3.2;
 return{environment:target.texture,update({quality='auto',index=0,deck=false}){if(!applied){previousIntensity=mainLight.intensity;applied=true;}mainLight.intensity=1.05;sun.castShadow=!deck&&(quality==='high'||(quality==='auto'&&innerWidth>=1100&&devicePixelRatio<=2));sun.intensity=2.2;sun.color.set(index===2?0xffd6ba:index===5?0xe2d6f5:0xfff2df);},hide(){if(applied){mainLight.intensity=previousIntensity;applied=false;}},dispose(){this.hide();sun.shadow.map?.dispose();target.dispose();}};
}
