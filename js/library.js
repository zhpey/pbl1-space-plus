import { articles as planets } from "../陈冠伟/articles.js";
import { articles as solar } from "../邹海鹏/articles.js";
import { articles as atlas } from "../朱雷/articles.js";
import { articles as theories } from "../滕紫涵/articles.js";
import { articles as observatory } from "../訾舒然/articles.js";
import { articleCovers } from "./article-covers.js";

export const localArticles = [
  ...planets,
  ...solar,
  ...atlas,
  ...theories,
  ...observatory,
];
const collections = { planets, solar, atlas, theories, observatory };
const labels = {
  planets: "行星与生命 · 图文探索",
  solar: "航天与工程 · 任务档案",
  atlas: "星空与文明 · 观察读本",
  theories: "宇宙与物理 · 问题研究室",
  observatory: "影像与想象 · 创作阅读室",
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const searchable = (a) =>
  [
    a.title,
    a.lead,
    a.category,
    ...a.sections.map((s) => s.title + " " + s.text),
  ]
    .join(" ")
    .toLocaleLowerCase();
const matches = (a, q) => searchable(a).includes(q.trim().toLocaleLowerCase());
const minutes = (a) =>
  Math.max(
    2,
    Math.ceil((a.lead + a.sections.map((s) => s.text).join("")).length / 300),
  );

function renderReadingCard(a, index, query) {
  const cover = articleCovers[a.id];
  return `<button type="button" class="reading-card" data-action="article" data-value="${a.id}" ${matches(a, query) ? "" : "hidden"}><div class="reading-card-image"><img src="${cover?.src || a.image}" alt="${escape(cover?.alt || a.caption)}" loading="lazy" decoding="async"><span>READING ${String(index + 1).padStart(2, "0")}</span>${cover?.kind === 'illustration' ? '<small class="reading-cover-kind">原创示意</small>' : ''}</div><div class="reading-card-copy"><span class="article-meta">${a.category || "基础科普"} · 约 ${minutes(a)} 分钟</span><h3>${a.title}</h3><p>${a.lead}</p><span class="reading-card-link">阅读图文专题 →</span></div></button>`;
}

export function renderModuleLibrary(module, s = {}) {
  const articles = collections[module],
    query = s.libraryQueries?.[module] || "",
    count = articles.filter((a) => matches(a, query)).length;
  return `<section id="world-library" class="module-library" data-library="${module}" tabindex="-1" aria-label="${labels[module]}"><header class="library-heading"><div><span class="eyebrow">READ — LOOK — UNDERSTAND</span><h2>${labels[module]}</h2><p>从一个问题出发，读懂背后的科学。</p></div><span class="library-count">${String(articles.length).padStart(2, "0")} 篇专题</span></header><div class="library-tools"><label><span class="visually-hidden">搜索本星球的专题标题、主题和正文</span><input type="search" data-library-search="${module}" placeholder="搜索专题、主题或关键词…" value="${escape(query)}" autocomplete="off"></label><span class="library-result" role="status" aria-live="polite">显示 ${count} / ${articles.length} 篇</span></div><p class="library-empty" ${count ? "hidden" : ""}>没有找到相关专题，试试更短的关键词。</p><div class="reading-card-grid">${articles.map((a, i) => renderReadingCard(a, i, query)).join("")}</div></section>`;
}

export function applyLibrarySearch(input) {
  const library = input.closest(".module-library");
  let count = 0;
  for (const card of library.querySelectorAll(".reading-card")) {
    card.hidden = !matches(findArticle(card.dataset.value), input.value);
    if (!card.hidden) count++;
  }
  library.querySelector(".library-result").textContent =
    `显示 ${count} / ${library.querySelectorAll(".reading-card").length} 篇`;
  library.querySelector(".library-empty").hidden = count > 0;
}

export function findArticle(id) {
  return localArticles.find((a) => a.id === id);
}

export function renderArticle(a) {
  const siblings = collections[a.module],
    index = siblings.indexOf(a);
  return `<div class="article-meta">${a.category || "基础科普"} · 约 ${minutes(a)} 分钟 · ${a.sections.length} 个阅读小节</div><p class="article-lead">${a.lead}</p><figure class="article-figure"><img src="${a.image}" alt="${a.caption}" decoding="async"><figcaption>${a.caption}<span>Credit: ${a.credit}</span></figcaption></figure><div class="article-body">${a.sections
    .map(
      (section, i) =>
        `<section><span class="reading-number">${String(i + 1).padStart(2, "0")}</span><h3>${section.title}</h3>${section.text
          .split("\n")
          .filter(Boolean)
          .map((p) => `<p>${p}</p>`)
          .join(
            "",
          )}</section>${a.diagram && i === 2 ? `<figure class="article-figure concept-figure"><img src="${a.diagram}" alt="${a.title}：概念关系示意图" loading="lazy"><figcaption>原创概念图 · 用于梳理阅读线索，不代表天体比例、实际观测或工程图纸。<span>Credit: SPACE PLUS / 成员专题制作</span></figcaption></figure>` : ""}`,
    )
    .join(
      "",
    )}</div>${a.task ? `<aside class="article-task"><span class="eyebrow">YOUR TURN / 小组探究</span><h3>把知识变成一次行动</h3><p>${a.task}</p></aside>` : ""}<footer class="article-sources"><p>资料依据：${a.source}</p><p>本文为中文科普整理与原创教学设计，数值为近似参考值。示意图、观测影像与艺术想象的区别见图注。</p>${a.sourceUrl ? `<details><summary>查看原始档案与出处</summary><a href="${a.sourceUrl}" target="_blank" rel="noopener noreferrer">原始资料（可选外部查证）→</a></details>` : ""}</footer><nav class="article-pagination" aria-label="继续阅读专题">${index > 0 ? `<button data-action="article" data-value="${siblings[index - 1].id}">← 上一篇</button>` : "<span></span>"}${index < siblings.length - 1 ? `<button data-action="article" data-value="${siblings[index + 1].id}">下一篇 →</button>` : "<span>本组专题已读到最后一篇</span>"}</nav>`;
}
