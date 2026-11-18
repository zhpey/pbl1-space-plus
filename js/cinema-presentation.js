import {isSpaceAudioEnabled,playSpaceCue,stopSpaceCues} from './ambient.js';

// This presentation follows the shared camera; it never creates a second canvas.
export function setupCinematicPresentation(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const layer=document.createElement('aside');
  layer.className='cinema-presentation';layer.hidden=true;
  layer.setAttribute('data-cinema-controls','');
  layer.setAttribute('aria-label','星际序章放映控制');
  layer.innerHTML=`<div class="cinema-matte cinema-matte-top" aria-hidden="true"></div><div class="cinema-matte cinema-matte-bottom" aria-hidden="true"></div>
    <div class="cinema-topline"><span>SPACE PLUS <i></i> 星际序章</span><button data-space-cinema="cancel" class="cinema-skip">结束观赏 <kbd>Esc</kbd></button></div>
    <div class="cinema-caption"><span data-cinema-shot>01 / 04</span><h2 data-cinema-title></h2><p data-cinema-subtitle></p></div>
    <div class="cinema-transport"><span class="cinema-running"><i></i> 序章</span><div class="cinema-timeline" role="progressbar" aria-label="开场进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><span class="cinema-time">00:00 / 00:13</span><button class="cinema-audio" data-space-audio aria-pressed="${isSpaceAudioEnabled()}"><i aria-hidden="true">♫</i><span>${isSpaceAudioEnabled()?'声音已开启':'开启声音'}</span></button></div>
    <span class="cinema-announcement sr-only" role="status" aria-live="polite"></span>`;
  document.body.append(layer);
  let active=false,source=null,lastPhase='';
  const title=layer.querySelector('[data-cinema-title]'),subtitle=layer.querySelector('[data-cinema-subtitle]');
  const timeline=layer.querySelector('.cinema-timeline'),time=layer.querySelector('.cinema-time');
  const announce=layer.querySelector('.cinema-announcement');
  const inertTargets='.map-heading,.world-map,.portal-bottom,.portal-location,.portal-instructions,.universe-map>.cinema-trigger,.controls';
  function reflect(){
    const available=document.body.dataset.portalRenderer==='webgl'&&!reduced.matches;
    document.querySelectorAll('[data-space-cinema="play"]').forEach(button=>{
      button.disabled=!available;
      button.title=available?'观看星际序章，可随时按 Esc 结束':reduced.matches?'已采用静态观赏，可直接探索星图':'当前为静态星图，可直接进入五个世界';
    });
    // The header remains available, while hidden scene labels leave the tab order.
    const dialogOpen=!!document.querySelector('.dialog-host:not(.hidden)');
    document.querySelectorAll(inertTargets).forEach(node=>node.inert=active||dialogOpen);
  }
  function command(action){document.dispatchEvent(new CustomEvent('space-cinema-command',{detail:{action}}));}
  function onClick(event){
    const control=event.target.closest('button[data-space-cinema]');
    if(control){event.preventDefault();if(control.dataset.spaceCinema==='play'){source=control;command('play');}else command('cancel');}
    const world=event.target.closest('[data-action="world"]');
    if(world&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&!reduced.matches)playSpaceCue('travel');
  }
  function update(event){
    const data=event.detail||{},wasActive=active;active=!!data.active;
    layer.hidden=!active;
    if(active){
      const p=Math.max(0,Math.min(1,Number(data.progress)||0));
      layer.style.setProperty('--cinema-progress',String(p));
      timeline.setAttribute('aria-valuenow',String(Math.round(p*100)));
      time.textContent=`00:${String(Math.min(13,Math.floor(p*13))).padStart(2,'0')} / 00:13`;
      layer.querySelector('[data-cinema-shot]').textContent=data.label||`0${Math.min(5,1+Math.floor(p*5))} / 05`;
      title.textContent=data.title||'从一束光，出发。';subtitle.textContent=data.subtitle||'';
      if(lastPhase!==data.phase||!wasActive){
        lastPhase=data.phase;announce.textContent=title.textContent;
        layer.classList.remove('cinema-new-shot');void layer.offsetWidth;layer.classList.add('cinema-new-shot');
        playSpaceCue(wasActive?'reveal':'opening');
      }
      if(!wasActive)layer.querySelector('.cinema-skip').focus({preventScroll:true});
    }else if(wasActive){
      stopSpaceCues();lastPhase='';
      // A manual click on another destination keeps that destination's focus.
      if(layer.contains(document.activeElement)&&source?.isConnected)source.focus({preventScroll:true});
    }
    reflect();
  }
  const observer=new MutationObserver(reflect);
  observer.observe(document.body,{attributes:true,attributeFilter:['data-portal-renderer','data-route']});
  document.addEventListener('click',onClick);document.addEventListener('space-cinema-update',update);
  reduced.addEventListener('change',()=>{if(reduced.matches&&active)command('cancel');reflect();});
  addEventListener('pagehide',()=>{observer.disconnect();stopSpaceCues();});
  reflect();
  return {afterRender:reflect};
}
