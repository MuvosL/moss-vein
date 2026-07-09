---
# ===== 文章标题（必填）=====
title: "{{ replace .File.ContentBaseName "-" " " | title }}"

# ===== URL 标识（必填）=====
# 格式: MuvosL-年份-序号
# 例如: MuvosL-2026-001、MuvosL-2026-002
# 每次新建时，请手动将 XXX 改为已有文章的最大序号 +1
slug: "MuvosL-{{ dateFormat "2006" now }}-XXX"

# ===== 文章描述 =====
# 用于 SEO 描述和社交分享卡片，不填则自动截取正文前几句
description: ""

# ===== 关键词 =====
# 逗号分隔，用于 SEO meta 标签
keywords: ""

# ===== 日期 =====
date: '{{ .Date }}'       # 创建日期
lastmod: '{{ .Date }}'    # 最后修改日期

# ===== 发布状态 =====
# true = 草稿（不会发布），false = 公开发布
draft: true

# ===== 数学公式 / 流程图 =====
# 文章中有 LaTeX 公式或 Mermaid 图时设为 true
math: false
mermaid: false

# ===== 分类（必填）=====
categories:
  -

# ===== 标签（必填）=====
tags:
  -
  -

# ===== 以下为可选字段，按需取消注释 =====

# 文章封面图（留空则使用随机封面）
# cover: ""

# 自定义文章摘要（留空则自动截取正文前 70 字）
# summary: ""

# 单独控制侧边栏位置（left / right / false）
# sidebar: right

# 单独控制是否显示目录
# toc: true

# 单独控制是否显示版权声明
# copyright: true

# 单独控制是否显示赞助
# sponsor: false

# 单独控制是否显示评论
# comments: true

# 文章作者（不填默认使用全局作者 MuvosL）
# author: ""

# 文章权重（数字越大越靠前，用于置顶）
# weight: 0
---

<!-- ===== 文章内容从这里开始 ===== -->