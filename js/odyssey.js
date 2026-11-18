import {hasObservation,observationStart,renderObservation,reflectObservation} from './observation.js';
import {renderJourneyArrival} from './interface.js';
import {renderImageControls,renderLightLab,renderMissionTrail,renderSignalDesk} from './expedition.js';
import {renderWorldPortals,renderArchiveFeature,renderCosmicPanorama} from './cosmos.js';
import {renderLessonGateway} from './lesson-reader.js';
import {renderShipboard} from './shipboard.js';
import {destinations,dossiers,referenceSources,imageCredits,odysseyAsset as image} from './odyssey-data.js';
import {isSpaceAudioEnabled,playSpaceCue} from './ambient.js';
import {spaceIcon,sphere,heroArtwork,orbitalAtlas} from './odyssey-visuals.js';
const KEY='space-plus-odyssey-log-v1';
let observationMode=null;
let selected=0,touring=false,bridge=false,query='',category='全部',quality='auto',visited=new Set(['earth']),saved=new Set(),storageAvailable=true;
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){visited=new Set((Array.isArray(s.visited)?s.visited:[]).filter(id=>destinations.some(d=>d.id===id)));visited.add('earth');saved=new Set((Array.isArray(s.saved)?s.saved:[]).filter(id=>dossiers.some(a=>a.id===id)));}}catch{/* Keep a fresh exploration log. */}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=`<svg viewBox="0 0 44 44" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="10"/><ellipse cx="22" cy="22" rx="21" ry="7" transform="rotate(-33 22 22)"/><circle cx="37" cy="10" r="2" fill="currentColor" stroke="none"/></svg>`;
const arrow='<span aria-hidden="true">↗</span>';
const sceneTitles={earth:['向群星，','出发。'],moon:['月球。','静寂之地'],mars:['火星。','红色边境'],jupiter:['木星。','风暴之眼'],saturn:['土星。','引力的诗'],nebula:['恒星。','正在诞生'],blackhole:['事件视界。','光的边境'],deepfield:['深空。','时间尽头']};
function persist(){try{localStorage.setItem(KEY,JSON.stringify({visited:[...visited],saved:[...saved]}));storageAvailable=true;}catch{storageAvailable=false;}const note=document.querySelector('.od-last-word p small');if(note)note.textContent=storageAvailable?'发现记录保存在当前浏览器。':'浏览器存储暂不可用，记录仅保留在本次访问。';}
function command(action,extra={}){document.dispatchEvent(new CustomEvent('space-odyssey-command',{detail:{action,...extra}}));}

export function renderOdysseyHeader(s){const audio=isSpaceAudioEnabled();return `<header class="topbar od-topbar"><a class="brand od-brand" href="#universe" data-od-jump="od-hero" aria-label="太空加首页">${icon}<span><b>太空<sup>+</sup></b><small>SPACE PLUS</small></span></a><nav class="od-header-nav" aria-label="远航导航"><a href="#od-hero" data-od-jump="od-hero" class="active">宇宙序章</a><a href="#od-destinations" data-od-jump="od-destinations">航行星图</a><a href="#od-archive" data-od-jump="od-archive">档案终端</a><a href="#od-worlds" data-od-jump="od-worlds">探索篇章</a></nav><div class="od-header-actions"><span class="od-visit-counter"><i></i><b data-od-count>${visited.size}</b> / 08 已探索</span><button class="space-audio" data-space-audio aria-pressed="${audio}" aria-label="${audio?'关闭':'开启'}星际氛围音乐"><i aria-hidden="true"><b></b><b></b><b></b><b></b></i><span>${audio?'声音已开启':'开启声音'}</span></button><button class="circle-button od-menu-button" data-interface-menu aria-label="打开探索目录"><span class="interface-menu-glyph" aria-hidden="true"></span></button></div></header>`;}

