# 观察甲板三维素材

核验与本地处理日期：2026-11-15。

首页默认的 WA—01 远行者号及其六个可操作组件由 `js/ship-scene.js` 程序生成；船体面板、阵列表面、标识和辉光也是本地 Canvas 纹理。其造型和机构为原创科幻演示。NASA 国际空间站保留在顶部“宇宙观景”的地球场景中。

## 国际空间站

- 文件：`iss-web.glb`，来源：NASA，International Space Station 3D Model。
- 介绍页：https://science.nasa.gov/resource/international-space-station-3d-model/
- 原始下载：https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/ISS_stationary.glb
- NASA 媒体使用说明：https://www.nasa.gov/nasa-brand-center/images-and-media/
- 原始模型约 44.5 MB，131 个网格、247,547 个三角形。使用 Pillow 将内嵌贴图缩至最长边 512 像素并转换为 WebP；再以 glTF Transform 4.2.1 优化、简化网格并使用 Meshopt 压缩。网页版本约 3.4 MB，校验见 `manifest.json`。
- 保留空间站整体结构；纹理与几何精度经过网页优化。场景中的尺度、轨道位置、光位和缓慢运动为艺术编排，不代表当前实测状态，也不表示 NASA 参与或认可本项目。
- 仅桌面地球场景在舰桥开启且非流畅画质时发起模型加载；手机、流畅画质、其他目的地及加载失败时使用原创程序飞船。不会从 NASA 网站实时加载模型。

## 原创构件与本地依赖

`js/bridge-scene.js` 中的 WAYFARER 飞船、观察窗框、金属面板、引擎辉光与远方薄雾均由程序生成，不是任何游戏的资产。

加载器、几何工具和解码模块来自 Three.js r160 的 `examples/jsm/`：`loaders/GLTFLoader.js`、`utils/BufferGeometryUtils.js`、`libs/meshopt_decoder.module.js`。采用 Three.js MIT 许可及解码器文件内的原始许可说明，保留在 `vendor/three/`。解码器内嵌 WebAssembly，运行时无需访问外站。模型采用 `EXT_meshopt_compression` 与 `EXT_texture_webp`；现代 Edge/Chrome 可直接加载。
