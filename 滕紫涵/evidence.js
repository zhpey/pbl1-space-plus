import {odysseyAsset} from '../js/odyssey-data.js';

function chirpPath() {
  return Array.from({length:221}, (_, index) => {
    const t = index / 220;
    const envelope = t < .72 ? 2 + 39 * (t / .72) ** 3 : 41 * Math.exp(-(t - .72) * 19);
    const vibration = Math.sin(2 * Math.PI * (2 * t + 8 * t ** 3 + 4 * t ** 6));
    return `${index ? 'L' : 'M'}${(47 + 288 * t).toFixed(1)} ${(87 + envelope * vibration).toFixed(1)}`;
  }).join('');
}

const sources = [
  {
    id: 'orbit', title: '恒星轨道', kind: '轨道示意', subject: '银河系中心 · S2 与人马座 A*',
    signal: '望远镜多年追踪恒星 S2 的位置和速度。它大约每 16 年绕银河系中心一圈。',
    inference: '从轨道大小、周期和速度可以估计中心质量。多颗恒星的观测共同指向约四百万倍太阳质量的致密天体。',
    limit: '观测约束的是中心质量与它所在的空间范围。图中的椭圆简化了 S2 轨道，实际观测还可测出轨道进动。',
    url: 'https://www.eso.org/public/news/eso2006/', credit: 'ESO · S2 轨道观测',
    graphic: `<svg viewBox="0 0 360 210" aria-hidden="true">
      <ellipse cx="176" cy="100" rx="113" ry="65" transform="rotate(-12 176 100)"/>
      <path class="evidence-guide" d="M115 164L266 81M115 164L79 178"/>
      <circle class="evidence-bright" cx="115" cy="164" r="5"/>
      <circle class="evidence-mark" cx="266" cy="81" r="5"/>
      <text x="206" y="26">人马座 A*</text><path class="evidence-guide" d="M266 33V73"/>
      <text x="24" y="195">恒星 S2</text><text x="203" y="190">简化运行轨迹</text>
      <path class="evidence-guide" d="M239 145V171"/>
    </svg>`,
  },
  {
    id: 'wave', title: '引力波', kind: '波形示意', subject: 'GW150914 · 双黑洞合并',
    signal: '2015 年 9 月 14 日，LIGO 的两台探测器都记录到了先加快、增强，随后迅速衰减的振荡。',
    inference: '把信号与广义相对论预测的波形比较，可以推断两个黑洞先逐渐靠近，随后合并，最后形成的黑洞振荡衰减。',
    limit: '探测器记录的是相对长度的微小变化，也叫应变。估计黑洞质量需要把实测波形和模型比较。',
    url: 'https://www.ligo.caltech.edu/page/press-release-gw150914', credit: 'LIGO · GW150914 原始发布',
    graphic: `<svg viewBox="0 0 360 210" aria-hidden="true">
      <text x="24" y="23">相对应变</text>
      <path class="evidence-axis" d="M40 38V145H335l-6-4m6 4l-6 4"/>
      <path class="evidence-guide" d="M47 87H335M248 40V146M271 40V146"/>
      <path d="${chirpPath()}"/>
      <text x="83" y="174">旋近</text><text x="228" y="174">合并</text>
      <text x="286" y="174">振铃</text><text x="284" y="198">时间 →</text>
    </svg>`,
  },
  {
    id: 'shadow', title: '黑洞阴影', kind: '射电观测重建', subject: 'M87* · 2019 年发布',
    signal: '事件视界望远镜合作组把全球多地的射电望远镜联成网络，从 1.3 毫米波段的观测数据重建了这幅影像。',
    inference: '环状亮区来自黑洞周围的辐射。引力弯折光的路径，部分光被黑洞捕获，中心因此形成较暗的区域。',
    limit: '中央暗影的范围大于事件视界。画面的颜色用来呈现射电辐射亮度。',
    url: 'https://www.eso.org/public/images/eso1907a/', credit: 'EHT Collaboration · ESO 原图',
    graphic: `<div class="evidence-observation">
      <img src="${odysseyAsset('m87-eht.jpg')}" width="720" height="420" alt="M87* 的射电重建图，橙色亮环围绕中央暗影，环的下部更亮" decoding="async">
      <svg viewBox="0 0 360 210" aria-hidden="true">
        <path class="evidence-axis" d="M175 91L121 54H62M192 122L229 153H268"/>
        <circle class="evidence-bright" cx="175" cy="91" r="2.5"/><circle class="evidence-bright" cx="192" cy="122" r="2.5"/>
        <text x="18" y="59">暗影</text><text x="275" y="158">亮环</text>
      </svg>
    </div>`,
  },
];

let selectedEvidence = sources[0];

function evidenceReading(item) {
  return `<figure class="evidence-figure">
    ${item.graphic}
    <figcaption><span>${item.kind}</span> ${item.subject}${item.id === 'shadow' ? '<button data-evidence-labels aria-pressed="true">图上标注</button>' : ''}</figcaption>
  </figure>
  <div class="evidence-explanation">
    <dl class="evidence-notes">
      <div><dt>测到了什么</dt><dd>${item.signal}</dd></div>
      <div><dt>能推断什么</dt><dd>${item.inference}</dd></div>
      <div><dt>读图提示</dt><dd>${item.limit}</dd></div>
    </dl>
    <a class="evidence-source" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.credit} ↗</a>
  </div>`;
}

export function renderEvidence() {
  return `<section class="pbl-instrument blackhole-evidence" id="blackhole-evidence" aria-labelledby="evidence-title">
    <header><h2 id="evidence-title">怎样知道那里有个黑洞？</h2><p>从恒星运动、时空振荡和射电影像三个角度，比较观测量和能推断的结论。</p></header>
    <div class="evidence-tabs" role="group" aria-label="选择观测证据">
      ${sources.map(item => `<button type="button" data-evidence="${item.id}" aria-pressed="${item === selectedEvidence}" aria-controls="evidence-reading">${item.title}</button>`).join('')}
    </div>
    <div class="evidence-reading" id="evidence-reading" data-evidence-reading aria-live="polite">${evidenceReading(selectedEvidence)}</div>
  </section>`;
}

export function bindEvidence() {
  document.addEventListener('click', event => {
    const labels = event.target.closest('[data-evidence-labels]');
    if (labels) {
      const enabled = labels.getAttribute('aria-pressed') !== 'true';
      labels.setAttribute('aria-pressed', String(enabled));
      labels.closest('figure').classList.toggle('evidence-unlabeled', !enabled);
      return;
    }
    const button = event.target.closest('[data-evidence]');
    const section = button?.closest('.blackhole-evidence');
    if (!section) return;
    const item = sources.find(source => source.id === button.dataset.evidence);
    if (!item || item === selectedEvidence) return;
    selectedEvidence = item;
    for (const option of section.querySelectorAll('[data-evidence]')) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    section.querySelector('[data-evidence-reading]').innerHTML = evidenceReading(item);
  });
}
