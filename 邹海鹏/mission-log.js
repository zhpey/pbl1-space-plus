const entries = [
  { year: '1977', date: '1977-08-20', title: '从地球发射', planet: 'earth', x: 58, y: 143, text: '旅行者 2 号先于旅行者 1 号发射。外行星在当时的相对位置，让一次任务得以接力飞越多颗行星。', question: '旅行者 2 号的编号和发射先后有什么区别？' },
  { year: '1979', date: '1979-07-09', title: '飞越木星', planet: 'jupiter', x: 200, y: 96, text: '旅行者 2 号拍摄了木星及其卫星，也为两艘旅行者探测器对木星系统的观测补充了新的细节。', question: '重力助推借用的是行星的哪一种运动？' },
  { year: '1981', date: '1981-08-26', title: '飞越土星', planet: 'saturn', x: 359, y: 132, text: '探测器穿过土星系统，观测行星环和卫星。经过土星后，它沿着与旅行者 1 号不同的路线继续前往天王星。', question: '两艘探测器为何可以从土星走向不同的目的地？' },
  { year: '1986', date: '1986-01-24', title: '飞越天王星', planet: 'uranus', x: 521, y: 79, text: '旅行者 2 号飞越天王星，调查大气、磁场、环与卫星。这里距离上一次主要行星飞越已经四年多。', question: '比较时间轴，相邻的两次飞越各相隔了多久？' },
  { year: '1989', date: '1989-08-25', title: '飞越海王星', planet: 'neptune', x: 650, y: 48, text: '探测器观测了海王星的大暗斑与海卫一，并完成这段外行星巡访的最后一次行星飞越。', question: '从发射到飞越海王星，大约用了多少年？' },
];

let selectedStep = 0;

function reading(index) {
  const item = entries[index];
  return `<time datetime="${item.date}">${item.date.replaceAll('-', ' / ')}</time><h3>${item.title}</h3><p>${item.text}</p><p class="mission-question">${item.question}</p><a href="#explore/${item.planet}">到行星漫游查看这颗行星 →</a>`;
}

export function renderMissionLog() {
  return `<section class="pbl-instrument voyager-log" id="voyager-log" aria-labelledby="voyager-title"><header><div><span class="instrument-kicker">VOYAGER 2</span><h2 id="voyager-title">一艘探测器，四次外行星飞越</h2></div><p>沿时间轴回看 1977–1989 年的旅行者 2 号任务。</p></header>
    <svg class="mission-map" viewBox="0 0 710 186" aria-hidden="true"><defs><pattern id="mission-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" opacity=".22"/></pattern></defs><rect width="710" height="186" fill="url(#mission-grid)"/><path class="mission-path" d="M58 143C111 143 145 92 200 96S300 147 359 132S450 89 521 79S601 67 650 48"/>${entries.map(({x,y},i)=>`<g data-mission-node="${i}" class="${i === selectedStep ? 'current' : ''}"><circle cx="${x}" cy="${y}" r="15" class="mission-halo"/><circle cx="${x}" cy="${y}" r="5" class="mission-point"/></g>`).join('')}</svg>
    <div class="mission-dates" role="group" aria-label="飞越里程碑">${entries.map((item,i)=>`<button data-voyager-step="${i}" aria-pressed="${i === selectedStep}"><strong>${item.year}</strong><span>${item.title}</span></button>`).join('')}</div>
    <article class="mission-reading" data-mission-reading aria-live="polite">${reading(selectedStep)}</article>
    <footer>路线与间距为示意。飞越日期以最接近时刻的 UTC 日期为准。 <a href="https://science.nasa.gov/mission/voyager/voyager-2/" target="_blank" rel="noopener">NASA 任务档案 ↗</a></footer></section>`;
}

export function bindMissionLog() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-voyager-step]');
    if (!button) return;
    const section = button.closest('.voyager-log');
    selectedStep = Number(button.dataset.voyagerStep);
    section.querySelectorAll('[data-voyager-step]').forEach(step => step.setAttribute('aria-pressed', String(step === button)));
    section.querySelectorAll('[data-mission-node]').forEach((node,i) => node.classList.toggle('current', i === selectedStep));
    section.querySelector('[data-mission-reading]').innerHTML = reading(selectedStep);
  });
}
