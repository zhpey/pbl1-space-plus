import * as THREE from 'three';

export function configureMoon(planet, relief) {
 const {material}=planet.userData.surface;
 material.bumpMap=relief;
 material.bumpScale=.008;
 material.shininess=1;
 material.specular.setScalar(.005);
}

export function createMarsRim(light) {
 const uniforms={uSun:{value:new THREE.Vector3()},uStrength:{value:1}};
 const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.015,5),new THREE.ShaderMaterial({
  uniforms,transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,
  vertexShader:`varying vec3 vNormal,vRay;void main(){
   vec4 p=modelViewMatrix*vec4(position,1.);
   vNormal=normalize(normalMatrix*normal);vRay=-p.xyz;gl_Position=projectionMatrix*p;
  }`,
  fragmentShader:`varying vec3 vNormal,vRay;uniform vec3 uSun;uniform float uStrength;
   void main(){
    vec3 n=normalize(vNormal);float edge=pow(1.-abs(dot(n,normalize(vRay))),8.);
    float sun=smoothstep(-.14,.64,dot(n,uSun));
    gl_FragColor=vec4(mix(vec3(.34,.53,.8),vec3(1.,.59,.3),sun),edge*sun*.28*uStrength);
   }`
 }));
 mesh.onBeforeRender=(renderer,scene,camera)=>uniforms.uSun.value.copy(light.position).transformDirection(camera.matrixWorldInverse);
 mesh.userData.strength=uniforms.uStrength;
 return mesh;
}

export function createEuropa() {
 const material=new THREE.MeshPhongMaterial({color:0xe0cbb3,shininess:6});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vIce;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvIce=position;');
  shader.fragmentShader='varying vec3 vIce;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 p=normalize(vIce);
   float seamA=abs(sin(dot(p,vec3(17.,7.,9.))+.4*sin(p.z*38.+p.y*14.)));
   float seamB=abs(sin(dot(p,vec3(6.,-18.,7.))+1.2*sin(p.x*12.)));
   float veins=(1.-smoothstep(.015,.145,min(seamA,seamB)))*smoothstep(-.7,.3,p.x+p.y*.23);
   diffuseColor.rgb*=mix(vec3(.92,.96,.98),vec3(.48,.25,.15),veins*.7);
  `);
 };
 return new THREE.Mesh(new THREE.IcosahedronGeometry(1,4),material);
}

// One directional-light umbra. Positions and radii use the same scene units.
export function configureJupiter(planet,light) {
 const uniforms={uMoon:{value:new THREE.Vector3()},uMoonRadius:{value:0},uSun:{value:new THREE.Vector3()},uCloudTime:{value:0}};
 const surface=planet.userData.surface;
 surface.material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec3 vJovePosition;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vJovePosition=(modelMatrix*vec4(position,1.)).xyz;`);
  shader.fragmentShader=`varying vec3 vJovePosition;uniform vec3 uMoon,uSun;uniform float uMoonRadius,uCloudTime;\n`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec2 bandUv=vMapUv;
   bandUv.x+=sin(bandUv.y*107.)*sin(uCloudTime*.19+bandUv.y*19.)*.0019;
   diffuseColor*=texture2D(map,bandUv);
  `).replace('#include <opaque_fragment>',`
   vec3 toMoon=uMoon-vJovePosition;float ahead=dot(toMoon,uSun);
   float distanceToRay=length(toMoon-ahead*uSun);
   float shadow=(1.-smoothstep(uMoonRadius*.74,max(.0001,uMoonRadius),distanceToRay));
   outgoingLight*=1.-.93*shadow*step(.0001,ahead)*step(.0001,uMoonRadius);
   #include <opaque_fragment>
  `);
 };
 surface.onBeforeRender=()=>uniforms.uSun.value.copy(light.position).normalize();
 return uniforms;
}

export function createBlackHole() {
 const uniforms={uTime:{value:0},uTilt:{value:.22},uRing:{value:0}};
 const material=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,uniforms,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 vUv;uniform float uTime,uTilt,uRing;
   float bell(float x){return exp(-x*x);}
   float flow(float r,float a){
    float time=uTime/(1.+r*4.);
    return .71+.14*sin(r*105.-a*4.+time*2.3+1.5*sin(3.*a-r*17.))
             +.09*sin(r*231.+a*13.-time*4.)+.06*sin(r*367.-a*23.+time*3.1);
   }
   void main(){
    vec2 p=(vUv-.5)*2.;p.y*=.82;
    float r=length(p), a=atan(p.y,p.x);
    float width=uTilt;
    vec2 diskP=vec2(p.x,p.y/width);
    float d=length(diskP), da=atan(diskP.y,diskP.x);
    float disk=bell((d-.375)/.233)*smoothstep(.206,.266,d)*(1.-smoothstep(.66,.94,d));
    float front=1.-smoothstep(-.021,.028,p.y);
    float upper=length(vec2(p.x,p.y-.029));
    float inner=.202;
    float crescent=smoothstep(-.023,.101,p.y);
    float arc=(bell((upper-.257)/.028)*.68+bell((upper-.298)/.043)*.24)*crescent*flow(upper,a);
    float under=bell((r-.232)/.012)*(1.-smoothstep(-.17,-.025,p.y))*.36;
    float ring=bell((r-.213)/.0055)*(.83+.1*sin(a*3.));
    float secondary=bell((r-.226)/.004)*.22;
    float lightSide=max(.27,1.+p.x*1.65);
    float occlusion=smoothstep(inner-.004,inner+.004,r);
    float discEnergy=disk*flow(d,da)*mix(.19,1.1,front)*mix(occlusion,1.,front*.83);
    float lensEnergy=(arc+under)*occlusion;
    float ringEnergy=(ring+secondary)*occlusion;
    float halo=bell((r-.263)/.130)*.108+bell((r-.46)/.30)*.026;
    vec3 hot=vec3(1.5,.72,.26), pale=vec3(1.7,1.24,.77), ember=vec3(.88,.21,.041);
    vec3 light=(hot*discEnergy+mix(ember,hot,.56)*lensEnergy)*mix(1.,.24,uRing);
    light+=pale*ringEnergy*(.9+.55*uRing)+ember*halo;
    light*=lightSide;
    float black=1.-occlusion;
    float alpha=clamp(max(black,(discEnergy+lensEnergy)*mix(1.,.30,uRing)+ringEnergy+halo)*1.22,0.,1.);
    gl_FragColor=vec4(light,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(15,12.3),material);
 mesh.userData.clock=uniforms.uTime;
 mesh.userData.tilt=uniforms.uTilt;
 mesh.userData.ring=uniforms.uRing;
 return mesh;
}
