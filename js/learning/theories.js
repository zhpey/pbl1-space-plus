import {mysteries} from '../data.js';
import {theoryNotes,cosmicTimeline} from '../learning-data.js';
import {heading,cards,timeline} from './shared.js';
import {renderBlackHoleEvidence} from '../fieldwork.js';
export function theoryReading(s){
 const selected=mysteries.find(x=>x.id===s.mystery)||mysteries[0],n=theoryNotes[selected.id];
 return `<section>${heading('FOLLOW THE EVIDENCE',`关于${selected.name}，证据与问题都要看。`,'科学用观测与实验不断修正解释，也保留尚未解决的问题。')}<span class="status-chip">${selected.status}</span>${cards([[n[0],n[1]],[n[2],n[3]],[n[4],n[5]]])}</section>${selected.id==='blackhole'?renderBlackHoleEvidence():''}<section>${heading('13.8 BILLION YEARS','138 亿年，压缩成一条时间线。','年份是基于当前观测与模型的近似值。越早的阶段，不确定性通常越大。')}${timeline(cosmicTimeline)}</section><section>${heading('KEEP ASKING','还有这些问题，值得一起追问。')}<div class="theory-directory">${mysteries.map(m=>`<a href="#unknown/${m.id}" class="theory-entry"><span class="entry-en">${m.en}</span><h3>${m.name}</h3><span class="status-chip">${m.status}</span><p>${m.subtitle}</p></a>`).join('')}</div><p class="reading-footnote">资料：<a href="https://science.nasa.gov/universe/" target="_blank" rel="noopener noreferrer">NASA Universe ↗</a>。不同理论的证据强度不同，“未知”不代表任意一种说法都得到同等支持。</p></section>`;
}
