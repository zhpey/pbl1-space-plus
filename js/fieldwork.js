import {constellations} from './data.js';
import {waveBands,missionArchives,dayLengths,communicationDefaults,constellationCodes} from './research-data.js';
import {heading} from './learning/shared.js';
import {renderReadingDetails} from './reading-details.js';

const assetRoot = new URL('../assets/research/',import.meta.url).href;
const source = (url,label='阅读原始资料') => `<a class="field-source" href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
export const escapeText = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

export function renderWaveComparison(s){
 const band=waveBands.find(x=>x.id===s.waveBand)||waveBands[0];
 return `<section class="wave-study" id="wave-study">${heading('ONE NEBULA, DIFFERENT LIGHT','同一片星云，不同的答案。','把创生之柱的可见光、近红外和双仪器合成图放在一起，看看尘埃与恒星怎样改变面貌。')}
  <div class="field-tabs" aria-label="选择右侧对照影像">${waveBands.map(x=>`<button data-action="wave-band" data-value="${x.id}" aria-pressed="${x.id===band.id}">${x.name}</button>`).join('')}</div>
  <div class="wave-pair"><figure><div class="wave-image"><img src="${assetRoot}pillars-optical.jpg" width="1200" height="1252" alt="哈勃可见光中的创生之柱，明亮气体边缘围绕暗色尘埃柱" loading="lazy"></div><figcaption><span class="eyebrow">HUBBLE / VISIBLE LIGHT</span><h3>可见光：勾勒气体与尘埃</h3><p>发光气体的明亮边缘，衬出遮挡星光的暗色尘埃。</p><p class="field-credit">NASA, ESA/Hubble and the Hubble Heritage Team</p>${source('https://esahubble.org/images/heic1501a/','可见光观测档案')}</figcaption></figure>
  <figure><div class="wave-image"><img src="${assetRoot}${band.image}" width="1200" height="1123" alt="${band.alt}" loading="lazy"></div><figcaption><span class="eyebrow">${band.instrument}</span><h3>${band.question}</h3><p>${band.body}</p><p class="field-credit">${band.credit}</p>${source(band.url,'当前影像观测档案')}</figcaption></figure></div>
  <div class="wave-metadata" role="status"><span>波段 · ${band.bands}</span><span>${band.date}</span></div><p class="wave-colour-note">影像颜色由观测波段映射而成，并非肉眼直接看到的红外景象。</p>
  ${renderReadingDetails(`wave-colour-${band.id}`,'查看颜色如何映射',`<p class="wave-colour-detail">${band.color}</p>`)}
  <p class="reading-footnote">并排展示不同视场与年代的观测，不作像素重叠比较。颜色映射与拍摄设备的差异，不能直接解释为天体随时间发生变化。</p>
 </section>`;
}

export function renderMissionArchives(s){
 const m=missionArchives.find(x=>x.id===s.missionId)||missionArchives[0];
 return `<section class="mission-archives" id="mission-archives">${heading('FROM OBSERVATION TO DISCOVERY','跟着中国探测器，读懂一张照片。','从月球背面到火星地表，再回望地球。每一幅图像，都有自己的拍摄方式和科学问题。')}
  <div class="field-tabs" aria-label="选择中国航天任务档案">${missionArchives.map(x=>`<button data-action="mission-select" data-value="${x.id}" aria-pressed="${x.id===m.id}"><small>${x.number}</small> ${x.name}</button>`).join('')}</div>
  <article class="mission-feature"><figure><img src="${assetRoot}${m.image}" alt="${m.alt}" loading="lazy" width="1200" height="800"><figcaption>${m.type}<br><span>${m.credit}</span></figcaption></figure><div class="mission-copy"><span class="eyebrow">${m.en}</span><h3>${m.lead}</h3><p>${m.body}</p><p class="reading-footnote">${m.date}</p>${source(m.url,'查看原始影像与发布说明')}</div></article>
  ${renderReadingDetails(`mission-method-${m.id}`,'照片怎样拍摄、传回并解读',`<ol class="mission-method">${m.steps.map(([name,body],i)=>`<li><span>0${i+1}</span><h4>${name}</h4><p>${body}</p></li>`).join('')}</ol>`)}
  <div class="reading-callout" role="status"><h3>${m.question}</h3><p>${m.answer}</p></div>
 </section>`;
}

export function renderDayStudy(planet){
 const day=dayLengths[planet.id];if(!day)return '';
 return `<section class="day-study">${heading('WHAT MAKES A DAY?',`${planet.name}的一天，究竟有多长？`,'相对远方恒星转一圈，与太阳再次回到相同方向，是两种不同的计时方式。')}<div class="day-pair"><article><span class="eyebrow">SIDEREAL ROTATION</span><h3>自转一圈</h3><strong>${day.rotation}</strong><p>相对于远方恒星的自转周期。</p></article><article><span class="eyebrow">SOLAR DAY</span><h3>从正午到下一次正午</h3><strong>${day.solar}</strong><p>自转与公转共同决定的太阳日。</p></article></div><p class="day-note">${day.note}</p><p class="reading-footnote">近似参考值；逆向自转的方向与周期长度需要分别理解。${source('https://nssdc.gsfc.nasa.gov/planetary/factsheet/','NASA 行星数据与定义')}</p></section>`;
}

export function communicationSeconds(distance){return Math.round(distance*149597870.7/299792.458);}
export function duration(seconds){const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60);return `${h?`${h} 小时 `:''}${m} 分 ${seconds%60} 秒`;}
function timestamp(ms){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(ms));}
export function renderCommunication(s){
 const distance=s.commDistance??communicationDefaults[s.chapter],seconds=communicationSeconds(distance),sent=s.transmissions.find(x=>x.chapter===s.chapter);
 return `<section class="communication-lab" aria-labelledby="communication-title"><header class="reading-heading"><span class="eyebrow">DEEP SPACE POST / 深空邮局</span><h2 id="communication-title">按下发送之后，星光还要走一程。</h2><p>给地球寄一封信。改变飞船与地球的间距，看看收到回信之前，至少要等多久。</p></header>
  <div class="communication-console"><div class="communication-input"><label for="comm-distance">地球与飞船的直线间距 <output data-readout="comm-distance">${distance.toFixed(2)} AU</output></label><input id="comm-distance" type="range" min="0.01" max="40" step="0.01" value="${distance}" data-action="discovery-range" data-value="commDistance"><div class="range-endpoints"><span>0.01 AU</span><span>40 AU</span></div><p>这里的间距由你设定，与当前章节的真实轨道位置无关。</p><button class="primary" data-action="letter-send">模拟发送一封信 <span aria-hidden="true">↗</span></button></div><div class="communication-results"><div><span>抵达地球 · 单程</span><output data-readout="comm-oneway">${duration(seconds)}</output></div><div><span>理论最早收到回信 · 往返</span><output data-readout="comm-roundtrip">${duration(seconds*2)}</output></div></div></div>
  <div class="transmission-receipt" role="status">${sent?`<span class="eyebrow">${s.storageNotice?'本次访问的发信记录':'已保存本章的发信记录'} / 间距 ${sent.distance.toFixed(2)} AU</span><ol><li><span>飞船发出</span><time>${timestamp(sent.sentAt)}</time></li><li><span>预计地球收到</span><time>${timestamp(sent.sentAt+communicationSeconds(sent.distance)*1000)}</time></li><li><span>最早回信抵达飞船</span><time>${timestamp(sent.sentAt+communicationSeconds(sent.distance)*2000)}</time></li></ol><p>${s.storageNotice?escapeText(s.storageNotice):'时刻按北京时间显示。修改间距后再次发送，会更新本章记录。'}</p>`:'还没有寄出这封信。发信后，这一章的时间记录会保存在当前浏览器中。'}</div>
  <p class="reading-footnote">固定间距下的传播时间估算：单程 t = d / c。往返忽略处理、排队与飞船运动；它是信号用时，并不是飞船航行时间。${source('https://science.nasa.gov/learn/basics-of-space-flight/chapter10-1/','NASA 深空通信教材')}</p>
 </section>`;
}
export function previewCommunication(distance){const sec=communicationSeconds(distance);for(const [name,value] of [['comm-distance',`${distance.toFixed(2)} AU`],['comm-oneway',duration(sec)],['comm-roundtrip',duration(sec*2)]])document.querySelectorAll(`[data-readout="${name}"]`).forEach(el=>{el.textContent=value;});}

export function renderObservationLog(s){
 const selected=constellations.find(x=>x.id===s.constellation)||constellations[0];
 return `<section class="observation-notebook">${heading('FROM THE SCREEN TO THE SKY','为真实的夜空，留一页笔记。','先校核日期、地点与天空条件，再记录你真正看到的目标。没有看到，也是一次有效的观察。')}
  <div class="observation-resources"><div><h3>图案之外，还有正式边界</h3><p>IAU 将全天划为 88 个星座区域；连线帮助记忆，并没有唯一的官方画法。季节提示不能替代指定地点、日期与时刻的星位。</p>${source(`https://iauarchive.eso.org/static/public/constellations/gif/${constellationCodes[selected.id]}.gif`,`${selected.name}正式边界图`)} ${source('https://stellarium-web.org/','用时间与地点校核星空')}</div></div>
  <form class="observation-form" data-action="observation-form"><label>观测日期<input type="date" name="date" required min="1900-01-01" max="${localDate()}" value="${localDate()}"></label><label>地点<input name="place" maxlength="40" placeholder="例如：校园操场，面向南方" required></label><label>观测目标<select name="target">${constellations.map(c=>`<option value="${c.id}" ${selected.id===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label>观察结果<select name="result"><option value="found">辨认到了</option><option value="uncertain">还不确定</option><option value="missed">这次没有看到</option></select></label><label class="observation-note">观察笔记<textarea name="note" maxlength="240" rows="3" placeholder="几点观察？云、月光或灯光有什么影响？你用什么图案确认目标？" required></textarea></label><div class="observation-submit"><button class="primary" type="submit" data-action="observation-save">保存观星记录 ↗</button><span role="status">${escapeText(s.observationNotice||s.storageNotice||'最近 5 条记录保存在当前浏览器中。')}</span></div></form>
  <div class="observation-entries">${s.observations.map(entry=>`<article><header><span>${escapeText(entry.date)} / ${escapeText(entry.place)}</span><strong>${constellations.find(c=>c.id===entry.target)?.name||'星空'} · ${{found:'辨认到了',uncertain:'还不确定',missed:'这次没有看到'}[entry.result]}</strong></header><p>${escapeText(entry.note)}</p></article>`).join('')}</div>
  <p class="reading-footnote">${source('https://iauarchive.eso.org/public/themes/constellations/','IAU 星座定义与文化背景')}。观测记录用于整理个人经验，不自动判定天体位置或天气。</p>
 </section>`;
}

export function renderBlackHoleEvidence(){return `<section class="evidence-study">${heading('THE CASE OF SAGITTARIUS A*','把一个黑洞问题，交给真实观测。','2022 年公布的人马座 A* 影像，为银河系中心的超大质量黑洞提供了直接的视觉证据。')}<div class="evidence-feature"><figure><img src="${assetRoot}sgra.jpg" alt="事件视界望远镜合作组织重建的人马座 A* 射电影像，明亮环状结构围绕中央暗区" width="1000" height="1000" loading="lazy"><figcaption>人马座 A* / EHT 射电观测重建<br>Credit: EHT Collaboration</figcaption></figure><div><h3>亮环不是固体外壳，暗区也不是普通表面的照片。</h3><p>发光物质的辐射在强引力作用下形成环状结构，中央较暗区域呈现黑洞阴影。多个射电望远镜协作，再通过数据处理重建图像，才得到这幅结果。</p>${renderReadingDetails('blackhole-evidence','观测怎样支持这个结论',`<ol class="evidence-reasoning"><li><b>观察</b>银河系中心的恒星绕着不可见、致密而大质量的天体运动。</li><li><b>成像</b>EHT 用地球尺度的射电干涉阵列观测中心区域。</li><li><b>检验</b>将亮环尺度、恒星轨道等不同线索与理论预测比较。</li></ol>`)}${source('https://www.eso.org/public/news/eso2208-eht-mw/','ESO 原始发布与科学解释')}<p class="reading-footnote">顶部三维吸积盘是艺术示意；本图是观测数据重建。不能从亮环直接看见事件视界以内，也不能把屏幕尺寸当作与 M87* 的真实大小比例。</p></div></div></section>`;}
