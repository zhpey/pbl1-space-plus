// Thumbnail illustrations are separate from each article's cited scientific image.
// The full article keeps its original figure, caption and credit.
const cover = (id, alt) => ({
  src: new URL(`../assets/covers/${id}.svg`, import.meta.url).href,
  alt,
  kind: 'illustration',
});

export const articleCovers = {
  'planet-habitable': cover('planet-habitable', '原创示意：恒星周围的温和轨道区域与不同的行星，宜居带不代表已经存在生命'),
  'planet-climate': cover('planet-climate', '原创示意：金星、地球和火星的大气厚度与热量散失对照，非真实比例'),
  'planet-ocean': cover('planet-ocean', '原创剖面示意：冰壳下的海洋、岩石内部与卫星喷流，非观测影像'),
  'planet-impact': cover('planet-impact', '原创示意：探测器使小行星轨迹发生微小偏转，从而避开未来交会，非真实比例'),
  'solar-station': cover('solar-station', '原创示意：地球上方的空间站、太阳能板与密封居住舱，非工程图纸'),
  'solar-rocket': cover('solar-rocket', '原创示意：火箭分级与进入地球轨道的弧形路径，非真实比例'),
  'solar-communication': cover('solar-communication', '原创示意：地球与火星之间以有限速度传播的通信信号，非真实比例'),
  'solar-moonbase': cover('solar-moonbase', '原创示意：月面居住舱、能源设备与相互连接的基地设施，非工程图纸'),
  'atlas-calendar': cover('atlas-calendar', '原创示意：月相、太阳与周期构成的天空日历，非实时星历'),
  'atlas-navigation': cover('atlas-navigation', '原创示意：北极星、方向与卫星定位之间的联系，非实际导航图'),
  'atlas-darksky': cover('atlas-darksky', '原创示意：城市灯光与暗夜星空的对照，展示光污染如何遮蔽星光'),
  'atlas-myth': cover('atlas-myth', '原创示意：相同星点通过不同连线形成不同图案，表达星空文化的多样性'),
  'theory-waves': cover('theory-waves', '原创示意：双致密天体周围的时空涟漪与啁啾信号，非实测波形'),
  'theory-stars': cover('theory-stars', '原创示意：星云、恒星与元素相互联系的物质旅程，非真实比例'),
  'theory-expansion': cover('theory-expansion', '原创示意：早期与较晚时刻的大尺度星系间距变化，局部星系符号保持尺寸'),
  'theory-evidence': cover('theory-evidence', '原创示意：带误差范围的测量点与模型曲线比较，非真实实验数据'),
  'image-fiction': cover('image-fiction', '原创示意：一本展开的书连接行星旅程与通信延迟，表达科学约束下的太空写作'),
  'image-color': cover('image-color', '原创示意：三个波段的灰度测量映射为彩色天体图像，非观测影像'),
  'image-photography': cover('image-photography', '原创示意：相机光圈、星轨与多次曝光，表达星空摄影对光的积累'),
  'image-archive': cover('image-archive', '原创示意：星系图像与来源、版本记录一起归档，非真实影像档案'),
};
