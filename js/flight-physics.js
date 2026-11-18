export function createFlightState(){return {position:{x:0,y:0,z:12},velocity:{x:0,y:0,z:0},yaw:0,pitch:0,roll:0,yawRate:0,pitchRate:0,rollRate:0,speed:0,boost:false,nextGate:0,collisions:0,active:false};}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function crossedFlightGate(previous,current,gate){const before=previous.z-gate.z,after=current.z-gate.z;if(before<=0||after>0)return false;const t=before/(before-after||1),x=previous.x+(current.x-previous.x)*t-gate.x,y=previous.y+(current.y-previous.y)*t-gate.y;return Math.hypot(x,y)<gate.radius-.35;}
export function stepFlight(state,input,dt){
 let remain=clamp(Number(dt)||0,0,.12);
 while(remain>1e-8){const h=Math.min(remain,1/120);remain-=h;
  const response=1-Math.exp(-h*4.2),turnRate=.78*(input.boost?1.06:1);
  state.yawRate+=((-input.yaw||0)*turnRate-state.yawRate)*response;
  state.pitchRate+=((input.pitch||0)*turnRate-state.pitchRate)*response;
  state.rollRate+=((input.roll||0)*1.35-state.rollRate)*response;
  state.yaw+=state.yawRate*h;state.pitch=clamp(state.pitch+state.pitchRate*h,-.9,.9);state.roll=clamp(state.roll+state.rollRate*h,-1.3,1.3);
  state.yawRate*=Math.exp(-h*.72);state.pitchRate*=Math.exp(-h*.72);state.rollRate*=Math.exp(-h*1.5);
  const cp=Math.cos(state.pitch),forward={x:-Math.sin(state.yaw)*cp,y:Math.sin(state.pitch),z:-Math.cos(state.yaw)*cp};
  const throttle=input.thrust?1:input.reverse?-.55:0,acceleration=throttle*(input.boost?12:7.5);
  state.velocity.x+=forward.x*acceleration*h;state.velocity.y+=forward.y*acceleration*h;state.velocity.z+=forward.z*acceleration*h;
  const drag=input.brake?Math.exp(-h*3.8):Math.exp(-h*.055);state.velocity.x*=drag;state.velocity.y*=drag;state.velocity.z*=drag;
  const max=input.boost?52:34,speed=Math.hypot(state.velocity.x,state.velocity.y,state.velocity.z);if(speed>max){const f=max/speed;state.velocity.x*=f;state.velocity.y*=f;state.velocity.z*=f;}
  state.position.x=clamp(state.position.x+state.velocity.x*h,-34,34);state.position.y=clamp(state.position.y+state.velocity.y*h,-22,22);state.position.z=clamp(state.position.z+state.velocity.z*h,-180,24);state.speed=Math.hypot(state.velocity.x,state.velocity.y,state.velocity.z);state.boost=!!input.boost;
 }
 return state;
}
