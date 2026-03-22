# Vibe Coding 实战心得 —— 海龟汤 AI 游戏部署全记录

> 写给未来的自己：这不只是一次部署记录，这是一次认知升级。

---

## 核心感悟

Vibe Coding 本身是为普通人设计的编程方式，但走完整个流程之后才发现，**真正的学习从部署那一刻才开始**。这个过程更像是在培养产品经理的思维，同时也是一次对程序员日常工作的深度认知。

关于 AI 工具的选择有了切身体会：**找老师问问题用 Gemini 没问题，但涉及代码 debug，Gemini 近 3 小时没解决的问题，Claude 3 分钟搞定。** 工具要用对场景。

### 关于 Vibe Coding 的本质认知

Vibe Coding 降低了"写代码"的门槛，但没有降低"理解系统"的门槛。  
换句话说：**AI 可以帮你写代码，但看不懂错误日志，AI 也救不了你。**

这次经历让我明白，AI 时代真正的分水岭不是"会不会写代码"，而是：
- 能不能**描述清楚问题**
- 能不能**读懂错误信息**
- 能不能**判断 AI 的回答是否靠谱**

懂程序的人用 AI 工具会更好，本质原因就在这里。

---

## 一、Debug 核心原则

**看错误日志是程序员最重要的习惯。**

- 打开浏览器开发者工具：按 `F12`
- AI 提示"服务器开小差"时，先看错误码再和 AI 交互
- 原以为几分钟能解决，结果是接下来 5 小时的开端——这就是真实的开发体验

### 常见错误码速查

| 错误码 | 含义 | 直觉判断 |
|--------|------|---------|
| 404 | 找不到这个地址 | 路由/路径写错了 |
| 405 | 请求方法不对 | GET/POST 用错了 |
| 502 | 网关错误 | 后端服务没启动或崩了 |
| CORS | 跨域被拦截 | 前后端域名不一致，后端没配置允许 |

### 姜学长小助理的建议
> 打开浏览器的开发者工具（按 F12 查看错误码），然后和 AI 交互。如果 AI 提示服务器开小差了，先看报的错误码是什么，才能进一步判断。

这句话值得反复咀嚼——**症状不等于病因，错误码才是诊断入口。**

---

## 二、本地开发 vs 线上部署

| 场景 | 说明 |
|------|------|
| 本地开发 | `npm run dev` 启动，需要同时开两个终端（前端 + 后端） |
| 线上部署 | 只有一个地址，前后端合并在一起 |

**本地和线上是两回事，这是新手最容易混淆的认知。**

### npm run dev 的本质

当你看到 `npm run dev` 这个命令时，你实际上是在启动一个名为 **Vite** 的小型网页服务器。

如果不运行命令：这个服务器根本没启动，浏览器去访问 `http://localhost:5173` 时，就像敲一扇锁着的门，里面没人应答，所以会报错。

**Cursor 内嵌预览快捷键：**
```
Cmd + Shift + P → 输入 Simple Browser → 输入 http://localhost:5173
```

### 为什么本地要开两个终端？
```
终端1：前端服务（Vite）  →  http://localhost:5173
终端2：后端服务（Node）  →  http://localhost:3000

前端页面 → 请求后端 API → 返回数据 → 显示在页面上
```

线上部署时，Railway 把这两者打包在一起，所以只有一个地址。

---

## 三、部署架构全貌

### 两个部署平台

**Railway（主力，前后端一体）**
- 地址：`https://ai-haigui-game-production.up.railway.app`
- 前后端都在这里，是完整的部署
- 后端健康检查：`/api/health` → 返回 `{"status":"ok"}`
- 用 Docker 容器运行，配置在 Dockerfile 里

**Vercel（前端）**
- 地址：`https://ai-haigui-game.vercel.app`
- 只部署前端，API 请求通过 vercel.json 转发到 Railway 后端
- 擅长静态前端部署，构建速度快

### 地址结构理解
```
https://ai-haigui-game-production.up.railway.app/
├── /              → 前端页面（HTML/CSS/JS）
├── /api/health    → 后端健康检查
├── /api/game      → 游戏相关接口
└── /api/...       → 其他后端接口
```

### 部署平台工作流程
```
你 push 代码到 GitHub
        ↓
Railway/Vercel 自动检测到更新
        ↓
拉取代码 → npm install → npm run build → 启动服务
        ↓
部署成功，用户可以访问
```

---

## 四、Git 核心概念

> 程序员万物可以 Git —— 这句话的意思是：任何值得保存的内容，都可以用 Git 管理版本。
```
commit = 游戏存档，记录"我在这个时间点改了什么"
push   = 把存档上传到 GitHub 云端
pull   = 把云端最新代码拉到本地
PR     = 团队协作时申请合并代码，个人开发基本用不上
branch = 分支，像平行宇宙，可以在不影响主线的情况下实验新功能
```

### Git 工作流程
```
修改代码
  ↓
git add .          （把改动放入暂存区，准备存档）
  ↓
git commit -m "说明这次改了什么"  （正式存档）
  ↓
git push           （上传到 GitHub）
  ↓
Railway/Vercel 自动部署
```

### 约定俗成的规则

- ✅ 上传：源代码（你写的东西）
- ❌ 不上传：`node_modules`（依赖包，别人写的，随时可以 `npm install` 重新下载）

