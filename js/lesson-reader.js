import {lessonCollections, lessonTotal} from './lesson-data.js';
import {sources} from './lesson-sources.js';
import {assetRoot, photoRoot} from './assets.js';
import {imageCredits, odysseyAsset} from './odyssey-data.js';
import {photos, routes} from './data.js';
import {renderReadingDetails} from './reading-details.js';

const siteRoot = new URL('..', assetRoot);
const savedViews = new Map();
const sharedLesson = new URLSearchParams(location.search).get('lesson');
const introFigures = {
  'jupiter-bands': ['jupiter.jpg', '木星的大气条纹与旋涡增强色影像'],
  'saturn-rings': ['saturn.jpg', '卡西尼号观测图中，土星环横过土星盘面'],
  'europa-ocean': ['europa.jpg', '木卫二的冰面有多条交错的深浅色纹路'],
  'moon-phases': ['moon.jpg', '阿波罗 8 号拍摄的月面与地出景象'],
  lagrange: ['webb.jpg', '显示韦伯的分段主镜与遮阳板的概念图'],
  horizon: ['blackhole.jpg', '黑洞周围发光物质被引力弯曲后的艺术示意'],
  'pillars-bands': ['nebula.jpg', '韦伯近红外图像中的创生之柱'],
  'cliffs-front': ['cosmic-cliffs.jpg', '韦伯近红外图中的云缘和恒星'],
  'pale-dot': ['pale-blue-dot.jpg', '旅行者 1 号图像里，光带中的一颗小点是地球'],
};
const galleryFigures = {'deep-field': 'deepfield', 'crab-spectrum': 'crab', 'andromeda-mosaic': 'galaxy'};
const sectionLabels = {
  explore: ['现象', '如何探测', '继续推理'],
  solar: ['基本原理', '计算与任务', '使用条件'],
  atlas: ['先找什么', '怎么核对', '记录要点'],
  unknown: ['物理机制', '观测依据', '解释的边界'],
  observatory: ['首先留意', '观测与处理', '如何核查'],
};
const external = 'target="_blank" rel="noopener noreferrer"';
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);

function lessonUrl(route, id) {
  const url = new URL(lessonCollections[route].directory + '/', siteRoot);
  url.searchParams.set('lesson', id);
  return url.href;
}

function renderFigure(id) {
  const image = introFigures[id];
  const photo = photos.find(item => item.id === galleryFigures[id]);
  if (!image && !photo) return '';
  const [url, alt, credit, original] = image
    ? [odysseyAsset(image[0]), image[1], ...imageCredits[image[0]]]
    : [new URL(photo.image, photoRoot).href, photo.title + '观测影像', photo.credit, photo.url];
  return `<figure class="lesson-image"><img src="${escape(url)}" alt="${escape(alt)}" loading="lazy" decoding="async"><figcaption>${escape(alt)}。<a href="${escape(original)}" ${external}>${escape(credit)} ↗</a></figcaption></figure>`;
}

function renderArticle(route, lesson) {
  const [sourceName, sourceUrl] = sources[lesson.source];
  const related = routes.find(item => item.id === lesson.related.split('/')[0]);
  return `<article class="lesson-paper" aria-labelledby="lesson-title">
    <span class="lesson-paper-group">${escape(lesson.group)}</span>
    <h3 id="lesson-title" tabindex="-1">${escape(lesson.title)}</h3>
    ${renderFigure(lesson.id)}
    ${lesson.paragraphs.map((text, index) => `<section class="lesson-paragraph"><h4>${sectionLabels[route][index]}</h4><p>${escape(text)}</p></section>`).join('')}
    <div class="lesson-exercise"><h4>试着回答</h4><p>${escape(lesson.question)}</p>${renderReadingDetails(`lesson-${lesson.id}`, '查看解析', `<p>${escape(lesson.answer)}</p>`)}</div>
    <div class="lesson-paper-links" aria-label="资料与延伸阅读"><a href="${escape(sourceUrl)}" ${external}>${escape(sourceName)} ↗</a><a href="#${escape(lesson.related)}" data-lesson-scene>回到场景 · ${escape(related.name)} ↑</a><a href="${escape(lessonUrl(route, lesson.id))}">此篇的直达链接 ↗</a></div>
  </article>`;
}

