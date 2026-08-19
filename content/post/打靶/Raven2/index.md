---
title: Raven2
description: ""
date: 2026-08-19T15:21:34+08:00
lastmod: 2026-08-19T16:06:33+08:00
draft: false
slug: MuvosL-2026-010
categories:
  - 打靶
tags:
  - 渗透靶场
---
# 1 信息收集

## 1.1 nmap信息挖掘

靶机的MAC地址为：`00:0C:29:AE:02:13`

使用`nmap`对`192.168.0.0`进行扫描，并根据靶机MAC地址确定靶机IP为`192.168.0.8`

![[Pasted image 20260819160628.png]]

对靶机IP进行全端口扫描，80端口有HTTP服务，22端口是可以进行爆破的

![image.png](image%201.png)

## 1.2 HTTP信息挖掘

访问80端口

![image.png](image%202.png)

![image.png](image%203.png)

进行一下目录扫描

![image.png](image%204.png)

可以看出他这是用wordpress搭建的这么一个网站，翻了翻各个目录后，进入/vendor/看看

![image.png](image%205.png)

在PATH这个页面中发现了一段flag
`flag1{a2c1f66d2b8051bd3a5874b5b6e43e21}`

![image.png](image%206.png)

phpmailer是什么

![image.png](image%207.png)

在搜索的时候，列表中有漏洞这个关键词

![image.png](image%208.png)

这里还发现了一个版本信息

![image.png](image%209.png)

# 2 查找漏洞信息并利用

![image.png](image%2010.png)

![image.png](image%2011.png)

再回到kali

![image.png](image%2012.png)

查找一下这个的完整路径在哪里，并将其移动到一个位置

![image.png](image%2013.png)

![image.png](image%2014.png)

然后我们要对这个脚本中的一下参数进行更改

![image.png](image%2015.png)

![image.png](image%2016.png)

这里刚开始运行的时候，缺少了些东西，先去安装了一些必要模块

`sudo apt install python3-requests-toolbelt -y`

然后`python3 40974.py`

![image.png](image%2017.png)

开启监听

![image.png](image%2018.png)

我们去访问刚刚在参数中设置的页面，然后它就会在当前目录下生成一个1.php，接下来再去访问，那么就会回来一个shell

![image.png](image%2019.png)

当前是个伪shell，进入一下pty

![image.png](image%2020.png)

# 3 信息收集

跳到/tmp

`find / -name flag*`

![image.png](image%2021.png)

![image.png](image%2022.png)

上面还有个flag3，是个png类型的

![image.png](image%2023.png)

接着跳转到flag3所在目录

![image.png](image%2024.png)

`grep “password” -rn wp-config.php`

<aside>
<img src="https://www.notion.so/icons/bug_purple.svg" alt="https://www.notion.so/icons/bug_purple.svg" width="40px" />

- `grep`：用于在文件中搜索指定字符串的命令
- `"password"`：要搜索的目标字符串（这里是查找包含 "password" 的内容）
- `r`：递归搜索（不过这里指定了具体文件，该参数实际不起作用）
- `n`：显示匹配内容所在的行号
- `wp-config.php`：要搜索的目标文件（WordPress 的配置文件）

执行后，会在 `wp-config.php` 文件中查找所有包含 "password" 的行，并显示行号和具体内容。

</aside>

![image.png](image%2025.png)

![image.png](image%2026.png)

登录mysql

查看一下基本信息，这里数据库是root权限

![image.png](image%2027.png)

![image.png](image%2028.png)

这里关于mysql的一些安装的版本的信息

![image.png](image%2029.png)

继续进行信息收集

![image.png](image%2030.png)

![image.png](image%2031.png)

这些账号的密码无法破解

# 4 提权

尝试利用mysql做提权，接下来查看一下前提条件

`show global variables like ‘secure%’;`

![image.png](image%2032.png)

此时就是第三种情况

找目录

![image.png](image%2033.png)

然后，查看mysql是否可以远程访问，如果可以，使用msf脚本攻击

![image.png](image%2034.png)

可以看到，不能进行远程访问

那就只能本地进行了

找寻exp

![image.png](image%2035.png)

![image.png](image%2036.png)

![image.png](image%2037.png)

接下来就是熟悉的，开启http服务，让靶机从kali获取这个文件

![image.png](image%2038.png)

![image.png](image%2039.png)

![image.png](image%2040.png)

接下来利用这个需要先创建一个表

`use mysql`

create table moyeah(line blob);

![image.png](image%2041.png)

![image.png](image%2042.png)

![image.png](image%2043.png)

接下来

![image.png](image%2044.png)

![image.png](image%2045.png)

![image.png](image%2046.png)

![image.png](image%2047.png)

# 5 拓展知识

在linux里，有一个存储账户的地方，这是我的kali里面的，可以看到root用户是什么样的一个格式在这里存放

![image.png](image%2048.png)

我们可以在哪个靶机数据库中写函数内容那块儿，更改为，加入一个root用户

我们现在这里准备一下一个用户

![image.png](image%2049.png)

![image.png](image%2050.png)

select do_system('echo "moyeah:KA5Pm2R5$d7ltJ2Ck1GFgk9X69PVN4:0:0root:/root:/bin/bash" >> /etc/passwd')；

这时候moyeah这个账户就也是root权限了

**仅限/bin/bash模式**

# 6 知识梳理

## udf提权

udf提权是mysql提权的方式之一，也是比较常用的

**提权的目的：mysql权限——》操作系统权限**

有时候我们通过一些方式获取了目标主机mysql的用户名和密码，并且可以[远程连接](https://so.csdn.net/so/search?q=%E8%BF%9C%E7%A8%8B%E8%BF%9E%E6%8E%A5&spm=1001.2101.3001.7020)。我们远程登录上了mysql服务器，这时，我们想通过mysql来执行系统命令，此时我们可以考虑使用UDF进行提权。

UDF（Userdefined function）可翻译为用户自定义函数，其为mysql的一个拓展接口，可以为mysql增添一些函数。比如mysql一些函数没有，我就使用UDF加入一些函数进去，那么我就可以在mysql中使用这个函数了。

**提权说明**
先说明一下UDF提取的先决条件

获取mysql控制权限：知道mysql用户名和密码，并且可以远程登录（即获取了mysql数据库的权限）
mysql具有写入文件的权限：mysql有写入文件的权限，即secure_file_priv的值为空。
什么情况下需使用mysql提权？

拿到了mysql的权限，但是没拿到mysql所在服务器的任何权限，通过mysql提权，将mysql权限提升到操作系统权限
ps：mysql提权获取到的权限大小跟运行mysql所在服务器登录的账号的权限相关，如操作系统以普通用户登录的并启动mysql，经udf提权后也只能获取到系统的普通用户权限。而使用管理员登录操作系统运行mysql，提权后获取的权限则为系统管理员权限。

**手动提取**

1. 查看mysql是否有写入文件的权限

```java
show global variables like '%secure%';
```

secure_file_priv是用来限制load dumpfile、into outfile、load_file()函数在哪个目录下拥有上传和读取文件的权限。如下关于secure_file_priv的配置介绍

secure_file_priv的值为null ，表示限制mysqld 不允许导入|导出
当secure_file_priv的值为/tmp/ ，表示限制mysqld 的导入|导出只能发生在/tmp/目录下
当secure_file_priv的值没有具体值时，表示不对mysqld 的导入|导出做限制

2. 上传UDF 的动态链接库文件

Mysql版本大于5.1，udf.dll文件必须放在MySQL安装目录的lib\plugin文件夹下。（plugin文件夹默认不存在，需要创建）。