---
title: 第一章 应急响应-Linux日志分析
description: ""
date: 2026-07-12T13:51:30+08:00
lastmod: 2026-07-12T14:43:39+08:00
draft: false
slug: MuvosL-2026-002
categories:
  - 打靶
tags:
  - 玄机靶场
  - 应急响应
---
# 0x00 题目

![[Pasted image 20260712135250.png]]

---

## 0x01 有多少 IP 在爆破主机 SSH 的 root 账号

**分析思路：**

1. SSH 登录尝试记录在 `/var/log/auth.log.1`
2. 爆破会产生大量失败登录，筛选 `Failed password for root` 即可定位
3. 从日志中提取 IP 地址（第 11 个字段），然后排序统计

**命令：**

```bash
cat auth.log.1 | grep -a “Failed password for root” | awk '{print $11}' | sort | uniq -c | sort -nr | more
```

> **命令拆解：**
> - `cat auth.log.1` — 读取日志文件
> - `grep -a “Failed password for root”` — 筛选 root 账号的失败登录记录
> - `awk '{print $11}'` — 提取第 11 列（远程 IP 地址）
> - `sort` — 对 IP 排序（`uniq -c` 的前置要求）
> - `uniq -c` — 统计每个 IP 出现的次数
> - `sort -nr` — 按次数降序排列（`-n` 数值排序，`-r` 倒序）
> - `more` — 分页显示，避免输出过长

---

## 0x02 SSH 爆破成功登录的 IP 是多少

**分析思路：**

在 `auth.log` 中，`Accepted` 关键字标识成功的登录尝试。筛选出所有包含 `Accepted` 的行，提取 IP 并统计即可。

**命令：**

```bash
cat auth.log.1 | grep -a “Accepted “ | awk '{print $11}' | sort | uniq -c | sort -nr | more
```

> **命令拆解：**
> - `grep -a “Accepted “` — 筛选所有成功登录的记录（注意 `Accepted` 后有空格，避免匹配到其他含该词的日志）
> - `awk '{print $11}'` — 提取远程 IP 地址
> - `sort | uniq -c | sort -nr` — 排序、去重统计、降序排列
> - 考点：区分 `Failed password`（失败）和 `Accepted`（成功）两类日志关键字
> - 结合 0x01 的结果交叉对比，即可锁定爆破成功的 IP

---

## 0x03 爆破用户名字典是什么

**分析思路：**

字典攻击指黑客使用一系列常见用户名，结合默认密码逐个尝试登录。要从日志中提取被尝试的用户名，需要用 `perl` 正则从 `Failed password` 行中截取 `for xxx from` 之间的用户名部分。

**命令：**

```bash
cat auth.log.1 | grep -a “Failed password” | perl -e 'while($_=<>){ /for(.*?) from/; print “$1\n”;}' | uniq -c | sort -nr
```

> **命令拆解：**
> - `grep -a “Failed password”` — 筛选所有失败登录记录
> - `perl -e '...'` — 用正则 `/for(.*?) from/` 从日志中提取 `for` 和 `from` 之间的用户名（`$1` 捕获）
> - `uniq -c | sort -nr` — 统计每个用户名被尝试的次数，降序排列
> - 考点：`awk '{print $11}'` 提取的是 IP，而这道题要提取的是**用户名**，需要用正则从日志正文中截取，`awk` 按列提取不够灵活

---

## 0x04 成功登录 root 的 IP 一共爆破了多少次

本题与 0x01 本质相同——统计 `Failed password for root` 时已经顺带得到了每个 IP 的尝试次数，直接复用第一题的命令即可。

**命令：**

```bash
cat auth.log.1 | grep -a “Failed password for root” | awk '{print $11}' | sort | uniq -c | sort -nr | more
```

> 命令与 0x01 完全一致。考点：同一份数据从不同角度提问——0x01 问”有哪些 IP”，0x04 问”某个 IP 爆破了多少次”，答案其实都在同一条命令的输出里。

---

## 0x05 黑客登录主机后新建了一个后门用户，用户名是多少

**分析思路：**

用户创建操作会记录在 `/var/log/auth.log.1` 中，关键字为 `new user`。直接搜索即可定位。

> 示例日志格式：`Jan 12 10:32:15 server useradd[1234]: new user: name=testuser, UID=1001, GID=1001, home=/home/testuser, shell=/bin/bash`

**命令：**

```bash
cat auth.log.1 | grep -a “new user”
```

> **命令拆解：**
> - `grep -a “new user”` — 搜索新建用户的日志记录，关键字 `new user` 是 `useradd` 命令产生的固定日志格式
> - 考点：知道 Linux 用户创建操作会写入 `/var/log/auth.log`，且日志中固定包含 `new user: name=xxx` 字样

---

### 补充：`grep -a` 的作用

`-a` 选项让 `grep` 将文件视为文本文件处理。当文件包含二进制数据时，不加 `-a` 可能导致 `grep` 跳过匹配或输出异常。加上 `-a` 可确保按文本模式处理，得到预期结果。
