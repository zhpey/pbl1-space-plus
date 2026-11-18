import { fieldnotes } from "./fieldnotes.js";
import { topics } from "./topics.js";
// Original educational summaries. Images and article text are stored locally.
const foundationalArticles = [
  {
    id: "solar-scale",
    title: "一张屏幕，为什么装不下真实太阳系？",
    lead: "模型把轨道拉近、把行星放大，是为了看清结构。真实的行星尺寸与行星之间的距离，相差非常悬殊。",
    image: "orbital-scale.svg",
    sections: [
      {
        title: "先认识天文单位",
        text: "1个天文单位约为地球到太阳的平均距离，即1.496亿千米。以此作尺子，木星平均约在5.2 AU，海王星约在30 AU。平均距离适合比较范围，但并不意味着行星沿着完全正圆的轨道运行。",
      },
      {
        title: "尺寸和距离很难同时展示",
        text: "如果把太阳画成直径约14厘米的球，地球直径仅约1.3毫米，却要放到约15米外，海王星更要放到数百米外。网页为了可操作性分别调整了行星大小与轨道间隔。下方示意采用距离刻度，三维首屏采用展示比例，两者用途不同。",
      },
      {
        title: "公转演示不是实时星历",
        text: "行星公转周期随轨道尺度改变，近太阳的行星通常绕行更快。本项目使用简化的不同角速度表达这个趋势，速度滑块控制演示节奏。它不能用于预测今晚某颗行星的位置，也不能直接作为航天器轨道规划的计算结果。",
      },
    ],
    source: "NASA Solar System / Planetary Facts",
    caption: "本项目自制教学示意图，非精确比例或实时星位。",
    credit: "太空+ SPACE PLUS · 原创 SVG 图解",
    sourceUrl: "",
    module: "solar",
  },
  {
    id: "solar-sun",
    title: "太阳发光，靠的不是燃烧",
    lead: "太阳是一颗恒星，核心核聚变持续释放能量。我们在图像里看到的“太阳表面”，也不是一层坚硬的外壳。",
    image: "sun-observation.jpg",
    sections: [
      {
        title: "从核心到可见的光",
        text: "太阳核心的高温高压让氢参与核聚变，部分质量转化为能量。能量经过内部传递，最终从外层辐射出去。阳光从太阳到地球约需8分20秒，但这并不等于能量从核心形成后也只花同样时间就到达表面。",
      },
      {
        title: "不同波段看到不同层次",
        text: "太阳观测设备使用可见光、紫外和极紫外等不同波段研究温度、磁场和活动。许多彩色太阳图并不是肉眼看到的自然颜色，而是为了区分波段而赋色。日冕、耀斑和日珥是不同现象，不能只凭鲜艳颜色判断温度或危险程度。",
      },
      {
        title: "太阳活动与地球",
        text: "强烈太阳活动可能影响卫星、无线电通信和电力系统，也与极光活动有关。科学家通过连续观测进行空间天气研究。日常观测太阳必须使用符合要求的专用滤光设备，普通墨镜、望远镜或相机镜头不能提供可靠保护。",
      },
    ],
    source: "NASA Sun / Solar Dynamics Observatory",
    caption: "太阳观测：波段与颜色见原始档案",
    credit: "NASA/GSFC/Solar Dynamics Observatory",
    sourceUrl: "https://images.nasa.gov/details/PIA26681",
    module: "solar",
  },
  {
    id: "solar-voyager",
    title: "旅行者怎样把远方的消息送回来？",
    lead: "探测器的旅程不仅是飞得远，还包括能源、仪器、天线和地面接收网络的长期配合。",
    image: "voyager.jpg",
    sections: [
      {
        title: "利用行星改变航向",
        text: "引力助推让飞船与运动中的行星交换极少量动量和能量，从而改变相对太阳的速度和方向。它不是在引力场里凭空制造能量。探测器能否遇到合适的行星，取决于出发时机和几何关系，因此任务规划常需要等待合适的窗口。",
      },
      {
        title: "离太阳远了怎样供电",
        text: "深空中太阳辐照减弱，一些任务采用放射性同位素热电机，将衰变产生的热量转换为电能。可用功率会随时间变化，团队需要在仪器、通信和温度控制之间安排资源。距离越远，信号越弱，回传速度和地面接收条件也越重要。",
      },
      {
        title: "飞出日球层不等于离开所有太阳系天体",
        text: "日球层是太阳风影响形成的区域，其边界不是奥尔特云的外缘。描述探测器“进入星际空间”时，应说明所采用的物理边界。太阳系没有一堵可以碰到的墙，不同定义讨论的是不同尺度与影响范围。",
      },
    ],
    source: "NASA Voyager / Deep Space Network",
    caption: "旅行者2号探测器的仪器结构示意图",
    credit: "NASA/JPL-Caltech",
    sourceUrl: "https://images.nasa.gov/details/PIA22915",
    module: "solar",
  },
  {
    id: "solar-frontier",
    title: "从小行星带，到奥尔特云",
    lead: "太阳系的外侧并不空荡：岩石天体、冰冻小天体和长周期彗星，帮助保存早期形成过程的线索。",
    image: "solar-family.jpg",
    sections: [
      {
        title: "小行星带不是密不透风的石墙",
        text: "主要小行星带位于火星和木星轨道之间。科幻作品常把它表现成需要不断躲避巨石的区域，真实空间通常非常稀疏。研究小行星的成分、形状与轨道，能够帮助了解早期行星形成时留下的材料。",
      },
      {
        title: "海王星外还有什么",
        text: "柯伊伯带位于海王星轨道外，包含许多冰质天体，冥王星是其中著名成员。矮行星不是“没有价值的小行星”，而是一类具有特定轨道与形状条件的天体。新视野号等任务帮助研究者从近距离了解这些遥远世界。",
      },
      {
        title: "奥尔特云为什么仍然需要谨慎表达",
        text: "奥尔特云是根据长周期彗星轨道等证据提出的遥远天体储库模型。它常被画成包围太阳系的球状分布，但尚未被整体直接成像。网页中的分区图用于理解假设结构，不能当作已经拍摄到的太阳系外部全景。",
      },
    ],
    source: "NASA Solar System / Kuiper Belt / Oort Cloud",
    caption: "太阳系全家福：探测器拍摄的拼接图",
    credit:
      "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington",
    sourceUrl: "https://images.nasa.gov/details/PIA14074",
    module: "solar",
  },
].map((a) => ({
  ...a,
  image: new URL("../邹海鹏/images/" + a.image, import.meta.url).href,
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
    const diagram = new URL("../邹海鹏/images/" + t.id + ".svg", import.meta.url).href;
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
