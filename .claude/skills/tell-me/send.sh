#!/bin/bash
# 飞书通知脚本 - 使用 Node.js 生成 JSON + curl 发送
# 用法: bash send.sh "标题" "内容" [颜色]
# 注意：内容中的 \n 会被转换为真正的换行符

WEBHOOK='https://open.feishu.cn/open-apis/bot/v2/hook/74d04a99-ba1d-4567-97c2-e0e2926c6b2f'
TITLE="$1"
CONTENT="$2"
COLOR="${3:-blue}"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JSON_FILE="$SCRIPT_DIR/feishu_message.json"
NODE_SCRIPT="$SCRIPT_DIR/.send-helper.js"

# 创建临时的 Node.js 脚本来生成 JSON
cat > "$NODE_SCRIPT" << 'ENDOFNODE'
const title = process.argv[1];
const content = process.argv[2].replace(/\\n/g, '\n');
const color = process.argv[3] || 'blue';
const time = new Date().toLocaleString('zh-CN');
const jsonPath = process.argv[4];

const data = {
  msg_type: 'interactive',
  card: {
    header: {
      title: { content: `📌 ${title}`, tag: 'plain_text' },
      template: color
    },
    elements: [
      {
        tag: 'div',
        text: { content: content, tag: 'lark_md' }
      },
      {
        tag: 'note',
        elements: [{ tag: 'plain_text', content: `⏰ ${time}` }]
      }
    ]
  }
};

const fs = require('fs');
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
ENDOFNODE

# 使用 Node.js 生成 JSON（传递绝对路径）
node "$NODE_SCRIPT" "$TITLE" "$CONTENT" "$COLOR" "$JSON_FILE"

# 使用 curl 发送
curl -s -X POST "$WEBHOOK" \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d @"$JSON_FILE"

# 清理临时文件
rm -f "$NODE_SCRIPT" "$JSON_FILE"
