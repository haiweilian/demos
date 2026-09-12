// src/cli.ts
// 对应 Claude Code:
//   src/entrypoints/cli.tsx（启动入口）
//   src/screens/REPL.tsx（Ink 交互界面）
//   src/ink.ts（Ink 应用管理）

import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import type { AgentConfig } from "./types.js";
import { createDefaultRegistry } from "./registry.js";
import { ContextManager } from "./context.js";
import { runAgentLoop } from "./agentLoop.js";

/**
 * 系统提示。
 * 对应 Claude Code: 由 getSystemPrompt() 动态生成
 * （包含 CLAUDE.md、git 状态、工具列表等）
 *
 * Claude Code 的系统提示超过 10,000 字，包含：
 * - 角色定义和核心规则
 * - 所有工具的使用指南
 * - 项目特定的 CLAUDE.md 内容
 * - Git 状态信息
 * - 权限模式说明
 * - 搜索策略指导
 */
const SYSTEM_PROMPT = `You are an AI coding assistant. You have access to the following tools to help users with their coding tasks:

1. ReadFile - Read file contents with line numbers
2. WriteFile - Create or overwrite files
3. Edit - Replace an exact string in a file (read the file first)
4. RunCommand - Execute shell commands
5. Search - Search file contents using regex

Guidelines:
- Always read files before modifying them
- Use Search to find relevant code before making changes
- Explain what you're doing and why
- If a command fails, analyze the error and try a different approach
- Be precise with file paths (use absolute paths when possible)
- When writing code, include proper error handling

The user's working directory is available as context. All file paths should be relative to or within this directory unless explicitly specified otherwise.`;

/**
 * 启动 CLI 交互循环。
 */
export async function startCLI(config: AgentConfig): Promise<void> {
  // 初始化 SDK
  const client = new Anthropic();

  // 初始化工具注册表
  const registry = createDefaultRegistry();

  // 初始化上下文管理器
  const contextManager = new ContextManager(
    SYSTEM_PROMPT,
    client,
    config.sessionFile,
  );

  // 尝试恢复会话
  const restored = await contextManager.loadSession();
  if (restored) {
    console.log("[Session] Previous session restored. Type /clear to start fresh.");
  }

  // 创建 readline 接口
  // Claude Code 使用 Ink（React for CLI）构建 UI，
  // 我们用 Node.js 原生的 readline 模块。
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\n> ",
  });

  // 中断控制器
  let currentAbort: AbortController | null = null;
  let rlClosed = false;

  const promptIfOpen = (): void => {
    if (!rlClosed) {
      rl.prompt();
    }
  };

  rl.on("close", () => {
    rlClosed = true;
  });

  // 处理 Ctrl+C
  rl.on("SIGINT", () => {
    if (currentAbort) {
      console.log("\n[Interrupted]");
      currentAbort.abort();
      currentAbort = null;
      promptIfOpen();
    } else {
      console.log("\nGoodbye!");
      process.exit(0);
    }
  });

  // 打印欢迎信息
  printWelcome(config);
  promptIfOpen();

  // 主交互循环
  // 对应 Claude Code 的 REPL 组件事件循环
  for await (const line of rl) {
    const input = line.trim();

    if (!input) {
      promptIfOpen();
      continue;
    }

    // 处理内置命令
    // 对应 Claude Code: src/commands.ts
    if (input.startsWith("/")) {
      const handled = handleCommand(input, contextManager, config);
      if (handled === "exit") {
        break;
      }
      promptIfOpen();
      continue;
    }

    // 添加用户消息到上下文
    contextManager.addMessage({
      role: "user",
      content: input,
    });

    // 创建中断控制器
    currentAbort = new AbortController();

    // 运行 Agent 循环
    try {
      const result = await runAgentLoop(
        client,
        registry,
        contextManager,
        config,
        (text) => process.stdout.write(text), // 流式输出回调
        currentAbort.signal,
      );

      // 打印结果状态
      if (result.reason === "end_turn") {
        // 正常结束，文本已流式输出
        console.log(""); // 换行
      } else if (result.reason === "max_turns") {
        console.log(`\n[Stopped after ${result.turnCount} turns]`);
      } else if (result.reason === "error") {
        console.log("\n[Agent stopped due to error]");
      }

      // 保存会话
      await contextManager.saveSession(config.cwd);
    } catch (err) {
      console.error("\n[Fatal error]:", (err as Error).message);
    }

    currentAbort = null;
    promptIfOpen();
  }

  // 退出前保存
  await contextManager.saveSession(config.cwd);
  console.log("Session saved. Goodbye!");
  rl.close();
}

// ============================================================
// 内置命令处理
// ============================================================

function handleCommand(
  input: string,
  context: ContextManager,
  config: AgentConfig,
): string | void {
  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd) {
    case "/help":
      console.log(`
Available commands:
  /help     Show this help message
  /clear    Clear conversation history
  /compact  Manually trigger context compaction
  /status   Show session status
  /exit     Exit the agent
`);
      break;

    case "/clear":
      // 对应 Claude Code: /clear 命令
      // 清空消息但保留系统提示
      (context as any).messages = [];
      console.log("[Cleared] Conversation history cleared.");
      break;

    case "/compact":
      // 对应 Claude Code: /compact 命令
      console.log("[Compacting...]");
      context.maybeCompact().then((compacted) => {
        if (!compacted) {
          console.log("[Compact] No compaction needed.");
        }
      });
      break;

    case "/status":
      console.log(`
Session status:
  Working directory: ${config.cwd}
  Model: ${config.model}
  Messages: ${context.getMessages().length}
  Estimated tokens: ~${context.getEstimatedTokens()}
  Permission check: ${config.enablePermissionCheck ? "enabled" : "disabled"}
`);
      break;

    case "/exit":
    case "/quit":
      return "exit";

    default:
      console.log(`Unknown command: ${cmd}. Type /help for available commands.`);
  }
}

// ============================================================
// 欢迎信息
// ============================================================

function printWelcome(config: AgentConfig): void {
  console.log(`
╔══════════════════════════════════════╗
║         MiniAgent v1.0.0            ║
║   A minimal AI coding assistant     ║
╚══════════════════════════════════════╝

Model:   ${config.model}
CWD:     ${config.cwd}
Session: ${config.sessionFile ?? "(none)"}

Type your request, or /help for commands.
Press Ctrl+C to interrupt, Ctrl+C again to exit.
`);
}
