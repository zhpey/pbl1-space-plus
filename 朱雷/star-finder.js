const targets = {
  orion: { prompt:'先找到三颗几乎排成直线的亮星，再沿着星图辨认两端。', options:['猎户腰带','北斗七星','夏季大三角'], answer:0, stars:[2,3,4], note:'腰带由参宿一、参宿二和参宿三组成。找到腰带后，可再找红色的参宿四和蓝白色的参宿七。' },
  ursa: { prompt:'从星图中看出一个斗柄和一个四星组成的斗口。整个图案叫什么？', options:['北十字','北斗七星','飞马大四边形'], answer:1, stars:[0,1,2,3,4,5,6], note:'北斗七星属于大熊座。沿天璇到天枢的方向延长约五倍，就能找到小熊座的北极星。' },
  cassiopeia: { prompt:'顺着五颗星的排列看，这个图案常让人想起哪个字母？', options:['O','T','W'], answer:2, stars:[0,1,2,3,4], note:'仙后座常见的五颗亮星可以连成 W。随着它绕北天极在天空中转动，有时看起来像 M。' },
  leo: { prompt:'沿着反写问号形状的星链找到最亮的末端，那颗星叫什么？', options:['天津四','轩辕十四','参宿四'], answer:1, stars:[4], note:'轩辕十四位于狮子座头部星链的底端。这组星也叫镰刀星群。' },
  cygnus: { prompt:'这一组星像一个十字。哪颗亮星在长轴的一端，也是夏季大三角的顶点之一？', options:['天津四','心宿二','北极星'], answer:0, stars:[0], note:'天津四沿北十字的长轴可以找到。到天琴座找织女星，再与牛郎星一起辨认夏季大三角。' },
  lyra: { prompt:'先找小平行四边形，再看旁边更亮的一颗。它叫什么？', options:['牛郎星','参宿七','织女星'], answer:2, stars:[0], note:'织女星是夏季大三角中最亮的一颗。天琴座的小平行四边形在织女星近旁。' },
  scorpius: { prompt:'沿着弯钩状的星链走，哪颗偏红的亮星像蝎子的心脏？', options:['轩辕十四','心宿二','织女星'], answer:1, stars:[2], note:'心宿二的偏红颜色可以帮助确认位置。低纬度的夏夜通常更易看到天蝎座的完整轮廓。' },
  andromeda: { prompt:'从飞马大四边形的一角走上仙女座星链，起点那颗亮星叫什么？', options:['壁宿二','天枢','参宿七'], answer:0, stars:[0], note:'壁宿二位于仙女座，也是飞马大四边形的一角。仙女座星系在这片天区，但天体性质与这些恒星不同。' },
};

const attempts = new Map();

export function isFinderStar(id, index) {
  const target = targets[id];
  return attempts.get(id) === target.answer && target.stars.includes(index);
}

function feedback(id) {
  const target = targets[id];
  if (!attempts.has(id)) return '选出答案后，可以在上方星图核对位置。';
  if (attempts.get(id) === target.answer) return target.note;
  return '再试一次。可在上方切换连线和恒星标注，看看提示中的形状或位置。';
}

export function renderFinder(id) {
  const target = targets[id];
  return `<section class="pbl-instrument star-finder" data-finder="${id}" aria-labelledby="finder-title"><header><div><span class="instrument-kicker">FIND A STAR</span><h2 id="finder-title">试着从星图认一次路</h2></div></header><p>${target.prompt}</p><div class="finder-options" role="group" aria-label="选择答案">${target.options.map((option,index) => `<button data-finder-option="${index}" aria-pressed="${attempts.get(id) === index}">${option}</button>`).join('')}<button data-finder-reset ${attempts.has(id) ? '' : 'disabled'}>重做</button><button data-finder-map>返回星图</button></div><p data-finder-result data-correct="${attempts.get(id) === target.answer}" role="status">${feedback(id)}</p></section>`;
}

export function bindFinder() {
  document.addEventListener('click', event => {
    const section = event.target.closest('[data-finder]');
    if (!section) return;
    const workbench = section.closest('.sky-workbench');
    if (event.target.closest('[data-finder-map]')) {
      const map = workbench.querySelector('.star-map');
      map.focus({preventScroll:true});
      map.scrollIntoView({block:'center'});
      return;
    }
    const button = event.target.closest('[data-finder-option]');
    const reset = event.target.closest('[data-finder-reset]');
    if (!button && !reset) return;
    const id = section.dataset.finder;
    if (reset) attempts.delete(id);
    else attempts.set(id, Number(button.dataset.finderOption));
    section.querySelectorAll('[data-finder-option]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    if (reset) section.querySelector('[data-finder-option]').focus();
    section.querySelector('[data-finder-reset]').disabled = !attempts.has(id);
    const result = section.querySelector('[data-finder-result]');
    result.textContent = feedback(id);
    result.dataset.correct = String(attempts.get(id) === targets[id].answer);
    workbench.querySelectorAll('[data-map-star]').forEach((star,index) => {
      star.classList.toggle('finder-highlight', isFinderStar(id, index));
    });
  });
}