function heroCopy(d){
 const title=sceneTitles[d.id].map((line,i)=>`<span${i===1?' class="od-title-last"':''}>${line}</span>`).join('');
 return `
  <div class="od-chapter-kicker"><i></i><span>第 ${d.number} 站</span><b>${d.name}</b></div>
  <h1 id="od-hero-title">${title}</h1>
  <p class="od-hero-intro">${d.intro}</p>
  <div class="od-hero-actions">
   <button class="od-primary od-explore-launch" data-od-jump="od-destinations">探索八站 <span aria-hidden="true">↓</span></button>
   <button class="od-secondary od-film-launch" data-od-film-start aria-label="播放远航电影，2 分 24 秒"><span aria-hidden="true">▷</span> 远航电影 <small>02:24</small></button>
   <button class="od-secondary" data-exp-pilot>亲自驾驶 <span aria-hidden="true">↗</span></button>
  </div>
  <div class="od-key-hint">
   <button class="od-tour-compact" data-od-tour aria-pressed="${touring}"><span class="od-play-symbol" aria-hidden="true">${touring?'Ⅱ':'▶'}</span><span data-od-tour-label>${touring?'暂停自动远航':'自动漫游'}</span></button>
   <button data-od-article="${d.article}">读懂这一站 ${arrow}</button>
   <button data-od-clean>纯净观景 ${arrow}</button>
   ${hasObservation(d.id)?'<button class="od-observation-launch" data-od-observation>观测实验 <span aria-hidden="true">↗</span></button>':''}
  </div>
  <div class="od-view-controls"><button data-od-bridge aria-pressed="${bridge}"><span>${bridge?'切换外部视角':'进入飞船舰桥'}</span></button><span>拖动星球，换个角度看宇宙</span></div>`;
}
function facts(d){return `<span class="od-hud-top">DESTINATION FILE / ${d.number}</span><h2>${d.name}<small>${d.en}</small></h2><dl>${d.facts.map(([value,label])=>`<div>${spaceIcon(['planet','orbit','scan'][d.facts.findIndex(f=>f[0]===value)])}<dt>${value}</dt><dd>${label}</dd></div>`).join('')}</dl><button data-od-article="${d.article}">打开科学档案 <span>＋</span></button>`;}
function archiveCards(){const q=query.trim().toLowerCase();const list=dossiers.filter(a=>(category==='全部'||category==='已收藏'&&saved.has(a.id)||a.category===category)&&(!q||[a.title,a.en,a.lead,...a.sections.flat()].join(' ').toLowerCase().includes(q)));return {list,html:list.length?list.map((a,i)=>`<article class="od-archive-card od-file-row"><span class="od-file-number">${String(i+1).padStart(2,'0')}</span><span class="interface-file-thumb" aria-hidden="true"><img src="${image(a.image)}" alt="" width="90" height="90" loading="lazy"></span><button class="od-archive-image od-file-title" data-od-article="${a.id}"><span>${a.category} / ${a.read}</span><h3>${a.title}</h3><p>${a.lead}</p></button><div class="od-card-foot"><button data-od-article="${a.id}">读取档案</button><button data-od-save="${a.id}" aria-pressed="${saved.has(a.id)}" aria-label="${saved.has(a.id)?'取消收藏':'收藏'}${a.title}">${saved.has(a.id)?'已收藏':'收藏'}</button></div></article>`).join(''):`<div class="od-empty"><span>SEARCH / 0 RESULTS</span><h3>没有找到匹配的档案。</h3><p>${category==='已收藏'?'在档案右侧点击“收藏”，把想再读的内容留在这里。':'换个关键词再试一次。'}</p><button data-od-clear-search>查看全部档案</button></div>`};}

