import { photos, chapters } from './data.js';
import { photoRoot } from '../js/assets.js';
import { title, icon } from '../js/discovery-shared.js';
export function visiblePhotos(s) {
  return photos.filter((p) =>
    s.filter === 'saved'
      ? s.savedPhotos.includes(p.id)
      : s.filter === 'all' || p.category === s.filter,
  );
}

export function renderPhotoViewer(s, p) {
  const saved = s.savedPhotos.includes(p.id);
  const list = visiblePhotos(s);
  const index = list.findIndex((item) => item.id === p.id);
  return `<div class="photo-position">${index >= 0 ? `${String(index + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}` : '当前影像'}</div><div class="photo-toolbar">
    <div>${icon('photo-previous', '←', '上一幅影像', list.length < 2 ? 'disabled' : '')}${icon('photo-next', '→', '下一幅影像', list.length < 2 ? 'disabled' : '')}</div>
    <div>${icon('photo-zoom-out', '−', '缩小影像', s.photoZoom <= 1 ? 'disabled' : '')}<output data-readout="photo-zoom">${Math.round(s.photoZoom * 100)}%</output>${icon('photo-zoom-in', '+', '放大影像', s.photoZoom >= 4 ? 'disabled' : '')}${icon('photo-reset', '↺', '还原影像大小')}</div>
    ${icon('photo-save', saved ? '★' : '☆', saved ? '取消收藏' : '收藏影像', `aria-pressed="${saved}"`)}
  </div><div class="photo-viewer ${s.photoZoom > 1 ? 'zoomed' : ''}" data-photo="${p.id}" data-zoom="${s.photoZoom}" tabindex="0" aria-label="${p.title}影像查看区"><div class="photo-image-space"><img src="${photoRoot}${p.image}" alt="${p.title}完整影像" draggable="false"></div></div>
  <p class="photo-save-status" role="status">${s.storageNotice || (saved ? '★ 已收藏' : '')}</p>`;
}

export function renderVoyage(s) {
  const read = s.readChapters.includes(s.chapter);
  return `<div id="discovery" tabindex="-1" class="discovery-lab voyage-log">${title('YOUR VOYAGE LOG', '给这段旅程，留下足迹。')}
      <div class="voyage-summary"><span role="status">已读 ${s.readChapters.length} / ${chapters.length} 封信</span>
        <button class="text-button" data-action="chapter-read" aria-pressed="${read}">${read ? '✓ 已记入航行日志' : '记下这封信的足迹'}</button>
      </div><div class="voyage-stops">${chapters.map((c, i) => `<a href="#story/${i}" class="voyage-stop ${s.readChapters.includes(i) ? 'visited' : ''} ${s.chapter === i ? 'current' : ''}"><span class="voyage-stamp">${s.readChapters.includes(i) ? '✓' : '0' + (i + 1)}</span><span>${c.title.slice(5)}</span><small>${s.readChapters.includes(i) ? '已读' : '未读'}</small></a>`).join('')}</div>
      <p class="discovery-status" role="status">${s.storageNotice || (s.readChapters.length === chapters.length ? '四封信都已抵达。下一站，回到我们的地球。' : '')}</p>
    </div>`;
}
