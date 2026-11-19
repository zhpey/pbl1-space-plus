import {destinations} from './odyssey-data.js';
import {playShipCue} from './ambient.js';

const launchSystems=['engine','power','radar'];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const initialMessage='选择目的地后可亲自驾驶或直接跃迁，也可以逐个查看飞船部件。';

export const shipSystems=[
 {id:'bridge',no:'01',name:'驾驶舱',en:'FLIGHT DECK',action:'接通导航',off:'关闭导航',ready:'导航已接通',description:'接管飞船的航行系统。驾驶舱开启后，选一个目的地，完成动力检查，再执行跃迁。',response:'舱盖开启，导航投影已接通。',article:'pale-blue-dot'},
 {id:'engine',no:'02',name:'推进引擎',en:'PROPULSION',action:'启动引擎',off:'关闭引擎',ready:'引擎已点火',description:'双侧推进器正在待命。启动后可以看到喷流逐渐增强；关闭后，喷流会收束熄灭。',response:'双侧推进器点火，推力正在建立。',article:'touch-the-sun'},
 {id:'radar',no:'03',name:'通信天线',en:'COMMUNICATIONS',action:'扫描航线',off:'停止扫描',ready:'航线已扫描',description:'展开定向天线，扫描下一段航线。你可以转动整艘飞船，观察天线与扫描波的方向。',response:'天线转向，正在进行航线扫描。',article:'beyond-neptune'},
 {id:'power',no:'04',name:'太阳翼',en:'POWER ARRAY',action:'展开太阳翼',off:'收起太阳翼',ready:'太阳翼已展开',description:'展开船体两侧的太阳翼，为导航与推进系统提供任务准备电力。这里是科幻船舶的操作演示。',response:'太阳翼展开，供电系统已就绪。',article:'touch-the-sun'},
 {id:'lab',no:'05',name:'观测载荷',en:'SCIENCE PAYLOAD',action:'开启观测',off:'收回载荷',ready:'观测载荷已开启',description:'打开仪器保护罩、伸出观测镜筒。随后进入档案终端，查看真实影像与科学资料。',response:'保护罩开启，观测镜筒已伸出。',article:'stellar-nursery'},
 {id:'bay',no:'06',name:'探测器舱',en:'PROBE BAY',action:'释放探测器',off:'召回探测器',ready:'探测器已释放',description:'滑开尾部舱门，释放一架探测器。再次操作会召回探测器并关闭舱门。',response:'舱门开启，探测器正在离船。',article:'beyond-neptune'}
];
const active=Object.fromEntries(shipSystems.map(s=>[s.id,false])),inspected=new Set();
let selected=null,view='scene',inspection=false,lamps=true,orbit=false,deck=false,guided=false,motion=null,warping=false,piloting=false,flightCockpit=false,message=initialMessage,targetIndex=1;
const cmd=(action,extra={})=>document.dispatchEvent(new CustomEvent('space-ship-command',{detail:{action,...extra}}));
export function renderShipboard(){return `<div class="ship-mode-switch" role="group" aria-label="首页视图"><button data-flight-view="ship" aria-pressed="${view==='ship'}">飞船操作</button><button data-flight-view="scene" aria-pressed="${view==='scene'}">宇宙观景</button></div>
 <div class="shipboard" aria-label="远行者号飞船操作台">
  <header class="ship-heading"><span>WA—01 / EXPLORATION VESSEL</span><h1>远行者号</h1><p>检查飞船系统，选择你要探索的站点。</p></header>
  <div class="ship-orbit-label"><span>任务区域</span><b data-ship-location>地球轨道</b><small>艺术化操作演示 · 非真实飞行模拟</small></div>
  <nav class="ship-system-menu" aria-label="飞船部件">${shipSystems.map(s=>`<button data-ship-select="${s.id}" aria-pressed="false"><span>${s.no}</span><b>${s.name}</b><small data-ship-menu-state="${s.id}">待检查</small></button>`).join('')}</nav>
  <div class="ship-scene-viewport" aria-hidden="true"></div>
  <div class="ship-feedback" data-ship-feedback>点击船体部件启动，再点一次收回或关闭。</div>
  <div class="ship-hotspots" aria-label="三维部件定位"><svg class="ship-leaders" aria-hidden="true">${shipSystems.map(s=>`<path data-ship-leader="${s.id}"/><circle data-ship-pin="${s.id}" r="2"/>`).join('')}</svg>${shipSystems.map(s=>`<button data-ship-anchor="${s.id}" data-ship-select="${s.id}" aria-label="操作${s.name}" title="${s.action}；再次点击关闭" style="visibility:hidden"><i></i><span>${s.no}<b>${s.name}</b></span></button>`).join('')}</div>
  <div class="ship-fallback-model"><svg viewBox="0 0 600 420" role="img" aria-label="飞船二维操作视图"><defs><linearGradient id="shipmetal"><stop stop-color="#57616a"/><stop offset=".4" stop-color="#d7d2c2"/><stop offset="1" stop-color="#323d44"/></linearGradient></defs><g fill="url(#shipmetal)" stroke="#121c24" stroke-width="3"><path d="M300 46 345 130 345 310 255 310 255 130Z"/><g data-ship-select="engine"><rect x="156" y="186" width="64" height="169" rx="23"/><rect x="380" y="186" width="64" height="169" rx="23"/><path d="M220 220H255V280H220ZM345 220H380V280H345Z"/></g><path data-ship-select="bridge" d="M275 135H325L333 182H267Z" fill="#61979b"/><g data-ship-select="power" fill="#364c64"><path d="M67 176H154V285H67ZM446 176H533V285H446Z"/><path d="M80 196H140M80 219H140M80 242H140M80 264H140M459 196H519M459 219H519M459 242H519M459 264H519" stroke="#b4a77b" stroke-width="1"/></g><g data-ship-select="radar"><path d="M302 245V196M270 211Q302 246 334 211Z" fill="#c8b89a"/></g><rect data-ship-select="lab" x="243" y="199" width="31" height="56" rx="9"/><path data-ship-select="bay" d="M278 287H322V330H278Z" fill="#3e4b54"/></g></svg><p>当前设备使用二维操作视图；部件功能仍可使用。</p></div>
  <aside class="ship-inspector" aria-labelledby="ship-inspector-title"><div class="ship-inspector-top"><span data-ship-panel-kicker>PRE-FLIGHT / 启航检查</span><button data-ship-overview>总览</button></div><h2 id="ship-inspector-title">飞船等待你的指令。</h2><p data-ship-description>点击模型上的部件，或使用左侧部件清单。每个部件都有独立动作。</p><div class="ship-part-actions"><button data-ship-toggle hidden></button><button data-ship-inspect aria-pressed="false" hidden>近看部件</button><button data-ship-read hidden>查阅相关档案</button></div><div class="ship-inspect-angles" role="group" aria-label="部件观察角度" hidden><button data-ship-angle="default" aria-pressed="true">斜视</button><button data-ship-angle="side" aria-pressed="false">侧面</button><button data-ship-angle="aft" aria-pressed="false">后方</button><button data-ship-angle="top" aria-pressed="false">上方</button></div><div class="ship-motion" hidden><span data-ship-motion-label>机构待命</span><progress data-ship-motion max="1" value="0" aria-label="部件动作进度"></progress></div><div class="ship-navigation"><label for="ship-destination">下一站</label><select id="ship-destination" aria-label="跃迁目的地">${destinations.map((d,i)=>`<option value="${i}"${i===targetIndex?' selected':''}>${d.name}</option>`).join('')}</select></div><div class="ship-preflight"><div><span>动力</span><b data-ship-check="engine">待命</b></div><div><span>供电</span><b data-ship-check="power">待命</b></div><div><span>航线</span><b data-ship-check="radar">待命</b></div></div><button class="ship-launch" data-ship-launch disabled>直接跃迁</button><button class="ship-arrival-file" data-ship-arrival-file hidden></button></aside>
  <div class="ship-task-log" role="status" aria-live="polite"><span>航行记录</span><p data-ship-log>${message}</p></div>
  <div class="ship-view-tools"><button data-ship-reset>复位视角</button><button data-ship-orbit aria-pressed="false" title="环绕展示；拖动模型可接管镜头，快捷键 O">环绕展示</button><button data-ship-guided aria-pressed="false" title="逐个开启并近看六个系统，随时选择部件可接管">自动巡检</button><button data-ship-deck aria-pressed="false" title="进入驾驶席，快捷键 V">进入驾驶席</button><button data-ship-start-flight title="进入三维飞行航道">亲自驾驶</button><button data-ship-lighting aria-pressed="true">关闭舷灯</button><span>拖动旋转 · Shift 滚轮缩放 · 1—6 操作部件</span></div>
  <section class="exp-flight-ui" tabindex="-1" data-exp-flight-ui aria-label="飞船驾驶" hidden>
   <div class="exp-flight-readout">
    <label for="flight-destination">目的地</label>
    <select id="flight-destination" data-flight-destination>${destinations.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('')}</select>
    <div class="exp-flight-metrics"><span><b data-flight-speed>0.0</b> m/s</span><b data-flight-gates>航标 0 / 3</b></div>
    <p data-flight-guidance>正在定位航标</p>
    <p data-flight-message role="status">按住推进，朝发光航标飞行。</p>
    <button data-flight-depart hidden>抵达目的地</button>
   </div>
   <div class="exp-flight-actions" aria-label="驾驶设置">
    <button data-flight-pause data-action="pause">暂停</button>
    <button data-flight-camera>驾驶席</button>
    <button data-flight-reset>重飞</button>
    <button data-flight-exit>退出驾驶</button>
   </div>
   <div class="exp-flight-pad" aria-label="触屏飞行操作">
    <div class="exp-flight-directions">
     <button data-flight-hold="pitch:1" aria-label="向上移动">↑</button>
     <button data-flight-hold="yaw:-1" aria-label="向左移动">←</button>
     <button data-flight-hold="pitch:-1" aria-label="向下移动">↓</button>
     <button data-flight-hold="yaw:1" aria-label="向右移动">→</button>
    </div>
    <div class="exp-flight-throttle">
     <button data-flight-hold="thrust:1">推进</button>
     <button data-flight-hold="brake:1">制动</button>
    </div>
   </div>
   <p class="exp-flight-keys">W 推进 · S / 空格制动 · 方向键移动 · Shift 增压 · Esc 退出</p>
  </section>
  <div class="ship-deck-ui"><header><span>WAYFARER / FLIGHT DECK</span><b>驾驶席</b><button data-ship-exit-deck>返回船外 · V</button></header><p>拖动环顾 · 点击仪表操作系统 · Esc 返回船外</p><div class="ship-deck-route"><label>下一站<select data-ship-deck-destination aria-label="驾驶席跃迁目的地">${destinations.map((d,i)=>`<option value="${i}"${i===targetIndex?' selected':''}>${d.name}</option>`).join('')}</select></label><button data-ship-deck-launch disabled>等待系统就绪</button><small data-ship-region-kind></small><button class="ship-arrival-file" data-ship-arrival-file hidden></button></div><nav aria-label="驾驶席系统">${shipSystems.map(s=>`<button data-ship-select="${s.id}" aria-pressed="false"><small>${s.no}</small>${s.name}</button>`).join('')}</nav></div>
  <footer class="ship-command-bar"><span><b data-ship-progress>0 / 6</b> 部件已检查</span><div><button data-od-film-start>播放远航电影</button><button data-ship-library>档案终端</button><button data-od-jump="od-worlds">任务分区</button><button data-ship-pause>暂停动画</button><label class="ship-quality">画质<select data-ship-quality aria-label="飞船场景画质"><option value="auto">自动</option><option value="high">精细</option><option value="low">流畅</option></select></label></div><small>WAYFARER / OPERATIONS</small></footer>
  <div class="ship-warp-overlay" aria-hidden="true"><span data-ship-warp-phase>航线锁定</span><b data-ship-warp-target>月球静海</b><i></i><small>WAYFARER / TRANSIT IN PROGRESS</small></div>
 </div>`;}

