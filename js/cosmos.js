import {atlasDetail,sphere} from './odyssey-visuals.js';
import {odysseyAsset} from './odyssey-data.js';
import {constellations} from './data.js';

export function renderWorldPortals(worlds){
 const c=constellations[0],sky=`<svg viewBox="0 0 330 350" fill="none" class="cosmos-portal-stars">${c.lines.map(([a,b])=>`<line x1="${c.stars[a][0]}" y1="${c.stars[a][1]}" x2="${c.stars[b][0]}" y2="${c.stars[b][1]}"/>`).join('')}${c.stars.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</svg>`;
 const scenes=[sphere('earth'),`<div class="cosmos-solar-orbits"><i></i><i></i><i></i><b></b><span></span><em></em></div>`,sky,'<div class="cosmos-singularity"><i></i><b></b></div>',`<img src="${odysseyAsset('nebula.jpg')}" alt="" loading="lazy" width="900" height="900">`];
 const labels=['WORLDS WITHIN REACH','A STAR AND ITS WORLDS','PATTERNS IN THE NIGHT','THE FABRIC OF REALITY','LET THE LIGHT SPEAK'];
 return `<div class="od-world-grid cosmos-worlds">${worlds.map((w,i)=>`<a href="#${w.route}" class="od-world-link cosmos-world-${i+1}"><span class="od-world-number">0${i+1}</span><div class="cosmos-world-copy"><span>${labels[i]}</span><h3>${w.theme}</h3><p>${w.intro}</p><b>进入${w.name} <span aria-hidden="true">↗</span></b></div><div class="cosmos-world-scene" aria-hidden="true">${scenes[i]}</div><small>${w.tags}</small></a>`).join('')}</div>`;
}

export function renderNextChapter(route){const chapters=[['explore','行星漫游'],['solar','太阳系'],['atlas','星座图谱'],['unknown','宇宙谜题'],['observatory','深空影像'],['story','星际来信']],index=chapters.findIndex(c=>c[0]===route);if(index<0)return '';const next=chapters[(index+1)%chapters.length];return `<nav class="cosmos-next-chapter" aria-label="继续探索"><span class="od-eyebrow">THE JOURNEY CONTINUES / ${String(index+2>6?1:index+2).padStart(2,'0')}</span><a href="#${next[0]}"><span>下一段星空</span><b>${next[1]}</b><i aria-hidden="true">↗</i></a><a class="cosmos-home-link" href="#universe">回到宇宙序章 ↑</a></nav>`;}

export function renderCosmicPanorama(){return `<section id="cosmos-nebula" class="cosmos-panorama" aria-labelledby="cosmos-nebula-title"><div class="cosmos-panorama-image"><img src="${odysseyAsset('cosmic-cliffs.jpg')}" alt="韦伯近红外影像中，NGC 3324 恒星形成区的气体与尘埃边缘" loading="lazy" width="1800" height="1042"></div><div class="cosmos-panorama-shade" aria-hidden="true"></div><span class="cosmos-panorama-coordinate">NGC 3324<br>CARINA / 7,600 LY</span><div class="cosmos-panorama-copy"><span class="od-eyebrow">INTERLUDE / THE STELLAR NURSERY</span><h2 id="cosmos-nebula-title">在星尘里，<br>看见诞生。</h2><p>这不是群山，而是星光雕刻的气体与尘埃。<br>约 7,600 光年之外，新的恒星正在醒来。</p><button class="od-outline" data-od-station="5" data-od-return-top>漫游恒星摇篮 <span aria-hidden="true">↗</span></button></div><div class="cosmos-observation-points" inert><button data-od-article="stellar-nursery" style="--point-x:30%;--point-y:40%"><i></i><span>被星光侵蚀的边缘<small>打开观测笔记 ↗</small></span></button><button data-od-article="pillars-of-dust" style="--point-x:64%;--point-y:69%"><i></i><span>尘埃中的恒星<small>阅读更多恒星形成影像 ↗</small></span></button></div><footer><a href="https://esawebb.org/images/weic2205a/" target="_blank" rel="noopener noreferrer">NASA / ESA / CSA / STScI · NIRCam 近红外影像 ↗</a><button data-cosmos-observe aria-pressed="false">展开影像细节 ＋</button></footer></section>`;}
export const cosmosMark='<svg class="cosmos-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="12"/><ellipse cx="24" cy="24" rx="24" ry="8" transform="rotate(-38 24 24)"/><path d="M24 5v5m0 28v5M5 24h5m28 0h5"/><circle cx="41" cy="10" r="2" fill="currentColor" stroke="none"/></svg>';

