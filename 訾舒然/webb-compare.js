import { odysseyAsset } from '../js/odyssey-data.js';

const frames = [
  { image:'cosmic-cliffs.jpg', width:2000, height:1158, alt:'暖色气体和尘埃构成起伏边缘，背景有蓝白色亮星', caption:'NIRCam 近红外合成', source:'https://esawebb.org/images/weic2205a/' },
  { image:'cliffs-composite.jpg', width:1280, height:444, alt:'同一星形成区域中的尘埃边缘，画幅较宽，可见不同颜色的星点', caption:'NIRCam 与 MIRI 合成', source:'https://esawebb.org/images/weic2205b/' },
];
const detailImages = ['cliffs-detail-nircam.webp', 'cliffs-detail-composite.webp'];
const cues = [
  { label:'尘埃边缘', x:37, y:35, description:'观察圆环附近的尘埃脊线。两幅图经过旋转、缩放和裁切，对齐的是同一片区域。' },
  { label:'不同波段', x:56, y:68, description:'圆环内是尘埃边缘的亮结。比较亮结在两幅图里的对比度，再观察附近细丝的纹理。第二幅加入了中红外数据。' },
  { label:'读懂颜色', x:35, y:23, description:'圆环内的亮星可用来核对位置。图中的颜色来自对红外滤镜的可见色映射，原图说明列出了滤镜和颜色对应关系。' },
];

let selectedCue = 0;
let detail = true;

function renderFrames() {
  return frames.map((frame,i) => `<figure><div class="webb-frame" data-detail="${detail}"><img src="${odysseyAsset(detail ? detailImages[i] : frame.image)}" alt="${frame.alt}${detail ? '，画面已对齐到共同区域' : ''}" width="${detail ? 1176 : frame.width}" height="${detail ? 380 : frame.height}" loading="lazy" decoding="async">${detail ? '<span class="webb-marker" aria-hidden="true"></span>' : ''}</div><figcaption><a href="${frame.source}" target="_blank" rel="noopener">${frame.caption} ↗</a></figcaption></figure>`).join('');
}

const markerStyle = () => `--webb-x:${cues[selectedCue].x}%;--webb-y:${cues[selectedCue].y}%`;

export function renderWebbCompare() {
  return `<section class="pbl-instrument webb-comparison" id="webb-compare" aria-labelledby="webb-title"><header><div><span class="instrument-kicker">WEBB · NGC 3324</span><h2 id="webb-title">两种拍法，读同一片宇宙悬崖</h2></div><button data-webb-frame-toggle aria-pressed="${detail}" aria-controls="webb-frames">对齐局部</button></header><div class="webb-frames" id="webb-frames" style="${markerStyle()}">${renderFrames()}</div><div class="webb-options" role="group" aria-label="选一个影像观察任务">${cues.map(({label},i)=>`<button data-webb-cue="${i}" aria-pressed="${i === selectedCue}">${label}</button>`).join('')}</div><p data-webb-reading aria-live="polite">${cues[selectedCue].description}</p><footer>影像署名 NASA / ESA / CSA / STScI。关闭「对齐局部」可查看各自的原图画幅。</footer></section>`;
}

export function bindWebbCompare() {
  document.addEventListener('click', event => {
    const section = event.target.closest('.webb-comparison');
    if (!section) return;
    const toggle = section.querySelector('[data-webb-frame-toggle]');
    const gallery = section.querySelector('.webb-frames');
    if (event.target.closest('[data-webb-frame-toggle]')) {
      detail = !detail;
      toggle.setAttribute('aria-pressed', String(detail));
      gallery.innerHTML = renderFrames();
      return;
    }
    const button = event.target.closest('[data-webb-cue]');
    if (!button) return;
    selectedCue = Number(button.dataset.webbCue);
    if (!detail) {
      detail = true;
      toggle.setAttribute('aria-pressed', 'true');
      gallery.innerHTML = renderFrames();
    }
    section.querySelectorAll('[data-webb-cue]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    gallery.style.cssText = markerStyle();
    section.querySelector('[data-webb-reading]').textContent = cues[selectedCue].description;
  });
}
