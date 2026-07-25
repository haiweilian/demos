// src/index.ts
// 对应 Claude Code: src/entrypoints/cli.tsx → src/main.tsx

import * as path from "path";
import * as os from "os";
import { startCLI } from "./cli.js";
import type { AgentConfig } from "./types.js";

/**
 * 解析命令行参数并启动 Agent。
 *
 * Claude Code 使用 Commander.js（@commander-js/extra-typings）解析参数，支持 30+ 个 flag。
 * 我们用最简单的 process.argv 解析。
 */
function parseArgs(): AgentConfig {
  const args = process.argv.slice(2);
  const config: AgentConfig = {
    model: "claude-sonnet-4-20250514",
    maxTokens: 16384,
    cwd: process.cwd(),
    enablePermissionCheck: true,
    permissionMode: "default",
    sessionFile: path.join(
      os.homedir(),
      ".mini-agent",
      "sessions",
      "default.json",
    ),
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--model":
      case "-m":
        config.model = args[++i] ?? config.model;
        break;
      case "--cwd":
        config.cwd = path.resolve(args[++i] ?? config.cwd);
        break;
      case "--max-tokens":
        config.maxTokens = parseInt(args[++i] ?? "16384", 10);
        break;
      case "--no-permission-check":
        config.enablePermissionCheck = false;
        break;
      case "--session":
        config.sessionFile = args[++i] ?? config.sessionFile;
        break;
      case "--no-session":
        config.sessionFile = undefined;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        if (!args[i]!.startsWith("-")) {
          // 非 flag 参数当作 cwd
          config.cwd = path.resolve(args[i]!);
        }
    }
  }

  return config;
}

function printUsage(): void {
  console.log(`
Usage: mini-agent [options] [directory]

Options:
  -m, --model <model>       Model to use (default: claude-sonnet-4-20250514)
  --cwd <dir>               Working directory
  --max-tokens <n>          Max output tokens (default: 16384)
  --no-permission-check     Disable dangerous command checking
  --session <file>          Session file path
  --no-session              Disable session persistence
  -h, --help                Show this help
`);
}

// ============================================================
// 环境检查
// ============================================================

function checkEnvironment(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "Error: ANTHROPIC_API_KEY environment variable is not set.\n" +
      "Get your API key at https://console.anthropic.com/\n" +
      "Then run: export ANTHROPIC_API_KEY=your-key-here",
    );
    process.exit(1);
  }
}

// ============================================================
// 启动
// ============================================================

async function main(): Promise<void> {
  checkEnvironment();
  const config = parseArgs();

  try {
    await startCLI(config);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
