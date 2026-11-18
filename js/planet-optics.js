import * as THREE from 'three';

export function createEarthAtmosphere(geometry, planet, light) {
 const uniforms = {
  uCenter: {value: new THREE.Vector3()},
  uRadius: {value: 1},
  uSun: {value: new THREE.Vector3()}
 };
 const atmosphere = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `varying vec3 vWorld;
   void main(){
    vec4 world=modelMatrix*vec4(position,1.);
    vWorld=world.xyz;
    gl_Position=projectionMatrix*viewMatrix*world;
   }`,
  fragmentShader: `varying vec3 vWorld;
   uniform vec3 uCenter, uSun;
   uniform float uRadius;
   void main(){
    // Integrate a thin, exponentially thinning shell along the viewing ray.
    vec3 origin=(vWorld-uCenter)/uRadius;
    vec3 ray=normalize(vWorld-cameraPosition);
    float h=dot(origin,ray);
    float impact2=dot(origin,origin)-h*h;
    float end=-2.*h;
    if(impact2<1.) end=min(end,-h-sqrt(max(0.,1.-impact2)));
    float stepSize=max(0.,end)/8.;
    vec3 inscatter=vec3(0.);
    float scatteringAngle=dot(ray,uSun);
    float phase=.7+.3*scatteringAngle*scatteringAngle;
    for(int i=0;i<8;i++){
     vec3 p=origin+ray*(float(i)+.5)*stepSize;
     float height=max(0.,length(p)-1.);
     float daylight=dot(normalize(p),uSun);
     float horizon=-sqrt(height*1.5);
     float lit=smoothstep(horizon-.036,horizon+.09,daylight);
     float blue=smoothstep(-.06,.29,daylight);
     vec3 tint=mix(vec3(1.,.33,.115),vec3(.09,.43,1.),blue);
     inscatter+=tint*lit*exp(-height*121.)*stepSize;
    }
    gl_FragColor=vec4(inscatter*4.9*phase,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    // Additive blending happens in the current render target's color space.
    gl_FragColor.rgb*=min(1.,length(inscatter)*23.);
   }`
 }));
 atmosphere.name = 'earth-atmospheric-scattering';
 atmosphere.scale.setScalar(1.034);
 atmosphere.renderOrder = 4;
 const worldScale = new THREE.Vector3();
 atmosphere.onBeforeRender = () => {
  planet.getWorldPosition(uniforms.uCenter.value);
  planet.getWorldScale(worldScale);
  uniforms.uRadius.value = worldScale.x;
  uniforms.uSun.value.copy(light.position).normalize();
 };
 return atmosphere;
}

// Radii are in Saturn equatorial radii. Fine banding is illustrative.
const ringProfile = `
 float rangeMask(float r,float lo,float hi,float s){
  return smoothstep(lo-s,lo+s,r)*(1.-smoothstep(hi-s,hi+s,r));
 }
 vec4 ringProfile(float r){
  float c=rangeMask(r,1.24,1.526,.008);
  float b=rangeMask(r,1.526,1.951,.004);
  float cassini=rangeMask(r,1.958,2.024,.004);
  float a=rangeMask(r,2.027,2.269,.003);
  float f=rangeMask(r,2.325,2.331,.002);
  float width=max(fwidth(r),.0003);
  float fine=sin(r*181.)*.06*(1.-smoothstep(.004,.016,width));
  fine+=sin(r*463.+sin(r*79.)*2.)*.047*(1.-smoothstep(.002,.009,width));
  float bands=sin(r*76.+sin(r*21.))*.09+sin(r*137.)*.035+fine;
  float encke=exp(-pow((r-2.218)/max(.0025,width*.45),2.))*min(1.,.009/width);
  float ringlets=pow(.5+.5*sin(r*530.),4.)*(1.-smoothstep(.002,.009,width));
  float density=c*(.22+bands*.45)+b*(.94+bands)+a*(.63+bands)*(1.-.8*encke)
    +cassini*(.045+ringlets*.06)+f*.24;
  vec3 tint=mix(vec3(.58,.49,.36),vec3(.91,.79,.60),b*.61+a*.51);
  tint*=.91+bands*.7;
  return vec4(tint,density);
 }`;

