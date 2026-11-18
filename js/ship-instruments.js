import * as THREE from 'three';

const definitions=[
 {id:'engine',title:'推进引擎',sub:'PROPULSION',position:[-.72,-.55,-1.58]},
 {id:'power',title:'太阳翼',sub:'POWER ARRAY',position:[0,-.55,-1.58]},
 {id:'radar',title:'航线扫描',sub:'COMMUNICATIONS',position:[.72,-.55,-1.58]},
 {id:'lab',title:'观测载荷',sub:'SCIENCE',position:[-1.36,-.8,-1.58],small:true},
 {id:'bay',title:'探测器舱',sub:'PROBE BAY',position:[1.36,-.8,-1.58],small:true}
];
export function createShipInstruments({group,camera}){
 const panels=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 for(const definition of definitions){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;const context=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
  const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),screen=new THREE.Mesh(new THREE.PlaneGeometry(definition.small?.5:.65,definition.small?.31:.4),material);
  screen.position.set(...definition.position);screen.rotation.x=definition.small?-.45:-.9;screen.name='wa-instrument-'+definition.id;screen.userData.shipPart=definition.id;group.add(screen);
  const housing=new THREE.Mesh(new THREE.BoxGeometry(definition.small?.54:.69,definition.small?.35:.44,.05),new THREE.MeshBasicMaterial({color:0x25343c}));housing.position.copy(screen.position).add(new THREE.Vector3(0,0,-.035).applyEuler(screen.rotation));housing.rotation.copy(screen.rotation);group.add(housing);
  panels.push({...definition,screen,housing,context,texture,last:''});
 }
 return{update({values,selected,hovered,index}){
  const fit=Math.min(1,Math.max(.28,camera.aspect*.88));
  for(const panel of panels){for(const object of [panel.screen,panel.housing]){object.scale.setScalar(fit);object.position.x=panel.position[0]*fit;object.visible=!panel.small||fit>.8;}const value=values[panel.id],percent=Math.round(value*100),key=[percent,selected===panel.id,hovered===panel.id,index].join(':');if(key===panel.last)continue;panel.last=key;
   const c=panel.context,focus=selected===panel.id||hovered===panel.id;c.fillStyle='#06121a';c.fillRect(0,0,512,320);c.strokeStyle=focus?'#cbb58c':'#4c6873';c.lineWidth=focus?5:2;c.strokeRect(4,4,504,312);
   c.fillStyle='#8aa6b1';c.font='18px monospace';c.fillText(panel.sub,25,37);c.fillStyle='#d4dfdd';c.font='29px sans-serif';c.fillText(panel.title,25,82);
   c.strokeStyle='#233e48';c.lineWidth=11;c.beginPath();c.arc(104,176,55,Math.PI*.75,Math.PI*2.25);c.stroke();c.strokeStyle=percent>97?'#a6c7b4':'#b4bdba';c.beginPath();c.arc(104,176,55,Math.PI*.75,Math.PI*(.75+1.5*value));c.stroke();
   c.textAlign='center';c.fillStyle='#d6dccc';c.font='26px monospace';c.fillText(percent+'%',104,185);c.textAlign='left';c.font='25px sans-serif';c.fillText(percent>97?'已就绪':percent<2?'待命':'动作中',202,162);c.font='18px monospace';c.fillStyle='#809aa6';c.fillText('SYS / '+panel.id.toUpperCase(),202,201);
   c.strokeStyle='#304b55';c.lineWidth=1;c.beginPath();c.moveTo(25,259);c.lineTo(487,259);c.stroke();c.font='17px sans-serif';c.fillStyle='#a2b8be';c.fillText('点击操作 · 再次关闭',25,291);c.font='13px monospace';c.fillText('DEMO',436,291);panel.texture.needsUpdate=true;panel.screen.userData.displayValue=percent;
  }
 },pick(e){const rect=document.querySelector('#universe').getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);ray.setFromCamera(pointer,camera);return ray.intersectObjects(panels.filter(p=>p.screen.visible).map(p=>p.screen),false)[0]?.object.userData.shipPart||null;}};
}
