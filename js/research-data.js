// Curated institutional sources, checked 2026-10-17. Dates describe observations,
// not a live mission feed. Full asset provenance is in assets/research/manifest.json.
export const waveBands = [
 {id:'infrared',name:'哈勃 · 近红外',instrument:'Hubble / WFC3',image:'pillars-infrared.jpg',alt:'哈勃近红外观测中的创生之柱，尘埃轮廓间显露出密集恒星',date:'2015-01-05 发布',bands:'1.1 μm、1.6 μm',question:'尘埃后面，藏着什么？',body:'部分近红外光比可见光更容易穿过尘埃。柱状轮廓变得通透，许多被遮挡的恒星显现出来；并不是尘埃从宇宙中消失了。',color:'两组近红外滤镜数据被映射为可见颜色。画面不是肉眼可以直接看见的红外景象。',url:'https://esahubble.org/images/heic1501b/',credit:'NASA, ESA/Hubble and the Hubble Heritage Team'},
 {id:'webb',name:'韦布 · 双仪器合成',instrument:'Webb / NIRCam + MIRI',image:'pillars-webb.jpg',alt:'韦布近红外与中红外合成的创生之柱，棕紫色尘埃柱间分布明亮恒星',date:'2022-08-14 观测 · 2022-11-30 发布',bands:'近红外与中红外 · 九组滤镜',question:'恒星与尘埃，怎样分别显现？',body:'NIRCam 与 MIRI 的数据结合，让恒星与尘埃结构共同出现在画面里。不同波段对不同物理过程敏感，科学家需要把它们放在一起阅读。',color:'例如 F090W 映射为紫色、F1130W 为绿色，F470N 与 F1500W 为红色。颜色用于区分不同滤镜的数据。',url:'https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-and-miri-composite-image/',credit:'NASA, ESA, CSA, STScI; Image Processing: Joseph DePasquale (STScI), Alyssa Pagan (STScI), Anton Koekemoer (STScI)'}
];

export const missionArchives = [
 {id:'change6',number:'01',name:'嫦娥六号',en:'CHANG’E 6 / THE LUNAR FAR SIDE',image:'change6.jpg',alt:'嫦娥六号全景相机拍摄的月球背面着陆点，画面包含月面与着陆器部件',date:'2024-06-04 发布',type:'月背着陆点 · 彩色镶嵌影像',lead:'月球背面的照片，怎样抵达地球？',body:'全景相机在表取采样前拍摄了着陆点北侧月面。图像上方是查菲环形山，下方可以看到着陆腿及着陆时挤压隆起的月壤。',steps:[['拍摄','降落相机记录下降过程，全景相机记录着陆点。'],['中继','影像数据经鹊桥二号中继卫星传回地球。'],['解读','地面处理和镶嵌图像，结合地形研究月背环境。']],question:'月球背面为什么不是“永远黑暗的一面”？',answer:'“背面”指长期背向地球的一侧，它也经历白昼与黑夜。月球遮挡直接通信的视线，因此需要中继卫星。',credit:'国家航天局（嫦娥六号任务）',url:'https://www.cnsa.gov.cn/n6758823/n6758842/c10543340/content.html'},
 {id:'tianwen1',number:'02',name:'天问一号',en:'TIANWEN 1 / A MARTIAN LANDSCAPE',image:'tianwen1.jpg',alt:'祝融号导航地形相机拍摄并镶嵌的火星表面，分布着环形坑和岩石',date:'2022-01-01 发布 · 任务数据截至 2021-12-31',type:'祝融号 · 三幅地貌图像镶嵌',lead:'从地貌线索，追问火星的过去。',body:'祝融号用导航地形相机记录火面地貌。图中可见环形坑、石块等典型结构；把巡视器近景与环绕器的大范围观测结合，才能逐步理解地质环境。',steps:[['环绕','从轨道观察火星地形与极区等大尺度结构。'],['巡视','在地面记录岩石、土壤与局部地貌。'],['比对','结合不同尺度和不同仪器的资料解释环境演化。']],question:'探测器可以像身边的遥控车一样即时操作吗？',answer:'不能。该篇历史通报记录：截至 2021-12-31，器地距离约 3.5 亿千米，通信时延约 19.5 分钟。这是当时的数值，时延会随相对位置改变。',credit:'国家航天局（天问一号任务）',url:'https://www.cnsa.gov.cn/n6758824/n6759009/n6760412/n6760413/c6840435/content.html'},
 {id:'tianwen2',number:'03',name:'天问二号',en:'TIANWEN 2 / EARTH FROM AFAR',image:'tianwen2.jpg',alt:'天问二号窄视场导航敏感器拍摄并由三波段合成的彩色地球',date:'2025-05-30 13:00 拍摄 · 2025-07-01 发布',type:'地球影像 · 三波段配准与彩色合成',lead:'一张彩色地球，是怎样制作出来的？',body:'天问二号的窄视场导航敏感器在距地球约 59 万千米时拍下这幅影像。科研人员进行辐射校正，将三波段图像配准，再合成为彩色图像。',steps:[['采集','红、绿、蓝对应 558–631、500–573、434–477 nm 波段。'],['配准','将不同波段中的同一地物对齐。'],['合成','进行颜色合成，展示相机记录的地球。']],question:'图像“经过处理”，就意味着内容是虚构的吗？',answer:'不是。辐射校正、配准和合成是从观测数据制作图像的常见步骤。关键在于交代原始数据、处理方法与颜色含义。',credit:'国家航天局（天问二号任务）',url:'https://www.cnsa.gov.cn/n6758823/n6758842/c10684432/content.html'}
];

export const dayLengths = {
 mercury:{rotation:'58.6 地球日',solar:'约 176 地球日',note:'水星每绕太阳两圈，大约自转三圈。从一次正午到下一次正午，比它的一年还长。'},
 venus:{rotation:'约 243 地球日',solar:'约 117 地球日',note:'金星逆向自转。自转周期最长，并不意味着从一次正午到下一次正午也同样长。'},
 earth:{rotation:'约 23 小时 56 分',solar:'约 24 小时',note:'地球自转一圈时，也沿公转轨道前进了一小段，需要再转一点，太阳才回到相同方向。'},
 mars:{rotation:'约 24 小时 37 分',solar:'约 24 小时 40 分',note:'火星的一个太阳日称为 sol，比地球的一天稍长。任务团队用它安排火星车的工作。'}
};
// These are chosen Earth–spacecraft separations for a teaching experiment,
// not heliocentric distances or an ephemeris.
export const communicationDefaults = [0.01,1,9,29];
export const constellationCodes = {orion:'ORI',ursa:'UMA',cassiopeia:'CAS',leo:'LEO',cygnus:'CYG',lyra:'LYR',scorpius:'SCO',andromeda:'AND'};