export function renderOdysseyHome(worlds){const d=destinations[selected],cards=archiveCards();return `
<section id="od-hero" class="universe-map od-hero" aria-labelledby="od-hero-title">
 ${renderShipboard()}
 ${heroArtwork()}
 <button class="od-station-model-credit" data-od-sources>ISS / 国际空间站 <span>NASA · 三维模型 ↗</span></button>
 <div class="od-hero-edge" aria-hidden="true"><span>AN OPEN INVITATION TO THE UNIVERSE</span><span>EST. 13.8 BILLION YEARS AGO</span></div>
 <div class="od-hero-copy" data-od-copy data-station="${d.id}" style="--od-accent:${d.accent}">${document.body.dataset.odObservation===d.id?renderObservation(d.id,observationMode):heroCopy(d)}</div>
 <div class="od-orbital-tag" aria-hidden="true"><span class="od-crosshair"></span><span data-od-coordinates>${d.coordinates}</span><b data-od-object>${d.name}</b><small>EXPLORATION / ${d.number}</small></div>
 <aside class="od-facts" data-od-facts aria-label="当前目的地资料">${facts(d)}</aside>
 <div class="od-bottom-hud"><div class="od-navigation-controls"><button data-od-direction="-1" aria-label="上一站">←</button><span><b data-od-current>${d.number}</b> / 08</span><button data-od-direction="1" aria-label="下一站">→</button><i></i><button data-od-fullscreen aria-label="进入全屏">⛶</button><button data-action="pause" aria-label="${safetyPaused()?'恢复':'暂停'}动画" aria-pressed="${safetyPaused()}">${safetyPaused()?'▷':'Ⅱ'}</button><label class="od-quality-label">画质<select data-od-quality aria-label="场景画质"><option value="auto">自动</option><option value="high">精细</option><option value="low">流畅</option></select></label></div><div class="od-current-label"><span data-od-kind>${d.kind}</span><button data-od-jump="od-destinations">向下探索 <span>↓</span></button></div></div>
 <nav class="od-station-rail" aria-label="八站航行路线">${destinations.map((s,i)=>`<button data-od-station="${i}" aria-pressed="${i===selected}" class="${visited.has(s.id)?'is-visited':''}">${sphere(s.id)}<span class="od-station-no">${s.number}</span><i><b></b></i><span>${s.name}</span><small>${s.en}</small></button>`).join('')}</nav>
 <div class="od-transition" aria-hidden="true"><div class="od-transit-vortex">${Array.from({length:16},(_,i)=>`<i style="--ray:${i}"></i>`).join('')}</div><div class="od-transit-destination"><small>航线切换 · TRANSIT</small><strong data-od-flight-target></strong></div><i></i></div>
 <button class="od-clean-exit" data-od-clean>显示界面 <kbd>Esc</kbd></button>
 <p class="od-fallback" role="status">当前显示静态观赏场景，仍可切换八站与阅读完整档案。</p>
</section>
<div class="od-content">
 ${renderJourneyArrival()}
 ${renderImageControls()}
 <section id="od-destinations" class="od-section od-destinations"><header class="od-section-heading"><div><span class="od-eyebrow"><i></i> 01 / CHOOSE YOUR NEXT WONDER</span><h2>航行星图</h2></div><div><p>从熟悉的地球，走向遥远的光。<br>点选星体预览，选择下一段旅程。</p><span class="od-section-index">08 DESTINATIONS / ONE UNIVERSE</span></div></header>
  ${orbitalAtlas(destinations)}
 </section>
 <section class="pbl-instrument od-distance-note" aria-labelledby="od-distance-title"><header><div><span class="instrument-kicker">EARTH → MOON</span><h2 id="od-distance-title">飞到月球之前</h2></div><p>把地球直径作为距离单位，感受地月之间的空旷。</p></header><div class="od-distance-track" role="img" aria-label="地月平均距离约为 30 个地球直径"><i></i><span></span><i></i></div><dl><div><dt>地月平均距离</dt><dd>约 38.4 万 km</dd></div><div><dt>按地球平均直径换算</dt><dd>约 30 个地球直径</dd></div><div><dt>光的单程时间</dt><dd>约 1.28 秒</dd></div></dl><footer>以平均地月中心距离计算。图中端点标记地球与月球的位置。 <a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noopener">NASA 月球资料 ↗</a></footer></section>
 ${renderCosmicPanorama()}
 ${renderLightLab()}
 ${renderSignalDesk()}
 <section id="od-archive" class="od-section od-archive"><header class="od-section-heading"><div><span class="od-eyebrow"><i></i> 02 / BEYOND THE BEAUTIFUL</span><h2>档案终端</h2></div><div><p>不止于惊叹，更想知道为什么。<br>16 份航行档案，连接真实影像背后的科学。</p><button data-od-sources class="od-inline-source">资料核验 / NASA · ESA · ESO ↗</button></div></header>${renderArchiveFeature()}<div class="exp-curiosity"><span>从一个问题开始</span><button data-exp-query="引力透镜">光为什么会弯曲？ ↗</button><button data-exp-query="海洋">哪里还可能有海洋？ ↗</button><button data-exp-surprise>替我选一份档案 ＋</button></div><div class="od-archive-toolbar"><div class="od-archive-tabs" role="group" aria-label="筛选科学档案">${['全部','行星','观测','宇宙','探索','已收藏'].map(c=>`<button data-od-category="${c}" aria-pressed="${c===category}">${c}</button>`).join('')}</div><label class="od-search"><span>⌕</span><input type="search" placeholder="寻找一个宇宙问题" value="${escape(query)}" aria-label="搜索深空档案"><kbd>/</kbd></label></div><div class="od-search-summary" role="status" aria-live="polite">找到 <b data-od-results>${cards.list.length}</b> 份档案 <span>YOUR CURIOSITY IS THE COMPASS.</span></div><div class="od-archive-grid" data-od-archives>${cards.html}</div></section>
 <section id="od-worlds" class="od-section od-worlds"><header class="od-section-heading"><div><span class="od-eyebrow"><i></i> 03 / GO DEEPER, STAY CURIOUS</span><h2>宇宙的五个篇章</h2></div><p>从眼前的世界，到看不见的宇宙。<br>浏览专题、动手观测，或打开星际来信。</p></header>${renderWorldPortals(worlds)}${renderLessonGateway()}</section>
 ${renderMissionTrail()}
 <section class="od-last-word"><div class="od-last-orbit" aria-hidden="true"></div><span class="od-eyebrow">SOMEWHERE, SOMETHING INCREDIBLE IS WAITING.</span><h2>宇宙没有为你停下。<br><em>但你可以，为它停留片刻。</em></h2><div><button class="od-primary" data-od-jump="od-hero">再出发一次 <span>↑</span></button><button class="od-text-button" data-od-article="pale-blue-dot">回望那颗蓝色的点 ↗</button></div><p>已探索 <b data-od-count>${visited.size}</b> / 8 个目的地 · 已收藏 <b data-od-saved-count>${saved.size}</b> 篇档案<br><small>${storageAvailable?'发现记录保存在当前浏览器。':'浏览器存储暂不可用，记录仅保留在本次访问。'}</small></p></section>
 <footer class="od-footer"><a class="od-footer-brand" href="#universe" data-od-jump="od-hero">${icon}<span>太空<sup>+</sup><small>SPACE PLUS / A JOURNEY BEYOND</small></span></a><p>让一份好奇心，拥有整个宇宙。<br><small>场景为艺术化科普展示，非真实比例、实时星历或航行模拟。</small></p><div><button data-od-sources>影像、科学资料与致谢 ↗</button><span>DESIGNED FOR THE EXPLORER IN YOU.</span></div></footer>
</div>`;}
function safetyPaused(){return document.body.dataset.paused==='true';}

