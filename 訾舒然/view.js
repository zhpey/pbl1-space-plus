import { photos, chapters } from './data.js';
import { planets } from '../js/data.js';
import { photoRoot } from '../js/assets.js';
import { visiblePhotos, renderDiscoveryLink } from '../js/discovery.js';
const arrow = '<span aria-hidden="true">↗</span>';
const tab = (action, id, label, selected) =>
  `<button class="tab ${selected ? 'active' : ''}" data-action="${action}" data-value="${id}" aria-pressed="${selected}">${label}</button>`;
export function renderView(s) {
  if (s.route === 'observatory')
    return `<section class="page gallery-page image-exhibition" aria-labelledby="page-title"><div class="gallery-heading"><div class="page-head"><div class="eyebrow">THE LIGHT COLLECTION / 05</div><h1 class="page-title" id="page-title">光走了很久，才抵达这里。</h1><p class="intro">六封来自宇宙的信。一场关于诞生、时间与距离的影像展。</p><a class="gallery-story-link" href="#story">阅读原创星际来信 →</a> <button class="text-button pbl-instrument-jump" data-instrument-jump="webb-compare">对照韦伯影像 ↓</button></div><div class="photo-filters" aria-label="影像分类">${[
      ['all', '全部'],
      ['nebula', '星云'],
      ['galaxy', '星系'],
      ['saved', `收藏 · ${s.savedPhotos.length}`],
    ]
      .map(([id, label]) => tab('filter', id, label, s.filter === id))
      .join('')}</div></div><div class="gallery-grid">${
      visiblePhotos(s)
        .map(
          (x, i) =>
            `<button class="photo-card ${i === 0 ? 'featured-photo' : ''}" data-action="photo" data-value="${x.id}"><div class="photo-wrap"><img src="${photoRoot}${x.image}" alt="${x.title}的哈勃天文影像" loading="lazy"><span class="photo-tag">EXHIBIT 0${i + 1} / ${x.label}${s.savedPhotos.includes(x.id) ? ' / ★' : ''}</span></div><div class="photo-caption"><span class="eyebrow">${x.instrument}</span><h2>${x.title}</h2><p>${x.desc}</p><div class="photo-foot"><span>${x.distance}</span><span aria-hidden="true">↗</span></div></div></button>`,
        )
        .join('') ||
      '<div class="gallery-empty"><p>收藏夹还是一片等待点亮的星空。</p><button class="text-button" data-action="filter" data-value="all">看看全部影像 →</button></div>'
    }</div><p class="gallery-source">影像来自 NASA Image and Video Library。天文图像通常由多个波段合成，颜色不一定等同于肉眼所见。<button class="local-source-link" data-action="article" data-value="image-hubble">了解哈勃望远镜 →</button></p></section>`;
}
export function renderStoryView(s) {
  const c = chapters[s.chapter];
  return `<section class="page story-page letter-room" aria-labelledby="page-title"><header class="letter-heading"><div class="eyebrow">LETTERS TO A PALE BLUE DOT</div><p>星际来信 / 原创虚构故事</p>${renderDiscoveryLink('航行日志')}</header><div class="letter-layout"><nav class="chapter-spine" aria-label="故事章节"><span>四封信，一段旅程</span>${chapters.map((x, i) => `<button class="${i === s.chapter ? 'active' : ''}" data-action="chapter" data-value="${i}" aria-pressed="${i === s.chapter}"><small>LETTER 0${i + 1}</small>${x.title.slice(5)}</button>`).join('')}</nav><article class="letter-paper"><div class="letter-postmark">SPACE MAIL<br>0${s.chapter + 1} / 04</div><span class="letter-recipient">TO：那颗淡蓝色的星球</span><h1 id="page-title">${c.title}</h1><div class="story-subtitle">${c.subtitle}</div><p class="story-text">${c.body}</p><p class="letter-signature">一个仍在仰望星空的人</p><div class="buttons"><button class="text-button" data-action="previous-chapter" ${s.chapter === 0 ? 'disabled' : ''}>← 上一封信</button><button class="primary" data-action="next-chapter">${s.chapter === 3 ? '重新读起' : '下一封信'} ${arrow}</button></div></article><aside class="letter-destination"><span class="eyebrow">本封信的目的地</span><h2>${planets.find((x) => x.id === c.planet).name}</h2><p>${c.science}</p><span>模型可拖动旋转<br>向下翻阅探索笔记 ↓</span></aside></div></section>`;
}
