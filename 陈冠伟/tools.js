import { planets } from './data.js';
import { assetRoot } from '../js/assets.js';
import { title } from '../js/discovery-shared.js';
const gravity = {
  mercury: 3.7,
  venus: 8.87,
  earth: 9.81,
  mars: 3.71,
  jupiter: 24.79,
  saturn: 10.44,
  uranus: 8.69,
  neptune: 11.15,
};
export function gravityReading(mass, planet) {
  return { force: mass * gravity[planet], scale: (mass * gravity[planet]) / gravity.earth };
}

export function renderSizeComparison(a, b) {
  const radius = (p) => Number(p.radius.replaceAll(',', ''));
  const largest = Math.max(radius(a), radius(b));
  return `<figure class="size-comparison" aria-label="${a.name}与${b.name}的直径比例">
    <div class="size-worlds">${[a, b].map((p) => `<div class="size-world"><div class="size-orbit"><div class="size-globe" data-size-planet="${p.id}" style="width:${(radius(p) / largest) * 100}%;background-image:url('${assetRoot}textures/${p.texture}.jpg')"></div></div><span>${p.name}</span><small>直径 ${(radius(p) * 2).toLocaleString('en-US')} km</small></div>`).join('')}</div>
    <figcaption>按平均直径比例展示 · 不包含行星环</figcaption>
  </figure>`;
}

export function renderGravity(s) {
  const p = planets.find((p) => p.id === s.planet);
  const reading = gravityReading(s.bodyMass, p.id);
  return `<div id="discovery" tabindex="-1" class="discovery-lab gravity-lab">${title('GRAVITY LAB', '带着同一个你，换一颗星球。')}
      <div class="gravity-layout"><div class="discovery-inputs">
        <label for="body-mass">你的质量 <output data-readout="mass">${s.bodyMass} kg</output></label>
        <input id="body-mass" type="range" min="10" max="150" step="1" value="${s.bodyMass}" data-action="discovery-range" data-value="bodyMass">
        <div class="range-endpoints"><span>10 kg</span><span>150 kg</span></div>
        <p>质量仍是 <span data-readout="mass-copy">${s.bodyMass}</span> kg；改变的是引力。</p>
        <p class="reading-footnote">巨行星使用参考层的近似重力，没有可站立的普通固体表面。</p>
      </div><div class="gravity-scale" style="--gravity-fill:${Math.min(reading.scale / 400, 1) * 100}%">
        <span class="eyebrow">${p.name} / ${gravity[p.id]} m/s²</span>
        <div class="scale-number"><output data-readout="scale">${reading.scale.toFixed(1)}</output><span>kg</span></div>
        <span class="scale-caption">按地球重力校准的秤读数</span><div class="scale-track"><i></i></div>
        <p>重力 <output data-readout="force">${reading.force.toFixed(0)}</output> N · 地球秤读数 <span data-readout="mass-copy">${s.bodyMass}</span> kg</p>
      </div></div>
      <div class="destination-strip" aria-label="引力秤目的地">${planets.map((p) => `<button data-action="gravity-planet" data-value="${p.id}" aria-pressed="${p.id === s.planet}"><img src="${assetRoot}textures/${p.texture}.jpg" alt=""><span>${p.name}</span></button>`).join('')}</div>
    </div>`;
}
