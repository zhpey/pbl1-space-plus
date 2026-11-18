import * as THREE from 'three';

// Original thermal blanket and radiator treatment; no external game textures.
export function createShipThermal({modules,materials,mesh,box,canvasTexture,random}){
 const foil=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#796c46';c.fillRect(0,0,w,h);for(let i=0;i<1300;i++){const x=random()*w,y=random()*h;c.strokeStyle=i%3?'#aa9a6555':'#272c2355';c.lineWidth=.5+random();c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*70-35,y+random()*70-35);c.lineTo(x+random()*45,y+random()*30);c.stroke();}c.strokeStyle='#b6aa7f';c.lineWidth=7;c.strokeRect(7,7,w-14,h-14);});
 const thermal=new THREE.MeshStandardMaterial({map:foil,bumpMap:foil,bumpScale:.008,color:0xd4c696,metalness:.72,roughness:.56});
 for(const side of [-1,1]){
  const quilt=box(modules.power,.018,.25,.82,thermal,[side*.43,.66,-.35]);quilt.name='wa-thermal-blanket-'+side;
  for(const z of [-.64,-.35,-.06])box(modules.power,.023,.28,.018,materials.dark,[side*.445,.66,z]);
 }
 const radiatorMap=canvasTexture(512,256,(c,w,h)=>{c.fillStyle='#222b2d';c.fillRect(0,0,w,h);for(let y=8;y<h;y+=13){c.fillStyle='#737a74';c.fillRect(7,y,w-14,2);c.fillStyle='#0a141b';c.fillRect(7,y+2,w-14,6);}c.strokeStyle='#a2a294';c.lineWidth=5;c.strokeRect(4,4,w-8,h-8);});
 const radiatorMaterial=new THREE.MeshStandardMaterial({map:radiatorMap,color:0xb3b7b2,metalness:.28,roughness:.84});
 for(const side of [-1,1]){const panel=box(modules.engine,.018,.32,1.1,radiatorMaterial,[side*2.16,-.06,.25]);panel.name='wa-radiator-surface-'+side;}
 const stencil=canvasTexture(512,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#c1b38a';c.font='bold 25px monospace';c.fillText('CAUTION / SERVICE ACCESS',20,38);c.fillStyle='#bcbfb1';c.font='17px monospace';c.fillText('WA 01    •    SECURE BEFORE FLIGHT',20,69);for(let i=0;i<20;i++){c.fillStyle=i%2?'#1e292b':'#a89058';c.fillRect(20+i*23,94,23,12);}});
 const decal=new THREE.MeshBasicMaterial({map:stencil,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 mesh(modules.bay,new THREE.PlaneGeometry(.76,.19),decal,[0,.365,.03],[-Math.PI/2,0,0]);
 mesh(modules.engine,new THREE.PlaneGeometry(.8,.2),decal,[1.7,.719,.25],[-Math.PI/2,0,0]);
}
