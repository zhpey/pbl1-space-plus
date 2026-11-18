import { fieldnotes } from "./fieldnotes.js";
import { topics } from "./topics.js";
// Original educational summaries. Images and article text are stored locally.
const foundationalArticles = [
  {
    id: "atlas-find-north",
    title: "第一次观星，先找到方向",
    lead: "先认识地平线与方位，再寻找明亮星点，通常比一开始记住很多星座更有效。观星也是一项需要耐心的观察练习。",
    image: "sky-directions.svg",
    sections: [
      {
        title: "先选对时间和地点",
        text: "选择视野开阔、远离强灯光且天气晴朗的地点。月光、薄云和空气透明度会影响能见度，城市里能看到的星星数量通常少于暗夜地点。请在安全、允许进入的区域观测，并提前了解回程路线。",
      },
      {
        title: "认识北方的天空",
        text: "在北半球中纬度地区，北极星靠近北天极，可帮助大致辨认北方。它并不是夜空最亮的恒星。北极星离地平线的高度大约对应观测纬度；到了南半球，多数地方无法使用它辨认方向。",
      },
      {
        title: "把图和天空对应起来",
        text: "星图上的东、西可能与普通地图的直觉不同，因为我们在仰望天空。应先确认星图面向和观测方向，再比较亮星间的形状。手机屏幕太亮会干扰暗适应，可以降低亮度并使用网站的红光模式；红光也不意味着可以无限提高亮度。",
      },
    ],
    source: "IAU 星座资料 / NASA Night Sky Network",
    caption: "本项目自制教学示意图，非精确比例或实时星位。",
    credit: "太空+ SPACE PLUS · 原创 SVG 图解",
    sourceUrl: "",
    module: "atlas",
  },
  {
    id: "atlas-orion",
    title: "从三颗腰带星，找到猎户座",
    lead: "冬季夜空中，猎户座的亮星图案容易辨认；同一方向上的猎户座星云，又带来恒星形成的另一条故事线。",
    image: "orion-chart.svg",
    sections: [
      {
        title: "先认形状，再认名字",
        text: "猎户腰带由三颗近似排成一直线的亮星组成。参宿四位于图案的一侧，参宿七位于另一侧。对初学者来说，先记住相对形状，再逐步补充恒星名字和颜色，比一次记住全部标注更容易。",
      },
      {
        title: "图上挨着，不代表空间里挨着",
        text: "星座图是从地球方向观察的投影。组成图案的恒星可能距离不同，星点大小也不代表恒星真实直径。网站的连线帮助识别形状，并没有给出精确坐标、实时地平高度或望远镜指向参数。",
      },
      {
        title: "“冬季星座”有什么范围",
        text: "这里的季节介绍主要针对北半球常见晚间观测时段。一天中的时间、纬度以及地平遮挡都会改变可见性。猎户座并不是只在冬季存在，而是在相应季节更方便于晚间观察。",
      },
    ],
    source: "IAU Constellations / Orion",
    caption: "本项目自制教学示意图，非精确比例或实时星位。",
    credit: "太空+ SPACE PLUS · 原创 SVG 图解",
    sourceUrl: "",
    module: "atlas",
  },
  {
    id: "atlas-nebula",
    title: "猎户座里，有一座恒星育婴室",
    lead: "星云是气体和尘埃构成的区域。不同波段的观测能穿透或强调不同结构，让我们看见恒星形成的不同侧面。",
    image: "orion-nebula.jpg",
    sections: [
      {
        title: "尘埃里发生着什么",
        text: "足够致密的分子云局部区域可能在引力作用下收缩。随着物质聚集，中心逐渐升温，形成原恒星，周围常伴随盘状结构。这个过程并不是每一团气体都会顺利走到同一个终点，磁场、湍流和周围辐射都可能影响演化。",
      },
      {
        title: "为什么红外观测很有用",
        text: "部分红外波段能够穿透可见光下较不透明的尘埃，从而揭示被遮挡的目标。红外也能帮助研究较冷的物质。配图结合了不同设备的观测，颜色用于突出结构，不能直接当作站在太空中用肉眼看到的颜色。",
      },
      {
        title: "从星座到真实天体",
        text: "猎户座是一片正式划定的天空区域；猎户座星云则是这一方向上的具体天体。区域名称、投影图案和真实天体属于不同层次。通过这个例子，也能理解为什么“仙女座”和“仙女座星系”不能互相替换。",
      },
    ],
    source: "NASA / Spitzer / Hubble：Chaos at the Heart of Orion",
    caption: "猎户座星云：恒星形成区域",
    credit: "NASA/JPL-Caltech/STScI",
    sourceUrl: "https://images.nasa.gov/details/PIA01322",
    module: "atlas",
  },
  {
    id: "atlas-clusters",
    title: "星群、星团、星系，区别在哪里？",
    lead: "名字里都有“星”，对应的对象却可能从一个便于记忆的图案，跨越到包含大量恒星的引力系统。",
    image: "pleiades.jpg",
    sections: [
      {
        title: "星群是辨认天空的图案",
        text: "北斗七星、夏季大三角属于常用星群，可以跨越正式星座边界。它们是观察者用来辨认天空的图案，不要求全部成员在空间中紧密聚集。现代天文学将全天划为88个正式星座区域，与不同文化的传统图案系统并不完全相同。",
      },
      {
        title: "星团强调真实的成员关系",
        text: "昴星团属于疏散星团，成员恒星具有共同形成背景。研究者会综合距离、运动和性质判断成员关系，而不是只看一张照片里它们是否挤在一起。配图中的红外尘埃结构经过颜色映射，亮点与尘埃也不一定在同一距离。",
      },
      {
        title: "星系是更大的系统",
        text: "银河系和仙女座星系包含大量恒星、气体、尘埃及暗物质。照片里一个很小的光斑可能是遥远星系，而一个很亮的点可能只是银河系内较近的恒星。画面上的大小与亮度，不能直接替代真实尺度与距离。",
      },
    ],
    source: "IAU / NASA：星座、星团与红外观测资料",
    caption: "昴星团及周围尘埃的红外影像，颜色经过波段映射",
    credit: "NASA/JPL-Caltech",
    sourceUrl: "https://images.nasa.gov/details/PIA09262",
    module: "atlas",
  },
].map((a) => ({
  ...a,
  image: new URL("../朱雷/images/" + a.image, import.meta.url).href,
}));

const diagramAsCover = new Set([
  "solar-moonbase",
  "image-color",
  "image-archive",
  "theory-evidence",
  "theory-expansion",
  "planet-impact",
  "solar-station",
  "solar-rocket",
]);
export const articles = [
  ...foundationalArticles.map((a) => ({
    ...a,
    sections: [...a.sections, ...(fieldnotes[a.id] || [])],
  })),
  ...topics.map((t) => {
    const original = foundationalArticles.find((a) => a.id === t.imageFrom);
    const diagram = new URL("../朱雷/images/" + t.id + ".svg", import.meta.url).href;
    const illustration = diagramAsCover.has(t.id);
    return {
      ...original,
      ...t,
      diagram: illustration ? null : diagram,
      ...(illustration
        ? {
            image: diagram,
            caption: t.title + "：原创概念关系示意图，非观测影像或工程图纸",
            credit: "SPACE PLUS / 原创教学示意",
          }
        : {}),
    };
  }),
];
