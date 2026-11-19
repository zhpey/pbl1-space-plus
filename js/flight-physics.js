const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const approach=(value,target,rate,dt)=>value+(target-value)*(1-Math.exp(-rate*dt));

export function createFlightState(){
 return {position:{x:0,y:0,z:12},velocity:{x:0,y:0,z:0},yaw:0,pitch:0,roll:0,speed:0,active:false};
}

export function crossedFlightGate(previous,current,gate){
 const before=previous.z-gate.z,after=current.z-gate.z;
 if(before<=0||after>0)return false;
 const t=before/(before-after);
 const x=previous.x+(current.x-previous.x)*t-gate.x;
 const y=previous.y+(current.y-previous.y)*t-gate.y;
 return Math.hypot(x,y)<=gate.radius-.35;
}

// Steering moves across the flight corridor. Attitude follows the controls visually,
// so releasing them levels the ship and never leaves thrust pointing off course.
export function assistFlightInput(state,input,gate){
 if(!input.thrust||input.brake||input.yaw||input.pitch||!gate)return input;
 const {position}=state;
 const x=gate.x-position.x,y=gate.y-position.y;
 return {...input,yaw:clamp(x*.36,-1,1),pitch:clamp(y*.36,-1,1)};
}

export function stepFlight(state,input,dt){
 const h=clamp(Number(dt)||0,0,.05);
 const horizontal=input.yaw||0,vertical=input.pitch||0;
 const diagonal=Math.max(1,Math.hypot(horizontal,vertical));
 const steer=input.brake?5:11;
 const cruise=input.boost?42:26;
 const forward=input.thrust&&!input.brake?cruise:0;
 const {position,velocity}=state;
 velocity.x=approach(velocity.x,horizontal*steer/diagonal,horizontal?11:19,h);
 velocity.y=approach(velocity.y,vertical*steer/diagonal,vertical?11:19,h);
 velocity.z=approach(velocity.z,-forward,input.brake?12:input.thrust?2.5:3.3,h);
 if(Math.abs(velocity.z)<.04)velocity.z=0;
 position.x=clamp(position.x+velocity.x*h,-29,29);
 position.y=clamp(position.y+velocity.y*h,-17,17);
 position.z+=velocity.z*h;
 state.yaw=approach(state.yaw,-velocity.x*.021,9,h);
 state.pitch=approach(state.pitch,velocity.y*.023,9,h);
 state.roll=approach(state.roll,-velocity.x*.029+(input.roll||0)*.36,8,h);
 state.speed=Math.hypot(velocity.x,velocity.y,velocity.z);
}
