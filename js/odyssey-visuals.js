import {destinations,odysseyAsset as asset} from './odyssey-data.js';

const paths={
 planet:'<circle cx="24" cy="24" r="12"/><ellipse cx="24" cy="24" rx="23" ry="7" transform="rotate(-28 24 24)"/>',
 rocket:'<path d="M20 29C13 17 26 5 40 6c1 14-11 27-23 20M20 29l-7 7M17 20l-9 3-3 10 12-3M28 29l-3 12-10 3 3-10"/><circle cx="29" cy="17" r="4"/><path d="m12 36-5 5m6-1-3 5M8 34l-5 3"/>',
 telescope:'<path d="m10 17 7-9 23 15-7 10zM32 31l-6 8M21 25l-6 8M23 33l-1 12m0-8-10 8m10-8 10 8M39 22l4-6M8 14l-4 6"/>',
 orbit:'<circle cx="24" cy="24" r="5"/><ellipse cx="24" cy="24" rx="22" ry="9" transform="rotate(30 24 24)"/><ellipse cx="24" cy="24" rx="22" ry="9" transform="rotate(-30 24 24)"/><ellipse cx="24" cy="24" rx="22" ry="9" transform="rotate(90 24 24)"/>',
 satellite:'<path d="m19 20 10-2 3 10-10 3zM18 22l-5 1m17 0 5-1M5 16l9-2 3 16-9 2zM33 12l9-2 3 16-9 2zM22 18l-2-8m0 0-6-2m6 2 4-5M25 31l2 7M8 21l7-1m-6 7 7-1m19-7 8-1m-7 6 8-1"/>',
 galaxy:'<path d="M24 25c-6-7 7-13 14-9 13 8-1 24-17 20C-2 31 9 5 30 7M24 23c6 7-7 13-14 9C-3 24 11 8 27 12c23 5 12 31-9 29"/><circle cx="24" cy="24" r="3"/>',
 scan:'<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="10"/><path d="M24 1v10m0 26v10M1 24h10m26 0h10m-13-9-10 9 5 6"/>',
 star:'<path d="m24 3 5 15 16 6-16 5-5 16-5-16-16-5 16-6z"/>',
};
export function spaceIcon(name,extra=''){return `<svg class="od-space-icon ${extra}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.planet}</svg>`;}
export function sphere(id,extra=''){
 const type=['nebula','deepfield','blackhole'].includes(id)?id:'planet';
 return `<span class="od-sphere od-sphere-${type} od-sphere-${id} ${extra}" aria-hidden="true" style="--sphere-map:url('${asset(type==='planet'?'spheres/'+id+'.jpg':id==='nebula'?'cosmic-cliffs.jpg':id==='deepfield'?'deepfield.jpg':'blackhole.jpg')}')"><i class="od-sphere-surface"></i><i class="od-sphere-shade"></i>${id==='saturn'?'<i class="od-sphere-ring"></i>':''}${id==='blackhole'?'<i class="od-event-ring"></i>':''}</span>`;
}
export function heroArtwork(){return `<div class="od-hero-art" aria-hidden="true"><span class="od-hero-ghost">BEYOND</span><svg class="od-hero-trajectories" viewBox="0 0 1000 1000"><defs><linearGradient id="od-path-light"><stop stop-color="#6be4ff" stop-opacity="0"/><stop offset=".6" stop-color="#6be4ff" stop-opacity=".6"/><stop offset="1" stop-color="#e4c88a" stop-opacity="0"/></linearGradient></defs><ellipse class="od-trajectory-track" cx="500" cy="500" rx="470" ry="190" transform="rotate(-32 500 500)"/><ellipse class="od-trajectory-fine" cx="500" cy="500" rx="405" ry="435" transform="rotate(22 500 500)"/><path class="od-signal-line" d="M50 700Q500 100 950 300"/></svg><span class="od-orbit-beacon">${spaceIcon('satellite')}<i></i></span><span class="od-flight-label">DEEP SPACE NETWORK<i></i><b>越过边界 / INTO THE UNKNOWN</b></span><span class="od-hero-flare"></span></div>`;}
export function gravityGate(){return `<section class="od-gravity-gate" aria-labelledby="od-gate-title"><div class="od-gate-stars" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="--ray:${i};--travel:${1.8+(i%7)*.34}s"></i>`).join('')}</div><div class="od-gate-universe" aria-hidden="true"><div class="od-gate-axis"><div class="od-gate-disk"></div><div class="od-gate-disk od-gate-disk-back"></div><div class="od-gate-core"><i></i></div><div class="od-gate-lensing"></div><div class="od-gate-particles"></div></div><span class="od-gate-coordinate">EVENT HORIZON / POINT OF NO RETURN</span></div><div class="od-gate-copy"><span class="od-eyebrow">${spaceIcon('orbit')} GRAVITY REWRITES THE LIGHT</span><h2 id="od-gate-title">光的尽头，<br><em>还有宇宙。</em></h2><p>靠近，看见光被引力弯曲。</p><button class="od-outline" data-od-station="6" data-od-return-top>${spaceIcon('rocket')}跃入事件视界 <span>↗</span></button></div><span class="od-gate-note">引力视觉艺术 / 非完整相对论模拟</span></section>`;}
export function orbitalAtlas(destinations){
 return `<div class="cosmos-chart"><div class="od-atlas-stage"><div class="od-atlas-noise" aria-hidden="true"></div><div class="od-atlas-caption"><span>${spaceIcon('scan')} 选择一个世界</span><small>点击星体 · 查看目的地</small></div><svg class="od-atlas-lines" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true"><path class="od-atlas-orbit" d="M70 420C180 170 400 80 680 110S1080 200 1150 420C980 650 430 690 120 480Z"/><path class="od-atlas-route" d="M150 315Q200 125 340 145T550 300 780 150 1020 285 930 520 650 530 350 540"/><ellipse cx="580" cy="360" rx="290" ry="200"/><ellipse cx="580" cy="360" rx="430" ry="300"/><path d="M580 0V700M0 360H1200" class="od-atlas-cross"/></svg><div class="od-atlas-sun" aria-hidden="true"><i></i><b></b><span>SOL</span></div><div class="od-destination-grid">${destinations.map((s,i)=>`<button class="od-destination-card od-atlas-node" data-cosmos-target="${i}" aria-pressed="${i===0}" aria-label="查看${s.name}的航行资料" style="--destination-accent:${s.accent};--node-index:${i}">${sphere(s.id)}<span class="od-destination-number">${s.number}</span><div><small>${s.en}</small><h3>${s.name}<span>↗</span></h3><p>${s.tag}</p></div><i class="od-node-target"></i></button>`).join('')}</div><div class="od-atlas-legend"><span><i></i> 轨道世界</span><span><i></i> 深空奇观</span><small>艺术化路线 / 非真实比例</small></div></div><aside class="cosmos-chart-detail" data-cosmos-detail aria-live="polite">${atlasDetail(0)}</aside></div>`;
}

