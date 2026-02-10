# Skills 和 MCPs 清单

更新时间：2026-02-10 22:51

> 本文档记录当前项目安装的所有 Skills 和 MCPs，用于快速重装和迁移到新项目。

---

## 已安装 Skills

### mycc（本地开发）

- **来源**：本地开发
- **功能**：启动 mycc 小程序后端服务（后台运行），连接网页版/小程序与本地 Claude Code
- **触发词**：`/mycc`、`启动 mycc`、`启动小程序后端`、`检查 mycc 状态`
- **配置**：
  - 需要 cloudflared（`brew install cloudflare/cloudflare/cloudflared`）
  - 需要安装依赖：`cd .claude/skills/mycc/scripts && npm install`
  - 连接信息保存在 `.claude/skills/mycc/current.json`

### tell-me（飞书通知）

- **来源**：本地开发
- **功能**：将当前对话要点发送到飞书群，支持跨平台（macOS/Linux/Windows）
- **触发词**：`/tell-me`、`通知我`、`飞书通知`、`告诉我`
- **配置**：
  - 使用 Node.js 原生 `fetch`（Node 18+），无需额外依赖
  - 需配置飞书 webhook（位置：`.claude/skills/tell-me/send.js` 中）
  - **注意**：webhook URL 不包含在本文档中，需要单独配置

### setup（初始化引导）

- **来源**：本地开发
- **功能**：首次使用引导，交互式帮助用户完成 MyCC 初始化配置
- **触发词**：`/setup`、`帮我配置`、`初始化`、首次使用时自动触发
- **配置**：无特殊配置，自动检测环境

### dashboard（能力看板）

- **来源**：本地开发
- **功能**：可视化查看 cc 能力看板，生成 HTML 页面展示技能、开发中能力、规划想法
- **触发词**：`/dashboard`、`看看能力看板`、`cc 能力`、`技能看板`
- **配置**：无特殊配置

### scheduler（定时任务）

- **来源**：本地开发
- **功能**：定时任务系统，内置在 mycc 后端，自动执行定时任务
- **触发词**：`/scheduler`、`定时任务`、`启动定时`、`查看定时`
- **配置**：
  - 依赖：推荐配合 `/tell-me` 使用（发送飞书通知）
  - 任务配置：`.claude/skills/scheduler/tasks.md`
  - 执行历史：`.claude/skills/scheduler/history.md`

### skill-creator（Skill 创建器）

