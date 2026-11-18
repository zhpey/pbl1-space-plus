import * as THREE from 'three';

// Original procedural props. The probe is fictional; no spacecraft telemetry
// or measured three-dimensional structure is implied by the composition.
export function createFilmProps(){
 let seed=71831;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const group=new THREE.Group();group.name='film-props';group.visible=false;
 const textures=[];
 function canvasTexture(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
 const glow=canvasTexture((c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'#fff');g.addColorStop(.08,'rgba(255,255,255,.9)');g.addColorStop(.22,'rgba(255,255,255,.25)');g.addColorStop(.55,'rgba(255,255,255,.035)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);});
 const sun=new THREE.Group();
 const sunCore=new THREE.Mesh(new THREE.SphereGeometry(.24,24,16),new THREE.MeshBasicMaterial({color:new THREE.Color(5,4.1,2.8),toneMapped:false}));sun.add(sunCore);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:new THREE.Color(1.8,1.3,.75),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(6.5,6.5,1);sun.add(halo);group.add(sun);
 const probe=new THREE.Group();
 const foil=canvasTexture((c,s)=>{c.fillStyle='#b68b32';c.fillRect(0,0,s,s);for(let i=0;i<1500;i++){const v=80+random()*120;c.strokeStyle=`rgba(${v+40},${v+12},${v*.4},.5)`;const x=random()*s,y=random()*s;c.beginPath();c.moveTo(x,y);c.lineTo(x+(random()-.5)*38,y+(random()-.5)*32);c.stroke();}for(let i=0;i<4;i++){c.strokeStyle='#e0bf64';c.strokeRect(i*s/4,0,s/4,s);}});
 const panelMap=canvasTexture((c,s)=>{c.fillStyle='#0c1e35';c.fillRect(0,0,s,s);for(let x=0;x<8;x++)for(let y=0;y<16;y++){const b=33+random()*18;c.fillStyle=`rgb(${b*.36},${b*.8},${b+24})`;c.fillRect(x*32+2,y*16+1,28,13);c.fillStyle='#527b97';c.fillRect(x*32+4,y*16+3,1,10);}c.strokeStyle='#92a1ac';c.lineWidth=4;c.strokeRect(1,1,s-2,s-2);});
 const gold=new THREE.MeshPhongMaterial({map:foil,shininess:42,specular:0xb89851});
 const metal=new THREE.MeshPhongMaterial({color:0x9aa4aa,shininess:80,specular:0xc5d5df});
 const dark=new THREE.MeshPhongMaterial({color:0x24323b,shininess:32});
 function mesh(geo,mat,pos,parent=probe){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);parent.add(m);return m;}
 mesh(new THREE.BoxGeometry(1.1,.85,.85),gold,[0,0,0]);
 const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.13,.88,.88)),new THREE.LineBasicMaterial({color:0xaeb5ac}));probe.add(frame);
 mesh(new THREE.BoxGeometry(.72,.11,.54),dark,[0,.49,0]);
 const profile=Array.from({length:25},(_,i)=>{const r=i/24*.62;return new THREE.Vector2(r,r*r*.58);});
 const dish=mesh(new THREE.LatheGeometry(profile,64),new THREE.MeshPhongMaterial({color:0xdbdcd4,side:THREE.DoubleSide,shininess:75,specular:0xffefd8}),[0,.12,.66]);dish.rotation.x=Math.PI/2;
 const mast=mesh(new THREE.CylinderGeometry(.014,.025,.63,8),metal,[0,.12,.93]);mast.rotation.x=Math.PI/2;mesh(new THREE.SphereGeometry(.045,12,8),gold,[0,.12,1.25]);
 for(const side of [-1,1]){
  const boom=mesh(new THREE.CylinderGeometry(.035,.035,1.65,8),metal,[side*1.16,0,0]);boom.rotation.z=Math.PI/2;
  const wing=mesh(new THREE.BoxGeometry(2.1,1.4,.028),new THREE.MeshPhongMaterial({map:panelMap,shininess:75,specular:0x6fa9c6}),[side*2.27,0,0]);wing.rotation.y=side*.1;
  for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(.025,1.44,.04),metal,[side*(1.25+i*.7),0,.025]);
  const thruster=mesh(new THREE.CylinderGeometry(.10,.17,.24,12),dark,[side*.5,-.44,-.33]);thruster.rotation.x=Math.PI/2;
 }
 const antenna=mesh(new THREE.CylinderGeometry(.009,.016,1.35,6),metal,[.4,.85,-.2]);antenna.rotation.z=-.26;
 mesh(new THREE.BoxGeometry(.38,.34,.25),metal,[-.24,.07,-.55]);probe.scale.setScalar(.45);group.add(probe);
 const ice=new THREE.Group();const rockGeo=new THREE.IcosahedronGeometry(.09,2);const verts=rockGeo.attributes.position;for(let i=0;i<verts.count;i++){const f=.88+.13*Math.sin(verts.getX(i)*35+verts.getY(i)*27)+.08*Math.cos(verts.getZ(i)*41+verts.getX(i)*21);verts.setXYZ(i,verts.getX(i)*f,verts.getY(i)*f,verts.getZ(i)*f);}rockGeo.computeVertexNormals();
 const rockTexture=canvasTexture((c,s)=>{c.fillStyle='#9a9e9f';c.fillRect(0,0,s,s);for(let i=0;i<11000;i++){const v=70+random()*130;c.fillStyle='rgb('+v+','+v+','+v+')';c.fillRect(random()*s,random()*s,1+random()*3,1+random()*3);}});const rockMat=new THREE.MeshPhongMaterial({color:'#e3edf5',map:rockTexture,bumpMap:rockTexture,bumpScale:.011,shininess:21,specular:0x7794a8,emissive:0x0a121c});
 const rocks=new THREE.InstancedMesh(rockGeo,rockMat,1200);const dummy=new THREE.Object3D();
 for(let i=0;i<1200;i++){const a=random()*Math.PI*2,r=3.1+random()*5.9;dummy.position.set(4+Math.cos(a)*r,(random()-.5)*.7,-4+Math.sin(a)*r);dummy.rotation.set(random()*6,random()*6,random()*6);dummy.scale.setScalar(.2+Math.pow(random(),3)*1.6);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);const shade=.66+random()*.34;rocks.setColorAt(i,new THREE.Color().setRGB(shade*.96,shade,shade*1.035));}ice.add(rocks);ice.position.y=1;ice.rotation.z=-.2;group.add(ice);
 const dust=new THREE.Group();for(let i=0;i<38;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:i%3?'#8b552f':'#36648b',transparent:true,opacity:.035+random()*.05,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.position.set((random()-.5)*27,(random()-.5)*16,-3-random()*17);sprite.scale.setScalar(6+random()*13);dust.add(sprite);}group.add(dust);
 const galaxy=new THREE.Group(),pos=[],col=[],sizes=[];const count=innerWidth<760?12000:24000;
 for(let i=0;i<count;i++){
  const r=Math.pow(random(),.72)*5.1,branch=i%4,a=(i%5===0?random()*Math.PI*2:branch*Math.PI/2+r*.9+(random()-.5)*(1.2+r*.24));
  pos.push(Math.cos(a)*r,Math.sin(a)*r,(random()-.5)*(.15+r*.035));const color=new THREE.Color().lerpColors(new THREE.Color('#f2c785'),new THREE.Color('#708bb7'),Math.min(1,r/4.5));color.multiplyScalar(.38+random()*.8);col.push(color.r,color.g,color.b);sizes.push(.5+random()*1.4);
 }
 const galaxyGeo=new THREE.BufferGeometry();galaxyGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));galaxyGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));galaxyGeo.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
 const galaxyMat=new THREE.ShaderMaterial({transparent:true,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uHeight:{value:innerHeight}},vertexShader:'attribute float aSize;uniform float uHeight;varying vec3 vC;void main(){vC=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aSize*uHeight*.032/-p.z,.7,4.5);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vC;void main(){float r=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(vC,exp(-r*r*5.)*(1.-smoothstep(.7,1.,r)));}'});
 const galaxyMap=canvasTexture((c,s)=>{
  const center=s/2;const core=c.createRadialGradient(center,center,0,center,center,s*.20);core.addColorStop(0,'rgba(255,219,155,.9)');core.addColorStop(.2,'rgba(226,171,107,.35)');core.addColorStop(1,'rgba(100,120,160,0)');c.fillStyle=core;c.fillRect(0,0,s,s);
  for(let i=0;i<3200;i++){const r=Math.pow(random(),.7)*s*.45,a=(i%4)*Math.PI/2+r/s*10+(random()-.5)*1.1,x=center+Math.cos(a)*r,y=center+Math.sin(a)*r,rad=3+random()*12;const g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,r<s*.13?'rgba(220,176,121,.035)':'rgba(114,151,202,.025)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);}
 },512);
 const haze=new THREE.Mesh(new THREE.PlaneGeometry(11.7,11.7),new THREE.MeshBasicMaterial({map:galaxyMap,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));haze.position.z=-.09;galaxy.add(haze);
 galaxy.add(new THREE.Points(galaxyGeo,galaxyMat));const core=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:'#dbad6f',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));core.scale.set(3.8,3.8,1);galaxy.add(core);group.add(galaxy);
 const warpPositions=[];for(let i=0;i<260;i++){const a=random()*Math.PI*2,r=1.2+random()*9,z=-random()*25;warpPositions.push(Math.cos(a)*r,Math.sin(a)*r,z,Math.cos(a)*r*1.18,Math.sin(a)*r*1.18,z+2.8);}
 const warpGeo=new THREE.BufferGeometry();warpGeo.setAttribute('position',new THREE.Float32BufferAttribute(warpPositions,3));const warp=new THREE.LineSegments(warpGeo,new THREE.LineBasicMaterial({color:'#9cc8f1',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));group.add(warp);
 return {group,sun,probe,ice,dust,galaxy,warp,update(time){galaxy.rotation.set(.67+Math.sin(time*.02)*.03,-.16,-.42+time*.006);galaxy.position.set(0,.3,-3);galaxyMat.uniforms.uHeight.value=innerHeight;ice.rotation.y=Math.sin(time*.04)*.025;dust.rotation.z=Math.sin(time*.02)*.018;},dispose(){group.removeFromParent();group.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[]))m.dispose();});textures.forEach(t=>t.dispose());}};
}
