# moss-vein

> 一片苔藓覆盖的知识脉络

**moss-vein**（vein）是 [MuvosL](https://github.com/MuvosL) 的个人博客。记录技术笔记、生活随想与知识沉淀，像苔藓一样在时光中缓慢生长，在数字世界的脉络中留下痕迹。

在线访问：[muvosl.github.io/moss-vein](https://muvosl.github.io/moss-vein/)

---

## 技术栈

| 组成部分 | 说明 |
|---|---|
| **静态站点生成器** | [Hugo](https://gohugo.io/) extended v0.164.0 |
| **博客主题** | [hugo-theme-reimu](https://github.com/D-Sketon/hugo-theme-reimu) v0.16.0 |
| **部署平台** | GitHub Pages（通过 GitHub Actions 自动部署） |
| **配置文件** | 全部统一为 YAML 格式 |
| **许可证** | MIT |

### 项目架构：从「主题嵌套」到「完全融合」

传统的 Hugo 项目通常将主题放在 `themes/` 目录中，以 Git Submodule 或 Hugo Module 方式引用：

```
传统 Hugo 项目
├── config/           # 你的配置（覆盖主题默认值）
├── content/          # 你的文章
├── themes/           # 主题目录（独立仓库，只读）
│   └── reimu/
│       ├── layouts/  # 主题模板
│       ├── assets/   # 主题样式
│       └── static/   # 主题资源
└── hugo.toml         # theme = 'reimu'
```

构建时 Hugo 采用**两层叠加**查找：

```
你的项目根目录 (优先级高)
    └── 找不到 → 回退到 themes/reimu/ (优先级低)
```

这种方式的优点是主题升级方便，但缺点是——你想改主题里的任何东西都得"绕路"，在项目根目录建一个同名文件去覆盖，没法直接改主题源码。

**本项目的做法：**

将主题的所有文件（`layouts/`、`assets/`、`static/`、`i18n/`、`data/`）直接搬到项目根目录，去掉 `theme` 配置项，删除 `themes/` 文件夹：

```
moss-vein（融合后）
├── config/           # 你的配置（含主题完整默认值）
├── content/          # 你的文章
├── layouts/          # 主题模板（可直接修改）
├── assets/           # 主题样式（可直接修改）
├── static/           # 主题资源 + 你的资源
├── data/             # 主题数据 + 你的数据
├── i18n/             # 多语言翻译
└── hugo.yaml         # 不再需要 theme 配置
```

带来的改变：

| 方面 | 传统方式 | 融合后 |
|---|---|---|
| 修改模板 | 需在项目根目录建同名文件覆盖 | 直接编辑 `layouts/` 下的文件 |
| 调整样式 | 需了解 Hugo 的覆盖规则 | 直接编辑 `assets/css/` 下的 SCSS |
| 替换资源 | 放到 `static/` 覆盖主题同名文件 | 直接替换 `static/` 下的文件 |
| 项目结构 | 分散在两个目录中 | 一目了然，所有代码都在手边 |
| 版本管理 | 主题独立仓库，版本分离 | 一个 Git 仓库，统一管理 |
| 主题升级 | `git submodule update` | 手动对比 diff，按需合并 |

适合选择融合方式的情况：你对主题有大量定制需求，希望完全掌控代码，不再依赖主题上游的更新节奏。

---

## 关于 Hugo

<a href="https://gohugo.io/"><img src="https://raw.githubusercontent.com/gohugoio/gohugoioTheme/master/static/images/hugo-logo-wide.svg?sanitize=true" alt="Hugo" width="400"></a>

[Hugo](https://gohugo.io) 是一个用 Go 语言编写的快速、灵活的静态站点生成器，由 [bep](https://github.com/bep)、[spf13](https://github.com/spf13) 和众多[贡献者](https://github.com/gohugoio/hugo/graphs/contributors) 共同打造。

Hugo 提供强大的模板系统、多语言支持、丰富的短代码和极快的构建速度，是构建个人博客、文档站点、企业网站等的理想选择。

- 官方网站：[gohugo.io](https://gohugo.io)
- 文档：[gohugo.io/documentation](https://gohugo.io/documentation)
- 社区论坛：[discourse.gohugo.io](https://discourse.gohugo.io)
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

### 主题特性

- ✨ 完整的博客功能，响应式布局
- 🌙 暗黑模式支持，多语言 (i18n)
- 🖥️ 代码高亮与复制，KaTeX / MathJax 数学公式
- 📊 Mermaid 流程图，Algolia 搜索集成
- 💬 多评论系统支持（Valine / Waline / Twikoo / Gitalk / Giscus / Disqus / Utterances / Beaudar）
- 🎵 APlayer / Meting 音乐播放器
- 🖱️ 灵梦鼠标指针、烟花特效、加载动画
- 👾 Live2D 看板娘集成
- 🔄 PJAX 无刷新加载
- 🎨 丰富的短代码（链接卡片、友链、热力图、标签轮盘、照片墙、标签页等）
- 📰 RSS 订阅、不蒜子访客统计

### 主题贡献者

[![](https://contributors-img.web.app/image?repo=D-Sketon/hugo-theme-reimu)](https://github.com/D-Sketon/hugo-theme-reimu/graphs/contributors)

### 主题赞助

如果你喜欢这个主题，可以通过 [爱发电](https://afdian.com/a/dsketon) 支持作者 D-Sketon。

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=D-Sketon/hugo-theme-reimu&type=date&legend=top-left)](https://www.star-history.com/#D-Sketon/hugo-theme-reimu&type=date&legend=top-left)

---

## 许可

本项目博客内容与配置采用 [MIT](LICENSE) 许可。

本项目所使用的第三方项目：

| 项目 | 许可 |
|---|---|
| [Hugo](https://github.com/gohugoio/hugo) | [Apache 2.0](https://github.com/gohugoio/hugo/blob/master/LICENSE) |
| [hugo-theme-reimu](https://github.com/D-Sketon/hugo-theme-reimu) | [MIT](https://github.com/D-Sketon/hugo-theme-reimu/blob/main/LICENSE) |

---

*Built with ❤️ using Hugo and hugo-theme-reimu.*