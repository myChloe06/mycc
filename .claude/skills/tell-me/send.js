#!/usr/bin/env node
/**
 * 飞书通知脚本 - 跨平台版本
 * 用法: node send.js "标题" "内容" [颜色]
 * 颜色: blue(默认), green, orange, red
 */

const [,, title, content, color = 'blue'] = process.argv;

if (!title || !content) {
  console.error('用法: node send.js "标题" "内容" [颜色]');
  process.exit(1);
}

// 从环境变量或配置文件读取 webhook
// 用户需要配置自己的飞书 webhook，参考 配置SOP.md
const webhook = process.env.FEISHU_WEBHOOK || '';

if (!webhook) {
  console.error('❌ 未配置飞书 webhook');
  console.error('请设置环境变量 FEISHU_WEBHOOK 或参考 配置SOP.md');
  process.exit(1);
}

const card = {
  msg_type: 'interactive',
  card: {
    header: {
      title: { content: `📌 ${title}`, tag: 'plain_text' },
      template: color
    },
    elements: [
      {
        tag: 'div',
        text: { content, tag: 'lark_md' }
      },
      {
        tag: 'note',
        elements: [{ tag: 'plain_text', content: `⏰ ${new Date().toLocaleString('zh-CN')}` }]
      }
    ]
  }
};

fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(card)
})
  .then(res => res.json())
  .then(data => {
    if (data.code === 0) {
      console.log('✅ 发送成功');
    } else {
      console.error('❌ 发送失败:', data.msg);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ 请求失败:', err.message);
    process.exit(1);
  });
