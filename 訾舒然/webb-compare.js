import { odysseyAsset } from '../js/odyssey-data.js';

const frames = [
  { image:'cosmic-cliffs.jpg', width:2000, height:1158, alt:'暖色气体和尘埃构成起伏边缘，背景有蓝白色亮星', caption:'NIRCam 近红外合成', source:'https://esawebb.org/images/weic2205a/' },
  { image:'cliffs-composite.jpg', width:1280, height:444, alt:'同一星形成区域中的尘埃边缘，画幅较宽，可见不同颜色的星点', caption:'NIRCam 与 MIRI 合成', source:'https://esawebb.org/images/weic2205b/' },
];
const cues = [
  { label:'尘埃边缘', description:'先找画面上起伏的尘埃边缘，再在两张图中寻找邻近的亮星。两幅图的取景范围不同，可以用这些特征辨认同一片区域。' },
  { label:'不同波段', description:'近红外可以穿透部分尘埃，中红外对温暖的尘埃也较敏感。两幅合成图的差异同时来自波段选择、取景和颜色映射。' },
  { label:'读懂颜色', description:'这些颜色由不同红外波段映射得出。要解释某个亮点，先查看影像说明中的滤镜分配，再判断它可能是恒星、气体还是尘埃。' },
];

let selectedCue = 0;

export function renderWebbCompare() {
  return `<section class="pbl-instrument webb-comparison" id="webb-compare" aria-labelledby="webb-title"><header><div><span class="instrument-kicker">WEBB · NGC 3324</span><h2 id="webb-title">两种拍法，读同一片宇宙悬崖</h2></div><p>选一个观察任务，然后对照韦伯的两幅官方影像。</p></header><div class="webb-frames">${frames.map(frame => `<figure><div class="webb-frame"><img src="${odysseyAsset(frame.image)}" alt="${frame.alt}" width="${frame.width}" height="${frame.height}" loading="lazy" decoding="async"></div><figcaption><a href="${frame.source}" target="_blank" rel="noopener">${frame.caption} ↗</a></figcaption></figure>`).join('')}</div><div class="webb-options" role="group" aria-label="选一个影像观察任务">${cues.map(({label},i)=>`<button data-webb-cue="${i}" aria-pressed="${i === selectedCue}">${label}</button>`).join('')}</div><p data-webb-reading aria-live="polite">${cues[selectedCue].description}</p><footer>来源署名 NASA / ESA / CSA / STScI。两图保留各自画幅。</footer></section>`;
}

export function bindWebbCompare() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-webb-cue]');
    if (!button) return;
    const section = button.closest('.webb-comparison');
    selectedCue = Number(button.dataset.webbCue);
    section.querySelectorAll('[data-webb-cue]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    section.querySelector('[data-webb-reading]').textContent = cues[selectedCue].description;
  });
}
