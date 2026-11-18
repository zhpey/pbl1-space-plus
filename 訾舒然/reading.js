import {renderWaveComparison,renderMissionArchives,renderCommunication} from '../js/fieldwork.js';
import { renderModuleLibrary } from '../js/library.js';
import { chapters } from './data.js';
import { telescopes } from './data.js';
import { heading, cards } from '../js/learning/shared.js';
export function observatoryReading(s) {
  return `<section>${heading('THE EYES BEHIND THE IMAGES', '谁在替我们，看向宇宙？', '不同望远镜观察不同波段。把它们的结果放在一起，才能得到更完整的图景。')}<div class="telescope-grid">${telescopes.map((t) => `<article class="telescope-card"><span class="eyebrow">${t.en}</span><h3>${t.name}</h3><dl><div><dt>出发时间</dt><dd>${t.year}</dd></div><div><dt>光学尺度</dt><dd>${t.mirror}</dd></div><div><dt>工作位置</dt><dd>${t.where}</dd></div><div><dt>主要波段</dt><dd>${t.band}</dd></div></dl><p>${t.body}</p><button class="local-source-link" data-action="article" data-value="${t.en === 'HUBBLE' ? 'image-hubble' : 'image-webb'}">阅读望远镜图文档案 →</button></article>`).join('')}</div></section><section>${heading('HOW TO READ A SPACE IMAGE', '一张宇宙照片，怎样读？')}${cards(
    [
      [
        '先看设备和波段',
        '可见光、红外、紫外、X 射线等揭示不同物理过程。相同天体换一种波段，外观可能大不相同。',
      ],
      [
        '再看颜色与处理',
        '多波段图像常映射成可见颜色，用来区分结构和元素。合成与校正不等于随意虚构观测对象。',
      ],
      [
        '最后看尺度与时间',
        '图中不同天体可能有不同距离。长时间曝光累积微弱光信号，看到的也都是光离开天体时的过去。',
      ],
    ],
  )}<div class="reading-callout"><h3>哈勃极深场：在一小片天空里，看见许多星系</h3><p>深场影像使用长时间、多次观测叠加来显示暗弱目标。一个不起眼的光斑可能是一整个星系，因此不能仅凭图片里点的大小判断天体的真实体积。</p><button class="text-button" data-action="photo" data-value="deepfield">打开极深场档案 ↗</button></div></section>${renderWaveComparison(s)}${renderMissionArchives(s)}${renderModuleLibrary('observatory',s)}`;
}
export function storyReading(s) {
  const chapter = chapters[s.chapter];
  return `<section>${heading('THE CAPTAIN’S NOTEBOOK', '故事之外，是探索的方法。', '《星际来信》的人物、年代与旅程是原创虚构。每一个停靠点，都可以变成一个真实的科学问题。')}<div class="story-directory">${chapters.map((c, i) => `<a class="story-entry ${i === s.chapter ? 'active' : ''}" href="#story/${i}"><span class="reading-number">0${i + 1}</span><h3>${c.title.slice(5)}</h3><p>${c.subtitle}</p></a>`).join('')}</div><article class="reading-callout"><span class="eyebrow">本章的科学线索</span><h3>${chapter.title.slice(5)}</h3><p>${chapter.science.replace('真实知识：', '')}</p></article>${cards(
    [
      [
        '光速与通信',
        '信号不是瞬间抵达。地球与远方探测器之间的通信延迟随距离和轨道位置而变，操作人员必须提前规划。',
      ],
      [
        '生命与宜居环境',
        '寻找水、能量和合适化学条件，是寻找宜居环境；确认生命需要更严格的证据。故事中的希望不替代观测结论。',
      ],
      [
        '我们为什么探索',
        '探索帮助理解地球的独特性、行星的演化和人类在宇宙中的位置。科学问题与文学想象可以相互启发，同时保持各自的边界。',
      ],
    ],
  )}</section>${renderCommunication(s)}<section class="story-more"><h2>读完来信，再读懂星光。</h2><p>从真实影像中，继续寻找故事背后的科学线索。</p><button class="text-button" data-action="article" data-value="image-reading">怎样读懂一张宇宙照片 →</button></section>`;
}
