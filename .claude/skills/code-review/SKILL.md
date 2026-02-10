---
name: code-review
description: 代码安全审查工具。在安装 skill/MCP 前自动扫描危险代码模式（网络请求、文件操作、命令执行、敏感信息）、检查依赖安全性、生成详细审查报告并给出安装建议。触发词："审查这个"、"检查代码安全"、"review code"、"/code-review"
---

# Code Review - 代码安全审查

在安装任何 skill、MCP 或第三方代码之前，必须进行安全审查。这个 skill 提供系统化的安全检查流程。

## 触发词
- "审查这个 skill"
- "检查代码安全性"
- "review this code"
- "这个代码安全吗"
- "/code-review"
- "安装前先检查一下"

## 审查流程

### 1. 提取代码
根据用户提供的信息：
- GitHub URL：使用 `git clone` 或 `mcp__zread__read_file` 读取
- 本地路径：使用 `Read` 工具读取
- 仓库名称：搜索并克隆

**必须审查的文件**：
- `package.json` / `requirements.txt` / `go.mod`（依赖）
- `README.md`（项目说明）
- `src/**/*.ts` / `*.js` / `*.py`（核心代码）
- `index.ts` / `main.js`（入口文件）

### 2. 自动扫描（使用 Grep）

#### 🔴 高危检查项

**网络请求**：
```bash
# 搜索所有网络请求
grep -r "fetch\|axios\|http\.request\|request\|urlopen" --include="*.js" --include="*.ts" --include="*.py"
```
检查点：
- 请求目标是否可信（官方 API vs 可疑域名）
- 是否发送敏感数据（token、密钥）
- 是否有数据外泄风险

**文件系统操作**：
```bash
# 搜索文件读写删除
grep -r "readFileSync\|writeFileSync\|unlink\|rm\|os\.remove" --include="*.js" --include="*.ts" --include="*.py"
```
检查点：
- 是否访问敏感目录（`~/.ssh`, `~/.aws`, `.env`）
- 是否删除用户数据
- 是否有路径遍历漏洞

**命令执行**：
```bash
# 搜索命令执行
grep -r "exec\|spawn\|child_process\|subprocess\|os\.system" --include="*.js" --include="*.ts" --include="*.py"
```
检查点：
- 命令是否可被注入
- 是否有破坏性操作（`rm -rf`, `format` 等）
- 是否隐藏执行命令

**敏感信息**：
```bash
# 搜索硬编码的密钥
grep -rE "api_key|apikey|secret|password|token" --include="*.js" --include="*.ts" --include="*.py" -i
```
检查点：
- 是否硬编码 API Key、密码
- 环境变量使用是否安全
- 日志是否泄露敏感信息

#### 🟡 中危检查项

**依赖安全**：
```bash
# 检查 package.json
cat package.json | grep -A 50 "dependencies"
```
检查点：
- 依赖版本是否过旧
- 是否有已知漏洞（可运行 `npm audit`）
- 依赖来源是否可信

**数据传输**：
- 是否使用 HTTPS
- 加密是否充分
- 是否有中间人攻击风险

### 3. 生成审查报告

使用 `.claude/skills/code-review/templates/report.md` 模板生成报告，包含：

- **总体评估**：风险等级（🟢/🟡/🔴）、安装建议
- **高危问题**：必须修复的问题列表
- **中危问题**：建议修复的问题列表
- **通过的检查项**：安全通过的项
- **审查结论**：具体的修改建议

### 4. 输出并保存

将报告保存到 `docs/troubleshooting/代码审查-{项目名}-{日期}.md`

## 审查标准

### 🔴 高危（必须通过）
- 未授权的网络请求到可疑域名
- 访问/删除敏感文件（.ssh, .aws, 凭证）
- 命令注入漏洞
- 硬编码的敏感信息
- 数据外泄风险

### 🟡 中危（建议通过）
- 依赖存在已知漏洞
- 使用 HTTP 而非 HTTPS
- 缺少输入验证
- 错误处理不当

### 🟢 低危（可选）
- 代码质量问题
- 性能问题
- 缺少文档

## 安装建议

- **✅ 可以安装**：无高危问题，中危问题可接受
- **⚠️ 需修改后安装**：存在高危/中危问题，但可修复
- **❌ 不建议安装**：存在严重安全问题或恶意代码

## 示例

**用户**："审查一下 Feishu-MCP 这个项目"

**执行流程**：
1. 克隆仓库：`git clone https://github.com/cso1z/Feishu-MCP.git`
2. 读取关键文件：`package.json`, `README.md`, `src/**/*.ts`
3. 运行 Grep 扫描危险模式
4. 分析发现的问题
5. 生成审查报告并保存到 `docs/troubleshooting/`
6. 给出安装建议

## 注意事项

- **优先安全**：宁可拒绝，也不要安装有风险的代码
- **透明审查**：报告要详细列出所有发现的问题
- **可操作建议**：每个问题都要给出具体的修复方案
- **保留记录**：所有审查报告都要保存到 `docs/troubleshooting/`
- **用户决策**：最终是否安装由用户决定，但必须说明风险