export function setupCosmos(){
 let observer,motionObserver,chartSelected=0;
 const visibility=()=>{document.body.dataset.cosmosHidden=String(document.hidden);};document.addEventListener('visibilitychange',visibility);visibility();
 document.addEventListener('click',event=>{const button=event.target.closest('[data-cosmos-heading]');if(!button)return;const section=button.closest('dialog').querySelectorAll('.od-reader-sections>section')[Number(button.dataset.cosmosHeading)];section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});section?.querySelector('h3')?.focus({preventScroll:true});});
 document.addEventListener('scroll',event=>{const dialog=event.target;if(!(dialog instanceof Element)||!dialog.matches('.od-dialog,.article-dialog'))return;const max=dialog.scrollHeight-dialog.clientHeight;dialog.style.setProperty('--cosmos-read',`${max>0?Math.min(100,dialog.scrollTop/max*100):100}%`);},{capture:true,passive:true});
 document.addEventListener('click',event=>{const button=event.target.closest('[data-cosmos-observe]');if(!button)return;const section=button.closest('.cosmos-panorama'),active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));button.textContent=active?'返回全景 －':'展开影像细节 ＋';section.classList.toggle('is-observing',active);section.querySelector('.cosmos-observation-points').inert=!active;});
 document.addEventListener('click',event=>{const target=event.target.closest('[data-cosmos-target]');if(!target)return;const index=Number(target.dataset.cosmosTarget),detail=document.querySelector('[data-cosmos-detail]');if(!detail)return;chartSelected=index;detail.innerHTML=atlasDetail(index);document.querySelectorAll('[data-cosmos-target]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));});
 return {afterRender(state){
  document.body.dataset.cosmosRoute=state.route;
  observer?.disconnect();
  motionObserver?.disconnect();
  motionObserver=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle('cosmos-visible',entry.isIntersecting);if(entry.isIntersecting)entry.target.classList.add('cosmos-arrived');}},{threshold:.12});
  document.querySelectorAll('.cosmos-panorama,.cosmos-worlds .od-world-link,.cosmos-archive-feature,.cosmos-next-chapter').forEach(e=>motionObserver.observe(e));
  if(state.route!=='universe')return;
  const detail=document.querySelector('[data-cosmos-detail]');if(detail)detail.innerHTML=atlasDetail(chartSelected);document.querySelectorAll('[data-cosmos-target]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cosmosTarget)===chartSelected)));
  const entries=new Map();
  observer=new IntersectionObserver(changes=>{
   for(const entry of changes)entries.set(entry.target.id,entry);
   const visible=[...entries.values()].filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top-100)-Math.abs(b.boundingClientRect.top-100))[0];
   if(!visible)return;
   document.querySelectorAll('.od-header-nav [data-od-jump]').forEach(a=>{const active=a.dataset.odJump===visible.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  },{rootMargin:'-80px 0px -40% 0px',threshold:0});
  document.querySelectorAll('#od-hero,#od-destinations,#od-archive,#od-worlds').forEach(e=>observer.observe(e));
 }};
}

export function renderArchiveFeature(){return `<article class="cosmos-archive-feature"><img src="${odysseyAsset('deepfield.jpg')}" alt="韦伯望远镜拍摄的 SMACS 0723 深场，星系与引力透镜弧组成的遥远宇宙" loading="lazy" width="1200" height="1225"><div><span class="od-eyebrow">FEATURED FIELD NOTE / DEEP TIME</span><h3>你看见的光，<br>出发于哪个时代？</h3><p>望向远方，也是在回望时间。<br>在这片微小的天空里，读一封来自过去的信。</p><button class="od-outline" data-od-article="deep-time">打开深空档案 <span aria-hidden="true">↗</span></button></div><span class="cosmos-feature-credit">NASA / ESA / CSA / STScI<br>SMACS 0723 · NIRCam</span></article>`;}
