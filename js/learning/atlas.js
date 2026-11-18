import {constellations} from '../data.js';
import {observingTips} from '../learning-data.js';
import {heading,cards} from './shared.js';
import {renderObservationLog} from '../fieldwork.js';
export function atlasReading(s){
 const selected=constellations.find(x=>x.id===s.constellation)||constellations[0];
 return `<section>${heading('YOUR FIRST NIGHT OUT','把屏幕里的星图，带到夜空中。','以下建议适合开始认识星空；季节提示主要面向北半球，实际可见性还取决于纬度、时间和天气。')}${cards(observingTips)}<div class="reading-callout"><span class="eyebrow">当前观测目标 / ${selected.en}</span><h3>今晚试着寻找${selected.name}</h3><p>${selected.desc}</p><p class="reading-footnote">${selected.note}</p></div></section><section>${heading('A YEAR UNDER THE STARS','四季星空，八个路标。','点击卡片回到对应星图。星座季节表示常见观测时段，并不是说其他季节绝对看不到。')}<div class="constellation-directory">${constellations.map(c=>`<a class="constellation-entry ${c.id===selected.id?'active':''}" href="#atlas/${c.id}"><span class="reading-number">✧</span><h3>${c.name}</h3><span class="entry-en">${c.en}</span><p>${c.season}</p><span aria-hidden="true">↗</span></a>`).join('')}</div><div class="reading-callout"><h3>星座、星群、星系：名字相近，尺度不同</h3><p>星座是天球上的正式区域；星群是便于辨认的图案，例如北斗七星、夏季大三角；星系是由大量恒星、气体与暗物质组成的真实引力系统。仙女座星系恰好位于仙女座方向，两者不能互相替代。</p></div><p class="reading-footnote"><a href="https://iauarchive.eso.org/public/themes/constellations/" target="_blank" rel="noopener noreferrer">国际天文学联合会的星座资料 ↗</a></p></section>${renderObservationLog(s)}`;
}
