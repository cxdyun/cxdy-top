# 爨乡的云 · 个人工具集

个人网站 <https://cxdy.top>。首页聚合真实可用的功能模块，各模块直接放在仓库根目录的独立文件夹中。

## 当前模块

| 模块 | 地址 | 运行方式 |
| --- | --- | --- |
| 照片快选 | `/photo-select/` | 下载 macOS 桌面应用，Apple Silicon 测试版 |
| Assets Atlas | `/assets-atlas/` | .car 资源预览、筛选与导出，Universal 测试版 |

照片快选 DMG 和 SHA-256 校验文件通过 [GitHub Releases](https://github.com/cxdyun/cxdy-top/releases/tag/photo-select-v1.4.1) 分发，模块页直接链接下载。v1.4.1 为临时签名、未公证的 Apple Silicon 测试版，最低系统目标 macOS 14。无需用户安装 Node.js 或启动终端，后台随应用启停。正式分发前仍需使用有权用于本产品的 Developer ID 签名并完成 Apple 公证。

1.4.1（build 10）简化了本地文件夹导入：添加目录后记住位置，无需复制原片。切换目录时保留选片位置与偏好，失联目录可重新链接或移除记录。选片侧栏只显示当前工作区，文件夹名称负责选择目录，右侧箭头单独展开子目录。此版本的导入页暂不提供设备同步入口。

本站不访问本机 API、不上传照片；没有将照片原文件、照片库缓存或本机工具源码放入公开仓库。首页封面与产品页使用应用真实截图，演示库为公开风景素材，不含私人照片或个人目录。应用数据和旧网页版本的恢复记录相互独立，旧版已删除照片需在旧版恢复。

## 照片快选真实界面

[查看产品发布页](https://cxdy.top/photo-select/)

![单图预览与标星](assets/images/photo-select-single.webp?v=1.3.2-lake)

| 左右对比 | 网格浏览 |
| --- | --- |
| ![左右对比](assets/images/photo-select-compare.webp?v=1.3.2-lake) | ![网格浏览](assets/images/photo-select-grid.webp?v=1.3.2-lake) |

截图来自实际运行的应用。单图看细节、按 C 并排比较、网格大小可调。[素材来源与许可](photo-select/素材说明.md)。

以上为 1.3.2 版本的真实选片截图。1.4.1 已调整侧栏和文件夹管理，截图不代表最新导航布局。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 4320 --bind 127.0.0.1
```

打开 `http://127.0.0.1:4320/`。静态站无需安装前端依赖或构建。

## 新增模块

1. 在仓库根目录新建模块文件夹，例如 `image-convert/`，放入入口 `index.html` 和该模块的资源。
2. 在首页的 `collection` 区域新增作品卡片，链接使用 `/image-convert/`，同步修改作品数量。
3. 模块可以使用独立技术栈；需要构建时，将最终静态产物发布到对应模块目录。
4. 本机工具应标明运行环境，并提供启动说明。有后端的模块另行部署服务。

`assets/site.css` 为首页和照片快选入口页共用样式。图标来自 Radix Icons，许可位于 `assets/icons/LICENSE`。

## 发布

GitHub Pages 从 `master` 分支的根目录发布，域名由 `CNAME` 保持为 `cxdy.top`。推送到 `master` 后检查 Pages 构建状态与线上页面。

## Assets Atlas

[产品页](https://cxdy.top/assets-atlas/)使用 1.1.1 发布版的真实截图。安装包和 SHA-256 文件通过本站仓库的 `assets-atlas-v1.1.1` Release 公开分发；源码保留在独立私有仓库。演示 `.car` 来自自绘素材与 Apple actool 编译，不包含第三方应用资源或个人路径。[截图说明](assets-atlas/截图说明.md)。
