Smilion-wang 241:
快接近商业化的半成品 webapp，其实就是透过，下面几个要素做出来的：
1. research.md
2. prd.md
3. tdd.md
4. CLAUDE.md
5. testing.MD

要注意限制下用户输入的文字内容数量，避免恶意灌大量文字，消耗太多。
让 AI 给你 repo 做下风险评估，可以避免很多不知道的潜在风险。


CI/CD 是 Continuous Integration / Continuous Deployment 的缩写，中文叫「持续集成/持续部署」。
简单说就是：你每次 push 代码到 GitHub，它自动帮你测试、打包、部署，不用你手动操作。
比如你改了海龟汤的代码 → push 到 GitHub → Railway 自动检测到更新 → 自动重新部署上线。这个自动化流程就叫 CI/CD。
改成 private 可能麻烦的地方是：某些 CI/CD 工具需要单独配置权限才能读取 private 仓库，而 public 仓库任何人都能读，不需要额外授权。但 Railway 和 Vercel 因为你已经用 GitHub 账号登录授权过了，所以改 private 对它们没影响。


GitHub 在提醒你改成 private 之后会有三个影响，逐条解释：
Dependabot 自定义告警规则会被禁用 — Dependabot 就是之前帮你扫描依赖漏洞的机器人，改成 private 后它的一些高级功能会关掉。对你影响不大，基础功能还在。
现有的 fork 会保持 public 并与这个仓库断开 — 就是说如果有人 fork 了你的仓库，改成 private 不会影响他们那份，但会断开关联。你这个仓库 0 stars 0 watchers，应该没人 fork，所以无影响。
Advanced Security 会被禁用 — 就是今天帮你发现 Key 泄露的 Secret scanning！改成 private 之后这个功能就没了。