export function atlasDetail(index){const d=destinations[index];return `<span class="od-eyebrow">DESTINATION / ${d.number}</span><div class="cosmos-chart-object">${sphere(d.id)}</div><small>${d.en}</small><h3>${d.name}</h3><p>${d.intro}</p><dl>${d.facts.slice(0,2).map(([n,l])=>`<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl><button class="od-outline" data-od-station="${index}" data-od-return-top>前往这个世界 <span aria-hidden="true">↗</span></button><button class="od-text-button" data-od-article="${d.article}">阅读科学档案 ↗</button>`;}

export function worldArtwork(i){
 const planet=['earth','mars','neptune','blackhole','saturn'][i],icons=['planet','rocket','telescope','orbit','satellite'];
 return `<div class="od-world-art" aria-hidden="true"><svg viewBox="0 0 300 260" class="od-world-orbits"><ellipse cx="150" cy="133" rx="135" ry="60" transform="rotate(-35 150 133)"/><circle cx="150" cy="133" r="102" stroke-dasharray="2 9"/>${i===2?'<path class="od-constellation" d="m30 50 55 25 55-35 25 65 85-50-10 100-65 55-45-60-75 15"/><g fill="currentColor"><circle cx="30" cy="50" r="3"/><circle cx="85" cy="75" r="3"/><circle cx="140" cy="40" r="3"/><circle cx="165" cy="105" r="3"/><circle cx="250" cy="55" r="3"/><circle cx="240" cy="155" r="3"/><circle cx="175" cy="210" r="3"/></g>':''}</svg>${sphere(planet)}<span class="od-world-object">${spaceIcon(icons[i])}</span><i class="od-world-spark"></i></div>`;
}

export function scienceGraphic(article){
 const scenes={
  'thin-blue-line':['earth','一层大气，一个世界','表面','大气','阳光'],
  'moon-memory':['moon','留在月面上的时间','月面','撞击','记录'],
  'stellar-nursery':['nebula','从尘埃，到第一束光','星云','引力','恒星'],
  'pale-blue-dot':['earth','回望，我们唯一的家','地球','远航','回望'],
 };
 const s=scenes[article.id]||(['行星','探索'].includes(article.category)?[article.category==='行星'?'mars':'earth','从一个世界，走向新的发现','观察','探测','发现']:article.category==='宇宙'?['blackhole','看见光，也读懂光的来处','光源','传播','证据']:['deepfield','把遥远的光，带到眼前','星光','望远镜','影像']);
 const middle=article.id==='thin-blue-line'||s[0]==='nebula'?'orbit':s[0]==='moon'?'satellite':article.category==='探索'?'rocket':article.category==='观测'?'telescope':'galaxy';
 const end=article.id==='thin-blue-line'||s[0]==='nebula'?'star':'scan';
 return `<figure class="od-science-graphic"><div class="od-science-body">${sphere(s[0])}<svg viewBox="0 0 600 180" aria-hidden="true"><path d="M130 90H480"/><path d="m170 82 10 8-10 8m90-16 10 8-10 8m90-16 10 8-10 8m90-16 10 8-10 8"/><circle cx="300" cy="90" r="54"/><circle cx="300" cy="90" r="70" stroke-dasharray="2 7"/></svg><span class="od-science-detector">${spaceIcon(middle)}</span><span class="od-science-star">${spaceIcon(end)}</span></div><figcaption><b>${s[1]}</b><span>${s[2]} <i>→</i> ${s[3]} <i>→</i> ${s[4]}</span><small>概念图解 · 非比例</small></figcaption></figure>`;
}

export function setupOdysseyVisuals(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let observer,gridObserver,raf=0,container=null;
 function suspended(){return document.hidden||document.body.dataset.paused==='true'||document.body.dataset.odysseyDialog==='true'||document.body.dataset.spaceFilm==='true'||document.body.dataset.route!=='universe';}
 function reflect(){document.body.dataset.odVisualPause=String(suspended());}
 const mutation=new MutationObserver(reflect);mutation.observe(document.body,{attributes:true,attributeFilter:['data-paused','data-odyssey-dialog','data-space-film','data-route']});document.addEventListener('visibilitychange',reflect);
 function observe(){if(!container)return;observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('od-in-view',e.isIntersecting);if(e.isIntersecting)e.target.classList.add('od-revealed');}},{threshold:.08,rootMargin:'0px 0px -20px 0px'});container.querySelectorAll('.od-section,.od-encounter,.od-human-story,.od-atlas-node,.od-world-link,.od-archive-card,.od-gravity-gate').forEach(e=>observer.observe(e));}
 document.addEventListener('pointermove',e=>{if(reduced.matches||suspended()||!container||raf||e.pointerType==='touch')return;raf=requestAnimationFrame(()=>{raf=0;const target=e.target.closest('.od-atlas-stage,.od-world-link,.od-hero,.od-gravity-gate');if(!target)return;const r=target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;target.style.setProperty('--pointer-x',x.toFixed(3));target.style.setProperty('--pointer-y',y.toFixed(3));if(target.matches('.od-hero'))target.querySelector('.od-hero-art').style.cssText=`--pointer-x:${x};--pointer-y:${y}`;});},{passive:true});
 return {afterRender(state){gridObserver?.disconnect();observer?.disconnect();container=state.route==='universe'?document.querySelector('.od-content'):null;reflect();observe();if(container){gridObserver=new MutationObserver(()=>observe());gridObserver.observe(container.querySelector('[data-od-archives]'),{childList:true});}}};
}
