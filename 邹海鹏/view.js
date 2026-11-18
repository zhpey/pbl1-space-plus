import { planets } from '../js/data.js';
import { renderOrbitControls } from './tools.js';
const arrow = '<span aria-hidden="true">↗</span>';
export function renderView(s) {
  if (s.route === 'solar')
    return `<section class="page solar-page mission-console" aria-labelledby="page-title">
      <header class="console-heading">
        <div><div class="eyebrow">02 / SOLAR SYSTEM</div><h1 id="page-title">太阳系 · 轨道总览</h1></div>
        <p class="console-intro">从一颗恒星出发，<br>认识我们的宇宙邻居。</p>
      </header>
      <div class="solar-workspace">
        <div class="solar-observation">
          <div class="orbital-viewport">
            <span class="viewport-coordinate">HELIOCENTRIC VIEW<br>日心轨道示意</span>
            <div class="solar-legend"><span>类地行星轨道</span><span>巨行星轨道</span></div>
            <div class="solar-static-chart" aria-label="按顺序浏览八大行星"><strong>太阳</strong>${planets.map(p=>`<a href="#explore/${p.id}" style="--world-color:${p.color}">${p.name}</a>`).join('')}</div>
            <span class="viewport-instruction">拖动改变视角 · 点击行星查看档案</span>
          </div>
          ${renderOrbitControls(s)}
        </div>
        <aside class="console-telemetry" aria-label="太阳系概览">
          <div class="solar-star-note"><span class="eyebrow">OUR STAR / 太阳</span><span class="solar-emblem" aria-hidden="true"></span><h2>一颗恒星，<br>八个行星世界。</h2><button class="primary" data-action="sun">打开太阳档案 ${arrow}</button></div>
          <div class="solar-mass"><small>太阳占太阳系总质量</small><strong>99.86<span>%</span></strong></div>
          <p class="console-disclaimer">轨道、尺寸与速度经过艺术化调整，用于认识结构，并非实时星历。</p><button class="text-button pbl-instrument-jump" data-instrument-jump="voyager-log">回看旅行者 2 号 ↓</button>
        </aside>
      </div>
    </section>`;
}
