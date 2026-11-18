import {odysseyAsset} from './odyssey-data.js';

const observations = {
 earth: {
  title: '地球的晨昏线', task: '切换光照，沿着地球边缘找云层、大气和城市灯光。', initial: 1,
  source: 'https://science.nasa.gov/earth/earth-observatory/sunrise-from-the-station-152259/', sourceLabel: '空间站拍摄的日出', note: '大气视效经过增强', image: 'earth.jpg',
  modes: [
   ['向阳面', '沿地球边缘斜看，视线穿过较长一段大气，更容易看出蓝色散射光。白色云层会遮住下方的地表。'],
   ['晨昏交界', '低角度阳光穿过较长的大气路径，较多蓝光被散射出去，剩下偏红的光能照亮高处云层。'],
   ['夜半球', '太阳照不到这一侧，城市的人工灯光更容易辨认。地球自转会让一个地点反复穿过晨昏线。']
  ]
 },
 moon: {
  title: '追踪月面晨昏线', task: '固定观看角度，改变太阳方向。先找月海，再沿暗边找撞击坑。', initial: 1,
  source: 'https://science.nasa.gov/moon/moon-phases/', sourceLabel: 'NASA · 月相', note: 'LRO 高程凹凸效果经过增强', image: 'moon-map.jpg',
  modes: [
   ['接近满月', '太阳从接近观察者的方向照来，坑壁阴影缩短，深色的月海更容易辨认。'],
   ['接近半月', '沿明暗交界看，低角度阳光更容易突出坑沿和邻近高地。地球上看到的月相取决于我们能看见多少被阳光照亮的月面。'],
   ['接近蛾眉月', '看得到的亮面缩成一弯细月。一般月相变化来自日、地、月的相对位置。地球的影子遮住月面时会发生月食。']
  ]
 },
 mars: {
  title: '用两种地图读火星', task: '先看地表色，再切到激光测高。比较高大的火山和被切开的峡谷。',
  source: 'https://science.nasa.gov/mars/facts/', sourceLabel: 'NASA · 火星地貌', extra: ['MOLA 高程原图', 'https://marsoweb.nas.nasa.gov/globalData/datamaps.html'], note: '色阶代表高程，表面几何为球形示意', image: 'mars-map.jpg',
  modes: [
   ['可见光地表', '红色来自广泛分布的含氧化铁尘土。深浅同时受岩石、尘埃与光照影响，单凭颜色很难判断地势。'],
   ['奥林帕斯山', '在高程图上找左侧偏上的红色山体。奥林帕斯山是盾状火山，广阔的坡面比尖峰更能体现它的体量。'],
   ['水手谷', '找靠近赤道的长条沟槽。蓝绿通常对应较低地势，黄红通常对应较高地势。水手谷系统横跨约 4000 千米。']
  ]
 },
 jupiter: {
  title: '木卫二掠过木星', task: '找卫星的小亮面和落在云顶的暗斑。比较凌日方向和侧视方向。',
  source: 'https://science.nasa.gov/jupiter/jupiter-moons/europa/', sourceLabel: 'NASA · 木卫二', extra: ['木星与云带', 'https://science.nasa.gov/jupiter/jupiter-facts/'], note: '凌日演示放大了卫星和影子，轨道经过编排', image: 'jupiter-map.jpg',
  modes: [
   ['云带与风暴', '木星的条纹由不同方向的高速气流分隔。南半球的大红斑是一场持续了很久的风暴。'],
   ['卫星凌日', '木卫二走到太阳与木星之间。它挡住一小束照向木星的阳光，云顶上就会出现暗斑。'],
   ['移到侧面', '换到外侧位置后，卫星与木星的轮廓分开。实际的木卫二直径大约是木星赤道直径的 1/46。']
  ]
 },
 saturn: {
  title: '土星环的三个视角', task: '比较环带完全展开和接近侧视时的样子，找出最明显的暗缝。',
  source: 'https://science.nasa.gov/mission/cassini/science/rings/', sourceLabel: 'NASA · 卡西尼号的环带观测', extra: ['环带数据', 'https://science.nasa.gov/saturn/facts/'], note: '角度与光位经过编排', image:'saturn.jpg',
  modes: [
   ['俯瞰环面', '从球体向外看，较暗的是 C 环，接着是明亮的 B 环。B 环与外侧 A 环之间是卡西尼缝，里面仍有稀疏的环物质。'],
   ['斜看环影', '找土星投在环面上的暗影，再看球面上的细暗纹。前者由土星遮光，后者由环带遮光。'],
   ['贴近环面', '视线几乎平行于环面时，明亮的环压成一条细线。主环典型厚度约十米，远小于环系的径向跨度。']
  ]
 },
 nebula: {
  title: '在宇宙悬崖里找细节', task: '从全景推进到尘埃边缘，再看加入中红外数据后的同一区域。',
  source: 'https://esawebb.org/images/weic2205a/', sourceLabel: 'ESA/Webb · 近红外原图', extra: ['近红外＋中红外', 'https://esawebb.org/images/weic2205b/'], note: '韦布观测合成图，镜头纵深为视觉编排', image: 'cosmic-cliffs.jpg',
  modes: [
   ['悬崖全景', '这是船底座星云中 NGC 3324 的恒星形成区。尘埃与气体交界在画面里像一面崎岖的山壁。'],
   ['尘埃尖峰', '沿着画面中央附近的亮边找突起。年轻大质量恒星发出的辐射和恒星风可以雕刻邻近的气体与尘埃。'],
   ['加入中红外', '近红外和中红外合成后，温暖尘埃与嵌在云中的年轻恒星呈现出不同细节。画面的色彩由观测波段映射而来。']
  ]
 },
 blackhole: {
  title: '黑洞边缘的光从哪来', task: '先看流动的吸积盘，再压低视角，最后单独突出靠近阴影的光环。',
  source: 'https://science.nasa.gov/universe/black-holes/anatomy/', sourceLabel: 'NASA · 黑洞结构', note: '受物理启发的程序着色示意', image: 'blackhole.jpg',
  modes: [
   ['吸积盘', '发光的是黑洞周围炽热的物质。朝观测者运动的一侧可以显得更亮，画面对此做了艺术简化。'],
   ['侧看弯折', '压低视角后，前侧光带变窄，后侧光经过引力弯折仍能出现在阴影上方。'],
   ['突出光环', '调暗外围发光结构后，观察靠近阴影的细亮环。实际观测中的亮环可能同时包含吸积流辐射与被强引力偏折的光。']
  ]
 },
 deepfield: {
  title: '读懂韦布首幅深场', task: '从星系团全景推进到弧像与亮星，在同一张原图中比较它们的形状。',
  source: 'https://esawebb.org/images/weic2209a/', sourceLabel: 'ESA/Webb · SMACS 0723 原图', note: '同一张观测图的定点取景', image: 'deepfield.jpg',
  modes: [
   ['星系团全景', '画面中心的 SMACS 0723 星系团周围还有大量更远的星系。离我们更远的光，往往也记录了更早的宇宙。'],
   ['寻找弧像', '找亮星系团右上方的橙色长弧。星系团的引力偏折了背景星系的光，在图像中把它拉伸成弧。'],
   ['辨认亮星', '找带蓝色放射尖峰的亮点。尖峰来自光在望远镜光学结构上的衍射，可以用来辨认这颗前景亮星。']
  ]
 }
};

