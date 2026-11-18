import { planets } from './data.js';

const earth = planets.find(planet => planet.id === 'earth');
const radius = planet => Number(planet.radius.replaceAll(',', ''));
const diameter = planet => (radius(planet) * 2).toLocaleString('zh-CN');

const details = {
  mercury: '水星的平均直径不到地球的四成。把地球缩成 1 米宽，水星大约只有 38 厘米。',
  venus: '金星和地球大小接近。判断一颗行星的表面环境，还要看大气成分、厚度和入射太阳辐射。',
  earth: '用地球作参照。切换到木星，想一想为什么体积会比直径的倍数大得多。',
  mars: '火星的直径大约是地球的一半。如果把两颗星球近似成球体，火星的体积大约只有地球的六分之一。',
  jupiter: '木星的直径约为地球的 11 倍。把两者近似为球体后，体积差达到千倍量级。',
  saturn: '圆盘只画土星本体。土星环横跨的范围很大，但不计入行星直径。',
  uranus: '天王星比海王星略宽。这个实验按平均直径比较，质量大小需要另外查证。',
  neptune: '海王星比天王星略窄，却比天王星更重。直径与质量不能用同一条比例尺衡量。',
};

function disk(planet, maxRadius) {
  const percent = radius(planet) / maxRadius * 100;
  return `<div class="scale-world"><div class="scale-well" aria-hidden="true"><span style="--disk:${percent.toFixed(3)}%;--planet-ink:${planet.color}"></span></div><strong>${planet.name}</strong><small>${diameter(planet)} km</small></div>`;
}

export function renderScaleReading(planet) {
  const maxRadius = Math.max(radius(earth), radius(planet));
  const ratio = radius(planet) / radius(earth);
  return `<div class="scale-disks">${disk(earth, maxRadius)}${disk(planet, maxRadius)}</div>
    <dl class="scale-measures"><div><dt>直径 / 地球</dt><dd>${ratio.toFixed(2)} 倍</dd></div><div><dt>体积 / 地球（球体近似）</dt><dd>${Number((ratio ** 3).toPrecision(3)).toLocaleString('zh-CN')} 倍</dd></div></dl>
    <p class="instrument-note">${details[planet.id]}</p>`;
}

let currentPlanetId;
let comparisonPlanetId;

export function renderScaleLab(planetId) {
  if (currentPlanetId !== planetId) comparisonPlanetId = planetId;
  currentPlanetId = planetId;
  const planet = planets.find(item => item.id === comparisonPlanetId) || earth;
  return `<section class="pbl-instrument scale-lab" id="planet-scale" aria-labelledby="scale-title">
    <header><div><span class="instrument-kicker">PLANETARY SCALE</span><h2 id="scale-title">把行星放在同一把尺上</h2></div><label class="instrument-select">与地球比较<select data-scale-target>${planets.map(item => `<option value="${item.id}" ${item === planet ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label></header>
    <div data-scale-reading aria-live="polite">${renderScaleReading(planet)}</div>
    <footer>两枚圆盘按同一比例绘制。换一组时会重新取景。圆盘直径取天体平均直径。 <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noopener">NASA 行星数据 ↗</a></footer>
  </section>`;
}

export function bindScaleLab() {
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-scale-target]')) return;
    const planet = planets.find(item => item.id === event.target.value);
    if (!planet) return;
    comparisonPlanetId = planet.id;
    event.target.closest('.scale-lab').querySelector('[data-scale-reading]').innerHTML = renderScaleReading(planet);
  });
}
