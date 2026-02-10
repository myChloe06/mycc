#!/usr/bin/env node
/**
 * 飞书通知脚本 - 直接生成并发送
 * 用法: node send.js "标题" "内容" [颜色]
 */

const [,, title, content, color = 'blue'] = process.argv;

if (!title || !content) {
  console.error('用法: node send.js "标题" "内容" [颜色]');
  process.exit(1);
}

const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/74d04a99-ba1d-4567-97c2-e0e2926c6b2f';

// 处理换行符
const processedContent = content.replace(/\\n/g, '\n');

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
        text: { content: processedContent, tag: 'lark_md' }
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
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
