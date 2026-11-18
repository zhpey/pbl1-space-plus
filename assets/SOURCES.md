# 素材与科学资料来源

## 行星纹理

下载目录：<https://github.com/jeromeetienne/threex.planets/tree/master/images>。

纹理原始来源：Planet Pixel Emporium，<https://planetpixelemporium.com/planets.html>。该站提供非商业及教育用途的免费低分辨率纹理；项目用于课程展示。仓库的 MIT 代码许可不自动等同于所有图像的许可，商业用途应另行确认图像条款。

| 本地文件 | 上游文件 |
| --- | --- |
| mercury.jpg | mercurymap.jpg |
| venus_surface.jpg | venusmap.jpg |
| earth_daymap.jpg | earthmap1k.jpg |
| earth_bump.jpg | earthbump1k.jpg |
| earth_clouds.jpg | earthcloudmap.jpg |
| earth_cloudmask.jpg | earthcloudmaptrans.jpg |
| earth_cloudalpha.jpg | 本地将 earthcloudmaptrans.jpg 灰度反转，用作云层透明度 |
| mars.jpg | marsmap1k.jpg |
| jupiter.jpg | jupitermap.jpg |
| saturn.jpg | saturnmap.jpg |
| uranus.jpg | uranusmap.jpg |
| neptune.jpg | neptunemap.jpg |
| moon.jpg | moonmap1k.jpg（预留素材） |
| sun.jpg | sunmap.jpg |

纹理表现用于教学。金星纹理是云层下地表的可视化，海王星的传统深蓝纹理不等同于重新校准后的自然色。土星环由代码生成。

## 哈勃影像

以下六幅影像现保存在 `../訾舒然/images/`，图像路径由 `js/assets.js` 统一提供。

| 本地文件 | NASA 档案 | 署名 |
| --- | --- | --- |
| pillars.jpg | GSFC_20171208_Archive_e000842 | NASA, ESA, and the Hubble Heritage Team (STScI/AURA) |
| galaxy.jpg | GSFC_20171208_Archive_e000833 | NASA, ESA, and G. Bacon (STScI) |
| nebula.jpg | PIA04215 | JPL/NASA, NOAO, ESA and The Hubble Heritage Team, STScI/AURA |
| crab.jpg | PIA03606 | NASA, ESA, J. Hester and A. Loll (Arizona State University) |
| carina.jpg | GSFC_20171208_Archive_e002076 | NASA, ESA, M. Livio and the Hubble 20th Anniversary Team (STScI) |
| deepfield.jpg | GSFC_20171208_Archive_e001651 | NASA, ESA, G. Illingworth, D. Magee, P. Oesch, R. Bouwens, and the HUDF09 Team |

创生之柱采用近红外影像。仙女座为哈勃全景观测区域影像，不是完整星系的全幅轮廓。完整档案链接见 `js/data.js` 和站内影像详情。下载查询元数据保存在 `../訾舒然/images/*-source.json`。图像颜色通常来自波段映射与处理。极深场包含不同距离的星系，不能为整张图标注一个单一距离。

NASA 影像使用说明：<https://www.nasa.gov/nasa-brand-center/images-and-media/>。

## 科学内容

- 行星、太阳与太阳系：<https://science.nasa.gov/solar-system/>
- 宇宙、黑洞与暗物质：<https://science.nasa.gov/universe/>
- 哈勃：<https://science.nasa.gov/mission/hubble/>
- 星座区域：<https://www.iau.org/public/themes/constellations/>
- 哈勃与韦布：<https://science.nasa.gov/mission/hubble/>、<https://science.nasa.gov/mission/webb/>
- 中国航天里程碑：<https://www.cnsa.gov.cn/>

数值为近似参考值；季节提示以北半球为准。白洞、可通行虫洞仍是理论设想。星座连线是简化投影，不是精确天体位置。

## 软件依赖

- Three.js 0.160.0，MIT，许可证：`../vendor/three/LICENSE`。
- Vue 3.5.22，MIT，许可证：`../../../web_PBL_VUE/vendor/LICENSE`。
- Bootstrap 5.3.8（Vue 版的 CSS 组件），MIT，许可证：`../../../web_PBL_VUE/vendor/LICENSE-bootstrap`。

本项目自行编写界面、着色器、交互与故事；视觉布局参考 Cosmic Broth，不复用其源代码或图像素材。

