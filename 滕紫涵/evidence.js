function chirpPath() {
  return Array.from({length:161}, (_, index) => {
    const t = index / 160;
    const envelope = t < .77 ? 1 + 34 * (t / .77) ** 3 : 35 * Math.exp(-(t - .77) * 21);
    const vibration = Math.sin(2 * Math.PI * (2 * t + 7 * t ** 3 + 3 * t ** 6));
    return `${index === 0 ? 'M' : 'L'}${(15 + 330 * t).toFixed(1)} ${(76 + envelope * vibration).toFixed(1)}`;
  }).join('');
}

const sources = [
  { id:'orbit', title:'恒星轨道', caption:'位置随时间变化 · 银河系中心', signal:'望远镜记录恒星 S2 在天空中的位置及其光谱。S2 每约 16 年绕银心完成一圈。', inference:'一颗恒星绕极小区域高速运行，可用轨道约束中心集中质量。多组数据指向约四百万倍太阳质量的致密天体。', limit:'轨道测量的是外部引力效应。它无法让我们看见被事件视界挡住的内部。', url:'https://www.eso.org/public/news/eso2006/', credit:'ESO · 银河系中心观测', drawing:'<ellipse cx="174" cy="69" rx="132" ry="40" transform="rotate(-13 174 69)"/><circle class="evidence-mark" cx="258" cy="50" r="6"/><circle class="evidence-bright" cx="84" cy="109" r="4"/><path d="M79 108H44"/>' },
  { id:'wave', title:'引力波', caption:'应变随时间变化 · GW150914', signal:'LIGO 于 2015 年 9 月 14 日探测到一个短促信号，振荡越来越快，随后衰减。两台探测器都记录到了它。', inference:'把信号波形与广义相对论模型对照，可以推断两个黑洞经历了旋近、合并与振铃。', limit:'探测结果给出时空应变，读出质量等参数需要同波形模型比较。图中曲线为讲解示意。', url:'https://www.ligo.caltech.edu/page/press-release-gw150914', credit:'LIGO · 首次探测发布', drawing:`<path d="${chirpPath()}"/><path class="evidence-guide" d="M15 76H345"/>` },
  { id:'shadow', title:'黑洞阴影', caption:'毫米波亮度分布 · M87*', signal:'事件视界望远镜合作组把多地射电望远镜联成一套网络，重建了 M87* 周围的环状毫米波亮度分布。', inference:'亮环来自黑洞周围辐射。引力使光线路径弯曲，部分光线落入黑洞，从而在中央形成较暗的区域。', limit:'亮环直径和事件视界直径是不同的量。画面中的环是讲解示意，实测图像见来源。', url:'https://www.eso.org/public/news/eso1907/', credit:'ESO / EHT · M87* 影像发布', drawing:'<circle cx="180" cy="74" r="43" class="evidence-ring"/><path class="evidence-bright" d="M143 94a43 43 0 0 0 74 0"/><circle cx="180" cy="74" r="24" class="evidence-guide"/>' },
];

let selectedEvidence = sources[0];

function evidenceReading(item) {
  return `<figure class="evidence-figure"><svg viewBox="0 0 360 148" aria-hidden="true">${item.drawing}</svg><figcaption>${item.caption} / 示意</figcaption></figure>
    <dl class="evidence-notes"><div><dt>测到了什么</dt><dd>${item.signal}</dd></div><div><dt>能推断什么</dt><dd>${item.inference}</dd></div><div><dt>证据的边界</dt><dd>${item.limit}</dd></div></dl><a class="evidence-source" href="${item.url}" target="_blank" rel="noopener">${item.credit} ↗</a>`;
}

export function renderEvidence() {
  return `<section class="pbl-instrument blackhole-evidence" id="blackhole-evidence" aria-labelledby="evidence-title"><header><div><span class="instrument-kicker">OBSERVING BLACK HOLES</span><h2 id="evidence-title">怎样知道那里有个黑洞？</h2></div></header><div class="evidence-tabs" role="group" aria-label="选择观测方法">${sources.map(item=>`<button data-evidence="${item.id}" aria-pressed="${item === selectedEvidence}">${item.title}</button>`).join('')}</div><div class="evidence-reading" data-evidence-reading aria-live="polite">${evidenceReading(selectedEvidence)}</div></section>`;
}

export function bindEvidence() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-evidence]');
    if (!button) return;
    const section = button.closest('.blackhole-evidence');
    const item = sources.find(source => source.id === button.dataset.evidence);
    if (!item) return;
    selectedEvidence = item;
    section.querySelectorAll('[data-evidence]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    section.querySelector('[data-evidence-reading]').innerHTML = evidenceReading(item);
  });
}
