const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {rolldown} = require(process.env.PBL_ROLLDOWN || 'rolldown');
const root = path.resolve(__dirname, '..');
const cssFiles = ['style.css', 'reading.css', 'layouts.css', 'discovery.css', 'enhancements.css',
  'library.css', 'polish.css', 'experience.css', 'cinema-grade.css', 'odyssey.css', 'odyssey-visuals.css',
  'odyssey-gate.css', 'bridge.css', 'shipboard.css', 'cosmos.css', 'expedition.css', 'interface.css', 'arrival.css', 'fast-preview.css', 'instruments.css', 'lesson-reader.css'];
const pages = [
  ['', 'universe', '离开地面，重新看见我们的世界。', '从地球轨道出发，走过八站深空旅程，阅读真实观测影像背后的科学。'],
  ['陈冠伟', 'explore/earth', '行星漫游', '比较八大行星的体积、公转周期和表面引力。地球的平均半径约 6,371 公里。'],
  ['邹海鹏', 'solar', '太阳系 · 轨道总览', '从太阳出发，认识行星轨道。按平均日心距离，阳光约需 8 分 20 秒抵达地球。'],
  ['朱雷', 'atlas/orion', '今夜，抬头寻找什么？', '先找几乎排成一条直线的三颗亮星：这是猎户座的腰带。星图收录八个常见观测目标。'],
  ['滕紫涵', 'unknown/blackhole', '从黑洞开始读宇宙', '引力波和黑洞阴影让我们从不同角度研究黑洞。翻阅证据，一起区分观测、模型与假说。'],
  ['訾舒然', 'observatory', '光走了很久，才抵达这里。', '阅读来自哈勃的宇宙影像，在星云和星系之间漫游，或翻开四封原创星际来信。'],
];
async function expandCss(file) {
  const source = (await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, '');
  const includes = [...source.matchAll(/^@import url\(['"]([^'"]+)['"]\);/gm)];
  if (!includes.length) return source;
  const expanded = await Promise.all(includes.map(async ([, target]) => {
    const filename = path.resolve(path.dirname(file), target);
    const text = await expandCss(filename);
    if (path.dirname(filename) !== root && /url\(/.test(text)) throw new Error(`Rebase CSS URLs in ${filename}`);
    return text;
  }));
  return expanded.join('\n') + '\n' + source.replace(/^@import url\(['"][^'"]+['"]\);/gm, '');
}
function launchMarkup(base, title, intro) {
  const names = ['行星漫游', '太阳系', '星座图谱', '宇宙理论', '影像与故事'];
  return `<main id="launch-preview" class="launch-preview">
    <a class="launch-brand" href="${base}">太空<sup>+</sup> <span>SPACE PLUS</span></a>
    <section class="launch-intro"><h1>${title}</h1><p>${intro}</p></section>
    <nav aria-label="五人作品">${pages.slice(1).map(([dir], i) => `<a href="${base}${dir}/">${names[i]} <span aria-hidden="true">↗</span></a>`).join('')}</nav>
  </main>`;
}
async function run() {
  const vendor = path.join(root, 'vendor/three');
  const build = await rolldown({input: { 'site': path.join(root, 'js/main.js') },
    plugins: [{name: 'local-three', resolveId(id) {
      if (id === 'three') return path.join(vendor, 'build/three.module.js');
      if (id.startsWith('three/addons/')) return path.join(vendor, 'examples/jsm', id.slice('three/addons/'.length));
    }}],
  });
  const {output} = await build.write({dir: path.join(root, 'js'), format: 'es',
    entryFileNames: 'public-[name]-[hash].js', chunkFileNames: 'public-[name]-[hash].js', minify: true});
  const entry = output.find(item => item.type === 'chunk' && item.isEntry);
  if (!entry) throw new Error('No site entry was generated.');
  const staticImports = new Set();
  function collectImports(chunk) {
    for (const name of chunk.imports) {
      if (staticImports.has(name)) continue;
      const dependency = output.find(part => part.type === 'chunk' && part.fileName === name);
      if (!dependency) throw new Error(`Missing dependency ${name}`);
      staticImports.add(name);
      collectImports(dependency);
    }
  }
  collectImports(entry);
  const css = (await Promise.all(cssFiles.map(name => expandCss(path.join(root, name))))).join('\n');
  const styleName = `public-site-${crypto.createHash('sha256').update(css).digest('hex').slice(0, 10)}.css`;
  await fs.writeFile(path.join(root, styleName), css);
  const previewStyle = (await fs.readFile(path.join(root, 'launch-preview.css'), 'utf8')).replace(/^\uFEFF/, '');
  for (const [directory, route, title, intro] of pages) {
    const base = directory ? '../' : './';
    const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090c0f">
  <meta name="description" content="${intro}">
  <title>太空+ SPACE PLUS · ${title}</title>
  <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
  <style>${previewStyle}</style>
  ${[...staticImports].map(name => `<link rel="modulepreload" href="${base}js/${name}">`).join('\n  ')}
  <script>if(new URLSearchParams(location.search).get('view')==='fast')document.documentElement.dataset.fastView='true';</script>
  <script type="module" src="${base}js/${entry.fileName}"></script>
  <link rel="stylesheet" href="${base}${styleName}" data-site-style media="print" onload="this.media='all'" onerror="this.dataset.failed='true'">
</head>
<body data-entry-route="${route}" style="--launch-earth:url('${base}assets/odyssey/earth-preview.webp')">
  ${launchMarkup(base, title, intro)}
  <div id="space-site" hidden>
    <a class="skip-link" href="#page-content">跳到探索内容</a>
    <div id="stage"><canvas id="universe" aria-label="可拖动旋转的三维宇宙" tabindex="0"></canvas><div class="stage-shade"></div></div>
    <div id="app"></div>
  </div>
</body>
</html>
`;
    await fs.writeFile(path.join(root, directory, 'index.html'), page);
  }
  console.log(output.map(({fileName, code}) => `${fileName} ${Buffer.byteLength(code || '')}`).join('\n'));
  console.log(styleName, Buffer.byteLength(css));
}
run().catch(error => {console.error(error); process.exitCode = 1;});
