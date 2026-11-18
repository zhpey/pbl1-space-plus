import {renderDayStudy} from '../js/fieldwork.js';
import { renderModuleLibrary } from '../js/library.js';
import { planets } from './data.js';
import { planetProfiles } from './data.js';
import { heading, cards } from '../js/learning/shared.js';
import { renderSizeComparison } from './tools.js';
import { renderReadingDetails } from '../js/reading-details.js';
export function planetReading(s) {
  const p = planets.find((x) => x.id === s.planet) || planets[2],
    profile = planetProfiles[p.id];
  const a = planets.find((x) => x.id === (s.compareA || 'earth')),
    b = planets.find((x) => x.id === (s.compareB || 'mars'));
  const options = (id) =>
    planets
      .map((x) => `<option value="${x.id}" ${x.id === id ? 'selected' : ''}>${x.name}</option>`)
      .join('');
  const ratio = (
    Number(b.radius.replaceAll(',', '')) / Number(a.radius.replaceAll(',', ''))
  ).toFixed(2);
  return `<section>${heading('INSIDE THIS WORLD', `关于${p.name}，再往深处看。`, '从表面到大气，从卫星到探测任务，一颗行星不只有一组数字。')}${cards(
    [
      ['地表与内部', profile.surface],
      ['大气与天气', profile.air],
      ['卫星世界', profile.moons],
      ['我们怎样探索它', profile.mission],
    ],
  )}<div class="reading-callout"><span class="eyebrow">一个值得追问的问题</span><h3>${profile.question}</h3><p>${profile.answer}</p></div></section><section class="comparison-section">${heading('WORLDS SIDE BY SIDE', '把两个世界放在一起。', '选择任意两颗行星，比较尺度、时间与环境。行星温度的参考层不同，请结合类别阅读。')}<div class="compare-controls"><label>第一颗行星<select data-action="compare" data-value="compareA">${options(a.id)}</select></label><button class="discovery-icon" data-action="compare-swap" aria-label="交换两颗行星" title="交换两颗行星">↔</button><label>第二颗行星<select data-action="compare" data-value="compareB">${options(b.id)}</select></label></div>${renderSizeComparison(a, b)}${renderReadingDetails(`comparison-${a.id}-${b.id}`, '查看详细参数', `<div class="table-scroll"><table class="comparison-table"><caption>${a.name}与${b.name}的近似数据对比</caption><thead><tr><th scope="col">指标</th><th scope="col">${a.name}</th><th scope="col">${b.name}</th></tr></thead><tbody>${[
    ['类型', a.type, b.type],
    ['平均半径', a.radius + ' km', b.radius + ' km'],
    ['平均日心距离', a.distance + ' AU', b.distance + ' AU'],
    ['公转周期', a.year, b.year],
    ['自转周期', a.day, b.day],
    ['参考温度', a.temp, b.temp],
  ]
    .map((row) => `<tr><th scope="row">${row[0]}</th><td>${row[1]}</td><td>${row[2]}</td></tr>`)
    .join(
      '',
    )}</tbody></table></div>`)}<p class="comparison-insight" role="status">${b.name}的平均半径约为${a.name}的 <strong>${ratio} 倍</strong>。距离、体积与大气环境共同塑造不同的行星世界。</p><p class="reading-footnote">地球、金星、火星等温度主要是地表参考值；巨行星常引用云层附近的温度，因此不能把这列简单视为同一高度的测量。<button class="local-source-link" data-action="article" data-value="planet-jupiter">行星环境与引力说明 →</button></p></section>${renderDayStudy(p)}${renderModuleLibrary('planets',s)}`;
}