2026-10-25 星空入口中的蓝紫星云、轨道弧线与大气辉光由项目着色器实时生成，是艺术化场景。地球及近景月面继续使用本目录现有纹理。`js/ambient.js` 使用 Web Audio 合成本地原创氛围音，由低频和弦与缓慢音符组成，无外部采样、音乐文件或第三方音频请求；默认关闭，点击声音开关后才播放。

## 五人模块新增本地图文

新增20篇中文科普摘要、14张NASA配图与11幅原创教学图解，均存放在对应成员目录。各目录的 `资料来源.md` 列出图片、图注、署名和内容依据；`images/*-source.json` 保存下载来源和原始描述。木星增强图保留 Gerald Eichstadt / Sean Doran 与 NASA/JPL-Caltech/SwRI/MSSS 的完整署名及 CC BY-NC-SA 标识。示意图、模拟图与艺术想象图在页面标明类别，不作为实拍。

## 2026-10-17 新增专题素材

本地文件位于 `assets/research/`，完整下载地址、像素尺寸、SHA-256 和处理记录见 `assets/research/manifest.json`。

| 本地文件 | 内容与来源 | 署名／说明 |
| --- | --- | --- |
| pillars-optical.jpg | [ESA/Hubble heic1501a](https://esahubble.org/images/heic1501a/) | NASA, ESA/Hubble and the Hubble Heritage Team；按比例转为 JPEG |
| pillars-infrared.jpg | [ESA/Hubble heic1501b](https://esahubble.org/images/heic1501b/) | NASA, ESA/Hubble and the Hubble Heritage Team；按比例转为 JPEG |
| pillars-webb.jpg | [NASA Webb 创生之柱](https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-and-miri-composite-image/) | NASA, ESA, CSA, STScI；含图像处理署名，颜色是多滤镜数据映射 |
| sgra.jpg | [ESO / EHT 人马座 A*](https://www.eso.org/public/news/eso2208-eht-mw/) | EHT Collaboration；射电观测数据重建，不是普通光学照片 |
| change6.jpg | [国家航天局：嫦娥六号月背影像](https://www.cnsa.gov.cn/n6758823/n6758842/c10543340/content.html) | 国家航天局；2024-06-04 发布，影像经鹊桥二号回传 |
| tianwen1.jpg | [国家航天局：天问一号最新图像](https://www.cnsa.gov.cn/n6758824/n6759009/n6760412/n6760413/c6840435/content.html) | 国家航天局；2022-01-01 发布，文件按比例压缩 |
| tianwen2.jpg | [国家航天局：天问二号地月影像](https://www.cnsa.gov.cn/n6758823/n6758842/c10684432/content.html) | 国家航天局；2025-07-01 发布，原始页面说明为三波段配准与彩色合成 |

新增专题代码在 `js/research-data.js`、`js/fieldwork.js` 和 `fieldwork.css`。韦布与哈勃影像使用 ESA/Hubble 与 NASA 各自页面的完整署名；ESA/Hubble 的使用条件见 <https://esahubble.org/copyright/>，NASA 使用说明见 <https://www.nasa.gov/nasa-brand-center/images-and-media/>。国家航天局页面公开展示不自动等于无限制授权，课程展示应保留来源、日期与原始链接。

项目把原失效的 IAU 链接替换为可访问的 [IAU 星座存档](https://iauarchive.eso.org/public/themes/constellations/)。存档页面说明正式定义的是星座边界，并不规定唯一的连线画法；星座图表的授权条件以页面标注为准。

## 深度专题及交互参考

五个栏目新增 55 篇中文专题。每篇的原始科学资料集中登记在 [`js/lesson-sources.js`](../js/lesson-sources.js)，页面提供直达链接。复用图片的观测类型和原始署名随图展示。正文、练习和解析为项目自行编写。

- [NASA Eyes](https://science.nasa.gov/eyes/) 将太阳系场景与天体和任务资料组织在一起。本站将轨道和探测任务的专题连回相应场景。
- [Stellarium](https://stellarium.org/) 在夜空视图中提供星群和星座边界。本站的观星手册配合已有星图，说明现场如何识别参照星、核对方位和记录条件。
- [ESA ESASky 使用指南](https://www.cosmos.esa.int/web/esdc/esasky-how-to) 展示如何按波长看同一片天空。本站影像专题沿用按波段辨读的思路，并为本站采用的影像注明仪器、图像类型及来源。
