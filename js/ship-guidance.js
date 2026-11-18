// Guided preflight uses the scene clock. It never schedules background timers.
export function createShipGuidance({step,state}){
 const systems=['bridge','engine','power','radar','lab','bay'];let running=false,elapsed=0,current=-1;
 function stop(completed=false){if(!running)return;running=false;state({active:false,completed});}
 return{get active(){return running;},start(){running=true;elapsed=0;current=-1;state({active:true,completed:false});},stop,
  update(delta,moving){if(!running)return;if(moving)elapsed+=delta;const next=Math.floor(elapsed/2.4);if(next>=systems.length){stop(true);return;}if(next!==current){current=next;step({id:systems[next],index:next,total:systems.length});}}
 };
}
