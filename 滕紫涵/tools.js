import { title } from '../js/discovery-shared.js';
export function shipTime(speed) {
  return 10 * Math.sqrt(1 - speed * speed);
}

export function renderRelativity(s) {
  return `<div id="discovery" tabindex="-1" class="discovery-lab relativity-lab">${title('TWO CLOCKS, ONE JOURNEY', '同一段旅程，两只时钟。')}
      <div class="clock-pair"><div class="earth-clock"><span>地球参考系经过</span><strong>10.00 <small>年</small></strong><div class="clock-track"><i style="width:100%"></i></div></div>
        <div class="ship-clock"><span>飞船上经过</span><strong><output data-readout="ship-time">${shipTime(s.shipSpeed).toFixed(2)}</output> <small>年</small></strong><div class="clock-track"><i data-readout="ship-bar" style="width:${shipTime(s.shipSpeed) * 10}%"></i></div></div>
      </div><div class="speed-control"><label for="ship-speed">飞船速度 <output data-readout="ship-speed">${(s.shipSpeed * 100).toFixed(0)}% 光速</output></label>
        <input id="ship-speed" type="range" min="0" max="0.99" step="0.01" value="${s.shipSpeed}" data-action="discovery-range" data-value="shipSpeed">
        <div class="range-endpoints"><span>静止</span><span>99% 光速</span></div>
      </div><p class="reading-footnote">狭义相对论的匀速运动示意：飞船固有时间 = 地球时间 × √(1 − v²/c²)。忽略加速、掉头和引力，不是完整的往返航行模型。</p>
    </div>`;
}
