import { fieldnotes } from "./fieldnotes.js";
import { topics } from "./topics.js";
// Original educational summaries. Images and article text are stored locally.
const foundationalArticles = [
  {
    id: "planet-earth",
    title: "从月球回望，重新认识地球",
    lead: "为什么地球看起来是蓝色的？一张“地出”照片，把海洋、大气和人类共同的家放在了同一个视野里。",
    image: "earthrise.jpg",
    sections: [
      {
        title: "蓝色不是一种单独的原因",
        text: "海洋占据地球表面约七成的面积，水对不同波长的光有不同吸收；大气又会散射阳光。云层、海洋、陆地和观测角度共同决定了太空中地球的外观。因此，不能简单把一张照片里的颜色全部归结为“天空的倒影”。",
      },
      {
        title: "看不见的保护也很重要",
        text: "大气既参与调节温度，也让大部分小型流星体在到达地面前烧蚀。磁场会影响带电粒子的运动，但它并不是一个阻挡所有辐射的坚硬外壳。宜居性来自距离、物质循环和漫长演化等条件的共同作用，不能由某一个指标单独判断。",
      },
      {
        title: "地出照片改变了什么",
        text: "阿波罗8号宇航员在1968年拍摄了月球地平线上的地球。照片让人们从外部看见地球的整体，也提醒我们：在照片中很薄的一层大气和很小的一颗星球，承载了全部已知生命。图中的月面与地球处在不同距离，不能直接按画面大小比较直径。",
      },
    ],
    source: "NASA Solar System / Apollo 8 影像档案",
    caption: "地出：从月球附近回望地球",
    credit: "JSC",
    sourceUrl: "https://images.nasa.gov/details/as08-14-2383",
    module: "planets",
  },
  {
    id: "planet-mars",
    title: "火星有水，为什么仍然荒凉？",
    lead: "古河道、湖泊沉积和极地冰层，记录着火星的环境变化；“曾经宜居”与“已经发现生命”是两件不同的事。",
    image: "mars-rover.jpg",
    sections: [
      {
        title: "地貌怎样成为过去的证据",
        text: "曲折河道、三角洲以及某些需要水参与形成的矿物，可以帮助研究者推断过去存在液态水。不同证据要相互印证，还要结合地层先后和撞击坑年代。仅凭一处像河流的外形，无法重建整颗火星的完整历史。",
      },
      {
        title: "今天的火星为什么不同",
        text: "火星大气稀薄，地表气压远低于地球，液态水难以在多数地表环境中长期稳定存在。火星也没有类似地球的全球性强磁场。大气流失、内部活动变化和太阳辐射等因素共同参与其环境演化，具体过程仍在研究。",
      },
      {
        title: "探测车在寻找什么",
        text: "探测器利用相机、光谱仪、钻取和岩石分析研究环境与化学成分。某些有机分子也能由非生命过程形成，因此不能把“发现有机物”直接当作发现生命。这里的毅力号配图是任务艺术想象图，用来说明设备和工作环境，并不是相机实拍。",
      },
    ],
    source: "NASA Mars Exploration / 毅力号任务介绍",
    caption: "毅力号在火星工作的艺术想象图，并非实拍",
    credit: "NASA/JPL-Caltech",
    sourceUrl: "https://images.nasa.gov/details/PIA23764",
    module: "planets",
  },
  {
    id: "planet-jupiter",
    title: "木星的云带下面是什么？",
    lead: "木星不像地球那样拥有可供站立的普通固体表面。我们看到的条纹，是其大气中不同区域的天气。",
    image: "jupiter-clouds.jpg",
    sections: [
      {
        title: "把大气看作流动的系统",
        text: "木星主要由氢和氦组成，快速自转与内部热量驱动复杂的大气运动。明暗相间的带和区，与云层高度、成分和气流有关。大红斑是一场巨大的风暴，其大小和形状会变化，不是固定贴在行星表面的标记。",
      },
      {
        title: "深入内部会发生什么",
        text: "越往内部，压力和温度通常越高。氢可逐渐表现出液态和金属性质，研究者还用引力场、磁场和微波观测约束其内部结构。这些结论来自观测与模型的结合，并不是已经把相机放进木星核心拍照。",
      },
      {
        title: "怎样理解引力秤",
        text: "网站对巨行星采用参考层附近的近似重力。假设质量为60千克，在木星参考重力下，重量约为1487牛顿；按地球重力校准的秤会显示约152千克。人的质量并没有因此变大，也不能据此认为能站在木星的云上称重。",
      },
    ],
    source: "NASA Jupiter / Juno 任务与图像档案",
    caption: "木星大气的云带结构",
    credit:
      "Enhanced Image by Gerald Eichstadt and Sean Doran (CC BY-NC-SA) based on images provided Courtesy of NASA/JPL-Caltech/SwRI/MSSS",
    sourceUrl: "https://images.nasa.gov/details/PIA21985",
    module: "planets",
  },
  {
    id: "planet-saturn",
    title: "土星环为什么又亮又薄？",
    lead: "远看像一整圈光环，近看却是大量彼此独立运行的冰粒和碎片。环也会留下引力相互作用的纹理。",
    image: "saturn-cassini.jpg",
    sections: [
      {
        title: "一块圆盘，还是很多条轨道",
        text: "土星环的颗粒以水冰为主，也混有岩石与尘埃。不同半径上的颗粒以不同速度绕土星运行。我们看到的明暗、缝隙和细纹，与颗粒密度、大小分布以及太阳照射角度有关，不能把它看成一块可以着陆的坚固圆盘。",
      },
      {
        title: "卫星怎样影响环",
        text: "卫星与环粒子之间的引力共振会形成复杂结构，有些小卫星还会约束环的边缘。环的来源、年龄及演化仍有研究问题，不能把某一种形成故事当作已经完全确定的事实。网站三维模型的环采用程序条纹，只用于辨认结构。",
      },
      {
        title: "卡西尼为什么重要",
        text: "卡西尼号在2004年至2017年间持续研究土星系统，拍摄环、卫星与大气，并测量周围环境。土卫二的喷流、土卫六的甲烷湖等发现，让研究者把“可能宜居的环境”扩展到冰壳之下和远离太阳的世界。配图摄于土星阴影方向，曝光与处理会影响颜色。",
      },
    ],
    source: "NASA Saturn / Cassini 任务档案",
    caption: "卡西尼视角中的土星系统",
    credit: "NASA/JPL-Caltech/SSI",
    sourceUrl: "https://images.nasa.gov/details/PIA17172",
    module: "planets",
  },
].map((a) => ({
  ...a,
  image: new URL("../陈冠伟/images/" + a.image, import.meta.url).href,
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
    const diagram = new URL("../陈冠伟/images/" + t.id + ".svg", import.meta.url).href;
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
