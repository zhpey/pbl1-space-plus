import { fieldnotes } from "./fieldnotes.js";
import { topics } from "./topics.js";
// Original educational summaries. Images and article text are stored locally.
const foundationalArticles = [
  {
    id: "theory-blackhole",
    title: "看不见黑洞，怎样知道它在那里？",
    lead: "研究者通过周围物质的运动、辐射以及引力波推断黑洞的性质；不同观测方法能够相互检验。",
    image: "blackhole-illustration.jpg",
    sections: [
      {
        title: "事件视界和亮盘不是同一个东西",
        text: "事件视界是光也无法返回远方的边界。黑洞周围炽热物质发出的光可以被观测，吸积盘并不是黑洞的实体外壳，也不是每个黑洞都一定有明亮的吸积盘。网页动画和配图都是模拟或艺术示意，不能当作直接观测照片。",
      },
      {
        title: "多种证据怎样拼在一起",
        text: "恒星绕致密天体的运动可以约束中心质量；双黑洞并合产生的引力波提供另一种观测途径；事件视界望远镜通过全球射电干涉观测重建极小角尺度的结构。每种方法都有分辨率、模型与误差范围，不是一张图就回答所有问题。",
      },
      {
        title: "它会吸走整个宇宙吗",
        text: "在距离足够远的地方，轨道运动仍由质量和引力关系决定，黑洞不会额外表现成无限范围的吸尘器。靠近时潮汐力和相对论效应才变得显著。白洞与可通行虫洞则仍是理论设想，不能因为黑洞有观测证据，就把它们一并认定为已发现。",
      },
    ],
    source: "NASA Universe / Black Holes / 引力波与EHT公开科普资料",
    caption: "黑洞计算模拟图，并非直接观测照片",
    credit: "JPL",
    sourceUrl: "https://images.nasa.gov/details/PIA04206",
    module: "theories",
  },
  {
    id: "theory-darkmatter",
    title: "暗物质的线索，为什么来自引力？",
    lead: "星系运动、星系团和引力透镜提示可见物质之外还存在引力来源，但“知道有影响”不等于“知道是什么粒子”。",
    image: "galaxy-cluster.jpg",
    sections: [
      {
        title: "从运动推断看不见的质量",
        text: "研究者比较星系中恒星和气体的运动与可见物质分布，发现仅靠发光物质难以解释全部现象。星系团中的运动以及其他观测还提供了不同尺度的约束。可靠的解释需要同时面对这些证据，而不只是拟合一条曲线。",
      },
      {
        title: "引力透镜怎样帮助观察",
        text: "质量会改变光传播的路径，让背景天体的像发生偏折、放大或拉伸。通过透镜结构能够重建总质量的分布，但这并不是给暗物质直接拍了一张普通照片。图中弧形结构需要结合观测和模型分析，不能把每一条弧线都当成同一种对象。",
      },
      {
        title: "暗能量为什么是另一回事",
        text: "暗物质参与引力聚集，暗能量用于描述宇宙加速膨胀，两者不能仅因名字里都有“暗”就混为一谈。在标准宇宙学模型中，约5%、27%、68%是当今宇宙总质能的近似比例，不是这幅图片中不同颜色的面积比例。",
      },
    ],
    source: "NASA Universe / Dark Matter / Hubble Frontier Fields",
    caption: "阿贝尔2744星系团与引力透镜：哈勃观测合成影像",
    credit: "NASA/ESA/STScI",
    sourceUrl: "https://images.nasa.gov/details/PIA17569",
    module: "theories",
  },
  {
    id: "theory-time",
    title: "接近光速时，谁的钟更慢？",
    lead: "相对论时钟展示一个简化情景：在地球参考系经过10年时，匀速飞船参考系对应的固有时怎样变化。",
    image: "cosmic-timeline.svg",
    sections: [
      {
        title: "先把参考系说清楚",
        text: "比较时间必须说明事件、参考系和时钟的路径。在本页的理想化计算里，飞船以固定速度运动，采用狭义相对论的时间膨胀关系。速度达到0.8倍光速时，地球参考系的10年对应飞船约6年固有时。",
      },
      {
        title: "公式有什么适用条件",
        text: "计算使用飞船时间等于地球时间乘以根号下的1减速度比平方。它没有模拟发射、加速、掉头、引力场或真正往返任务。完整的双生子问题需要比较两条世界线，不能只把两个惯性参考系的对称关系套在同一段往返上。",
      },
      {
        title: "真实设备也会遇到相对论",
        text: "高精度卫星导航需要考虑运动与引力对钟表的影响。相对论不是只存在于科幻故事的概念，但这也不意味着任意一种“时间旅行”设想都已实现。网站互动帮助理解数量关系，不提供可实施的接近光速航行方案。",
      },
    ],
    source: "NASA / Einstein 相对论公开科普资料",
    caption: "本项目自制教学示意图，非精确比例或实时星位。",
    credit: "太空+ SPACE PLUS · 原创 SVG 图解",
    sourceUrl: "",
    module: "theories",
  },
  {
    id: "theory-milkyway",
    title: "我们在银河里面，怎样画出银河？",
    lead: "从地球望去的银河光带，不等于从外部拍摄的完整银河系。研究者需要把不同方向、距离和波段的信息拼起来。",
    image: "milkyway.jpg",
    sections: [
      {
        title: "尘埃遮住了什么",
        text: "银河盘面中的尘埃会遮挡部分可见光，影响我们直接观察远方恒星。红外、射电及X射线等波段提供不同线索，可以研究恒星、气体和高能活动。配图是银河中心方向的多波段观测，不是宇宙飞船在银河外拍下的全景。",
      },
      {
        title: "距离与运动让地图有深度",
        text: "视差、变星和其他测距方法帮助建立空间结构；恒星和气体的运动提供动力学信息。太阳系位于银河盘面内，距离银河中心约2.6万光年。由于身处内部，对旋臂细节和整体形态的重建仍有模型和观测限制。",
      },
      {
        title: "把银河放回宇宙时间线",
        text: "银河系的形成与演化经历了漫长的气体聚集、恒星形成和并合过程，太阳系形成于更晚的约46亿年前。宇宙约138亿年的年龄是基于观测与模型得到的估计，不代表已经直接观测到最初时刻的全部物理过程。",
      },
    ],
    source: "NASA Milky Way / Great Observatories 多波段影像",
    caption: "银河系结构与多波段观测",
    credit: "NASA/JPL-Caltech/ESA/CXC/STScI",
    sourceUrl: "https://images.nasa.gov/details/PIA12348",
    module: "theories",
  },
].map((a) => ({
  ...a,
  image: new URL("../滕紫涵/images/" + a.image, import.meta.url).href,
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
    const diagram = new URL("../滕紫涵/images/" + t.id + ".svg", import.meta.url).href;
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
