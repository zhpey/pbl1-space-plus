import { mysteries } from './data.js';
import { renderDiscoveryLink } from '../js/discovery.js';
const arrow = '<span aria-hidden="true">↗</span>';
const tab = (action, id, label, selected) =>
  `<button class="tab ${selected ? 'active' : ''}" data-action="${action}" data-value="${id}" aria-pressed="${selected}">${label}</button>`;
export function renderView(s) {
  if (s.route === 'unknown') {
    const m = mysteries.find((x) => x.id === s.mystery) || mysteries[0];
    return `<section class="page unknown-page cosmic-editorial" aria-labelledby="page-title"><header class="editorial-masthead"><span class="eyebrow">THE UNKNOWN / 宇宙问题集</span><span>VOL. 0${mysteries.indexOf(m) + 1} / ${m.en}</span></header><nav class="editorial-index" aria-label="选择宇宙谜题">${mysteries.map((x) => tab('mystery', x.id, x.name, x.id === m.id)).join('')}</nav><header class="editorial-title"><h1 id="page-title">${m.name}</h1><p>${m.subtitle}</p></header><div class="editorial-spread"><figure class="theory-visual"><figcaption>FIG. 0${mysteries.indexOf(m) + 1}<br>动态艺术示意<br>非观测影像或物理仿真</figcaption></figure><article class="hero-copy editorial-abstract"><span class="status-chip">${m.status}</span><p class="editorial-lead">${m.desc}</p>${m.id === 'cosmos' ? '<div class="composition"><div>5%<small>普通物质</small></div><div>27%<small>暗物质</small></div><div>68%<small>暗能量</small></div></div>' : ''}<p class="science-note">${m.fact}</p><div class="buttons"><button class="text-button" data-action="mystery-detail" data-value="${m.id}">阅读全文与科学解释 ${arrow}</button></div>${m.id === 'blackhole' ? '<button class="text-button pbl-instrument-jump" data-instrument-jump="blackhole-evidence">查看三类黑洞证据 ↓</button>' + renderDiscoveryLink('实验 · 比较地球与飞船的时钟') : renderDiscoveryLink('实验 · 比较地球与飞船的时钟')}</article></div></section>`;
  }
}
