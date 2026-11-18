import { additionalLetters } from './letters.js';
export const photos = [
  {
    id: 'pillars',
    title: '创生之柱',
    en: 'PILLARS OF CREATION',
    category: 'nebula',
    label: '星云',
    image: 'pillars.jpg',
    instrument: 'HUBBLE · 近红外',
    distance: '约 6,500 光年',
    desc: '近红外光穿透部分尘埃，让鹰状星云的柱状结构变得通透，也显露出藏在背后的无数恒星。新的恒星，正在其中诞生。',
    credit: 'NASA, ESA, and the Hubble Heritage Team (STScI/AURA)',
    url: 'https://images.nasa.gov/details/GSFC_20171208_Archive_e000842',
  },
  {
    id: 'galaxy',
    title: '仙女座星系',
    en: 'THE ANDROMEDA GALAXY',
    category: 'galaxy',
    label: '星系',
    image: 'galaxy.jpg',
    instrument: 'HUBBLE · 星系全景',
    distance: '约 250 万光年',
    desc: '哈勃对银河系邻居的全景观测，分辨出数量惊人的恒星。我们看到的光，早在人类文明诞生之前就已经出发。',
    credit: 'NASA, ESA, and G. Bacon (STScI)',
    url: 'https://images.nasa.gov/details/GSFC_20171208_Archive_e000833',
  },
  {
    id: 'nebula',
    title: '马头星云',
    en: 'THE HORSEHEAD NEBULA',
    category: 'nebula',
    label: '星云',
    image: 'nebula.jpg',
    instrument: 'HUBBLE · 星际尘埃',
    distance: '约 1,500 光年',
    desc: '猎户座中，暗色尘埃云勾勒出熟悉的马头轮廓。星际空间并非空无一物，气体与尘埃构成了下一代恒星的原料。',
    credit: 'JPL/NASA, NOAO, ESA and The Hubble Heritage Team, STScI/AURA',
    url: 'https://images.nasa.gov/details/PIA04215',
  },
];

export const chapters = [
  {
    title: '01 / 离开那颗蓝色星球',
    subtitle: '有些出发，是为了重新理解归途。',
    body: '公元 2186 年，信使号离开地球。舷窗外，城市的灯光消失在晨昏线上。林遥把第一封信写给还在熟睡的妹妹：“如果有一天你想起我，抬头看看星星。我们仍在同一片宇宙里。”',
    planet: 'earth',
    science:
      '真实知识：地球没有清晰坚硬的大气边缘，空气会随高度逐渐稀薄。卡门线常被约定为海拔 100 千米。',
  },
  {
    title: '02 / 红色荒原的回声',
    subtitle: '每一条干涸的河，都记得水的方向。',
    body: '飞船停靠在火星轨道。林遥看见红色荒原上，古老的河床像一封没有寄出的信。她写道：“这里曾有过水。我们还不知道是否曾有谁，在另一个黄昏望向地球。”',
    planet: 'mars',
    science: '真实知识：火星上存在古代河流、湖泊的地质证据。目前没有确认火星曾经或现在存在生命。',
  },
  {
    title: '03 / 穿过冰的光环',
    subtitle: '宏大的风景，也由微小的事物组成。',
    body: '经过土星时，光环不再是一条平滑的线。无数冰粒沿各自的轨道漂浮，像没有声音的雪。林遥在信里写：“原来最壮丽的事物，也可以由平凡而微小的碎片组成。”',
    planet: 'saturn',
    science:
      '真实知识：土星环由独立绕土星运行的冰粒、岩石和尘埃组成。这里的航行与人物属于虚构故事。',
  },
  {
    title: '04 / 把星光寄回家',
    subtitle: '我们探索远方，也珍惜唯一的家。',
    body: '越过海王星，太阳变成一颗异常明亮的星。妹妹的回信终于抵达：“今天我也看了星星。”林遥明白了，她带着的问题或许没有终点，但每次回望，那颗蓝色星球都是答案的一部分。',
    planet: 'neptune',
    science: '真实知识：光从海王星附近传到地球通常需要约四小时，具体时长随两颗行星的位置而变化。',
  },
];

export const telescopes = [
  {
    name: '哈勃空间望远镜',
    en: 'HUBBLE',
    year: '1990 年发射',
    mirror: '2.4 米主镜',
    where: '近地轨道',
    band: '紫外、可见光与部分近红外',
    body: '它不只是“拍漂亮照片”：也测量恒星、行星大气、星系距离与宇宙膨胀。其清晰影像来自在地球大气层之外的观测。',
    url: 'https://science.nasa.gov/mission/hubble/',
  },
  {
    name: '詹姆斯·韦布空间望远镜',
    en: 'JAMES WEBB',
    year: '2021 年发射',
    mirror: '6.5 米主镜',
    where: '日地 L2 附近',
    band: '以红外为主',
    body: '红外观测有助于研究被尘埃遮挡的恒星形成区域和遥远星系。韦布与哈勃的波段优势互补，而非简单重复同一种观测。',
    url: 'https://science.nasa.gov/mission/webb/',
  },
];

photos.push(
  {
    id: 'crab',
    title: '蟹状星云',
    en: 'THE CRAB NEBULA',
    category: 'nebula',
    label: '超新星遗迹',
    image: 'crab.jpg',
    instrument: 'HUBBLE · 可见光',
    distance: '约 6,500 光年',
    desc: '一颗恒星爆炸后的遗迹，丝状气体仍在向外扩展。中心的脉冲星是一颗高速旋转的中子星，提醒我们恒星死亡也会留下新的天体。',
    credit: 'NASA, ESA, J. Hester and A. Loll (Arizona State University)',
    url: 'https://images.nasa.gov/details/PIA03606',
  },
  {
    id: 'carina',
    title: '船底座星云',
    en: 'THE CARINA NEBULA',
    category: 'nebula',
    label: '恒星诞生区',
    image: 'carina.jpg',
    instrument: 'HUBBLE · 多波段合成',
    distance: '约 7,500 光年',
    desc: '大质量恒星的辐射与恒星风雕刻着气体云。明亮的边缘和暗色尘埃展示了恒星形成区域的复杂结构。',
    credit: 'NASA, ESA, M. Livio and the Hubble 20th Anniversary Team (STScI)',
    url: 'https://images.nasa.gov/details/GSFC_20171208_Archive_e002076',
  },
  {
    id: 'deepfield',
    title: '哈勃极深场',
    en: 'HUBBLE EXTREME DEEP FIELD',
    category: 'galaxy',
    label: '遥远星系',
    image: 'deepfield.jpg',
    instrument: 'HUBBLE · 长时间叠加',
    distance: '包含不同距离的星系',
    desc: '把目光停在很小的一片天空，累积长时间的曝光，原本微弱的星系逐渐出现。画面中许多小光斑不是恒星，而是整个星系。',
    credit:
      'NASA, ESA, G. Illingworth, D. Magee and P. Oesch (University of California, Santa Cruz), R. Bouwens (Leiden University), and the HUDF09 Team',
    url: 'https://images.nasa.gov/details/GSFC_20171208_Archive_e001651',
  },
);

chapters.forEach((chapter, index) => {
  chapter.body += '\n\n' + additionalLetters[index];
});
