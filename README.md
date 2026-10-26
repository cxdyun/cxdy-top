# 爨乡的云 · 个人作品集

个人网站 <https://cxdy.top>。首页聚合真实可用的功能模块，各模块直接放在仓库根目录的独立文件夹中。

## 当前模块

| 模块 | 地址 | 运行方式 |
| --- | --- | --- |
| 片刻 | `/cook-photo/` | 下载 macOS 桌面应用，Apple Silicon 测试版 |
| 片段 | `/video-select/` | 与片刻共用帧藏 macOS 安装包 |
| Assets Atlas | `/assets-atlas/` | .car 资源预览、筛选与导出，Universal 测试版 |

片刻（图片）与片段（视频）分别展示、拥有独立详情页，共用帧藏 MomentCove 的同一个 DMG。源码仓库 `cxdyun/cxdy-moment` 保持私有；公开站点 Release 仅镜像安装包与 SHA-256，不包含应用源码或私人素材。当前 2.0.2 测试版仅支持 Apple Silicon、macOS 26.2 及以上，临时签名、未完成 Apple 公证，模型独立安装。应用从空库启动，不迁入旧应用数据。

应用的文件管理、片刻和片段使用一致的顶部入口。图片选片、AI 建议与文案，视频精彩候选、人工双轨修正、备注和保留片段导出均在本机处理。AI 分析及视频导出不改动原素材；用户主动标星沿用文件事务保护。

主页和详情页已替换为作者自有、明确授权公开的 20 张图片在 2.0.2 中的实际截图；视频演示由同一组图片制作。旧风景演示组已从当前站点移除，原始图片不公开打包。

## 片刻真实界面

[查看产品发布页](https://cxdy.top/cook-photo/)

![单图预览与标星](assets/images/cook-photo-single.webp?v=2.0.2)

| 左右对比 | 网格浏览 |
| --- | --- |
| ![左右对比](assets/images/cook-photo-compare.webp?v=2.0.2) | ![网格浏览](assets/images/cook-photo-grid.webp?v=2.0.2) |

![专注选片](assets/images/cook-photo-focus.webp?v=2.0.2)

![文件夹管理](assets/images/cook-photo-folders.webp?v=2.0.2)

截图来自实际运行的 2.0.2 应用。按 H 专注、按 C 比较，胶片条居中，网格大小可调。[素材来源与许可](cook-photo/credits.md)。

以上截图使用作者自有图片，从 2.0.2 工作台重新拍摄，涵盖黑白主题、专注、对比、网格与文件夹管理。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 4320 --bind 127.0.0.1
```

打开 `http://127.0.0.1:4320/`。静态站无需安装前端依赖或构建。

全站复用 `assets/home.css` 与 `assets/home.js` 的字体、导航和按钮。首页提供支持横滑与键盘操作的截图画廊；产品详情页通过 `assets/site.css` 补充吸顶产品导航、功能展示和安装说明。关闭 JavaScript 后仍可浏览截图、展开菜单与安装说明。

已安装 Playwright 和 Google Chrome 的开发环境可在启动本地预览后运行网站回归检查：

```sh
NODE_PATH="$(npm root -g)" node --test tests/site.test.cjs
```

检查覆盖桌面与移动端布局、导航、截图切换、减少动态效果、无 JavaScript 浏览，产品页吸顶导航与安装说明折叠项，以及首页下载地址与产品页的一致性。

## 新增模块

1. 在仓库根目录新建模块文件夹，例如 `image-convert/`，放入入口 `index.html` 和该模块的资源。
2. 在首页的 `collection` 区域新增产品展示区，链接使用 `/image-convert/`，同步更新导航。下载地址与版本说明应和对应产品页保持一致。
3. 模块可以使用独立技术栈；需要构建时，将最终静态产物发布到对应模块目录。
4. 本机工具应标明运行环境，并提供启动说明。有后端的模块另行部署服务。

`assets/site.css` 为两个产品详情页共用样式。图标来自 Radix Icons，许可位于 `assets/icons/LICENSE`。

## 发布

GitHub Pages 从 `master` 分支的根目录发布，域名由 `CNAME` 保持为 `cxdy.top`。推送到 `master` 后检查 Pages 构建状态与线上页面。

## Assets Atlas

[产品页](https://cxdy.top/assets-atlas/)使用 1.1.1 发布版的真实截图。安装包和 SHA-256 文件通过本站仓库的 `assets-atlas-v1.1.1` Release 公开分发；源码保留在独立私有仓库。演示 `.car` 来自自绘素材与 Apple actool 编译，不包含第三方应用资源或个人路径。[截图说明](assets-atlas/截图说明.md)。

照片工具已统一更名为片刻（cook-photo），当前产品页为 `/cook-photo/`，旧产品地址保留跳转。安装包名称与截图路径同步使用 cook-photo。
