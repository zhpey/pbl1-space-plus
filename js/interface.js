const sections=[['od-hero','序章','向群星出发'],['od-destinations','星图','选择下一个世界'],['exp-light-lab','观测','读懂光与颜色'],['exp-signal','信号','把距离变成等待'],['od-archive','档案','留住一个宇宙问题'],['od-worlds','篇章','走进五个主题世界'],['exp-missions','足迹','回看人类的远航']];
const worlds=[['explore','行星漫游'],['solar','太阳系'],['atlas','星座图谱'],['unknown','宇宙谜题'],['observatory','深空影像'],['story','星际来信']];

export function renderJourneyArrival(){return `<div class="interface-arrival"><div><span class="interface-arrival-number">01—08</span><p>你的好奇心，决定航向。<small>选择一个世界，或带着一个问题继续。</small></p></div><a href="#od-destinations" data-od-jump="od-destinations">展开航行星图 <span aria-hidden="true">↓</span></a></div>`;}

export function setupInterface(){
 const menu=document.createElement('dialog');menu.className='interface-directory';menu.setAttribute('aria-labelledby','interface-menu-title');document.body.append(menu);
 let readingSize='standard';
 try{if(localStorage.getItem('space-plus-interface-reading')==='comfortable')readingSize='comfortable';}catch{}
 function reflectReading(){
  document.documentElement.dataset.interfaceReading=readingSize;
  menu.querySelectorAll('[data-interface-reading]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.interfaceReading===readingSize)));
 }
 reflectReading();
 const progress=document.createElement('div');progress.className='interface-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<i></i>';document.body.append(progress);
 const returnButton=document.createElement('button');returnButton.className='interface-return';returnButton.innerHTML='回到星空 <span aria-hidden="true">↑</span>';returnButton.setAttribute('aria-label','回到首页宇宙序章');document.body.append(returnButton);
 let scrollFrame=0,activeSection='od-hero';
 function updateJourney(){
  scrollFrame=0;
  const home=document.body.dataset.route==='universe',hero=document.getElementById('od-hero');
  const visible=home&&hero&&scrollY>hero.offsetHeight*.8;
  progress.dataset.visible=String(Boolean(visible));returnButton.dataset.visible=String(Boolean(visible));
  returnButton.tabIndex=visible?0:-1;
  if(!home)return;
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.setProperty('--interface-progress',String(max>0?Math.min(1,Math.max(0,scrollY/max)):0));
  activeSection='od-hero';
  for(const [id] of sections){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top<=160)activeSection=id;}
 }
 function queueJourney(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateJourney);}
 function revealRouteNav(){const link=document.querySelector('.side-nav a[aria-current=page]');if(link&&matchMedia('(max-width:759px)').matches){const nav=link.parentElement;nav.scrollLeft=link.offsetLeft-nav.clientWidth/2+link.offsetWidth/2;}}
 document.addEventListener('scroll',queueJourney,{passive:true});window.addEventListener('resize',()=>{queueJourney();revealRouteNav();},{passive:true});
 returnButton.addEventListener('click',()=>jump('od-hero'));
 document.addEventListener('click',event=>{
  const size=event.target.closest('button[data-interface-reading]');
  if(size){readingSize=size.dataset.interfaceReading;reflectReading();try{localStorage.setItem('space-plus-interface-reading',readingSize);}catch{}return;}
  if(event.target.closest('[data-interface-clear-search]')){
   const input=document.querySelector('.od-search input');
   if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus({preventScroll:true});}
   return;
  }
  if(event.target.closest('[data-interface-read-letter]')){
   const paper=document.querySelector('.letter-paper'),title=paper?.querySelector('h1');
   paper?.scrollIntoView({block:'start',behavior:'instant'});
   if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
  }
 });
 document.addEventListener('input',event=>{
  if(event.target.matches('.od-search input')){
   const clear=event.target.closest('.od-search').querySelector('[data-interface-clear-search]');if(clear)clear.hidden=!event.target.value;
  }
 });
 let opener=null,pendingSection=null,restoreFocus=true;
 function close(){menu.close();}
 function jump(id){const section=document.getElementById(id);section?.scrollIntoView({block:'start',behavior:'instant'});const heading=document.getElementById(section?.getAttribute('aria-labelledby'))||section?.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 function navigateSection(id){restoreFocus=false;close();if(document.body.dataset.route==='universe'){jump(id);return;}pendingSection=id;location.hash='universe';}
 function open(){updateJourney();opener=document.activeElement;menu.innerHTML=`<header><div><span class="od-eyebrow">SPACE PLUS / JOURNEY DIRECTORY</span><h2 id="interface-menu-title">下一段星空</h2></div><button data-interface-close aria-label="关闭探索目录">×</button></header><div class="interface-directory-columns"><nav aria-label="首页探索章节">${sections.map(([id,label,description],i)=>`<button data-interface-section="${id}" ${document.body.dataset.route==='universe'&&id===activeSection?'aria-current="location"':''}><span>0${i+1}</span><b>${label}</b><small>${description}</small><i aria-hidden="true">↗</i></button>`).join('')}</nav><div class="interface-directory-worlds"><span class="od-eyebrow">深入一个世界</span>${worlds.map(([route,label])=>`<a href="#${route}" data-interface-route ${document.body.dataset.route===route?'aria-current="page"':''}>${label}<span aria-hidden="true">↗</span></a>`).join('')}<p>八个目的地 · 16 份科学档案<br>40 篇专题 · 一段属于你的旅程</p></div></div>`;menu.showModal();opener?.setAttribute('aria-expanded','true');document.dispatchEvent(new CustomEvent('space-odyssey-command',{detail:{action:'dialog',open:true}}));}
 document.addEventListener('click',event=>{if(event.target.closest('[data-interface-menu]')){restoreFocus=true;open();menu.insertAdjacentHTML('beforeend','<div class="interface-reading-settings" role="group" aria-label="阅读弹窗字号"><span>阅读弹窗字号</span><button data-interface-reading="standard" aria-pressed="false">标准</button><button data-interface-reading="comfortable" aria-pressed="false">舒适</button></div>');reflectReading();return;}if(event.target.closest('[data-interface-close]')){close();return;}const section=event.target.closest('[data-interface-section]');if(section){navigateSection(section.dataset.interfaceSection);return;}if(event.target.closest('[data-interface-route]')){restoreFocus=false;close();}});
 menu.addEventListener('close',()=>{document.dispatchEvent(new CustomEvent('space-odyssey-command',{detail:{action:'dialog',open:false}}));if(restoreFocus&&opener?.isConnected)opener.focus({preventScroll:true});document.querySelectorAll('[data-interface-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));});
 menu.addEventListener('click',event=>{if(event.target!==menu)return;const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
 return {afterRender(){
  const route=document.body.dataset.route;
  const gallery=document.querySelector('.gallery-heading');
  if(gallery&&!document.querySelector('.interface-gallery-note')){
   const note=document.createElement('p');note.className='interface-gallery-note';
   const count=String(document.querySelectorAll('.photo-card').length).padStart(2,'0');
   note.innerHTML=`<span>观测影像 / ${count}</span><span>点开影像，可放大查看</span>`;gallery.insertAdjacentElement('afterend',note);
  }
  const search=document.querySelector('.od-search');
  if(search&&!search.querySelector('[data-interface-clear-search]')){
   const clear=document.createElement('button');clear.type='button';clear.dataset.interfaceClearSearch='';clear.setAttribute('aria-label','清空档案搜索');clear.textContent='×';clear.hidden=!search.querySelector('input').value;search.append(clear);
  }
  const letterHeader=document.querySelector('.letter-heading');
  if(letterHeader&&!letterHeader.querySelector('[data-interface-read-letter]')){
   const read=document.createElement('button');read.className='interface-letter-entry';read.dataset.interfaceReadLetter='';read.innerHTML='直接读这封信 <span aria-hidden="true">↓</span>';letterHeader.append(read);
  }
  document.querySelectorAll('[data-interface-menu]').forEach(b=>{b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded',String(menu.open));});
  document.querySelectorAll('.header-nav a').forEach(a=>{if(a.hash==='#'+route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  revealRouteNav();
  queueJourney();
  if(pendingSection&&route==='universe'){const id=pendingSection;pendingSection=null;requestAnimationFrame(()=>jump(id));}
 }};
}
