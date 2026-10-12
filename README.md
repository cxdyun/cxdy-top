# 爨乡的云 · 个人工具集

个人网站 <https://cxdy.top>。首页聚合真实可用的功能模块，各模块直接放在仓库根目录的独立文件夹中。

## 当前模块

| 模块 | 地址 | 运行方式 |
| --- | --- | --- |
| 照片快选 | `/photo-select/` | 下载 macOS 桌面应用，Apple Silicon 测试版 |

照片快选 DMG 和 SHA-256 校验文件通过 [GitHub Releases](https://github.com/cxdyun/cxdy-top/releases/tag/photo-select-v1.3.2) 分发，模块页直接链接下载。v1.3.2 为临时签名、未公证的 Apple Silicon 测试版，最低系统目标 macOS 14。无需用户安装 Node.js 或启动终端，后台随应用启停。正式分发前仍需使用有权用于本产品的 Developer ID 签名并完成 Apple 公证。

1.3.2 新增 USB 安卓相册导入：按照片/视频、日期和相册选择，支持增量复制、传输进度和同步后自动预览。发行包内置 ADB；保存目录使用「相机」「微信」等名称，同名以数字区分，旧编号目录自动迁移。照片可继续进入选片工作台，视频保持原文件，无法解码时通过 Finder 打开。

本站不访问本机 API、不上传照片；没有将照片原文件、照片库缓存或本机工具源码放入公开仓库。首页封面与产品页使用应用真实截图，演示库为公开风景素材，不含私人照片或个人目录。应用数据和旧网页版本的恢复记录相互独立，旧版已删除照片需在旧版恢复。

## 照片快选真实界面

[查看产品发布页](https://cxdy.top/photo-select/)

![单图预览与标星](assets/images/photo-select-single.webp?v=1.3.2-lake)

| 左右对比 | 网格浏览 |
| --- | --- |
| ![左右对比](assets/images/photo-select-compare.webp?v=1.3.2-lake) | ![网格浏览](assets/images/photo-select-grid.webp?v=1.3.2-lake) |

截图来自实际运行的应用。单图看细节、按 C 并排比较、网格大小可调。[素材来源与许可](photo-select/素材说明.md)。

| USB 同步 | 同步后相册预览 |
| --- | --- |
| ![按日期、类型和相册选择](assets/images/photo-select-usb.webp?v=1.3.2-lake) | ![同步后自动进入相册](assets/images/photo-select-album.webp?v=1.3.2-lake) |

新增截图使用公开风景素材组成的演示相册，设备与拍摄日期为演示数据，未读取真实手机或私人相册。

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
