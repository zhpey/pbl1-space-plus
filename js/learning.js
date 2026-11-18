import {planetReading} from '../陈冠伟/reading.js';
import {solarReading} from '../邹海鹏/reading.js';
import {atlasReading} from '../朱雷/reading.js';
import {theoryReading} from '../滕紫涵/reading.js';
import {observatoryReading,storyReading} from '../訾舒然/reading.js';
import {renderWorldIntro} from './worlds.js';
import {renderDiscovery} from './discovery.js';
const readers={explore:planetReading,solar:solarReading,atlas:atlasReading,unknown:theoryReading,observatory:observatoryReading,story:storyReading};
export function renderReadingEntry(s){
 if(s.route==='universe')return '';
 const topics={explore:'行星档案 · 大小对比 · 引力体验',solar:'光行时间 · 太阳系分区 · 航天历程',atlas:'观星指南 · 四季星空 · 星座目录',unknown:'相对论时钟 · 科学证据 · 宇宙时间线',observatory:'空间望远镜 · 影像解读 · 科学来源',story:'航行日志 · 章节目录 · 科学笔记'};
 return `<a class="reading-entry" href="#learning-content" data-action="learning-jump"><span><small>探索不止于眼前</small><strong>${topics[s.route]}</strong></span><span class="reading-entry-arrow">向下探索 ↓</span></a>`;
}
export function renderLearning(s){if(s.route==='universe')return '';return `<section id="learning-content" tabindex="-1" class="learning-region" data-learning="${s.route}" aria-label="${{explore:'行星深度档案',solar:'太阳系与航天历程',atlas:'观星指南',unknown:'宇宙理论与证据',observatory:'望远镜与影像解读',story:'故事探索笔记'}[s.route]}"><a class="reading-top-link" data-action="reading-top" href="#${s.route}">回到本页宇宙场景 ↑</a>${renderWorldIntro(s)}${renderDiscovery(s)}${readers[s.route](s)}</section>`;}