export function addSaturnRings(planet, surface, light) {
 const equator = new THREE.Group();
 equator.rotation.x = .54;
 planet.add(equator);
 equator.add(surface);
 surface.scale.y = .902;
 const uniforms = {
  uCenter: {value: new THREE.Vector3()},
  uRadius: {value: 1},
  uAxis: {value: new THREE.Vector3()},
  uSun: {value: new THREE.Vector3()}
 };
 const worldScale = new THREE.Vector3();
 function syncLighting() {
  equator.updateWorldMatrix(true, false);
  uniforms.uCenter.value.setFromMatrixPosition(equator.matrixWorld);
  worldScale.setFromMatrixScale(equator.matrixWorld);
  uniforms.uRadius.value = worldScale.x;
  uniforms.uAxis.value.set(0,1,0).transformDirection(equator.matrixWorld);
  uniforms.uSun.value.copy(light.position).normalize();
 }
 const ring = new THREE.Mesh(new THREE.RingGeometry(1.22,2.34,256,1), new THREE.ShaderMaterial({
  uniforms,
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  vertexShader: `varying vec3 vWorld;varying vec2 vRing;
   void main(){
    vRing=position.xy;
    vec4 world=modelMatrix*vec4(position,1.);
    vWorld=world.xyz;
    gl_Position=projectionMatrix*viewMatrix*world;
   }`,
  fragmentShader: `varying vec3 vWorld;varying vec2 vRing;
   uniform vec3 uCenter, uSun, uAxis;
   uniform float uRadius;
   ${ringProfile}
   void main(){
    vec4 band=ringProfile(length(vRing));
    vec3 p=(vWorld-uCenter)/uRadius;
    // Ray toward the Sun, with the same polar flattening as the globe.
    vec3 q=p+uAxis*dot(p,uAxis)*.109;
    vec3 sun=normalize(uSun+uAxis*dot(uSun,uAxis)*.109);
    float along=dot(-q,sun);
    float impact=length(q+sun*max(0.,along));
    float eclipse=(1.-smoothstep(.982,1.024,impact))*step(0.,along);
    vec3 view=normalize(cameraPosition-vWorld);
    float incidence=dot(uAxis,uSun), elevation=dot(uAxis,view);
    float illuminated=smoothstep(-.02,.035,incidence*elevation);
    float phase=.83+.17*pow(.5+.5*dot(view,uSun),2.);
    float lit=mix(.33,.81,illuminated)+abs(incidence)*.33;
    float opacity=1.-exp(-band.a*1.8/max(.48,abs(elevation)));
    // Soften the outermost strand when its projected width is subpixel.
    opacity*=1.-.68*smoothstep(2.322,2.332,length(vRing));
    gl_FragColor=vec4(band.rgb*lit*phase*mix(1.,.085,eclipse),opacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 }));
 ring.name = 'saturn-rings';
 ring.rotation.x = -Math.PI/2;
 ring.onBeforeRender = syncLighting;
 equator.add(ring);
 surface.onBeforeRender = syncLighting;
 surface.material.onBeforeCompile = shader => {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = 'varying vec3 vSaturnWorld;\n'+shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vSaturnWorld=(modelMatrix*vec4(transformed,1.)).xyz;`);
  shader.fragmentShader = `varying vec3 vSaturnWorld;
   uniform vec3 uCenter, uSun, uAxis;
   uniform float uRadius;
   ${ringProfile}\n`+shader.fragmentShader.replace('#include <opaque_fragment>',`
   vec3 p=(vSaturnWorld-uCenter)/uRadius;
   float s=dot(uSun,uAxis);
   float crossing=-dot(p,uAxis)/(s<0.?min(-.001,s):max(.001,s));
   float ringShadow=ringProfile(length(p+uSun*max(crossing,0.))).a;
   outgoingLight*=1.-.58*ringShadow*step(.001,crossing);
   #include <opaque_fragment>`);
 };
 surface.material.customProgramCacheKey = () => 'saturn-ring-shadow-v1';
 planet.userData.equator = equator;
}
