# 本地字体

- 中文正文：Noto Sans SC 的本站字符子集，字体族名为 `Space Reading SC`，保留 100–900 可变字重。
- 中文标题配合英文标题：Space Grotesk + Space Reading SC。
- 数值、坐标和英文档案标签：IBM Plex Mono 的 WOFF2 转换版，字体族名为 `Space Data Mono`。

三个字体文件合计约 499 KB，全部从本站加载，不调用在线字体服务。采用 `font-display: swap`，加载期间使用系统字体。新内容中不在中文子集里的字会回退到系统中文字体。

原始来源、文件校验值与子集信息见 `manifest.json`。每套字体对应的 `*-OFL.txt` 保留版权和 SIL Open Font License 1.1；派生字体采用新的字体名称。

添加中文内容后，可从项目根目录重新生成字体：

```powershell
python -m pip install fonttools brotli
python tools/build_space_fonts.py
```

生成脚本扫描任务一中的 HTML、JavaScript 和 SVG，跳过第三方 vendor 目录。原始字体下载到系统临时目录缓存，网站运行仅需要这里的 WOFF2 文件和许可证。
