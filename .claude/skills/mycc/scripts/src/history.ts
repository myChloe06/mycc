/**
 * 历史记录处理
 * 读取 ~/.claude/projects/{encodedProjectName}/ 下的 JSONL 文件
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, renameSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { RawHistoryLine, ConversationSummary, ConversationHistory } from "./types.js";
import { findProjectRoot } from "./config.js";

// 重新导出类型（保持兼容）
export type { ConversationSummary, ConversationHistory };

// ============ sessions-index.json 相关类型 ============

/** sessions-index.json 中的单个会话条目 */
interface SessionEntry {
  sessionId: string;
  fullPath: string;
  fileMtime: number;
  firstPrompt: string;
  customTitle?: string | null;
  messageCount: number;
  created: string;
  modified: string;
  gitBranch?: string;
  projectPath: string;
  isSidechain: boolean;
}

/** sessions-index.json 文件格式 */
interface SessionsIndex {
  version: number;
  entries: SessionEntry[];
}

/**
 * 过滤系统标签
 */
function stripSystemTags(text: string): string {
  if (!text) return "";
  return text
    .replace(/<user-prompt-submit-hook[^>]*>[\s\S]*?<\/user-prompt-submit-hook>/g, "")
    .replace(/<short-term-memory[^>]*>[\s\S]*?<\/short-term-memory>/g, "")
    .replace(/<current-time[^>]*>[\s\S]*?<\/current-time>/g, "")
    .replace(/<system-reminder[^>]*>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/<command-name[^>]*>[\s\S]*?<\/command-name>/g, "")
    .trim();
}

/**
 * 将项目路径编码为 Claude 使用的目录名
 * /Users/aster/AIproject/mylife → -Users-aster-AIproject-mylife
 *
 * 自动检测项目根目录（查找 .claude/ 或 CLAUDE.md），确保历史记录路径一致性
 */
export function encodeProjectPath(projectPath: string): string {
  // 先找到项目根目录（统一逻辑，避免历史记录分散）
  const root = findProjectRoot(projectPath) || projectPath;

  // 再编码
  return root.replace(/\/$/, "").replace(/[/\\:._]/g, "-");
}

/**
 * 获取历史记录目录
 */
export function getHistoryDir(cwd: string): string {
  const encodedName = encodeProjectPath(cwd);
  return join(homedir(), ".claude", "projects", encodedName);
}

/**
 * 获取对话列表
 */
export function getConversationList(cwd: string): ConversationSummary[] {
  const historyDir = getHistoryDir(cwd);

  if (!existsSync(historyDir)) {
    return [];
  }

  const files = readdirSync(historyDir).filter(f => f.endsWith(".jsonl"));
  const conversations: ConversationSummary[] = [];

  for (const file of files) {
    const filePath = join(historyDir, file);
    const sessionId = file.replace(".jsonl", "");

    try {
      const summary = parseConversationSummary(filePath, sessionId);
      if (summary) {
        conversations.push(summary);
      }
    } catch (err) {
      console.error(`[History] Failed to parse ${file}:`, err);
    }
  }

  // 按最后时间倒序排列（无日期的排到最后）
  conversations.sort((a, b) => {
    const timeA = a.lastTime ? new Date(a.lastTime).getTime() : 0;
    const timeB = b.lastTime ? new Date(b.lastTime).getTime() : 0;
    return timeB - timeA;
  });

  return conversations;
}

/**
 * 解析对话摘要
 */
function parseConversationSummary(
  filePath: string,
  sessionId: string
): ConversationSummary | null {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n").filter(line => line.trim());

  if (lines.length === 0) {
    return null;
  }

  let startTime = "";
  let lastTime = "";
  let lastMessagePreview = "";
  let messageCount = 0;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as RawHistoryLine;
      messageCount++;

      // 跟踪时间戳（summary 消息没有 timestamp，跳过）
      if (parsed.timestamp) {
        if (!startTime || parsed.timestamp < startTime) {
          startTime = parsed.timestamp;
        }
        if (!lastTime || parsed.timestamp > lastTime) {
          lastTime = parsed.timestamp;
        }
      }

      // 提取最后一条消息预览（user 消息，过滤系统标签）
      if (parsed.type === "user" && parsed.message?.content) {
        const content = parsed.message.content;
        let rawPreview = "";
        if (typeof content === "string") {
          rawPreview = content;
        } else if (Array.isArray(content)) {
          for (const item of content) {
            if (typeof item === "object" && item && "text" in item) {
              rawPreview = String((item as { text: string }).text);
              break;
            }
          }
        }
        // 过滤系统标签后截取
        const cleanPreview = stripSystemTags(rawPreview);
        if (cleanPreview) {
          lastMessagePreview = cleanPreview.substring(0, 100);
        }
      }
    } catch {
      // 忽略解析错误的行
    }
  }

  return {
    sessionId,
    startTime,
    lastTime,
    messageCount,
    lastMessagePreview: lastMessagePreview || "(无预览)",
  };
}

