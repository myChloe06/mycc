# 飞书通知配置 SOP

> 这是给 cc 看的配置指南，用于帮助用户配置飞书通知

---

## 用户需要做的

1. **打开飞书客户端**（必须是客户端，网页版没有入口）
2. 创建一个群（可以只有自己）
3. 点击群名 → 设置 → 群机器人 → 添加机器人
4. 选择「自定义机器人」→ 起个名字 → 添加
5. **复制 Webhook 地址，发给 cc**

---

## cc 需要做的

收到用户的 Webhook URL 后：

### 1. 设置环境变量

**macOS / Linux**：编辑 `~/.zshrc` 或 `~/.bashrc`：

```bash
export FEISHU_WEBHOOK='用户提供的URL'
```

然后执行 `source ~/.zshrc` 或重启终端。

**Windows**：
```powershell
# 永久设置
[Environment]::SetEnvironmentVariable("FEISHU_WEBHOOK", "用户提供的URL", "User")

# 当前会话临时设置
$env:FEISHU_WEBHOOK = "用户提供的URL"
```

### 2. 测试

```bash
node .claude/skills/tell-me/send.js "测试" "飞书通知配置成功" green
```

返回 `✅ 发送成功` 就完成了。

### 3. 告诉用户

配置完成，以后说 `/tell-me` 或 `通知我` 就能收到飞书通知了。

---

## 跨平台说明

- **macOS / Linux**：直接可用
- **Windows**：需要 Node.js 18+（自带 fetch）

---

*更新于 2026-02-01*