export const observationStart = id => observations[id].initial ?? 0;
export const hasObservation = id => Object.hasOwn(observations, id);

function fallbackImage(id,mode) {
 if (id==='mars'&&mode>0) return 'mars-elevation.jpg';
 if (id==='nebula'&&mode===2) return 'cliffs-composite.jpg';
 return observations[id].image;
}

export function renderObservation(id, mode) {
 const {title, task, source, sourceLabel, extra, modes, note} = observations[id];
 return `
  <div class="observation-pane">
   <button class="observation-back" data-od-observation-exit>← 返回星站</button>
   <h1 id="od-hero-title" tabindex="-1">${title}</h1>
   <p class="observation-task">${task}</p>
   <div class="observation-modes" role="group" aria-label="观测方式">
    ${modes.map(([label], i) => `<button data-od-observation-mode="${i}" aria-pressed="${i===mode}">${label}</button>`).join('')}
   </div>
   <p class="observation-reading" data-observation-reading aria-live="polite">${modes[mode][1]}</p>
   <a class="observation-source" href="${source}" target="_blank" rel="noopener noreferrer">${sourceLabel} ↗</a>
   ${extra ? `<a class="observation-source" href="${extra[1]}" target="_blank" rel="noopener noreferrer">${extra[0]} ↗</a>` : ''}
   <p class="observation-note" data-observation-model-note>${note}</p>
   <div class="observation-fallback" data-observation-fallback data-mode="${mode}" style="--ring-view:${[.82,.42,.025][mode]}" aria-hidden="true"><i></i><b></b><div class="observation-reference"><img alt="" src="${odysseyAsset(fallbackImage(id,mode))}"></div></div>
   <p class="observation-note observation-fallback-note">静态参考图 · ${note}</p>
  </div>`;
}

export function reflectObservation(id, mode) {
 document.querySelectorAll('[data-od-observation-mode]').forEach(button => {
  button.setAttribute('aria-pressed', String(Number(button.dataset.odObservationMode)===mode));
 });
 document.querySelector('[data-observation-reading]').textContent = observations[id].modes[mode][1];
 const fallback = document.querySelector('[data-observation-fallback]');
 fallback.dataset.mode = mode;
 fallback.style.setProperty('--ring-view', [.82,.42,.025][mode]);
 const image = fallback.querySelector('img');
 const src = odysseyAsset(fallbackImage(id,mode));
 if(image.src!==src) image.src=src;
}
