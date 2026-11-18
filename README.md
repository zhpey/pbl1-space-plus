# 太空+ SPACE PLUS

Web 前端开发技术 PBL1《宇宙探索》的 3D 展示版，含深空旅程、行星漫游、太阳系、星座图谱、宇宙理论、影像与故事。

## 在本地浏览

从 GitHub 仓库选择 **Code → Download ZIP** 并解压。若已安装 Python 3，在项目根目录运行以下命令，然后打开 <http://127.0.0.1:8011/>。

```sh
python -m http.server 8011 --bind 127.0.0.1
```

也可以在 VS Code 中打开项目文件夹，用 Live Server 预览 `index.html`。项目已包含生成好的页面和资源，预览无需安装 npm 依赖。JavaScript 模块和 3D 资源需通过本地 HTTP 服务加载。

## 深度专题

五个栏目各有 11 篇专题，涵盖行星观测、轨道与航天、实地观星、宇宙证据和影像解读。首页的「宇宙的五个篇章」和各栏目开头都有入口。专题可按关键词和主题筛选，每篇附练习解析、原始资料和直达链接。

组员可在自己的目录更新 `lessons.js`。来源集中在 `js/lesson-sources.js`，共用阅读界面与样式分别在 `js/lesson-reader.js` 和 `lesson-reader.css`。

## 小组协作

仓库所有者在 **Settings → Collaborators → Add people** 邀请组员。组员接受邀请后，可克隆仓库，各自在分支中修改自己的栏目，再通过 Pull Request 合并。

五个成员目录存放各栏目的内容、交互、样式和配图。共享逻辑在 `js/`，共享素材在 `assets/`。修改源文件后，用 Node.js 22.12 或较新的版本重新构建，再在本地检查页面。

```sh
npm ci
npm run build
```

提交时包含源文件、生成的六个 `index.html` 和引用的 `public-*` 资源。GitHub Pages 可以从 `main` 分支的 `/(root)` 发布。

素材来源及使用条款见 [素材与科学资料来源](assets/SOURCES.md)，Three.js 许可证见 [LICENSE](vendor/three/LICENSE)。