export function setupOdysseyExperience(){
 const modal=document.createElement('dialog');modal.className='od-dialog';modal.setAttribute('aria-labelledby','od-dialog-title');document.body.append(modal);let opener=null,openArticleId=null,lastTick=0,clean=false;
 function refreshCards(){const cards=archiveCards();const grid=document.querySelector('[data-od-archives]');if(grid)grid.innerHTML=cards.html;const result=document.querySelector('[data-od-results]');if(result)result.textContent=cards.list.length;document.querySelectorAll('[data-od-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.odCategory===category)));document.querySelectorAll('[data-od-saved-count]').forEach(n=>n.textContent=saved.size);}
 function reflect(){const d=destinations[selected],copy=document.querySelector('[data-od-copy]');if(!copy)return;if(observationMode!==null&&copy.dataset.station!==d.id)closeObservation(false);if(copy.dataset.station!==d.id){copy.innerHTML=heroCopy(d);copy.style.setProperty('--od-accent',d.accent);copy.dataset.station=d.id;copy.classList.remove('od-copy-arrive');void copy.offsetWidth;copy.classList.add('od-copy-arrive');}document.body.dataset.odysseyStation=d.id;document.querySelector('[data-od-facts]').innerHTML=facts(d);document.querySelector('[data-od-coordinates]').textContent=d.coordinates;document.querySelector('[data-od-object]').textContent=d.name;document.querySelector('.od-orbital-tag small').textContent='EXPLORATION / '+d.number;document.querySelector('[data-od-current]').textContent=d.number;document.querySelector('[data-od-kind]').textContent=d.kind;document.querySelectorAll('[data-od-station]').forEach(b=>{const index=Number(b.dataset.odStation);b.setAttribute('aria-pressed',String(index===selected));b.classList.toggle('is-visited',visited.has(destinations[index].id));});document.querySelectorAll('[data-od-count]').forEach(n=>n.textContent=visited.size);document.querySelectorAll('[data-od-tour]').forEach(b=>{b.setAttribute('aria-pressed',String(touring));b.querySelector('[data-od-tour-label]').textContent=touring?'暂停自动远航':'自动漫游';b.querySelector('.od-play-symbol').textContent=touring?'Ⅱ':'▶';});document.body.dataset.odysseyTour=String(touring);revealActiveStation();if(document.body.dataset.portalRenderer==='fallback'||matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('[data-od-tour-label]').forEach(n=>n.textContent='逐站探索宇宙');}}
 function revealActiveStation(){
  const rail=document.querySelector('.od-station-rail');
  const station=rail?.querySelector('button[aria-pressed="true"]');
  if(!station||rail.scrollWidth<=rail.clientWidth)return;
  const bounds=rail.getBoundingClientRect(),target=station.getBoundingClientRect();
  if(target.left<bounds.left||target.right>bounds.right){
   rail.scrollLeft+=target.left-bounds.left-(bounds.width-target.width)/2;
  }
 }
 function toHero(){document.querySelector('#od-hero')?.scrollIntoView({behavior:'instant',block:'start'});}
 function select(index,returnTop=false){closeObservation(false);selected=(index+destinations.length)%destinations.length;touring=false;visited.add(destinations[selected].id);persist();if(returnTop)toHero();command('select',{index:selected});playSpaceCue('travel');reflect();}
 function openObservation(){
  const id=destinations[selected].id;
  const copy=document.querySelector('[data-od-copy]');
  if(!copy||!hasObservation(id)||observationMode!==null)return;
  touring=false;
  observationMode=observationStart(id);
  document.body.dataset.odObservation=id;
  command('observation',{station:selected,mode:observationMode});
  copy.innerHTML=renderObservation(id,observationMode);
  reflect();
  copy.querySelector('h1').focus({preventScroll:true});
 }
 function closeObservation(restoreFocus){
  if(observationMode===null)return;
  observationMode=null;
  delete document.body.dataset.odObservation;
  command('observation',{mode:null});
  const copy=document.querySelector('[data-od-copy]');
  if(!copy)return;
  copy.innerHTML=heroCopy(destinations.find(d=>d.id===copy.dataset.station));
  if(restoreFocus)copy.querySelector('[data-od-observation]')?.focus({preventScroll:true});
 }
 document.addEventListener('space-film-update',event=>{if(event.detail?.active)closeObservation(false);});
 document.addEventListener('space-odyssey-command',event=>{
  if(event.detail?.action==='ship-mode'&&event.detail.enabled)closeObservation(false);
 });
 function open(title,content,articleId=null){if(!modal.open)opener=document.activeElement;openArticleId=articleId;modal.innerHTML=`<button class="od-dialog-close" aria-label="关闭阅读" data-od-close>×</button>${content}`;if(!modal.open)modal.showModal();modal.scrollTop=0;modal.style.setProperty('--cosmos-read','0%');document.body.dataset.odysseyDialog='true';command('dialog',{open:true});}
 function article(id){const a=dossiers.find(a=>a.id===id);if(!a)return;const refs=referenceSources.filter(s=>a.sources.includes(s[0]));const credit=imageCredits[a.image];open(a.title,`<div class="od-reader-image"><img src="${image(a.image)}" alt="${a.title}配图"><span>${a.en}</span></div><div class="od-reader-body"><span class="od-eyebrow">${a.category} / ${a.read} / SCIENCE FIELD NOTES</span><h2 id="od-dialog-title">${a.title}</h2><p class="od-reader-lead">${a.lead}</p>${credit?`<a class="od-image-credit" href="${credit[1]}" target="_blank" rel="noopener noreferrer">封面：${credit[0]} ↗</a>`:""}<div class="od-reader-meta"><span>依据公开科学资料编写 · 2026.11 核验</span><button data-od-save="${a.id}" aria-pressed="${saved.has(a.id)}">${saved.has(a.id)?'◆ 已收藏':'◇ 收藏这份档案'}</button></div><nav class="cosmos-reader-toc" aria-label="本文目录">${a.sections.map(([t],i)=>`<button data-cosmos-heading="${i}"><span>0${i+1}</span>${t}</button>`).join('')}</nav><div class="od-reader-sections">${a.sections.map(([t,p],i)=>`<section><span>0${i+1}</span><h3 tabindex="-1">${t}</h3><p>${p}</p></section>`).join('')}</div><aside class="od-reader-question"><small>TAKE A QUESTION WITH YOU.</small><h3>带着一个问题，继续航行。</h3><p>${a.question}</p></aside><div class="od-reader-sources"><h3>资料与延伸阅读</h3>${refs.map(s=>`<a href="${s[2]}" target="_blank" rel="noopener noreferrer">${s[1]} ↗</a>`).join('')}<p>正文为资料整理后的中文科普解读。封面下方可查阅原始影像与署名；艺术场景不用于天体测量。</p></div><div class="od-reader-next"><button data-od-close>回到旅程 ←</button><button data-od-article="${dossiers[(dossiers.indexOf(a)+1)%dossiers.length].id}">下一份档案 ↗</button></div></div>`,id);}
 function sources(){open('资料与致谢',`<div class="od-source-body"><span class="od-eyebrow">THE SCIENCE BEHIND THE JOURNEY</span><h2 id="od-dialog-title">让每一次惊叹，<br>都有可以追溯的来处。</h2><p>本次拓展查阅 NASA、ESA/Webb、ESA 与 ESO 的 22 个科学及任务页面，并检索 NASA 影像档案。主体内容与影像保存在本地，下面的原始链接供进一步查证。</p><div class="od-source-list">${referenceSources.map((s,i)=>`<a href="${s[2]}" target="_blank" rel="noopener noreferrer"><span>${String(i+1).padStart(2,'0')}</span>${s[1]} ↗</a>`).join('')}</div><h3>影像与三维场景</h3><p>韦伯影像：NASA / ESA / CSA / STScI。NASA 图片的具体机构、任务与处理者见各条素材记录。新增地球、火星与木星纹理：<a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer">Solar System Scope</a>，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>，经尺寸缩小和压缩；月球纹理：<a href="https://svs.gsfc.nasa.gov/4720/" target="_blank" rel="noopener noreferrer">NASA / Goddard / Scientific Visualization Studio，LRO / LROC</a>；其余纹理沿用原项目并保留原来源。Three.js：MIT 许可证。</p><p>地球、月球和行星使用天体纹理构图；星云与深场使用真实观测图像进行空间化展示，人工纵深不等于三维测量。黑洞的光带与透镜外观是物理启发的艺术表达，未进行完整相对论计算。所有场景的大小、距离、速度均经过视觉编排。</p><p>地球舰桥前景中的国际空间站使用 <a href="https://science.nasa.gov/resource/international-space-station-3d-model/" target="_blank" rel="noopener noreferrer">NASA 公开三维模型</a>，已压缩网格并缩小纹理以适配网页。镜头中的位置、尺度和运动为艺术编排；其余探索飞船、观察窗框为原创程序模型。</p><p>电影中的探测器、冰环近景与星系是程序化艺术构图，不是实拍或测量重建。</p><p>本地氛围音与电影配乐由 Web Audio 合成；点击播放电影会开启声音，可在播放器中关闭。首页首次默认静音；没有将科幻音效当作太空中真实传播的声音。</p><button class="od-outline" data-od-close>继续探索 ↗</button></div>`);}
 document.addEventListener('space-ship-read',e=>article(e.detail.id));
 document.addEventListener('space-ship-navigation',e=>select(e.detail.index));
 document.addEventListener('space-odyssey-update',event=>{const d=event.detail||{};if(Number.isInteger(d.index)&&d.index>=0&&d.index<destinations.length){const changed=selected!==d.index;selected=d.index;touring=!!d.touring;if(changed){visited.add(destinations[selected].id);persist();playSpaceCue('reveal');}reflect();}if(Number.isFinite(d.progress)){document.documentElement.style.setProperty('--od-tour-progress',d.progress);}});
 document.addEventListener('click',event=>{
  const save=event.target.closest('[data-od-save]');if(save){const id=save.dataset.odSave;if(!dossiers.some(a=>a.id===id))return;saved.has(id)?saved.delete(id):saved.add(id);persist();refreshCards();if(modal.open&&openArticleId){const b=modal.querySelector('[data-od-save]');if(b){b.textContent=saved.has(openArticleId)?'◆ 已收藏':'◇ 收藏这份档案';b.setAttribute('aria-pressed',String(saved.has(openArticleId)));}}return;}
  if(event.target.closest('[data-od-close]')){modal.close();return;}
  const read=event.target.closest('[data-od-article]');if(read){article(read.dataset.odArticle);return;}
  if(event.target.closest('[data-od-sources]')){sources();return;}
  if(event.target.closest('button[data-od-observation]')){openObservation();return;}
  if(event.target.closest('[data-od-observation-exit]')){closeObservation(true);return;}
  const observationButton=event.target.closest('[data-od-observation-mode]');
  if(observationButton&&observationMode!==null){
   observationMode=Number(observationButton.dataset.odObservationMode);
   reflectObservation(destinations[selected].id,observationMode);
   command('observation',{station:selected,mode:observationMode});
   return;
  }
  const jump=event.target.closest('[data-od-jump]');if(jump){event.preventDefault();const target=document.getElementById(jump.dataset.odJump);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});if(jump.matches('.od-explore-launch')){const heading=target?.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}return;}
  const station=event.target.closest('[data-od-station]');if(station){select(Number(station.dataset.odStation),station.hasAttribute('data-od-return-top'));return;}
  if(event.target.closest('button[data-od-bridge]')){bridge=!bridge;command('bridge',{enabled:bridge});document.querySelectorAll('button[data-od-bridge]').forEach(b=>{b.setAttribute('aria-pressed',String(bridge));b.querySelector('span').textContent=bridge?'切换外部视角':'进入飞船舰桥';});document.body.dataset.odBridge=String(bridge);return;}
  const direction=event.target.closest('[data-od-direction]');if(direction){select(selected+Number(direction.dataset.odDirection));return;}
  if(event.target.closest('[data-od-tour]')){toHero();if(document.body.dataset.portalRenderer==='fallback'||matchMedia('(prefers-reduced-motion: reduce)').matches){select(selected+1);return;}touring=!touring;command('tour',{active:touring});if(touring)playSpaceCue('opening');reflect();return;}
  const prompt=event.target.closest('[data-exp-query]');if(prompt){query=prompt.dataset.expQuery;category='全部';document.querySelector('.od-search input').value=query;refreshCards();return;}
  if(event.target.closest('[data-exp-surprise]')){const list=archiveCards().list;article((list.length?list:dossiers)[Math.floor(Math.random()*(list.length||dossiers.length))].id);return;}
  const filter=event.target.closest('[data-od-category]');if(filter){category=filter.dataset.odCategory;refreshCards();return;}
  if(event.target.closest('[data-od-clear-search]')){category='全部';query='';const input=document.querySelector('.od-search input');if(input)input.value='';refreshCards();return;}
  if(event.target.closest('[data-od-clean]')){clean=!clean;document.body.dataset.odysseyClean=String(clean);document.querySelector(clean?'.od-clean-exit':'.od-key-hint [data-od-clean]')?.focus({preventScroll:true});return;}
  if(event.target.closest('[data-od-fullscreen]')){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>{});}
 });
 document.addEventListener('input',event=>{if(event.target.matches('.od-search input')){query=event.target.value;refreshCards();}});
 document.addEventListener('change',event=>{if(event.target.matches('[data-od-quality]')){quality=event.target.value;command('quality',{quality});}});
 document.addEventListener('keydown',event=>{if(modal.open)return;if(event.key==='Escape'){if(observationMode!==null){closeObservation(true);return;}if(clean){clean=false;document.body.dataset.odysseyClean='false';document.querySelector('.od-key-hint [data-od-clean]')?.focus({preventScroll:true});}else if(touring){touring=false;command('tour',{active:false});reflect();}}if(document.body.dataset.route!=='universe')return;if(event.key==='/'&&!event.target.matches('input,textarea')){event.preventDefault();document.querySelector('.od-search input')?.focus();document.querySelector('#od-archive')?.scrollIntoView({behavior:'instant'});}if(document.body.dataset.flightMode!=='ship'&&document.activeElement?.id==='universe'&&['ArrowRight','ArrowLeft'].includes(event.key)){event.preventDefault();select(selected+(event.key==='ArrowRight'?1:-1));}});
 modal.addEventListener('close',()=>{delete document.body.dataset.odysseyDialog;command('dialog',{open:false});if(opener?.isConnected)opener.focus({preventScroll:true});openArticleId=null;});
 modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
 addEventListener('scroll',()=>{const now=performance.now();if(now-lastTick<70)return;lastTick=now;document.body.classList.toggle('od-scrolled',scrollY>90);if(scrollY>innerHeight*.65&&touring){touring=false;command('tour',{active:false});reflect();}},{passive:true});
 return {afterRender(s){if(s.route==='universe'){document.body.dataset.odBridge=String(bridge);reflect();refreshCards();const q=document.querySelector('[data-od-quality]');if(q)q.value=quality;}else{closeObservation(false);if(modal.open)modal.close();clean=false;delete document.body.dataset.odysseyClean;}}};
}
