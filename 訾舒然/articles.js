import { fieldnotes } from "./fieldnotes.js";
import { topics } from "./topics.js";
// Original educational summaries. Images and article text are stored locally.
const foundationalArticles = [
  {
    id: "image-hubble",
    title: "哈勃：清晰图像从哪里来？",
    lead: "哈勃在地球大气层之外工作，减少大气扰动和部分吸收的影响。它的贡献还来自仪器、长期观测与精密校准。",
    image: "hubble-telescope.jpg",
    sections: [
      {
        title: "轨道位置带来的优势",
        text: "哈勃主要在近地轨道运行，不需要透过地面上空不断变化的大气来成像。这有利于稳定、高分辨率观测，也让某些被大气影响的波段更容易研究。但观测质量还取决于目标、仪器、曝光时间和数据处理。",
      },
      {
        title: "不是拍得越亮就越科学",
        text: "科学图像通常需要校准探测器、去除仪器背景并结合多次曝光。不同滤光片的结果可组合成彩色影像，用于识别结构、恒星颜色和气体分布。公开图片里的鲜艳颜色不一定等同于肉眼看到的颜色，也不是任意涂色。",
      },
      {
        title: "为什么仍然需要其他望远镜",
        text: "哈勃的主要优势不能覆盖所有波段与所有研究任务。地面大型望远镜、射电阵列、X射线卫星和红外望远镜各有所长。理解一张宇宙照片时，先看设备与波段，再看颜色、尺度和曝光背景，比只看标题更可靠。",
      },
    ],
    source: "NASA Hubble Space Telescope",
    caption: "哈勃空间望远镜",
    credit: "JSC",
    sourceUrl: "https://images.nasa.gov/details/sts061-57-021",
    module: "observatory",
  },
  {
    id: "image-webb",
    title: "韦布与哈勃，谁看得更远？",
    lead: "两者的研究重点与波段不同，“谁更先进”无法概括全部差别。把观测互相对照，往往比单独比较照片更有价值。",
    image: "webb-telescope.jpg",
    sections: [
      {
        title: "为什么韦布重视红外",
        text: "宇宙膨胀会使遥远天体的光红移，红外观测适合研究部分早期星系；它也有助于研究尘埃遮挡区域和较冷天体。韦布的分段主镜、遮阳板及低温工作环境，共同服务于这些观测目标。",
      },
      {
        title: "L2附近有什么作用",
        text: "韦布在日地系统第二拉格朗日点附近的轨道运行，并不静止停在一个无引力的位置。轨道与遮阳设计帮助保持太阳、地球和月球大致位于遮阳板同一侧。其运行方式与近地轨道上的哈勃不同。",
      },
      {
        title: "比较时要统一问题",
        text: "同一天体在哈勃和韦布图像中可能显露不同结构，是因为波段、分辨率、曝光与处理不同。不能简单把更鲜艳、更亮的照片认定为更真实。网站保留设备和署名，主要解释已下载到本地的图文内容，阅读不依赖跳转到国外网站。",
      },
    ],
    source: "NASA James Webb Space Telescope / Hubble",
    caption: "韦布望远镜与分段主镜",
    credit: "NASA/GSFC/Bill Hrybyk",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20161102_2016-21507_012",
    module: "observatory",
  },
  {
    id: "image-deepfield",
    title: "极深场：一个光点，也许是一座星系",
    lead: "在一小片天空中积累大量曝光，可以看见原本暗弱的目标。画面看起来拥挤，背后却是不同距离与不同年代的光。",
    image: "deepfield.jpg",
    sections: [
      {
        title: "曝光为什么能看见暗弱目标",
        text: "探测器通过长时间、多次曝光累积微弱信号，并在处理时控制噪声与伪影。深场观测不是简单把普通照片的亮度拉高，而是依靠观测设计、仪器性能与数据分析共同完成。",
      },
      {
        title: "一张图没有唯一距离",
        text: "深场里包含许多不同距离的星系及可能的前景天体。我们接收到的是它们在不同过去时刻发出的光，不能给整幅图填上一个精确的单一距离，也不能仅凭画面中的光斑大小判断实际直径。",
      },
      {
        title: "看得远也不是看见一切",
        text: "更暗或更远的目标可能超过仪器灵敏度，星系距离与性质还需要光谱或其他测量来约束。一张深场代表一个观测区域和一套选择条件。它能展示宇宙的丰富性，但不能替代对全天全部天体的完整普查。",
      },
    ],
    source: "NASA / ESA / Hubble Ultra Deep Field",
    caption: "哈勃极深场：多次曝光叠加，包含不同距离的星系。",
    credit:
      "NASA, ESA, G. Illingworth, D. Magee and P. Oesch (University of California, Santa Cruz), R. Bouwens (Leiden University), and the HUDF09 Team",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20171208_Archive_e001651",
    module: "observatory",
  },
  {
    id: "image-reading",
    title: "从“好看”到“看懂”：读图的四个问题",
    lead: "宇宙照片可以同时具有视觉吸引力和科学意义。带着设备、波段、尺度与证据这四个问题阅读，更容易理解图像。",
    image: "pillars.jpg",
    sections: [
      {
        title: "设备与波段：拍到的是什么",
        text: "先确认是可见光、红外、紫外、射电还是X射线，再看是否合成了不同设备的结果。“创生之柱”有不同波段的版本，本项目采用的图像为近红外观测，不应直接套用另一幅可见光版本的颜色含义。",
      },
      {
        title: "尺度与颜色：哪些是映射",
        text: "检查距离、视场或比例说明，区分天体真实大小与画面占比。颜色常来自滤光片组合或波段映射，用于揭示物理结构。处理后的图像仍可包含真实观测信息，但需要交代处理方式与适用解释。",
      },
      {
        title: "证据与故事：哪些是推测",
        text: "把相机观测、计算模拟和艺术想象图区分开，再判断文字是否超出了图片能支持的结论。《星际来信》提供文学想象，各章科学笔记说明真实背景；故事人物、航行年代与情节都不构成发现生命或实现星际航行的证据。",
      },
    ],
    source: "NASA Images and Media / 各影像原始档案",
    caption: "创生之柱的近红外观测影像；颜色经过波段映射与处理。",
    credit: "NASA, ESA, and the Hubble Heritage Team (STScI/AURA)",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20171208_Archive_e000842",
    module: "observatory",
  },
].map((a) => ({
  ...a,
  image: new URL("../訾舒然/images/" + a.image, import.meta.url).href,
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
    const diagram = new URL("../訾舒然/images/" + t.id + ".svg", import.meta.url).href;
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
