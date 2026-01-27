<div align="center">
<img src="https://raw.githubusercontent.com/Aster110/mycc/main/assets/logo-bear.png" alt="MyCC Logo" width="200">

[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
![Status](https://img.shields.io/badge/状态-可用-brightgreen)
![Claude Code](https://img.shields.io/badge/Claude_Code-Template-blueviolet)

**让 Claude Code 成为你的搭档**

</div>

> 开箱即用的 Claude Code 系统模板 | 中国开发者的 CC 最佳实践

## 这是什么

你是否遇到过这些问题：
- **CC 每次开会话都"失忆"**，要重复说明背景
- **不知道 CLAUDE.md 怎么写**，网上的例子太简单
- **CC 太"客气"**，像客服而不是搭档

MyCC 解决这些问题。它是一个 **Claude Code 系统模板**，让 CC：
- 🧠 自动记住你的状态（通过 Hooks）
- 🎭 有自己的"性格"（通过 CLAUDE.md）
- 🔧 可以扩展新能力（通过 Skills）

## 前置条件

- 已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- 有 Anthropic API Key 或 Claude Pro 订阅

## 30 秒上手

```bash
# 1. Clone
git clone https://github.com/Aster110/mycc.git
cd mycc

# 2. 启动 Claude Code
claude

# 3. 输入 /setup，跟着引导完成配置
```

CC 会一步步引导你完成初始化，支持中断后继续。

<details>
<summary>手动配置（可选）</summary>

```bash
# 复制配置文件
cp .claude/settings.local.json.example .claude/settings.local.json
cp 0-System/status.md.example 0-System/status.md
cp 0-System/context.md.example 0-System/context.md

# 改名字（把 {{YOUR_NAME}} 换成你的名字）
sed -i '' 's/{{YOUR_NAME}}/你的名字/g' CLAUDE.md
```

</details>

## 目录结构

```
mycc/
├── CLAUDE.md                  # CC 的"性格"和"规则"（核心）
├── .claude/
│   ├── settings.local.json    # Hooks 配置
│   ├── DASHBOARD.md           # 能力看板
│   └── skills/                # 技能库
├── 0-System/                  # 记忆系统
│   ├── status.md              # 短期记忆（每日状态）
│   ├── context.md             # 中期记忆（本周上下文）
│   └── about-me/              # 长期记忆（你的画像）
├── 1-Inbox/                   # 想法收集箱
├── 2-Projects/                # 进行中的项目
├── 3-Thinking/                # 认知沉淀
├── 4-Assets/                  # 可复用资产
├── 5-Archive/                 # 归档
└── tasks/                     # 跨会话任务追踪
```

## 核心概念

### CLAUDE.md - CC 的性格

定义 CC 的工作风格：
- 简洁直接，不废话
- 搭档心态，不是客服
- 务实不纠结，先跑起来再迭代

你可以根据自己喜好修改。

### 记忆系统 - 三层结构

| 层级 | 文件 | 作用 |
|------|------|------|
| 短期 | `status.md` | 今日状态，Hooks 自动注入 |
| 中期 | `context.md` | 本周上下文，每日追加 |
| 长期 | `about-me/` | 你的完整画像 |

### Skills - 可扩展能力

内置 3 个技能：

| Skill | 功能 | 触发 |
|-------|------|------|
| `/setup` | 首次使用引导，交互式完成配置 | 直接输入 |
| `/dashboard` | 查看能力看板 | 直接输入 |
| `/skill-creator` | 创建新技能 | 直接输入 |

添加新 Skill：`.claude/skills/技能名/SKILL.md`

## 📱 移动端访问（Beta）

**在手机上使用你的 CC！**

通过 `mycc-backend`，你可以在手机浏览器或微信里访问本地的 Claude Code。

### 网页版（已上线）

访问 [mycc.dev](https://mycc.dev)，输入连接码和配对码即可。

### 微信小程序（即将上线）

敬请期待。

### 后端启动

```bash
# 1. 安装依赖（首次）
cd .claude/skills/mycc/scripts && npm install && cd -

# 2. 启动（在项目根目录下输入）
/mycc

# 3. 扫码或访问显示的 URL 即可
```

**平台支持**：
- ✅ macOS
- ✅ Linux
- ❌ Windows（暂不支持，可用 WSL 运行）

> Windows 用户如有需要，可以让 AI 帮你做适配，代码在 `.claude/skills/mycc/scripts/`

**依赖**：
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)：`brew install cloudflare/cloudflare/cloudflared`

## 常见问题

**Q: Hooks 没生效？**
A: 先输入 `/setup` 完成配置引导，然后**重启 Claude Code 窗口**（关掉再开）。Hooks 只在启动时加载。

**Q: 怎么让 CC 记住更多东西？**
A: 写到 `0-System/about-me/` 里。

**Q: 怎么自定义 CC 的性格？**
A: 编辑 `CLAUDE.md` 里的风格定义。

## 为什么做这个

Claude Code 很强大，但需要配置才能发挥最大价值。

这个模板把实践中积累的最佳配置开源出来，让你不用从零开始。

**适合**：
- 想用 AI 辅助工作/生活的开发者
- 想让 CC 成为"搭档"而不是"工具"的人
- 对个人效率系统感兴趣的人

## 贡献

欢迎提 Issue 和 PR！

## Star History

<a href="https://star-history.com/#Aster110/mycc&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Aster110/mycc&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Aster110/mycc&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Aster110/mycc&type=Date" />
 </picture>
</a>

## License

MIT

---

**MyCC** - 让 Claude Code 成为你的搭档，而不只是工具。
