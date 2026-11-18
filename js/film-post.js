import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

export function createFilmPost(renderer,scene,camera){
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.45,.45,.82);composer.addPass(bloom);
 const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0},uWarmth:{value:0},uFade:{value:0},uGrain:{value:.007},uExposure:{value:1.1},uSize:{value:new THREE.Vector2(innerWidth,innerHeight)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
  uniform sampler2D tDiffuse;uniform float uTime,uWarmth,uFade,uGrain,uExposure;uniform vec2 uSize;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  vec3 display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),c));}
  void main(){
   vec2 d=vUv-.5;float edge=dot(d,d);vec2 chroma=d*edge*.0014;
   vec3 c=texture2D(tDiffuse,vUv).rgb;c.r=texture2D(tDiffuse,vUv+chroma).r;c.b=texture2D(tDiffuse,vUv-chroma).b;
   c*=vec3(1.+uWarmth*.8,1.+uWarmth*.12,1.-uWarmth*.7);
   c=display(aces(max(c,vec3(0.))*uExposure));
   float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.04);
   c*=1.-smoothstep(.08,.55,edge)*.22;
   c+=(hash(floor(vUv*uSize)+floor(uTime*24.))-.5)*uGrain;
   c*=1.-uFade;gl_FragColor=vec4(max(c,vec3(0.)),1.);
  }`});grade.material.toneMapped=false;composer.addPass(grade);
 function resize(quality='auto'){
  const ratio=Math.min(devicePixelRatio,quality==='low'?1:quality==='high'?1.75:innerWidth<760?1:1.35);composer.setPixelRatio(ratio);composer.setSize(innerWidth,innerHeight);grade.uniforms.uSize.value.set(innerWidth*ratio,innerHeight*ratio);
  bloom.enabled=quality!=='low';
 }
 resize();
 return {resize,render(delta,look,time){bloom.strength=look.bloom;grade.uniforms.uWarmth.value=look.warmth;grade.uniforms.uFade.value=look.fade;grade.uniforms.uExposure.value=look.exposure;grade.uniforms.uTime.value=time;grade.uniforms.uGrain.value=look.grain;composer.render(delta);},dispose(){bloom.dispose();grade.material.dispose();composer.dispose();}};
}