- **来源**：参考 [官方 Skill 仓库](https://github.com/anthropics/skills)
- **功能**：帮助创建有效的 Claude Code Skill
- **触发词**：`/create-skill`、`帮我创建一个 skill`、`把这个变成 skill`、`新建技能`
- **配置**：无特殊配置

### cc-usage（Token 用量统计）

- **来源**：本地开发
- **功能**：扫描本地 Claude Code 日志，按日期 x 模型维度统计 token 消耗和 API 等价费用
- **触发词**：`/cc-usage`、`看看用量`、`token 消耗`、`用量统计`
- **配置**：
  - 纯 Python 3 脚本，无需安装任何依赖
  - 跨平台（Mac / Linux / Windows）

### read-gzh（公众号文章读取）

- **来源**：本地开发
- **功能**：读取微信公众号文章并总结，包括配图识别
- **触发词**：`/read-gzh`、`帮我读一下这篇公众号`、`总结一下这篇文章`
- **配置**：
  - 需要脚本：`.claude/skills/read-gzh/scripts/fetch_wechat_article.py`

### humanizer-zh（去 AI 痕迹）

- **来源**：翻译自 [blader/humanizer](https://github.com/blader/humanizer)，参考 [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
- **功能**：去除文本中的 AI 生成痕迹，使文字听起来更自然、更有人味
- **触发词**：编辑或审阅文本，去除 AI 写作痕迹
- **配置**：无特殊配置

### NanoBanana-PPT-Skills（PPT 生成器 Pro）

- **来源**：[归藏/NanoBanana-PPT-Skills](https://github.com/op7418/NanoBanana-PPT-Skills)
- **功能**：基于 AI 自动生成高质量 PPT 图片和视频，支持智能转场和交互式播放
- **触发词**：`/ppt-generator-pro`
- **配置**：
  - 必需：`GEMINI_API_KEY`（Google AI API 密钥）
  - 可选：`KLING_ACCESS_KEY`、`KLING_SECRET_KEY`（可灵 AI，用于视频功能）
  - Python 依赖：`pip install google-genai pillow python-dotenv`
  - 系统依赖：`ffmpeg`（视频功能需要）

### Document-illustrator-skill（文档配图生成）

- **来源**：[归藏/Document-illustrator-skill](https://github.com/op7418/Document-illustrator-skill)
- **功能**：基于文档内容自动生成配图，AI 智能分析文档结构，归纳核心要点
- **触发词**：配图、插图、illustration、generate images、document images
- **配置**：
  - 必需：`GEMINI_API_KEY`
  - Python 依赖：`pip install google-genai pillow python-dotenv`

### agent-browser-skill（浏览器自动化）

- **来源**：[agent-browser/agent-browser-skill](https://github.com/agent-browser/agent-browser-skill)
- **功能**：浏览器自动化 CLI，用于网页交互、表单填写、截图、数据提取等
- **触发词**：`open a website`、`fill out a form`、`click a button`、`take a screenshot`、`scrape data`、`test this web app`、`login to a site`、`automate browser actions`
- **配置**：
  - 需要安装 agent-browser CLI（参考 skill 文档）
  - macOS iOS 模拟器需要：Xcode + Appium

### find-skills-skill（技能查找器）

- **来源**：[skills ecosystem](https://skills.sh/)
- **功能**：帮助用户发现和安装 agent skills，使用 `npx skills` 命令
- **触发词**：`how do I do X`、`find a skill for X`、`is there a skill that can...`
- **配置**：
  - 需要安装 Skills CLI：`npx skills`

### code-review（代码安全审查）

- **来源**：本地开发
- **功能**：在安装 skill/MCP 前自动扫描危险代码模式，检查依赖安全性，生成审查报告
- **触发词**：`审查这个`、`检查代码安全`、`review code`、`/code-review`
- **配置**：无特殊配置

### guizang-s-prompt（归藏的提示词库）

- **来源**：[op7418/guizang-s-prompt](https://github.com/op7418/guizang-s-prompt)
- **功能**：归藏创作的优质 AI 提示词库，涵盖图像、文本和视频生成
- **触发词**：无特定触发词，作为参考资源使用
- **配置**：无特殊配置，纯提示词库

### notebooklm-skill（Google NotebookLM 集成）

- **来源**：[PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill)
- **功能**：直接从 Claude Code 查询 Google NotebookLM 笔记本，获得基于来源的、有引用支持的 Gemini 回答。包含浏览器自动化、库管理、持久化认证。通过仅限文档响应大幅减少幻觉。
- **触发词**：查询笔记本、分析笔记、NotebookLM 相关请求时自动触发
- **配置**：
  - 需要 Python 环境
  - 需要 `GEMINI_API_KEY` 环境变量
  - 需要 Google NotebookLM 访问权限
  - 详细配置见 skill 目录下的 `AUTHENTICATION.md`
- **注意**：此 skill 需要 Google 账户授权和 NotebookLM 访问权限

---

## 已安装 MCPs

### feishu-mcp（飞书 MCP）

- **包名**：`feishu-mcp@latest`
- **来源**：[cso1z/Feishu-MCP](https://github.com/cso1z/Feishu-MCP)
- **功能**：飞书集成，支持文档操作、白板、图片上传等功能
- **配置**：
  - 启动命令：`npx -y feishu-mcp@latest --stdio`
  - 环境变量：
    - `FEISHU_APP_ID`：飞书应用 ID
    - `FEISHU_APP_SECRET`：飞书应用密钥
    - `FEISHU_AUTH_TYPE`：tenant
  - **注意**：具体凭证不包含在本文档中，需要单独配置

### docker-sandbox（Docker 沙箱）

- **来源**：内置 MCP（通过 `enabledMcpjsonServers` 启用）
- **功能**：Docker 容器沙箱环境
- **配置**：在 `~/.claude/settings.json` 中启用

---

## 快速重装指南

### Skills 重装

```bash
# 1. 复制 skills 目录到新项目
cp -r .claude/skills /path/to/new/project/.claude/

# 2. 安装外部依赖（如需要）
# mycc
cd /path/to/new/project/.claude/skills/mycc/scripts && npm install

# PPT Generator / Document Illustrator
pip install google-genai pillow python-dotenv
# 如果需要视频功能，还需安装 ffmpeg
```

### MCPs 重装

```bash
# 1. 复制 .mcp.json 到新项目
cp .mcp.json /path/to/new/project/

# 2. 或手动配置到 ~/.claude/settings.json
```

---

## 迁移到新项目指南

### 完整迁移步骤

```bash
# 1. 复制 skills 目录
cp -r .claude/skills /path/to/new/project/.claude/

# 2. 复制 MCP 配置
cp .mcp.json /path/to/new/project/

# 3. 复制配置文件（可选）
cp .claude/settings.local.json /path/to/new/project/.claude/

# 4. 安装依赖
cd /path/to/new/project
.claude/skills/mycc/scripts/npm install
pip install google-genai pillow python-dotenv

# 5. 配置环境变量（不包含在本文档中）
# - 飞书 webhook URL（tell-me skill）
# - 飞书应用凭证（feishu-mcp）
# - GEMINI_API_KEY（PPT/配图生成）
```

### 仅迁移部分 Skills

如果只需要部分 skills，可以单独复制对应的目录：

```bash
# 例如只迁移 mycc 和 tell-me
cp -r .claude/skills/mycc /path/to/new/project/.claude/skills/
cp -r .claude/skills/tell-me /path/to/new/project/.claude/skills/
```

---

## 配置检查清单

迁移或重装后，需要检查以下配置：

- [ ] tell-me：飞书 webhook URL 已配置
- [ ] feishu-mcp：飞书应用 ID 和密钥已配置
- [ ] mycc：依赖已安装（`npm install`）
- [ ] PPT Generator：`GEMINI_API_KEY` 已配置
- [ ] Document Illustrator：`GEMINI_API_KEY` 已配置
- [ ] 全局设置：`~/.claude/settings.json` 已正确配置

---

## 注意事项

### 安全相关

1. **敏感信息**：本文档不包含任何具体的 API Key、密码、webhook URL 等敏感信息
2. **代码审查**：安装任何第三方 skill/MCP 前，建议使用 `code-review` skill 进行安全审查
3. **配置文件**：`.claude/settings.local.json` 包含本地配置，不应提交到公开仓库

### 兼容性

1. **操作系统**：大部分 skills 支持 macOS/Linux，Windows 支持：tell-me、cc-usage
2. **mycc 后端**：目前 macOS/Linux 支持，Windows/WSL 存在兼容性问题
3. **Claude Code 版本**：建议使用官方原版，第三方 fork 版本可能不兼容

### 更新维护

1. **Skills 更新**：定期检查并更新 skills
2. **MCPs 更新**：使用 `npx skills check` 检查更新
3. **文档更新**：每次添加/删除 skills 或 MCPs 后更新本文档

---

## 参考资源

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [官方 Skills 仓库](https://github.com/anthropics/skills)
- [Skills 生态系统](https://skills.sh/)
- [归藏的技能库](https://github.com/op7418)
