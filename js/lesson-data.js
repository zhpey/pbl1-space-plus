import {lessons as planetLessons} from '../陈冠伟/lessons.js';
import {lessons as solarLessons} from '../邹海鹏/lessons.js';
import {lessons as atlasLessons} from '../朱雷/lessons.js';
import {lessons as theoryLessons} from '../滕紫涵/lessons.js';
import {lessons as imageLessons} from '../訾舒然/lessons.js';

const definitions = [
  ['explore', '行星漫游', '行星观察档案', '从大气、地形和卫星读懂每个世界。', '陈冠伟', '#ffbc9f', planetLessons],
  ['solar', '太阳系', '轨道与航天课', '沿距离、轨道和任务记录，走一遍探测器的行程。', '邹海鹏', '#f6d18e', solarLessons],
  ['atlas', '星座图谱', '夜空观测手册', '从辨方向、认亮星开始，试着写下自己的观测记录。', '朱雷', '#a5e6d9', atlasLessons],
  ['unknown', '宇宙谜题', '宇宙证据室', '追问每个结论怎样测得，还有哪些问题悬而未决。', '滕紫涵', '#d5c1ff', theoryLessons],
  ['observatory', '深空影像', '影像解读工作室', '读懂照片中的光、颜色和仪器留下的痕迹。', '訾舒然', '#a9d7ff', imageLessons],
];
export const lessonCollections = Object.fromEntries(definitions.map(([route, name, title, summary, directory, accent, entries]) => [route, {
  name, title, summary, directory, accent,
  entries: entries.map(([id, group, title, source, paragraphs, question, answer, related]) => ({id, group, title, source, paragraphs, question, answer, related})),
}]));
export const lessonTotal = definitions.reduce((total, definition) => total + definition[6].length, 0);
