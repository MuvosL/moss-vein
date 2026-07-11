# moss-vein

> 一片苔藓覆盖的知识脉络

**moss-vein**（vein）是 [MuvosL](https://github.com/MuvosL) 的个人博客。

苔藓长得慢，但铺开来也能连成一片。这个项目便是如此——将 **Hugo** 的迅捷、**hugo-theme-reimu** 的灵动、**Obsidian** 的沉静，三者揉作一处，让你可以随时随地拉取仓库，用 Obsidian 打开即写，推送即发布。

在线访问：[muvosl.github.io/moss-vein](https://muvosl.github.io/moss-vein/)

---

## 三器合璧

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
# Ctrl+Shift+X 一键新建文章，写完 Ctrl+Shift+P 推送
```

就这么简单。GitHub Actions 会自动构建并部署到 GitHub Pages。

---

## 写作自动化

为了让写作这件事尽可能地「不被打断」，我在 Obsidian 里精心配置了一套自动化流水线。从新建文章到最终推送，双手几乎不需要离开键盘。

### 一键新建文章

按下 `Ctrl+Shift+X`，QuickAdd 会启动一个交互式脚本（`moss_model/new-post.js`），依次引导你：

1. **选择分类** —— 列出已有目录，也支持新建分类或跳过分类
2. **输入文章名** —— 自动创建 `文章名/index.md` 的目录结构
3. **选择标签** —— 从已有标签中挑选，或新增标签，支持多选
4. **自动生成 slug** —— 格式为 `MuvosL-YYYY-NNN`，按年份自动递增编号，确保每篇文章有唯一且整洁的 URL 标识
5. **替换模板变量** —— `{{title}}`、`{{date}}`、`{{category}}`、`{{tags}}`、`{{slug}}` 全部自动填入

### 保存即维护

每次保存（`Ctrl+S`）时，**Obsidian Linter** 会在后台自动更新 `lastmod` 字段，无需手动维护「最后修改时间」。

### 写好即推送

**Obsidian Git** 插件提供了完整的 Git 操作面板和快捷键：
- `Ctrl+Shift+P` —— 一键 Commit-and-sync（提交并推送）
- 支持 Stage / Unstage 当前文件、查看 Diff、切换分支等
- 侧边栏直接查看变更文件列表，所见即所得

### 图片粘贴即用

在 Obsidian 中直接粘贴截图，图片会自动存入 `images/` 子目录。写作时用 `![[图片名]]` 语法引用，Hugo 构建时自动转换为标准 `<img>` 标签，无需手动管理路径。

### 面板布局

Obsidian 左侧栏固定为：文件列表、搜索、书签；右侧栏固定为：反向链接、出链、标签、属性、大纲。模板目录 `moss_model` 和 `_index.md` 通过 CSS 片段隐藏，保持文件列表的纯粹。

---

## 个性化定制

本站在原主题基础之上，做了不少细节打磨：

### 主题配置

| 定制项 | 说明 |
|---|---|
| 🎨 字体 | 正文字体 Mulish + Noto Serif SC（思源宋体），中西文混排更优雅 |
| 🌙 暗黑模式 | 跟随系统自动切换 |
| 📝 打字副标题 | 首页循环打字，句子随机播放：「想，全是问题；做，全是答案」 |
| 🏷️ 三角徽标 | 右上角 GitHub 角标，点击直达项目仓库 |
| 📐 布局宽度 | 内容区最大宽度 1350px，比默认更宽敞 |
| 📂 首页排序 | 分类和标签页按时间倒序，首页保持默认排序 |
| 🔤 中英文空格 | Pangu 自动在中英文之间插入空格 |
| 📡 RSS | 最近 10 篇文章，全文输出 |

### 深度适配 Obsidian

| 特性 | 说明 |
|---|---|
| 🖼️ `![[图片]]` 语法 | 自动转换为 Hugo 页面资源引用，无需手动改路径 |
| 📦 Page Bundle 结构 | 每篇文章 = 一个文件夹 + `index.md` + `images/`，Obsidian 原生兼容 |
| 🧹 摘要过滤 | 卡片、搜索、分享描述中自动过滤 Obsidian 语法残留 |
| 🔗 Slug 路由 | `permalink: /post/:slug/`，URL 由 slug 决定，与目录结构解耦 |
| 📝 模板同步 | 模板文件随项目 Git 同步，`{{date}}` 变量由 QuickAdd 脚本自动替换 |
| 🚫 构建隔离 | Hugo 通过 `ignoreFiles` 跳过 `.obsidian`、`.trash`、`moss_model` 目录 |

### APlayer 音乐播放器

侧边栏内置音乐播放器，支持固定播放和播放列表。音乐文件放入 `static/music/` 即可。

---

## Algolia 站内搜索

<div align="center">
  <a href="https://www.algolia.com/">
    <img src="https://avatars.githubusercontent.com/u/2034458?s=200&v=4" alt="Algolia" width="60">
  </a>
</div>

<br>

本站搜索功能由 [Algolia](https://www.algolia.com/) 驱动。虽然这个功能是 Reimu 主题自带的，但能搜得准、搜得快，离不开 Algolia 的即时索引。每次 GitHub Actions 构建时，Hugo 会生成 `algolia.json`，随后自动上传至 Algolia 的 `moss-vein` 索引。前端通过 InstantSearch.js 实现实时搜索，输入即得结果。

---

## 项目结构

```
moss-vein/
  content/post/             ← Obsidian 仓库根目录
    .obsidian/              ← Obsidian 配置（插件、主题、快捷键、CSS 片段）
    moss_model/             ← 文章模板 + QuickAdd 脚本
    分类目录/               ← 任意创建
      文章名/
        index.md            ← 文章正文
        images/             ← 文章图片
  layouts/                  ← Hugo 主题模板（已适配 Obsidian 语法）
  hugo.yaml                 ← Hugo 配置
  .github/workflows/        ← 自动部署 + Algolia 索引上传
```

> 本项目没有使用 `themes/` 目录，而是将主题文件直接放在根目录下，方便直接修改主题代码。

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
- 使用 QuickAdd 脚本一键创建新文章
- 直接粘贴图片，使用 `![[...]]` 语法引用
- 所有 Obsidian 配置（插件、主题、模板、快捷键）随项目一起同步

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