function updateList(section, collection, view) {
  const query = view.query.trim().toLocaleLowerCase();
  let visible = 0;
  for (const row of section.querySelectorAll('[data-lesson-row]')) {
    const lesson = collection.entries[Number(row.dataset.lessonRow)];
    const match = (!view.group || lesson.group === view.group) &&
      ([lesson.title, lesson.group, ...lesson.paragraphs, lesson.question].join(' ').toLocaleLowerCase().includes(query));
    row.hidden = !match;
    visible += Number(match);
    const button = row.querySelector('button');
    if (lesson.id === view.id) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
  section.querySelector('[data-lesson-count]').textContent = visible ? `显示 ${visible} / ${collection.entries.length} 篇` : '没有符合条件的专题';
}

export function renderLessonCollection(route) {
  const collection = lessonCollections[route];
  if (!collection) return '';
  const view = savedViews.get(route) || {id: collection.entries.find(lesson => lesson.id === sharedLesson)?.id || collection.entries[0].id, query: '', group: ''};
  savedViews.set(route, view);
  const lesson = collection.entries.find(entry => entry.id === view.id);
  const groups = [...new Set(collection.entries.map(entry => entry.group))];
  return `<section id="science-lessons" class="lesson-room lesson-room--${route}" data-lesson-collection="${route}" style="--lesson-accent:${collection.accent}" aria-labelledby="lessons-heading">
    <header class="lesson-heading"><div><span>${collection.name} · ${collection.entries.length} 篇专题</span><h2 id="lessons-heading" tabindex="-1">${collection.title}</h2></div><p>${collection.summary}</p></header>
    <div class="lesson-layout">
      <div class="lesson-index"><label class="lesson-search">搜索专题<input type="search" data-lesson-search placeholder="关键词或主题" value="${escape(view.query)}"></label>
        <label class="lesson-filter">主题<select data-lesson-filter><option value="">全部主题</option>${groups.map(group => `<option${group === view.group ? ' selected' : ''}>${escape(group)}</option>`).join('')}</select></label>
        <p class="lesson-count" data-lesson-count role="status"></p>
        <nav aria-label="${collection.title}目录"><ul>${collection.entries.map((entry, index) => `<li data-lesson-row="${index}"><button type="button" data-open-lesson="${entry.id}">${escape(entry.title)}</button></li>`).join('')}</ul></nav>
      </div>
      <div data-lesson-reader>${renderArticle(route, lesson)}</div>
    </div>
  </section>`;
}

export function renderLessonGateway() {
  return `<aside class="lesson-gateway" aria-labelledby="lesson-gateway-title"><div><h3 id="lesson-gateway-title">${lessonTotal} 篇深度专题</h3><p>按主题阅读原理、观测证据和随堂问题。</p></div><nav aria-label="深度专题栏目">${Object.entries(lessonCollections).map(([route, collection]) => `<a href="${escape(lessonUrl(route, collection.entries[0].id))}" style="--lesson-accent:${collection.accent}">${collection.title} ↗</a>`).join('')}</nav></aside>`;
}

export function setupLessonReader(app) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let openedSharedLesson = false;
  function showHeading(heading, smooth) {
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start', behavior:smooth && !motion.matches ? 'smooth' : 'instant'});
  }

  function update(event) {
    const section = event.target.closest('[data-lesson-collection]');
    if (!section) return;
    const route = section.dataset.lessonCollection;
    const collection = lessonCollections[route];
    const view = savedViews.get(route);
    if (event.target.matches('[data-lesson-search]')) view.query = event.target.value;
    else if (event.target.matches('[data-lesson-filter]')) view.group = event.target.value;
    else return;
    updateList(section, collection, view);
  }
  app.addEventListener('input', update);
  app.addEventListener('change', update);
  app.addEventListener('click', event => {
    const sceneLink = event.target.closest('[data-lesson-scene]');
    if (sceneLink) window.scrollTo({top:0,behavior:'instant'});
    const button = event.target.closest('[data-open-lesson]');
    if (!button) return;
    const section = button.closest('[data-lesson-collection]');
    const route = section.dataset.lessonCollection;
    const collection = lessonCollections[route];
    const lesson = collection.entries.find(entry => entry.id === button.dataset.openLesson);
    if (!lesson) return;
    const view = savedViews.get(route);
    const reader = section.querySelector('[data-lesson-reader]');
    if (view.id !== lesson.id) {
      view.id = lesson.id;
      reader.innerHTML = renderArticle(route, lesson);
      updateList(section, collection, view);
    }
    showHeading(reader.querySelector('h3'), true);
  });
  return {afterRender(route) {
    const section = app.querySelector('[data-lesson-collection]');
    if (!section) return;
    const view = savedViews.get(route);
    updateList(section, lessonCollections[route], view);
    if (!openedSharedLesson && sharedLesson === view.id) {
      openedSharedLesson = true;
      requestAnimationFrame(() => {
        if (section.isConnected) showHeading(section.querySelector('h3'), false);
      });
    }
  }};
}
