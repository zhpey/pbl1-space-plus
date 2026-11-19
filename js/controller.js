import {communicationDefaults,waveBands,missionArchives} from './research-data.js';
import {previewCommunication,localDate} from './fieldwork.js';
import {planets,routes,constellations,mysteries,chapters,photos} from './data.js';
import {handleMemberAction} from './member-actions.js';
import {findArticle,applyLibrarySearch} from './library.js';
import {previewDiscovery,visiblePhotos} from './discovery.js';
import {capturePhotoView,fitPhotoView} from './photo-view.js';
export function createController(options={}){
 const state=options.state||{route:'universe',planet:'earth',constellation:'orion',mystery:'blackhole',chapter:0,filter:'all',paused:matchMedia('(prefers-reduced-motion: reduce)').matches,dialog:null,vue:false};
 let saved={};
 try{saved=JSON.parse(localStorage.getItem('space-plus-discoveries')||'{}')||{};}catch{}
 Object.assign(state,{libraryQueries:{},compareA:state.compareA||'earth',compareB:state.compareB||'mars',solarZone:state.solarZone||'sun',bodyMass:60,lightTarget:'earth',orbitSpeed:1,shipSpeed:0.8,atlasLines:true,atlasLabels:true,atlasNight:false,atlasGrid:false,photoZoom:1,
  savedPhotos:[...new Set(Array.isArray(saved.photos)?saved.photos.filter(id=>photos.some(p=>p.id===id)):[])],
  readChapters:[...new Set(Array.isArray(saved.chapters)?saved.chapters.filter(i=>Number.isInteger(i)&&i>=0&&i<chapters.length):[])],lastChapter:Number.isInteger(saved.lastChapter)&&saved.lastChapter>=0&&saved.lastChapter<chapters.length?saved.lastChapter:0,storageNotice:'',
  waveBand:'infrared',missionId:'change6',commDistance:communicationDefaults[0],observationNotice:'',
  transmissions:Array.isArray(saved.transmissions)?saved.transmissions.filter(x=>x&&Number.isInteger(x.chapter)&&x.chapter>=0&&x.chapter<chapters.length&&Number.isFinite(x.distance)&&x.distance>=0.01&&x.distance<=40&&Number.isFinite(x.sentAt)&&x.sentAt>0&&x.sentAt<=Date.now()+86400000).slice(0,4):[],
  observations:Array.isArray(saved.observations)?saved.observations.filter(x=>x&&typeof x.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&typeof x.place==='string'&&typeof x.note==='string'&&constellations.some(c=>c.id===x.target)&&['found','uncertain','missed'].includes(x.result)).slice(0,5).map(x=>({...x,place:x.place.slice(0,40),note:x.note.slice(0,240)})):[]});
 let engine,returnFocus,returnFocusPosition=0,oldDialog=null,restoreFocus=false,pendingFocus=null,photoSnapshot=null,photoAnchor=null,photoReset=false;const subscribers=new Set();
 const update=()=>{photoSnapshot=capturePhotoView(document.querySelector('.photo-viewer'),photoAnchor);photoAnchor=null;const active=document.activeElement;if(active?.dataset.action)pendingFocus={action:active.dataset.action,value:active.dataset.value};document.body.dataset.route=state.route;document.body.dataset.paused=String(state.paused);for(const [key,value] of [['atlasLines',state.atlasLines],['atlasLabels',state.atlasLabels],['atlasNight',state.atlasNight],['atlasGrid',state.atlasGrid]])document.body.dataset[key]=String(value);engine?.setView(state);for(const fn of subscribers)fn();};
 function persist(){try{localStorage.setItem('space-plus-discoveries',JSON.stringify({photos:state.savedPhotos,chapters:state.readChapters,lastChapter:state.lastChapter,transmissions:state.transmissions,observations:state.observations}));state.storageNotice='';}catch{state.storageNotice='当前浏览器无法保存，记录仅保留在本次访问中。';}}
 function parseHash(){
  const previousChapter=state.chapter,previousRoute=state.route;
  const [r,id]=location.hash.slice(1).split('/');
  state.route=routes.some(x=>x.id===r)?r:'universe';
  if(state.route==='explore'&&planets.some(x=>x.id===id))state.planet=id;
  if(state.route==='atlas'&&constellations.some(x=>x.id===id))state.constellation=id;
  if(state.route==='unknown'&&mysteries.some(x=>x.id===id))state.mystery=id;
  if(state.route==='story'){
   state.chapter=id!==undefined&&id!==''&&Number.isInteger(Number(id))&&Number(id)>=0&&Number(id)<chapters.length?Number(id):state.lastChapter;
   if(state.chapter!==previousChapter)state.commDistance=communicationDefaults[state.chapter];
   state.lastChapter=state.chapter;persist();
  }
  state.dialog=null;update();
  const continuingLetter=previousRoute==='story'&&state.route==='story'&&previousChapter!==state.chapter;
  const paper=continuingLetter?document.querySelector('.letter-paper'):null;
  if(paper){
   paper.scrollIntoView({block:'start',behavior:'instant'});
   const title=paper.querySelector('h1');
   if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
  }else if(previousRoute!==state.route||!['atlas','unknown'].includes(state.route)) window.scrollTo({top:0,behavior:'instant'});
  updateSceneControls();
 }
 function open(type,id){returnFocus=document.activeElement;returnFocusPosition=[...document.querySelectorAll('[data-action]')].filter(el=>el.dataset.action===returnFocus?.dataset?.action&&el.dataset.value===returnFocus?.dataset?.value).indexOf(returnFocus);state.photoZoom=1;state.dialog={type,id};update();}
 function close(){state.dialog=null;restoreFocus=true;update();}
 function click(event){
  if(event.target.closest('.skip-link')){event.preventDefault();if(!state.dialog){const main=document.querySelector('#page-content');main?.focus({preventScroll:true});main?.scrollIntoView({block:'start'});}return;}
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const value=el.dataset.value;if(handleMemberAction(el.dataset.action,value,{state,update,persist}))return;switch(el.dataset.action){
   case 'wave-band':if(waveBands.some(x=>x.id===value)){state.waveBand=value;update();}break;
   case 'mission-select':if(missionArchives.some(x=>x.id===value)){state.missionId=value;update();}break;
   case 'letter-send':{const distance=Number(document.querySelector('#comm-distance')?.value);if(!Number.isFinite(distance)||distance<0.01||distance>40)break;state.commDistance=distance;state.transmissions=[...state.transmissions.filter(x=>x.chapter!==state.chapter),{chapter:state.chapter,distance,sentAt:Date.now()}];persist();update();break;}
   case 'world':if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)break;if(engine?.enterWorld){event.preventDefault();engine.enterWorld(value);}break;
   case 'article':if(findArticle(value))open('article',value);break;
   case 'pause':state.paused=!state.paused;update();break;
   case 'detail':open('planet',value);break;
   case 'photo':open('photo',value);break;
   case 'mystery-detail':open('mystery',value);break;
   case 'guide':case 'sources':case 'sun':case 'zodiac':open(el.dataset.action);break;
   case 'close':close();break;
   case 'zoom-in':engine?.zoom(-1);break;
   case 'zoom-out':engine?.zoom(1);break;
   case 'reset':engine?.reset();break;
   case 'reading-top':event.preventDefault();window.scrollTo({top:0,behavior:'instant'});break;
   case 'map-jump':{event.preventDefault();const target=document.querySelector('#beyond-space');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:'instant'});break;}
   case 'library-jump':{event.preventDefault();const target=document.querySelector('#world-library');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:'instant'});break;}
   case 'learning-jump':{event.preventDefault();const target=document.querySelector('.learning-region');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;}
   case 'discovery-jump':{event.preventDefault();const target=document.querySelector('#discovery');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;}
   case 'photo-next':navigatePhoto(1);break;
   case 'photo-previous':navigatePhoto(-1);break;
   case 'photo-zoom-in':state.photoZoom=Math.min(4,state.photoZoom+0.5);update();break;
   case 'photo-zoom-out':state.photoZoom=Math.max(1,state.photoZoom-0.5);update();break;
   case 'photo-reset':state.photoZoom=1;photoReset=true;update();break;
  }
 }
 function afterRender(){
  const host=document.querySelector('.dialog-host');if(!host)return;
  host.classList.toggle('hidden',!state.dialog);document.body.style.overflow=state.dialog?'hidden':'';
  host.querySelector('.dialog')?.classList.toggle('dialog-stable',!!state.dialog&&!!oldDialog);
  if(state.dialog?.type==='photo'){
   let viewer=host.querySelector('.photo-viewer');
   const snapshot=photoSnapshot?.id===state.dialog.id?photoSnapshot:null;
   if(snapshot&&viewer!==snapshot.viewer){viewer.replaceWith(snapshot.viewer);viewer=snapshot.viewer;}
   fitPhotoView(viewer,state.photoZoom,photoReset?null:snapshot);
   if(snapshot)host.querySelector('.dialog').scrollTop=snapshot.dialogScroll;
   if(snapshot?.focused)viewer.focus({preventScroll:true});
  }
  photoSnapshot=null;photoReset=false;
  for(const el of document.querySelectorAll('.topbar,.side-nav,#page-content,.planet-dock,.controls,.bottom-bar,#stage,.scene-status'))el.inert=!!state.dialog;
  if(state.dialog&&state.dialog!==oldDialog){host.querySelector('.dialog-close')?.focus();}
  if(!state.dialog&&restoreFocus){const peers=[...document.querySelectorAll('[data-action]')].filter(el=>el.dataset.action===returnFocus?.dataset?.action&&el.dataset.value===returnFocus?.dataset?.value);const target=returnFocus?.isConnected?returnFocus:peers[returnFocusPosition]||peers[0]||document.querySelector('[data-action="filter"][data-value="saved"]');target?.focus({preventScroll:true});restoreFocus=false;}
  oldDialog=state.dialog;
  if(pendingFocus&&(document.activeElement===document.body||!document.activeElement?.isConnected)){
   const target=document.querySelector(`[data-action="${pendingFocus.action}"]${pendingFocus.value?`[data-value="${pendingFocus.value}"]`:''}`);target?.focus({preventScroll:true});
  }
  pendingFocus=null;
  updateSceneControls();
 }
 function key(event){
  if(!state.dialog)return;
  if(event.key==='Escape'){event.preventDefault();close();}
  if(state.dialog?.type==='photo'&&['ArrowLeft','ArrowRight'].includes(event.key)&&!event.target.closest('.photo-viewer')){event.preventDefault();navigatePhoto(event.key==='ArrowRight'?1:-1);}
  if(event.key==='Tab'){const items=[...document.querySelector('.dialog').querySelectorAll('button:not([disabled]),a[href],summary,[tabindex="0"]')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 }
 function background(event){if(event.target.classList.contains('dialog-host'))close();}
 function updateSceneControls(){
  const learning=document.querySelector('.learning-region'),controls=document.querySelector('.controls');
  if(!controls)return;
  const paper=state.route==='story'?document.querySelector('.letter-paper')?.getBoundingClientRect():null;
  const destination=state.route==='story'?document.querySelector('.letter-destination')?.getBoundingClientRect():null;
  const readingLetter=!!paper&&((paper.right>innerWidth-96&&paper.top<innerHeight*.65)||(destination&&destination.bottom<innerHeight*.25));
  const instrument = document.querySelector('.pbl-instrument');
  const readingInstrument = instrument && instrument.getBoundingClientRect().top < innerHeight * .65;
  controls.classList.toggle('scrolled-out',readingLetter||readingInstrument||!!learning&&learning.getBoundingClientRect().top<innerHeight*.5);
 }
 addEventListener('scroll',updateSceneControls,{passive:true});
 addEventListener('resize',updateSceneControls);
 function navigatePhoto(direction){if(state.dialog?.type!=='photo')return;const list=visiblePhotos(state);if(list.length<2)return;const index=list.findIndex(p=>p.id===state.dialog.id);state.photoZoom=1;state.dialog={type:'photo',id:list[(index+direction+list.length)%list.length].id};update();}
 const ranges={bodyMass:[10,150],shipSpeed:[0,0.99],orbitSpeed:[0,4],commDistance:[0.01,40]};
 function rangeValue(el){const bounds=ranges[el.dataset.value],value=Number(el.value);return bounds&&Number.isFinite(value)?Math.max(bounds[0],Math.min(bounds[1],value)):null;}
 function input(event){const search=event.target.closest('[data-library-search]');if(search){state.libraryQueries[search.dataset.librarySearch]=search.value;applyLibrarySearch(search);return;}const el=event.target.closest('input[data-action="discovery-range"]');if(!el)return;const value=rangeValue(el);if(value===null)return;if(el.dataset.value==='commDistance'){previewCommunication(value);return;}const preview={...state,[el.dataset.value]:value};previewDiscovery(preview);if(el.dataset.value==='orbitSpeed')engine?.setView(preview);}
 function submit(event){const form=event.target.closest('form[data-action="observation-form"]');if(!form)return;event.preventDefault();const fields=new FormData(form),entry={date:String(fields.get('date')||''),place:String(fields.get('place')||'').trim().slice(0,40),target:String(fields.get('target')||''),result:String(fields.get('result')||''),note:String(fields.get('note')||'').trim().slice(0,240)};if(!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)||entry.date<'1900-01-01'||entry.date>localDate()||!entry.place||!entry.note||!constellations.some(c=>c.id===entry.target)||!['found','uncertain','missed'].includes(entry.result))return;state.observations=[entry,...state.observations].slice(0,5);persist();state.observationNotice=state.storageNotice||'观星记录已保存。';update();document.querySelector('.observation-submit button')?.focus({preventScroll:true});}
 function change(event){const el=event.target.closest('[data-action]');if(!el)return;
  if(el.dataset.action==='compare'&&['compareA','compareB'].includes(el.dataset.value)&&planets.some(p=>p.id===el.value)){state[el.dataset.value]=el.value;update();}
  if(el.dataset.action==='light-target'&&planets.some(p=>p.id===el.value)){state.lightTarget=el.value;update();}
  const toggles={'atlas-lines':'atlasLines','atlas-labels':'atlasLabels','atlas-night':'atlasNight','atlas-grid':'atlasGrid'};
  if(el.type==='checkbox'&&toggles[el.dataset.action]){state[toggles[el.dataset.action]]=el.checked;update();}
  if(el.dataset.action==='discovery-range'){const value=rangeValue(el);if(value!==null){state[el.dataset.value]=value;update();}}
 }
 document.addEventListener('input',input);
 let photoDrag=null;
 function photoDown(event){const viewer=event.target.closest('.photo-viewer.zoomed');if(!viewer||event.pointerType!=='mouse'||event.button!==0)return;photoDrag={viewer,x:event.clientX,y:event.clientY,left:viewer.scrollLeft,top:viewer.scrollTop};viewer.setPointerCapture(event.pointerId);event.preventDefault();viewer.focus({preventScroll:true});}
 function photoMove(event){if(!photoDrag)return;const {viewer,x,y,left,top}=photoDrag;viewer.scrollLeft=left+x-event.clientX;viewer.scrollTop=top+y-event.clientY;}
 function photoUp(event){if(photoDrag?.viewer.hasPointerCapture(event.pointerId))photoDrag.viewer.releasePointerCapture(event.pointerId);photoDrag=null;}
 function photoDoubleClick(event){const viewer=event.target.closest('.photo-viewer');if(!viewer||state.dialog?.type!=='photo')return;event.preventDefault();const r=viewer.getBoundingClientRect();photoAnchor={x:event.clientX-r.left-viewer.clientLeft,y:event.clientY-r.top-viewer.clientTop};state.photoZoom=state.photoZoom===1?2:1;update();}
 function photoResize(){const viewer=document.querySelector('.photo-viewer');if(viewer)fitPhotoView(viewer,state.photoZoom,capturePhotoView(viewer));}
 document.addEventListener('dblclick',photoDoubleClick);addEventListener('resize',photoResize);
 document.addEventListener('pointerdown',photoDown);document.addEventListener('pointermove',photoMove);document.addEventListener('pointerup',photoUp);document.addEventListener('pointercancel',photoUp);
 document.addEventListener('submit',submit);
 document.addEventListener('change',change);
 addEventListener('hashchange',parseHash);document.addEventListener('click',click);document.addEventListener('click',background);document.addEventListener('keydown',key);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');const motionChange=e=>{state.paused=e.matches;update();};motion.addEventListener('change',motionChange);
 parseHash();
 return {state,subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},attachEngine(value){engine=value;engine.setView(state);},afterRender,update,togglePause(){state.paused=!state.paused;update();},selectPlanet(id){location.hash='explore/'+id;},selectWorld(route){location.hash=route;},destroy(){removeEventListener('hashchange',parseHash);removeEventListener('scroll',updateSceneControls);removeEventListener('resize',updateSceneControls);document.removeEventListener('click',click);document.removeEventListener('click',background);document.removeEventListener('submit',submit);document.removeEventListener('change',change);document.removeEventListener('input',input);document.removeEventListener('pointerdown',photoDown);document.removeEventListener('pointermove',photoMove);document.removeEventListener('pointerup',photoUp);document.removeEventListener('pointercancel',photoUp);document.removeEventListener('dblclick',photoDoubleClick);removeEventListener('resize',photoResize);document.removeEventListener('keydown',key);motion.removeEventListener('change',motionChange);engine?.dispose();}};
}
