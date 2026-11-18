import { planets } from '../js/data.js';
import { title, renderDiscoveryLink } from '../js/discovery-shared.js';
const options = (selected) =>
  planets
    .map((p) => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.name}</option>`)
    .join('');
export function lightTime(distance) {
  const seconds = Math.round((distance * 149597870.7) / 299792.458);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours ? hours + ' 小时 ' : ''}${minutes} 分 ${seconds % 60} 秒`;
}

export function renderOrbitControls(s) {
  return `<div class="orbit-tools"><div class="solar-speed"><label for="orbit-speed">公转速度 <output data-readout="orbit-speed">${s.orbitSpeed}×</output></label><input id="orbit-speed" type="range" min="0" max="4" step="0.25" value="${s.orbitSpeed}" data-action="discovery-range" data-value="orbitSpeed"></div><div class="solar-view-controls" role="group" aria-label="三维视角控制"><button data-action="zoom-in" aria-label="拉近视角">+</button><button data-action="zoom-out" aria-label="拉远视角">−</button><button data-action="reset" aria-label="重置视角">↺</button></div>${renderDiscoveryLink('追随阳光')}</div>`;
}

export function renderLight(s) {
  const target = planets.find((p) => p.id === s.lightTarget);
  return `<div id="discovery" tabindex="-1" class="discovery-lab light-lab">${title('A JOURNEY AT LIGHT SPEED', '阳光抵达之前。')}
      <div class="light-route"><span>太阳</span><div class="light-track"><i></i></div><span data-readout="light-target">${target.name}</span></div>
      <div class="light-telemetry"><label>光的目的地<select data-action="light-target">${options(target.id)}</select></label>
        <div><span>单程光行时间</span><output data-readout="light-time">${lightTime(Number(target.distance))}</output></div>
        <div><span>平均日心距离</span><strong>${target.distance} AU</strong></div>
      </div><p class="reading-footnote">以平均日心距离计算太阳到行星的光行时间；实际距离随轨道位置变化。</p>
    </div>`;
}