**为什么不上传 node_modules？**
- 动辄几百MB甚至几GB，完全没必要
- `package.json` 里记录了所有依赖，`npm install` 一键还原
- Railway 和 Vercel 部署时都会自己跑 `npm install`

### push 有时需要开代理

上传代码到 GitHub 属于访问国外服务，在国内有时需要 Shadowrocket 开全局代理。

---

## 五、Dockerfile 是什么

这次部署踩了很多 Dockerfile 的坑，值得单独记录。

**Dockerfile = 告诉服务器"如何从零开始运行我的项目"的说明书**
```dockerfile
FROM node:22.12.0-alpine   # 用什么环境（Node版本很重要！）
WORKDIR /app               # 工作目录
COPY . .                   # 先复制代码（顺序错了就报错）
RUN npm install            # 安装依赖
RUN npm run build          # 打包构建
EXPOSE 3000                # 开放端口
CMD ["node", "server/index.js"]  # 启动命令
```

### 本次踩过的坑

| 错误 | 原因 | 解决 |
|------|------|------|
| rolldown 找不到原生绑定 | Node 22.11 不满足 Vite 要求（需要 22.12+）| 改为 `node:22.12.0-alpine` |
| tsconfig 找不到 | `COPY` 在 `RUN build` 之后，代码还没复制就开始构建 | 调换顺序：先 COPY 再 RUN |
| rolldown 再次报错 | `--no-optional` 跳过了必要的原生依赖 | 去掉 `--no-optional` 参数 |
| Vercel 找不到 dist | 构建输出目录其实是 `public_html` 不是 `dist` | 修正 vercel.json 的 outputDirectory |

---

## 六、AI 工具使用心得

### 不同 AI 的适用场景

| AI | 擅长 |
|----|------|
| Claude | 代码 debug、逻辑推理、长文分析、一步步排查问题 |
| GPT | 生态最全、插件最多、联网搜索、图片生成 |
| Gemini | Google 全家桶联动、搜索整合 |
| DeepSeek | 数学和代码能力强、免费、性价比高 |
| 豆包 | 中文日常对话、国内访问最方便 |

### 和 AI 对话的正确姿势

1. **截图错误日志**，而不是描述症状（"报错了"没用，日志截图才有用）
2. **每次只改一件事**，改完确认结果再继续
3. **AI 给的方案越改越乱时**，停下来，换一个 AI 重新描述问题
4. **不要盲目 Accept**，看懂改了什么再接受

---

## 七、Cursor 操作备忘

| 操作 | 说明 |
|------|------|
| Accept / Keep | 接受 AI 的代码改动，两个按钮同一个意思，不同版本显示不同 |
| 绿色代码行 | 新增内容 |
| 红色代码行 | 删除内容 |
| Commit | 存档 |
| Push | 上传到 GitHub |
| Composer | 给 AI 发指令改代码的地方 |

---

## 八、手机访问国外网站

Shadowrocket 设置：
1. 打开 Shadowrocket
2. 右上角 → 全局路由 → 选**代理**
3. 刷新网页

---

## 九、本次涉及的核心技能

- **Git 远程管理**：commit、push、branch 管理
- **Vercel 自动化部署**：前端静态部署、vercel.json 配置
- **Railway 容器化部署**：Dockerfile 编写、环境变量配置
- **错误日志分析**：从日志定位根本原因而不是表面症状
- **环境变量联调**：本地 `.env.local` vs 线上平台变量配置
- **跨域（CORS）理解**：前后端分离架构的基础认知

---

## 十、最后的思考

> AI 时代，懂程序的人比不懂程序的人在对待这些工具模型方面使用的更好。

这句话的深层含义是：

**不是因为他们会写代码，而是因为他们懂得：**
- 系统是怎么工作的
- 出错了去哪里找原因
- 怎么把问题描述得足够精准
- 怎么判断 AI 的回答是否靠谱

Vibe Coding 降低了写代码的门槛，但**理解系统、读懂错误、精准提问**这些能力，永远是人机协作的核心竞争力。

这次 21 天的学习，表面上是做了一个海龟汤游戏，实际上是完成了一次从"用户"到"构建者"的思维转变。

---

## API Key 安全管理

**踩坑经历：**
DeepSeek API Key 被提交到了公开的 GitHub 仓库，触发了 Secret scanning 告警（Public leak）。
GitHub Secret scanning 的告警截图如下所示（告警显示 sk-0ea60f5dd713404ba4dfa... 被检测到泄露在 server/.env 第1行，标记为 Public leak）。

**根本原因：**
.gitignore 中没有包含 .env，导致 server/.env 被 Git 追踪并上传。
注意：*.local 只能匹配 .env.local，不能匹配 .env 本身。

**正确做法：**
1. 创建 .env 文件之前，先确认 .gitignore 里已经有 .env 相关规则
2. .gitignore 中应包含：
   .env
   .env.*
   server/.env
3. 用 git ls-files | grep env 检查有没有 env 文件被追踪

**处理泄露的步骤：**
1. 立即去 API 平台作废泄露的 Key
2. git rm --cached <泄露的文件>
3. git commit & push
4. 更新 .env 文件写入新 Key
5. 关闭 GitHub Secret scanning 告警

**记住这句话：有 Key 的文件，在第一次 git add 之前，先确认 .gitignore 里有没有它。**

---

*第一次用 Git 部署上线的纪念 🐢*  
*2026年3月20日*  
*历时：Gemini 3小时 + Claude 3分钟 = 一次难忘的认知升级*
