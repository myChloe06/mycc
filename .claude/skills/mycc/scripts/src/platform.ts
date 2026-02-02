/**
 * 跨平台工具函数
 * 集中处理 Windows / Mac / Linux 的差异
 */

import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import { parse, join, dirname } from "path";

/**
 * 是否是 Windows 平台
 */
export const isWindows = process.platform === "win32";

/**
 * 空设备路径
 * Windows: NUL, Mac/Linux: /dev/null
 */
export const NULL_DEVICE = isWindows ? "NUL" : "/dev/null";

/**
 * 跨平台 sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取路径的根目录
 * Mac/Linux: "/"
 * Windows: "C:\\" 等盘符
 */
export function getRoot(filePath: string): string {
  return parse(filePath).root;
}

/**
 * 清理占用指定端口的进程
 */
export async function killPortProcess(port: number): Promise<void> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 检查端口是否被占用
      const pid = isWindows
        ? getWindowsPortPid(port)
        : getUnixPortPid(port);

      if (!pid) {
        // 端口未被占用，成功
        return;
      }

      // 直接强制杀掉进程
      if (isWindows) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      } else {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      }

      // 等待端口释放（操作系统需要时间清理）
      await sleep(1000);

      // 验证端口是否已释放
      const stillOccupied = isWindows
        ? getWindowsPortPid(port)
        : getUnixPortPid(port);

      if (!stillOccupied) {
        // 成功释放
        return;
      }

      // 如果还被占用且不是最后一次重试，继续
      if (attempt < maxRetries) {
        console.log(`端口 ${port} 仍被占用，重试 ${attempt}/${maxRetries}...`);
      }
    } catch (error) {
      // 命令失败，可能端口未被占用
      return;
    }
  }

  // 所有重试都失败了
  throw new Error(`无法释放端口 ${port}，请手动检查并关闭占用进程`);
}

/**
 * 获取 Unix 系统上占用端口的 PID
 */
function getUnixPortPid(port: number): string | null {
  try {
    const pid = execSync(`lsof -i :${port} -t 2>/dev/null`, {
      encoding: "utf-8",
    }).trim();
    return pid || null;
  } catch {
    return null;
  }
}

/**
 * 获取 Windows 系统上占用端口的 PID
 */
function getWindowsPortPid(port: number): string | null {
  try {
    const result = execSync(
      `netstat -ano | findstr :${port} | findstr LISTENING`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const lines = result.trim().split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        return pid;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 检测 cloudflared 路径
 * 优先级：环境变量 > 常见路径 > 命令名
 */
export function detectCloudflaredPath(): string {
  // 1. 环境变量优先
  if (process.env.CLOUDFLARED_PATH) {
    return process.env.CLOUDFLARED_PATH;
  }

  if (isWindows) {
    // Windows: 直接用命令名，依赖 PATH
    return "cloudflared";
  } else {
    // Mac/Linux: 尝试常见路径
    const paths = [
      "/opt/homebrew/bin/cloudflared", // macOS ARM
      "/usr/local/bin/cloudflared", // macOS Intel / Linux
    ];
    for (const p of paths) {
      if (existsSync(p)) return p;
    }
    return "cloudflared"; // fallback
  }
}

/**
 * 检测 Claude CLI 路径
 * 返回 { executable, cliPath }
 * - Mac/Linux: { executable: "node", cliPath: "/path/to/cli.js" } 或 { executable: "claude", cliPath: "/path/to/claude" }
 * - Windows: { executable: "claude", cliPath: "claude" } 使用 native binary，不转换
 */
export function detectClaudeCliPath(): { executable: string; cliPath: string } {
  const fallback = { executable: "claude", cliPath: "claude" };

  try {
    if (isWindows) {
      // Windows: npm 全局安装的 claude 需要用 node + cli.js 方式调用
      // 因为 .cmd/.ps1 文件不能直接被 spawn
      const npmGlobalDir = join(process.env.APPDATA || "", "npm");

      // 尝试找到 cli.js 入口文件
      const cliJsPath = join(npmGlobalDir, "node_modules", "@anthropic-ai", "claude-code", "cli.js");
      if (existsSync(cliJsPath)) {
        return { executable: "node", cliPath: cliJsPath };
      }

      // 检查常见安装路径（native binary）
      const commonPaths = [
        join(process.env.LOCALAPPDATA || "", "Programs", "Claude", "claude.exe"),
        join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links", "claude.exe"),
      ];
      for (const p of commonPaths) {
        if (existsSync(p)) {
          return { executable: "claude", cliPath: p };
        }
      }

      // 回退到 "claude"，依赖 PATH
      return { executable: "claude", cliPath: "claude" };
    } else {
      // Mac/Linux: 使用 which 命令，可能需要 node + cli.js
      try {
        const result = execSync("which claude", { encoding: "utf-8" }).trim();
        if (result) {
          // 检查是否是 npm 全局安装（需要 node）
          const cliJsPath = join(dirname(result), "node_modules", "@anthropic-ai", "claude-code", "cli.js");
          if (existsSync(cliJsPath)) {
            return { executable: "node", cliPath: cliJsPath };
          }
          return { executable: "claude", cliPath: result };
        }
      } catch {
        // which 失败
      }
      return fallback;
    }
  } catch {
    return fallback;
  }
}

/**
 * 获取 cloudflared 安装提示
 */
export function getCloudflaredInstallHint(): string {
  if (isWindows) {
    return `请下载 cloudflared 并添加到 PATH:
1. 访问 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. 下载 Windows 版本 (cloudflared-windows-amd64.exe)
3. 重命名为 cloudflared.exe
4. 放到一个目录（如 C:\\Tools\\）
5. 将该目录添加到系统 PATH 环境变量`;
  } else {
    return "安装方法: brew install cloudflare/cloudflare/cloudflared";
  }
}

/**
 * 检查 cloudflared 是否可用
 */
export async function checkCloudflared(): Promise<boolean> {
  return new Promise((resolve) => {
    const cloudflaredPath = detectCloudflaredPath();
    const proc = spawn(cloudflaredPath, ["--version"]);

    proc.on("close", (code: number) => {
      resolve(code === 0);
    });

    proc.on("error", () => {
      resolve(false);
    });
  });
}