export function setupShipboardExperience(){
 const body=document.body;
 const inHome=()=>body.dataset.route==='universe';
 const inShip=()=>inHome()&&view==='ship';
 function prepareFlight(){for(const id of launchSystems)active[id]=true;}
 const rendererReady=()=>body.dataset.portalRenderer==='webgl'&&!reducedMotion.matches;
 const setSceneMode=enabled=>document.dispatchEvent(new CustomEvent('space-odyssey-command',{detail:{action:'ship-mode',enabled}}));
 const flightCommand=(action,extra={})=>document.dispatchEvent(new CustomEvent('space-flight-command',{detail:{action,...extra}}));
 let arrivedAt=null,flightStatus=null,pendingFlight=false;

 function sceneState(extra={}){if(!inShip())return;cmd('state',{selected,inspection,lamps,deck,guided,active:{...active},...extra});}
 function revealShip(){const stage=document.querySelector('.ship-scene-viewport'),rect=stage?.getBoundingClientRect();if(rect&&(rect.top<80||rect.bottom>innerHeight-80))stage.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 function feedback(text){const el=document.querySelector('[data-ship-feedback]');if(!el)return;el.textContent=text;el.classList.remove('is-feedback');void el.offsetWidth;el.classList.add('is-feedback');}
 function renderMotion(){const row=document.querySelector('.ship-motion');if(!row)return;row.hidden=!selected;if(!selected)return;const live=motion?.id===selected&&motion.active===active[selected]?motion:null,fallback=document.body.dataset.portalRenderer==='fallback';row.querySelector('progress').value=live?live.value:active[selected]?fallback?1:0:1;row.querySelector('span').textContent=live?(live.moving?(live.active?'开启中':'关闭中'):(live.active?'已开启':'已关闭')):fallback?(active[selected]?'已开启':'已关闭'):'等待机构响应';}
 function reflect(){
  if(!inHome())return;
  const panel=document.querySelector('.shipboard');
  if(panel)panel.hidden=!inShip();
  document.body.dataset.shipSelected=selected||'overview';
  document.body.dataset.shipPerspective=deck?'deck':'external';document.querySelector('button[data-ship-deck]')?.setAttribute('aria-pressed',String(deck));
  const angles=document.querySelector('.ship-inspect-angles');if(angles)angles.hidden=!inspection;
  const guideButton=document.querySelector('button[data-ship-guided]');if(guideButton){guideButton.setAttribute('aria-pressed',String(guided));guideButton.textContent=guided?'停止巡检':'自动巡检';guideButton.disabled=matchMedia('(prefers-reduced-motion: reduce)').matches;}
  document.body.dataset.shipOrbiting=String(orbit);const orbitButton=document.querySelector('button[data-ship-orbit]');if(orbitButton){orbitButton.setAttribute('aria-pressed',String(orbit));orbitButton.textContent=orbit?'停止环绕':'环绕展示';orbitButton.disabled=matchMedia('(prefers-reduced-motion: reduce)').matches;}
  document.body.dataset.flightMode=view;document.body.dataset.piloting=String(piloting);document.body.dataset.shipWarp=String(warping);document.body.dataset.shipInspection=String(inspection);const flightUI=document.querySelector('[data-exp-flight-ui]');if(flightUI)flightUI.hidden=!piloting;const inspect=document.querySelector('[data-ship-inspect]');if(inspect){inspect.hidden=!selected;inspect.textContent=inspection?'返回全船':'近看部件';inspect.setAttribute('aria-pressed',String(inspection));}const reset=document.querySelector('[data-ship-reset]');if(reset)reset.textContent=inspection?'返回全船':'复位视角';const lampButton=document.querySelector('[data-ship-lighting]');if(lampButton){lampButton.textContent=lamps?'关闭舷灯':'开启舷灯';lampButton.setAttribute('aria-pressed',String(lamps));}renderMotion();
  document.querySelectorAll('[data-flight-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flightView===view)));
  document.querySelectorAll('[data-ship-select]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.shipSelect===selected));b.dataset.powered=String(!!active[b.dataset.shipSelect]);});
  document.querySelectorAll('[data-ship-menu-state]').forEach(e=>e.textContent=active[e.dataset.shipMenuState]?'已启动':inspected.has(e.dataset.shipMenuState)?'已检查':'待检查');
  const system=shipSystems.find(s=>s.id===selected),title=document.querySelector('#ship-inspector-title'),toggle=document.querySelector('[data-ship-toggle]'),read=document.querySelector('[data-ship-read]');
  if(!title)return;title.textContent=system?system.name:'飞船等待你的指令。';document.querySelector('[data-ship-panel-kicker]').textContent=system?system.no+' / '+system.en:'PRE-FLIGHT / 启航检查';document.querySelector('[data-ship-description]').textContent=system?system.description:'点击模型上的部件，或使用左侧部件清单。每个部件都有独立动作。';
  toggle.hidden=read.hidden=!system;if(system){toggle.textContent=active[selected]?system.off:system.action;toggle.setAttribute('aria-pressed',String(active[selected]));}
  const destinationInput=document.querySelector('#ship-destination');
  destinationInput.value=String(targetIndex);destinationInput.disabled=warping;
  for(const id of launchSystems){const el=document.querySelector(`[data-ship-check="${id}"]`);el.textContent=active[id]?'就绪':'待命';el.dataset.ready=String(active[id]);}
  const go=!warping&&!piloting;
  const launch=document.querySelector('[data-ship-launch]');
  launch.disabled=!go;
  launch.textContent=warping?'跃迁中…':'直接跃迁至 '+destinations[targetIndex].name;
  const deckLaunch=document.querySelector('[data-ship-deck-launch]');
  deckLaunch.disabled=!go;
  deckLaunch.textContent=warping?'跃迁中…':go?'执行跃迁':launch.textContent;
  const deckDestination=document.querySelector('[data-ship-deck-destination]');
  deckDestination.value=String(targetIndex);deckDestination.disabled=warping;
  const region=document.querySelector('[data-ship-region-kind]');
  region.textContent=warping?'航线已锁定':arrivedAt===null?'跃迁前自动准备动力、供电和航线系统':'已抵达 '+destinations[arrivedAt].name;
  document.querySelectorAll('[data-ship-arrival-file]').forEach(button=>{
   button.hidden=arrivedAt===null||warping;
   button.textContent=arrivedAt===null?'':'查阅'+destinations[arrivedAt].name+'档案 ↗';
  });
  document.querySelector('[data-ship-progress]').textContent=inspected.size+' / 6';
  document.querySelector('[data-ship-log]').textContent=message;
  document.querySelector('[data-ship-warp-target]').textContent=destinations[targetIndex].name;
  document.querySelector('[data-ship-pause]').textContent=body.dataset.paused==='true'?'继续动画':'暂停动画';
  document.querySelector('[data-flight-pause]').textContent=body.dataset.paused==='true'?'继续':'暂停';
  const startFlight=document.querySelector('[data-ship-start-flight]');
  startFlight.disabled=warping||pendingFlight;
  startFlight.textContent=pendingFlight?'正在加载…':'亲自驾驶';
  startFlight.title=rendererReady()?'自动完成启航准备并进入航道':'可在操作台选择目的地并直接跃迁';
  document.querySelector('[data-flight-destination]').value=String(targetIndex);
  flightUI?.style.setProperty('--flight-accent',destinations[targetIndex].accent);
  document.querySelector('[data-flight-camera]').textContent=flightCockpit?'船外视角':'驾驶席';
  renderFlightStatus();
  document.querySelector('[data-ship-quality]').value=document.querySelector('[data-od-quality]')?.value||'auto';
  document.querySelector('[data-ship-location]').textContent=destinations.find(d=>d.id===document.body.dataset.odysseyStation)?.name||destinations[0].name;
 }
 function select(id,fromGuide=false){if(!inShip()||warping||piloting)return;const part=shipSystems.find(s=>s.id===id);if(!part)return;if(guided&&!fromGuide)cmd('guided',{active:false});active[id]=fromGuide?true:selected===id?!active[id]:true;selected=id;if(fromGuide)inspection=true;inspected.add(id);message=active[id]?part.response:part.name+'已关闭，再次点击可启动。';reflect();sceneState({guided:fromGuide});feedback(message);playShipCue(id,active[id]);}
 const flightKeys={w:'thrust:1',s:'brake:1',' ':'brake:1',a:'yaw:-1',d:'yaw:1',arrowleft:'yaw:-1',arrowright:'yaw:1',arrowup:'pitch:1',arrowdown:'pitch:-1',q:'roll:-1',e:'roll:1',shift:'boost:1'};
 const keyHolds=new Map(),pointerHolds=new Map();
 function sendInput(){
  const input={thrust:false,brake:false,boost:false,yaw:0,pitch:0,roll:0};
  const pointerInputs=Array.from(pointerHolds.values(),button=>button.dataset.flightHold);
  for(const spec of [...keyHolds.values(),...pointerInputs]){
   const [axis,value]=spec.split(':');
   if(typeof input[axis]==='boolean')input[axis]=true;
   else input[axis]+=Number(value);
  }
  for(const axis of ['yaw','pitch','roll'])input[axis]=Math.sign(input[axis]);
  document.dispatchEvent(new CustomEvent('space-flight-input',{detail:input}));
 }
 function clearInput(){
  if(!keyHolds.size&&!pointerHolds.size)return;
  keyHolds.clear();
  for(const [id,button] of pointerHolds){
   delete button.dataset.held;
   if(button.hasPointerCapture(id))button.releasePointerCapture(id);
  }
  pointerHolds.clear();
  sendInput();
 }
 function clearTransit(){
  body.style.removeProperty('--ship-transit');
  body.style.removeProperty('--ship-surge');
  const phase=document.querySelector('[data-ship-warp-phase]');
  if(phase)phase.textContent='航线锁定';
 }
 function leaveShip(){
  view='scene';pendingFlight=false;
  stopFlight();
  selected=null;inspection=false;deck=false;guided=false;orbit=false;motion=null;warping=false;
  lamps=true;arrivedAt=null;
  for(const id of Object.keys(active))active[id]=false;
  message=initialMessage;
  clearTransit();
  const feedbackLabel=document.querySelector('[data-ship-feedback]');
  if(feedbackLabel){feedbackLabel.textContent=initialMessage;feedbackLabel.classList.remove('is-feedback');}
  for(const el of document.querySelectorAll('[data-hovered]')){
   if(el.closest('.shipboard'))delete el.dataset.hovered;
  }
  document.querySelectorAll('[data-ship-angle]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shipAngle==='default')));
  for(const key of ['flightMode','piloting','shipPerspective','shipSelected','shipOrbiting','shipWarp','shipInspection'])delete body.dataset[key];
  setSceneMode(false);
  reflect();
 }
 function mode(value){
  if(value==='scene'){leaveShip();return;}
  if(!inHome()||inShip())return;
  view='ship';
  reflect();
  setSceneMode(true);
  sceneState();
 }
 function startFlight(fromHome=false){
  if(!inHome()||piloting||warping)return;
  if(fromHome&&!inShip()){
   const index=destinations.findIndex(d=>d.id===body.dataset.odysseyStation);
   if(index>0)targetIndex=index;
  }
  mode('ship');
  if(!rendererReady()){
   pendingFlight=body.dataset.portalRenderer==='loading'&&!reducedMotion.matches;
   message=pendingFlight?'三维场景加载完成后将进入驾驶。':'当前设置无法进入三维驾驶，可以选站并直接跃迁。';
   reflect();feedback(message);return;
  }
  pendingFlight=false;
  if(body.dataset.paused==='true')document.querySelector('[data-ship-pause]')?.click();
  if(guided)cmd('guided',{active:false});
  cmd('reset');prepareFlight();
  message='启航准备已完成。';
  deck=false;selected=null;inspection=false;flightCockpit=false;piloting=true;flightStatus=null;
  reflect();sceneState();flightCommand('start',{index:targetIndex});
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('[data-exp-flight-ui]')?.focus({preventScroll:true});
 }
 function exitFlight(){
  if(flightStatus?.complete)message='航道已通过，可以选择下一站。';
  stopFlight();reflect();document.querySelector('[data-ship-start-flight]')?.focus({preventScroll:true});
 }
 function stopFlight(){
  clearInput();
  if(!piloting)return;
  piloting=false;flightCockpit=false;flightStatus=null;
  flightCommand('stop');
 }
 function renderFlightStatus(){
  const ui=document.querySelector('[data-exp-flight-ui]');
  if(!ui)return;
  const d=flightStatus;
  ui.querySelector('[data-flight-speed]').textContent=Number(d?.speed??0).toFixed(1);
  ui.querySelector('[data-flight-gates]').textContent=`航标 ${d?.gate??0} / ${d?.total??3}`;
  const offset=d?.offset;
  const correction=[];
  if(offset){
   if(Math.abs(offset.x)>2.5)correction.push(offset.x>0?'右':'左');
   if(Math.abs(offset.y)>2.5)correction.push(offset.y>0?'上':'下');
  }
  ui.querySelector('[data-flight-guidance]').textContent=d?.complete?'已通过全部航标':offset?`航标距 ${d.distance} m · ${correction.length?'向'+correction.join('')+'调整':'保持当前航线'}`:'正在定位航标';
  const status=ui.querySelector('[data-flight-message]');
  const text=d?.message??'按住 W 或「推进」，朝发光航标飞行。';
  if(status.textContent!==text)status.textContent=text;
  const depart=ui.querySelector('[data-flight-depart]');
  depart.hidden=!d?.complete;
  depart.textContent='抵达'+destinations[targetIndex].name;
  depart.disabled=body.dataset.paused==='true';
 }
 const acceptsInput=()=>inShip()&&piloting&&body.dataset.paused!=='true'&&body.dataset.spaceFilm!=='true'&&!document.querySelector('dialog[open]');
 function resetFlight(){clearInput();flightStatus=null;renderFlightStatus();flightCommand('reset',{index:targetIndex});}
 document.addEventListener('pointerdown',e=>{
  const button=e.target.closest('[data-flight-hold]');
  if(!button||e.button!==0||!acceptsInput())return;
  e.preventDefault();
  button.setPointerCapture(e.pointerId);
  pointerHolds.set(e.pointerId,button);
  button.dataset.held='true';
  sendInput();
 });
 function releasePointer(e){
  const button=pointerHolds.get(e.pointerId);
  if(!button)return;
  pointerHolds.delete(e.pointerId);
  if(![...pointerHolds.values()].includes(button))delete button.dataset.held;
  sendInput();
 }
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,releasePointer);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&inShip()&&piloting&&!document.querySelector('dialog[open]')&&!e.target.closest('select')){e.preventDefault();exitFlight();return;}
  if(!acceptsInput()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea,[contenteditable=true]'))return;
  const spec=flightKeys[e.key.toLowerCase()];
  if(e.key===' '&&e.target.closest('button:not([data-flight-hold])'))return;
  if(!spec&&e.key!=='Backspace')return;
  e.preventDefault();
  if(e.repeat)return;
  if(e.key==='Backspace')resetFlight();
  else{keyHolds.set(e.code||e.key.toLowerCase(),spec);sendInput();}
 });
 document.addEventListener('keyup',e=>{if(keyHolds.delete(e.code||e.key.toLowerCase()))sendInput();});
 addEventListener('blur',clearInput);
 addEventListener('pagehide',()=>{if(inShip())leaveShip();});
 addEventListener('scroll',()=>{
  if(!inShip())return;
  const hero=document.querySelector('#od-hero');
  if(hero&&hero.getBoundingClientRect().bottom<=0)leaveShip();
 },{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput();});
 document.addEventListener('space-flight-status',e=>{
  if(!inShip()||!piloting)return;
  if(e.detail.misses>(flightStatus?.misses??0))clearInput();
  flightStatus=e.detail;
  renderFlightStatus();
 });
 function perspective(value){if(warping||piloting)return;if(guided)cmd('guided',{active:false});deck=!!value&&document.body.dataset.portalRenderer==='webgl';inspection=false;selected=null;reflect();sceneState();scrollTo({top:0,behavior:'instant'});}
 document.addEventListener('space-ship-pick',e=>select(e.detail?.id));
 document.addEventListener('space-ship-hover',e=>{if(!inShip())return;document.querySelectorAll('[data-ship-select],[data-ship-leader],[data-ship-pin]').forEach(el=>{el.dataset.hovered=String((el.dataset.shipSelect||el.dataset.shipLeader||el.dataset.shipPin)===e.detail?.id);});});
 document.addEventListener('space-ship-orbit',e=>{if(!inShip())return;orbit=!!e.detail?.active;reflect();});
 document.addEventListener('space-ship-guided-step',e=>select(e.detail.id,true));
 document.addEventListener('space-ship-guided-state',e=>{if(!inShip())return;guided=!!e.detail.active;if(e.detail.completed){selected=null;inspection=false;message='六个系统巡检完成，可以选择目的地并执行跃迁。';}reflect();if(e.detail.completed)sceneState();});
 document.addEventListener('space-ship-mechanism',e=>{if(!inShip())return;motion=e.detail;renderMotion();});
 document.addEventListener('space-ship-transit',e=>{if(!inShip()||!warping)return;document.body.style.setProperty('--ship-transit',e.detail.progress);document.body.style.setProperty('--ship-surge',e.detail.surge);const phase=document.querySelector('[data-ship-warp-phase]');if(phase)phase.textContent=e.detail.phase;});
 document.addEventListener('space-ship-miss',()=>{if(inShip()&&!piloting)feedback('点击船体部件可操作，按住鼠标拖动可旋转飞船。');});
 document.addEventListener('space-odyssey-command',e=>{if(e.detail?.action==='quality'){const q=document.querySelector('[data-ship-quality]');if(q)q.value=e.detail.quality;}});
 function arrive(index){
  if(!inShip()||!warping||index!==targetIndex)return;
  warping=false;arrivedAt=index;
  clearTransit();
  message='已抵达'+destinations[index].name+'。打开本站档案，查看观测影像和科学资料。';
  document.dispatchEvent(new CustomEvent('space-ship-navigation',{detail:{index}}));
  reflect();feedback(message);
 }
 function launch(){
  if(!inShip()||warping||piloting)return;
  if(body.dataset.paused==='true'&&rendererReady()){
   message='当前动画已暂停，继续动画后可以跃迁。';
   reflect();feedback(message);return;
  }
  if(guided)cmd('guided',{active:false});
  cmd('orbit',{active:false});
  pendingFlight=false;prepareFlight();warping=true;selected=null;inspection=false;
  message='航线锁定，正在前往'+destinations[targetIndex].name+'。';
  clearTransit();reflect();sceneState();
  if(rendererReady())cmd('warp',{index:targetIndex});
  else arrive(targetIndex);
 }
 document.addEventListener('space-ship-arrival',e=>arrive(e.detail.index));
 document.addEventListener('space-odyssey-update',e=>{
  const destination=destinations[e.detail?.index],el=document.querySelector('[data-ship-location]');
  if(inShip()&&el&&destination)el.textContent=destination.name;
 });
 document.addEventListener('space-film-update',e=>{if(e.detail?.active&&inShip())leaveShip();});
 document.addEventListener('click',e=>{
  const modeButton=e.target.closest('[data-flight-view]');
  if(modeButton&&inHome()){mode(modeButton.dataset.flightView);return;}
  const pilotButton=e.target.closest('[data-ship-start-flight],[data-exp-pilot]');
  if(pilotButton){startFlight(pilotButton.hasAttribute('data-exp-pilot'));return;}
  if(!inShip())return;
  if(piloting){
   if(e.target.closest('[data-flight-pause]'))clearInput();
   if(e.target.closest('[data-flight-camera]')){
    flightCockpit=!flightCockpit;flightCommand('camera',{cockpit:flightCockpit});reflect();
   }
   if(e.target.closest('[data-flight-exit]'))exitFlight();
   if(e.target.closest('[data-flight-reset]'))resetFlight();
   if(e.target.closest('[data-flight-depart]')&&flightStatus?.complete){stopFlight();reflect();launch();}
   return;
  }
  if(e.target.closest('[data-ship-arrival-file]')&&arrivedAt!==null&&!warping){
   document.dispatchEvent(new CustomEvent('space-ship-read',{detail:{id:destinations[arrivedAt].article}}));
   return;
  }
  if(e.target.closest('[data-ship-deck]')&&!warping){perspective(!deck);return;}if(e.target.closest('[data-ship-exit-deck]')){perspective(false);return;}
  if(e.target.closest('[data-ship-guided]')&&!warping){cmd('guided',{active:!guided});return;}
  const angleButton=e.target.closest('[data-ship-angle]');if(angleButton&&inspection){document.querySelectorAll('[data-ship-angle]').forEach(b=>b.setAttribute('aria-pressed',String(b===angleButton)));cmd('angle',{value:angleButton.dataset.shipAngle});return;}
  const part=e.target.closest('[data-ship-select]');if(part){select(part.dataset.shipSelect);return;}
  if(e.target.closest('[data-ship-toggle]')&&selected&&!warping){select(selected);return;}
  if(e.target.closest('[data-ship-orbit]')&&!warping){const next=!orbit;selected=null;inspection=false;reflect();sceneState();cmd('orbit',{active:next});feedback(next?'环绕展示已开启。拖动模型或选择部件即可接管。':'已停止环绕，可继续拖动检查。');return;}
  if(e.target.closest('[data-ship-inspect]')&&selected&&!warping){inspection=!inspection;reflect();sceneState();revealShip();feedback(inspection?'已切入部件近景，拖动检查；点击“返回全船”退出。':'已返回全船视角。');return;}
  if(e.target.closest('[data-ship-lighting]')){lamps=!lamps;reflect();sceneState();feedback(lamps?'舷灯与驾驶舱照明已开启。':'舷灯与驾驶舱照明已关闭。');return;}
  if(e.target.closest('[data-ship-overview]')){selected=null;inspection=false;reflect();sceneState();return;}
  if(e.target.closest('[data-ship-reset]')){selected=null;inspection=false;reflect();cmd('reset');sceneState();return;}
  if(e.target.closest('[data-ship-read]')){const part=shipSystems.find(s=>s.id===selected);document.dispatchEvent(new CustomEvent('space-ship-read',{detail:{id:part.article}}));return;}
  if(e.target.closest('[data-ship-library]')){document.getElementById('od-archive')?.scrollIntoView({behavior:'smooth'});return;}
  if(e.target.closest('[data-ship-pause]')){document.querySelector('.od-navigation-controls [data-action="pause"]')?.click();return;}
  if(e.target.closest('[data-ship-launch],[data-ship-deck-launch]'))launch();
 });
 document.addEventListener('change',e=>{
  if(!inShip())return;
  if(e.target.matches('[data-flight-destination]')&&piloting){
   const index=Number(e.target.value);
   if(destinations[index]&&index!==targetIndex){
    targetIndex=index;reflect();resetFlight();
    document.querySelector('[data-exp-flight-ui]')?.focus({preventScroll:true});
   }
   return;
  }
  if(e.target.matches('#ship-destination,[data-ship-deck-destination]')){
   const index=Number(e.target.value);
   if(!warping&&destinations[index])targetIndex=index;
   reflect();
  }
  if(e.target.hasAttribute('data-ship-quality')){
   const target=document.querySelector('[data-od-quality]');
   target.value=e.target.value;target.dispatchEvent(new Event('change',{bubbles:true}));
  }
 });
 document.addEventListener('keydown',e=>{if(piloting||warping||!inShip()||document.querySelector('dialog[open]')||document.body.dataset.spaceFilm==='true'||e.target.closest('input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(/^[1-6]$/.test(e.key)){e.preventDefault();select(shipSystems[Number(e.key)-1].id);}if(e.key.toLowerCase()==='o'){e.preventDefault();document.querySelector('[data-ship-orbit]')?.click();}if(e.key==='Escape'&&guided){cmd('guided',{active:false});return;}if(e.key.toLowerCase()==='v'){e.preventDefault();perspective(!deck);return;}if(e.key==='Escape'&&deck){perspective(false);return;}if(e.key==='Escape'&&selected){if(inspection)inspection=false;else selected=null;reflect();sceneState();}if(e.key==='0'){selected=null;inspection=false;reflect();cmd('reset');sceneState();}});
 reducedMotion.addEventListener('change',()=>{
  if(!inShip())return;
  if(!rendererReady()){
   pendingFlight=false;
   if(piloting){stopFlight();message='已启用减少动态效果，可以继续直接跃迁。';}
   if(warping)arrive(targetIndex);
   reflect();
  }
 });
 return {afterRender(){
  if(!inHome()){
   if(view==='ship'||body.dataset.flightMode)leaveShip();
   return;
  }
  if(pendingFlight&&body.dataset.portalRenderer!=='loading'){startFlight();return;}
  if(piloting&&!rendererReady())stopFlight();
  if(warping&&!rendererReady())arrive(targetIndex);
  clearInput();
  reflect();sceneState();
 }};
}
