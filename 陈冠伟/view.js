import { planets } from './data.js';
import { renderDiscoveryLink } from '../js/discovery.js';
function identity(p, index) {
  return `<aside class="planet-identity"><span class="sequence">SOLAR SYSTEM / 0${index + 1}</span><h2>${p.en}</h2><p>${p.name} / ${p.tag}</p></aside>`;
}
const arrow = '<span aria-hidden="true">↗</span>';
const tab = (action, id, label, selected) =>
  `<button class="tab ${selected ? 'active' : ''}" data-action="${action}" data-value="${id}" aria-pressed="${selected}">${label}</button>`;
export function renderView(s) {
  const p = planets.find((x) => x.id === s.planet) || planets[2];
  if (s.route === 'explore')
    return `<section class="page hero-page" aria-labelledby="page-title"><div class="hero-copy"><div class="eyebrow">YOUR JOURNEY BEGINS HERE</div><h1 id="page-title">${p.lead}</h1><p>${p.desc}</p><div class="buttons"><button class="primary" data-action="detail" data-value="${p.id}">探索${p.name} ${arrow}</button><a class="text-button" href="#solar">查看太阳系 <span>→</span></a></div><div class="hero-stats"><div><strong>${p.radius}</strong><small>km</small><label>平均半径</label></div><div><strong>${p.distance}</strong><small>AU</small><label>平均日心距离</label></div><div><strong>${p.year}</strong><label>公转周期</label></div></div><nav class="planet-quick-pick" aria-label="快速切换行星">${planets.map(world => tab('planet', world.id, world.name, world.id === p.id)).join('')}</nav>${renderDiscoveryLink('打开引力实验')} <button class="text-button pbl-instrument-jump" data-instrument-jump="planet-scale">测量行星大小 ↓</button></div>${identity(p, planets.indexOf(p))}<div class="orbit-label">${p.type.toUpperCase()}<small>${p.id === 'earth' ? 'OUR PALE BLUE DOT' : 'A WORLD WAITING TO BE EXPLORED'}</small></div><div class="scene-note">拖动旋转 · Ctrl + 滚轮缩放 <button data-action="pause">${s.paused ? '恢复运动' : '自动旋转中'}</button></div></section>`;
}
