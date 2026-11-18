import * as THREE from 'three';

export function createShipAtmosphere({root,camera,glowMap}){
 const sky=new THREE.Group();sky.name='wa-deep-space';root.add(sky);
 const haze=new THREE.Mesh(new THREE.PlaneGeometry(145,100),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
  varying vec2 uvv;uniform float time;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
  float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=noise(p)*a;p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return n;}
  void main(){vec2 p=(uvv-.5)*vec2(4.,3.);float lane=exp(-pow((p.y-p.x*.21-.17*sin(p.x*1.8))/.38,2.));float clouds=fbm(p*3.2+vec2(time*.0006,0.));vec3 tint=mix(vec3(.055,.09,.155),vec3(.19,.13,.085),fbm(p*1.2+3.));gl_FragColor=vec4(tint,lane*clouds*.46);}`
 }));haze.name='wa-galactic-dust';haze.position.z=-88;sky.add(haze);
 const positions=[],colors=[];let seed=4681;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<780;i++){positions.push((random()-.5)*125,(random()-.5)*88,-72-random()*12);const light=.24+random()*.7;colors.push(light,light*(.88+random()*.15),light*(.82+random()*.3));}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const stars=new THREE.Points(geometry,new THREE.PointsMaterial({size:.042,vertexColors:true,transparent:true,opacity:.75,depthWrite:false,sizeAttenuation:true}));stars.name='wa-distant-stars';sky.add(stars);
 const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:0xffd3a0,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending}));sun.name='wa-distant-sun';sun.position.set(-9,11,-56);sun.scale.set(5,5,1);sky.add(sun);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(.095,24),new THREE.MeshBasicMaterial({color:new THREE.Color(2.5,2.1,1.6),toneMapped:false,depthWrite:false}));disc.position.copy(sun.position);sky.add(disc);
 const corona=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:0xd5e7ff,transparent:true,opacity:.055,depthWrite:false,blending:THREE.AdditiveBlending}));corona.position.copy(sun.position);corona.scale.set(15,1.2,1);sky.add(corona);
 return{update({time,quality,moving}){sky.position.copy(camera.position).sub(root.position);sky.quaternion.copy(camera.quaternion);sun.position.x=innerWidth<760?5:-9;disc.position.copy(sun.position);corona.position.copy(sun.position);haze.material.uniforms.time.value=time;haze.visible=quality!=='low';stars.material.opacity=quality==='low'?.48:.75;if(moving)stars.rotation.z=Math.sin(time*.003)*.01;}};
}