/**
 * 获取具体对话内容
 * 优化：只返回最后一个 summary 之后的消息，节省流量
 */
export function getConversation(
  cwd: string,
  sessionId: string
): ConversationHistory | null {
  // 验证 sessionId 格式（防止路径遍历攻击）
  if (!sessionId || /[<>:"|?*\x00-\x1f\/\\]/.test(sessionId)) {
    return null;
  }

  const historyDir = getHistoryDir(cwd);
  const filePath = join(historyDir, `${sessionId}.jsonl`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n").filter(line => line.trim());
  const allMessages: unknown[] = [];
  let lastSummaryIndex = -1;

  // 第一遍：解析所有消息，找到最后一个 summary 的位置
  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      allMessages.push(parsed);

      // 记录最后一个 summary 的索引
      if (parsed.type === "summary") {
        lastSummaryIndex = i;
      }
    } catch {
      // 忽略解析错误的行
      allMessages.push(null);
    }
  }

  // 第二遍：只收集最后一个 summary 之后的消息
  const messages: RawHistoryLine[] = [];
  const startIndex = lastSummaryIndex + 1; // summary 之后开始

  for (let i = startIndex; i < allMessages.length; i++) {
    const msg = allMessages[i];
    if (msg && typeof msg === "object" && "type" in msg) {
      messages.push(msg as RawHistoryLine);
    }
  }

  return {
    sessionId,
    messages,
  };
}

/**
 * 获取对话列表（新实现：从 sessions-index.json 读取）
 * 性能提升 10-100x
 */
export function getConversationListFromIndex(cwd: string): ConversationSummary[] {
  const historyDir = getHistoryDir(cwd);
  const indexPath = join(historyDir, "sessions-index.json");

  if (!existsSync(indexPath)) {
    return [];
  }

  try {
    const content = readFileSync(indexPath, "utf-8");
    const index: SessionsIndex = JSON.parse(content);

    // 按修改时间倒序排列
    const sorted = index.entries.sort((a, b) =>
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    // 转换为前端需要的格式
    return sorted.map(entry => ({
      sessionId: entry.sessionId,
      customTitle: entry.customTitle,
      firstPrompt: entry.firstPrompt,
      messageCount: entry.messageCount,
      startTime: entry.created,
      lastTime: entry.modified,
      lastMessagePreview: entry.firstPrompt?.substring(0, 100) || "(无预览)"
    }));
  } catch (error) {
    console.error("[History] Failed to read sessions-index.json:", error);
    return [];
  }
}

/**
 * 重命名会话
 * @param sessionId 会话 ID
 * @param newTitle 新标题（trim 后不能为空）
 * @param projectPath 项目路径
 * @returns 是否成功
 */
export function renameSession(
  sessionId: string,
  newTitle: string,
  projectPath: string
): boolean {
  // 验证标题（trim 后不能为空）
  const trimmed = newTitle.trim();
  if (!trimmed) {
    console.error("[Rename] Title cannot be empty");
    return false;
  }

  try {
    // 1. 获取索引文件路径
    const encodedPath = encodeProjectPath(projectPath);
    const indexPath = join(
      homedir(),
      ".claude",
      "projects",
      encodedPath,
      "sessions-index.json"
    );

    // 2. 检查文件是否存在
    if (!existsSync(indexPath)) {
      console.error("[Rename] sessions-index.json not found:", indexPath);
      return false;
    }

    // 3. 读取索引文件
    const index: SessionsIndex = JSON.parse(
      readFileSync(indexPath, "utf-8")
    );

    // 4. 找到对应会话
    const entry = index.entries.find(e => e.sessionId === sessionId);
    if (!entry) {
      console.error("[Rename] Session not found:", sessionId);
      return false;
    }

    // 5. 修改标题和时间戳
    entry.customTitle = trimmed;
    entry.modified = new Date().toISOString();

    // 6. 原子性写回（临时文件 + rename）
    const tempPath = `${indexPath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(index, null, 2), "utf-8");
    renameSync(tempPath, indexPath);

    console.log(`[Rename] Session renamed: ${sessionId} -> "${trimmed}"`);
    return true;
  } catch (error) {
    console.error("[Rename] Failed:", error);
    return false;
  }
}
