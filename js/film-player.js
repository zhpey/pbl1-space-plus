import {filmShots,filmDuration,filmTime} from './film-shots.js';
import {isSpaceAudioEnabled,setSpaceAudioEnabled} from './ambient.js';

export function setupFilmPlayer(){
 const layer=document.createElement('section');layer.className='film-player';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','彼岸 · 星际电影播放器');
 layer.innerHTML=`<div class="film-matte film-matte-top"></div><div class="film-matte film-matte-bottom"></div>
  <div class="film-top film-interactive"><span><b>太空<sup>+</sup></b><i></i> ORIGINAL CINEMATIC EXPERIENCE</span><button data-film-exit>回到自由探索 <kbd>Esc</kbd></button></div>
  <div class="film-shot-label"><span data-film-shot-en></span><b data-film-shot-name></b><i></i></div>
  <div class="film-opening"><span>A SPACE PLUS ORIGINAL</span><h2>彼<span>岸</span></h2><p>BEYOND THE FAMILIAR</p><small>一段关于远方，也关于家园的旅程。</small></div>
  <div class="film-caption" aria-live="off"><p data-film-caption></p><small data-film-caption-en></small></div>
  <div class="film-end"><span>THE JOURNEY DOES NOT END HERE.</span><h2>彼岸。<br><em>也在此岸。</em></h2><p>带着一点不同的目光，回到我们的世界。</p><div class="film-interactive"><button data-film-exit>继续自由探索 ↗</button><button data-film-replay>再看一次 ↺</button></div></div>
  <button class="film-paused film-interactive" data-film-pause aria-label="继续放映"><span>▶</span><small>继续这段旅程</small></button>
  <div class="film-transport film-interactive"><div class="film-timeline"><input type="range" min="0" max="${filmDuration}" step=".1" value="0" aria-label="电影播放位置" data-film-seek><div class="film-chapters">${filmShots.map((s,i)=>`<button data-film-shot="${i}" style="left:${s.start/filmDuration*100}%" title="${filmTime(s.start)} · ${s.name}" aria-label="跳到${s.name}"><i></i><span>${s.name}</span></button>`).join('')}</div></div>
   <div class="film-controls"><div><button class="film-play-button" data-film-pause aria-label="暂停电影">Ⅱ</button><span class="film-clock" data-film-time>00:00 <i>/ ${filmTime(filmDuration)}</i></span><i class="film-controls-divider"></i><span class="film-current-chapter" data-film-current>序幕</span></div><div><label class="film-quality">画质<select data-film-quality aria-label="电影画质"><option value="auto">自动</option><option value="high">精细</option><option value="low">流畅</option></select></label><button class="film-sound" data-space-audio aria-pressed="${isSpaceAudioEnabled()}">♫ <span>${isSpaceAudioEnabled()?'声音已开启':'开启声音'}</span></button><button data-film-captions aria-pressed="true">字幕</button><button data-film-fullscreen aria-label="进入全屏">⛶</button></div></div>
  </div><span class="sr-only" role="status" aria-live="polite" data-film-announcement></span>`;
 document.body.append(layer);
 let state={active:false,paused:false,ended:false,time:0,shotIndex:0},source=null,lastShot=-1,idleTimer,subtitles=true,fullscreenOwned=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const send=(action,extra={})=>document.dispatchEvent(new CustomEvent('space-film-command',{detail:{action,...extra}}));
 function reveal(){layer.dataset.controls='true';clearTimeout(idleTimer);if(state.active&&!state.paused&&!state.ended)idleTimer=setTimeout(()=>{if(!layer.querySelector('.film-transport')?.contains(document.activeElement))layer.dataset.controls='false';},3200);}
 function availability(){
  const available=document.body.dataset.portalRenderer==='webgl'&&!reduced.matches;
  const reason=reduced.matches?'已启用减少动态效果':document.body.dataset.portalRenderer==='loading'?'三维场景正在加载':'当前为静态模式';
  document.querySelectorAll('[data-od-film-start]').forEach(button=>{
   button.disabled=!available;
   button.title=available?'播放 2 分 24 秒星际电影':`${reason}，可使用探索八站`;
  });
  document.querySelectorAll('[data-exp-pilot]').forEach(button=>{
   button.disabled=!available;
   button.title=available?'进入三维驾驶，沿发光星环穿越航道':`${reason}，三维驾驶暂不可用`;
  });
 }
 function reflect(event){
  const d=event.detail||{};const wasActive=state.active;state={...state,...d};
  layer.hidden=!state.active;document.body.dataset.spaceFilm=String(state.active);
  const app=document.querySelector('#app'),stage=document.querySelector('#stage');if(app)app.inert=state.active;if(stage)stage.inert=state.active;
  if(!state.active){clearTimeout(idleTimer);lastShot=-1;if(wasActive){if(fullscreenOwned&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});fullscreenOwned=false;const target=source?.isConnected&&source.getClientRects().length?source:[...document.querySelectorAll('[data-od-film-start]')].find(b=>b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden');target?.focus({preventScroll:true});}return;}
  const shot=filmShots[Math.min(filmShots.length-1,state.shotIndex)],local=Math.max(0,(state.time-shot.start)/shot.duration);
  layer.dataset.paused=String(state.paused);layer.dataset.ended=String(state.ended);layer.dataset.opening=String(state.shotIndex===0&&state.time>1.1&&state.time<5.9);layer.dataset.ending=String(state.shotIndex===filmShots.length-1&&local>.4);layer.dataset.captions=String(subtitles);
  layer.style.setProperty('--film-progress',String(state.time/filmDuration*100)+'%');
  layer.querySelector('[data-film-seek]').value=state.time;layer.querySelector('[data-film-seek]').setAttribute('aria-valuetext',filmTime(state.time)+'，'+shot.name);
  layer.querySelector('[data-film-time]').innerHTML=`${filmTime(state.time)} <i>/ ${filmTime(filmDuration)}</i>`;
  layer.querySelector('[data-film-current]').textContent=String(state.shotIndex+1).padStart(2,'0')+' / '+shot.name;
  layer.querySelector('.film-play-button').textContent=state.ended?'↺':state.paused?'▶':'Ⅱ';layer.querySelector('.film-play-button').setAttribute('aria-label',state.ended?'重播电影':state.paused?'继续电影':'暂停电影');
  layer.querySelectorAll('[data-film-shot]').forEach((b,i)=>b.setAttribute('aria-current',String(i===state.shotIndex)));
  if(lastShot!==state.shotIndex){lastShot=state.shotIndex;layer.querySelector('[data-film-shot-en]').textContent=shot.en;layer.querySelector('[data-film-shot-name]').textContent=shot.title;layer.querySelector('[data-film-caption]').textContent=shot.line;layer.querySelector('[data-film-caption-en]').textContent=shot.en;layer.querySelector('[data-film-announcement]').textContent=shot.title;layer.classList.remove('film-new-shot');void layer.offsetWidth;layer.classList.add('film-new-shot');}
  if(!wasActive){layer.querySelector('[data-film-quality]').value=document.querySelector('[data-od-quality]')?.value||'auto';reveal();layer.querySelector('[data-film-exit]').focus({preventScroll:true});}
  if(state.paused||state.ended)reveal();
 }
 document.addEventListener('space-film-update',reflect);
 document.addEventListener('click',event=>{
  const start=event.target.closest('[data-od-film-start]');if(start&&!start.disabled){source=start;document.querySelector('#od-hero')?.scrollIntoView({behavior:'instant'});setSpaceAudioEnabled(true).catch(()=>{});send('play');return;}
  if(!state.active)return;
  if(event.target.closest('[data-film-exit]')){send('exit');return;}
  if(event.target.closest('[data-film-replay]')){send('play');return;}
  if(event.target.closest('[data-film-pause]')){send(state.ended?'play':'pause');reveal();return;}
  const shot=event.target.closest('[data-film-shot]');if(shot){send('seek',{time:filmShots[Number(shot.dataset.filmShot)].start+.05});reveal();return;}
  if(event.target.closest('[data-film-captions]')){subtitles=!subtitles;layer.dataset.captions=String(subtitles);layer.querySelector('[data-film-captions]').setAttribute('aria-pressed',String(subtitles));return;}
  if(event.target.closest('[data-film-fullscreen]')){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else{fullscreenOwned=true;document.documentElement.requestFullscreen?.().catch(()=>{fullscreenOwned=false;});}return;}
 });
 layer.addEventListener('change',e=>{if(e.target.matches('[data-film-quality]')){const q=document.querySelector('[data-od-quality]');if(q){q.value=e.target.value;q.dispatchEvent(new Event('change',{bubbles:true}));}}});
 layer.addEventListener('input',e=>{if(e.target.matches('[data-film-seek]')){send('seek',{time:Number(e.target.value)});reveal();}});
 layer.addEventListener('pointermove',reveal,{passive:true});layer.addEventListener('pointerdown',reveal,{passive:true});layer.addEventListener('focusin',reveal);
 document.addEventListener('keydown',e=>{
  if(!state.active)return;reveal();
  if(e.key==='Escape'){e.preventDefault();send('exit');return;}
  if(e.key===' '&&!e.target.matches('input,select')){e.preventDefault();send(state.ended?'play':'pause');return;}
  if(['ArrowLeft','ArrowRight','j','l'].includes(e.key)&&!e.target.matches('input,select')){e.preventDefault();send('seek',{time:state.time+(['ArrowLeft','j'].includes(e.key)?-1:1)*(e.key.length===1?10:5)});return;}
  if(e.key==='Tab'){const buttons=[...layer.querySelectorAll('button,input,select')].filter(b=>!b.disabled&&b.getBoundingClientRect().width&&getComputedStyle(b).visibility!=='hidden'&&getComputedStyle(b).display!=='none');const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 });
 document.addEventListener('fullscreenchange',()=>{const b=layer.querySelector('[data-film-fullscreen]');b.setAttribute('aria-label',document.fullscreenElement?'退出全屏':'进入全屏');b.setAttribute('aria-pressed',String(!!document.fullscreenElement));});
 const observer=new MutationObserver(availability);observer.observe(document.body,{attributes:true,attributeFilter:['data-portal-renderer']});reduced.addEventListener('change',availability);
 return {afterRender(s){if(s.route!=='universe'&&state.active)send('exit');availability();if(state.active){document.querySelector('#app').inert=true;document.querySelector('#stage').inert=true;}}};
}
