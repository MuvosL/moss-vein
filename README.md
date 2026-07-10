# moss-vein

> 一片苔藓覆盖的知识脉络

**moss-vein**（vein）是 [MuvosL](https://github.com/MuvosL) 的个人博客。

这个项目整合了三个优秀的开源项目——**Hugo** 静态站点生成器、**hugo-theme-reimu** 博丽灵梦主题、**Obsidian** 本地笔记工具——让你可以随时随地拉取仓库，用 Obsidian 打开即写，推送即发布。

在线访问：[muvosl.github.io/moss-vein](https://muvosl.github.io/moss-vein/)

---

## 三合一整合

<div align="center">
  <a href="https://gohugo.io/">
    <img src="https://raw.githubusercontent.com/gohugoio/gohugoioTheme/master/static/images/hugo-logo-wide.svg?sanitize=true" alt="Hugo" height="60">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/D-Sketon/hugo-theme-reimu">
    <img src="https://fastly.jsdelivr.net/gh/D-Sketon/blog-img/icon.png" alt="hugo-theme-reimu" height="60">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://obsidian.md/">
    <img src="https://i-blog.csdnimg.cn/direct/817a517dfe9a44c68e73be52e4cfd24d.png?x-oss-process=image/resize,m_fixed,h_224,w_224" alt="Obsidian" height="60">
  </a>
</div>

| 项目 | 角色 | 说明 |
|---|---|---|
| [Hugo](https://gohugo.io/) | 静态站点生成器 | 将 Markdown 构建为静态网页，构建速度极快 |
| [hugo-theme-reimu](https://github.com/D-Sketon/hugo-theme-reimu) | 博客主题 | 博丽灵梦风格，由 [D-Sketon](https://github.com/D-Sketon) 创作 |
| [Obsidian](https://obsidian.md/) | 本地编辑器 | 用 Obsidian 打开 `content/post/` 作为仓库，所见即所得地写作 |

---

## 快速开始

```bash
git clone https://github.com/MuvosL/moss-vein.git
cd moss-vein
# 用 Obsidian 打开 content/post/ 目录作为仓库
# 新建文章：右键 → 新建文件夹 → 在里面新建 index.md
# 写完推送：git add . && git commit && git push
```

就这么简单。GitHub Actions 会自动构建并部署到 GitHub Pages。

---

## 文章编写

### 目录结构

```
content/post/
  .obsidian/              ← Obsidian 配置（自动同步，Hugo 构建时忽略）
  moss_model/             ← 文章模板（自动同步，Hugo 构建时忽略）
  碎碎念/                 ← 任意分类目录
    obsidian测试/         ← 每篇文章一个文件夹
      index.md            ← 文章正文
      images/             ← 文章图片（直接粘贴即可）
        Pasted image.png
    序言/
      index.md
```

### Front Matter 模板

```yaml
---
title: ""
description: ""
date: {{date:YYYY-MM-DDTHH:mm:ssZ}}
lastmod: {{date:YYYY-MM-DDTHH:mm:ssZ}}
draft: false
slug: ""
categories:
  - ""
tags:
  - ""
cover: ""
---
```

> 模板文件位于 `content/post/moss_model/moss_model.md`，Obsidian 新建文章时可直接引用。
> 模板中的 `{{date}}` 变量由 Obsidian 自动替换，Hugo 构建时通过 `ignoreFiles` 跳过该目录。

### 图片引用

直接在 Obsidian 中粘贴图片，使用 `![[图片名]]` 语法即可。Hugo 构建时会自动：

- 将 `![[图片名]]` 转换为标准 `<img>` 标签
- 图片作为页面资源随文章一起发布
- 卡片、搜索、分享等位置的摘要中自动过滤掉图片语法残留

### 封面

在 front matter 中设置 `cover` 字段，将封面图片放入文章目录，Hugo 会自动识别为页面资源：

```yaml
cover: "cover.jpg"
```

### 音乐

将 mp3 文件放入 `static/music/`，在 `hugo.yaml` 的 APlayer 配置中添加曲目信息即可。

---

## 关于 Hugo

<a href="https://gohugo.io/"><img src="https://raw.githubusercontent.com/gohugoio/gohugoioTheme/master/static/images/hugo-logo-wide.svg?sanitize=true" alt="Hugo" width="400"></a>

[Hugo](https://gohugo.io) 是一个用 Go 语言编写的快速、灵活的静态站点生成器，由 [bep](https://github.com/bep)、[spf13](https://github.com/spf13) 和众多[贡献者](https://github.com/gohugoio/hugo/graphs/contributors) 共同打造。

- 官方网站：[gohugo.io](https://gohugo.io)
- 文档：[gohugo.io/documentation](https://gohugo.io/documentation)
- 开源仓库：[github.com/gohugoio/hugo](https://github.com/gohugoio/hugo)

### Hugo 赞助商

<p float="left">
  <a href="https://www.jetbrains.com/go/?utm_source=OSS&utm_medium=referral&utm_campaign=hugo" target="_blank"><img src="https://raw.githubusercontent.com/gohugoio/hugoDocs/master/assets/images/sponsors/goland.svg" width="200" alt="The complete IDE crafted for professional Go developers."></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://cloudcannon.com/hugo-cms/?utm_campaign=HugoSponsorship&utm_source=sponsor&utm_content=gohugo" target="_blank"><img src="https://raw.githubusercontent.com/gohugoio/hugoDocs/master/assets/images/sponsors/cloudcannon-cms-logo.svg" width="200" alt="CloudCannon"></a>
</p>

---

## 关于 hugo-theme-reimu

<div align="center">
  <img src="https://fastly.jsdelivr.net/gh/D-Sketon/blog-img/icon.png"/>
  <h3>hugo-theme-reimu</h3>
  <p>💘 博麗 霊夢 💘</p>
</div>

**hugo-theme-reimu** 是一个博丽灵梦风格的 Hugo 主题，由 [D-Sketon](https://github.com/D-Sketon) 从 [hexo-theme-reimu](https://github.com/D-Sketon/hexo-theme-reimu) 迁移而来。

- 主题仓库：[github.com/D-Sketon/hugo-theme-reimu](https://github.com/D-Sketon/hugo-theme-reimu)
- 演示站点：[d-sketon.github.io/hugo-theme-reimu](https://d-sketon.github.io/hugo-theme-reimu)
- 许可证：MIT

### 主题贡献者

[![](https://contributors-img.web.app/image?repo=D-Sketon/hugo-theme-reimu)](https://github.com/D-Sketon/hugo-theme-reimu/graphs/contributors)

### 主题赞助

如果你喜欢这个主题，可以通过 [爱发电](https://afdian.com/a/dsketon) 支持作者 D-Sketon。

---

## 关于 Obsidian

<div align="center">
  <a href="https://obsidian.md/">
    <img src="https://i-blog.csdnimg.cn/direct/817a517dfe9a44c68e73be52e4cfd24d.png?x-oss-process=image/resize,m_fixed,h_224,w_224" alt="Obsidian" width="80">
  </a>
</div>

[Obsidian](https://obsidian.md) 是一个基于本地 Markdown 文件的笔记工具。本项目的 `content/post/` 目录本身就是一个 Obsidian 仓库，你可以：

- 用 Obsidian 直接打开 `content/post/` 作为仓库
- 使用 Obsidian 的模板功能快速创建新文章
- 直接粘贴图片，使用 `![[...]]` 语法引用
- 所有 Obsidian 配置（插件、主题、模板）随项目一起同步

---

## 本站启用的功能

- 🌙 暗黑模式（跟随系统）
- 🔍 Algolia 站内全文搜索
- 🎵 APlayer 音乐播放器
- 📖 文章目录 (TOC)
- 🖥️ 代码高亮与复制
- ➗ KaTeX 数学公式
- 📊 Mermaid 流程图
- 🖱️ 烟花特效、加载动画
- 🔄 PJAX 无刷新页面切换
- ⚡ 预加载链接 (Quicklink)
- 📡 RSS 订阅
- 📊 不蒜子访客统计
- 📝 文章版权声明
- 📎 分享按钮（微博 / QQ / 微信）
- 📂 首页分类卡片
- 💬 打字副标题
- 🏷️ 三角徽标
- 🔤 Pangu 中英文自动空格
- ⬆️ 回到顶部
- 📱 响应式布局
- 💾 Service Worker 离线缓存

### Obsidian 深度适配

- 🖼️ `![[图片名]]` 语法自动转换为 `<img>` 标签
- 📦 图片作为页面资源随文章一起发布，无需手动管理路径
- 🧹 卡片摘要、搜索索引、分享描述中自动过滤图片语法残留
- 📁 文章以 page bundle（文件夹 + `index.md`）组织，Obsidian 原生兼容
- 📝 模板文件随项目同步，`{{date}}` 变量由 Obsidian 自动替换
- 🔗 `permalink: /post/:slug/` 路由，URL 由 slug 决定，与目录结构无关

---

## 项目结构

```
moss-vein/
  content/post/             ← Obsidian 仓库根目录
    .obsidian/              ← Obsidian 配置
    moss_model/             ← 文章模板
    分类目录/               ← 任意创建
      文章名/
        index.md            ← 文章正文
        images/             ← 文章图片
  layouts/                  ← Hugo 主题模板（已适配 Obsidian 语法）
  hugo.yaml                 ← Hugo 配置
  .github/workflows/        ← 自动部署
```

> 本项目没有使用 `themes/` 目录，而是将主题文件直接放在根目录下，方便直接修改主题代码。

---

## 许可

本项目博客内容与配置采用 [MIT](LICENSE) 许可。

| 第三方项目 | 许可 |
|---|---|
| [Hugo](https://github.com/gohugoio/hugo) | [Apache 2.0](https://github.com/gohugoio/hugo/blob/master/LICENSE) |
| [hugo-theme-reimu](https://github.com/D-Sketon/hugo-theme-reimu) | [MIT](https://github.com/D-Sketon/hugo-theme-reimu/blob/main/LICENSE) |
| [Obsidian](https://obsidian.md/) | 专有软件（个人使用免费） |

---

*Built with Hugo + hugo-theme-reimu + Obsidian*
