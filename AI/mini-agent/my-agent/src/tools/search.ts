// src/tools/search.ts
// 对应 Claude Code: src/tools/GrepTool/GrepTool.ts

import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs/promises";
import type { Tool, ToolResult } from "../types.js";

const execAsync = promisify(exec);

export const SearchTool: Tool = {
  name: "Search",
  description:
    "Search for a pattern in files within a directory. " +
    "Uses grep (or ripgrep if available) to search file contents. " +
    "Returns matching lines with file paths and line numbers.",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description:
          "The regex pattern to search for in file contents.",
      },
      path: {
        type: "string",
        description:
          "Directory or file to search in. Defaults to cwd.",
      },
      glob: {
        type: "string",
        description:
          'File glob pattern to filter (e.g. "*.ts", "*.{js,jsx}").',
      },
    },
    required: ["pattern"],
  },
  isReadOnly: true,

  async execute(
    args: Record<string, unknown>,
    cwd: string,
  ): Promise<ToolResult> {
    const pattern = args.pattern as string;
    const searchPath = (args.path as string) ?? ".";
    const glob = args.glob as string | undefined;

    const resolvedPath = path.isAbsolute(searchPath)
      ? searchPath
      : path.resolve(cwd, searchPath);

    // 检查路径是否存在
    try {
      await fs.access(resolvedPath);
    } catch {
      return {
        content: `Error: Path not found: ${resolvedPath}`,
        isError: true,
      };
    }

    // 优先使用 ripgrep（rg），回退到 grep
    const useRipgrep = await isRipgrepAvailable();
    let command: string;

    if (useRipgrep) {
      // ripgrep 命令（Claude Code 的 GrepTool 底层就是 rg）
      command = `rg --line-number --no-heading --color=never`;
      if (glob) {
        command += ` --glob '${glob}'`;
      }
      // 排除常见的非代码目录
      command += ` --glob '!node_modules' --glob '!.git' --glob '!dist'`;
      command += ` -- '${escapeShellArg(pattern)}' '${escapeShellArg(resolvedPath)}'`;
    } else {
      // grep 回退
      command = `grep -rn --include='${glob ?? "*"}'`;
      command += ` --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist`;
      command += ` -- '${escapeShellArg(pattern)}' '${escapeShellArg(resolvedPath)}'`;
    }

    try {
      const { stdout } = await execAsync(command, {
        cwd,
        timeout: 30_000,
        maxBuffer: 2 * 1024 * 1024,
      });

      const lines = stdout.trim().split("\n").filter(Boolean);
      const resultCount = lines.length;

      if (resultCount === 0) {
        return {
          content: `No matches found for pattern: ${pattern}`,
          isError: false,
        };
      }

      // 限制输出量
      const maxResults = 100;
      let output: string;
      if (resultCount > maxResults) {
        output =
          lines.slice(0, maxResults).join("\n") +
          `\n\n--- ${resultCount - maxResults} more matches (showing first ${maxResults}) ---`;
      } else {
        output = lines.join("\n");
      }

      return {
        content: `Found ${resultCount} matches:\n\n${output}`,
        isError: false,
      };
    } catch (err) {
      const error = err as Error & { code?: number; stdout?: string };
      // grep 退出码 1 = 没有匹配，不是错误
      if (error.code === 1) {
        return {
          content: `No matches found for pattern: ${pattern}`,
          isError: false,
        };
      }
      return {
        content: `Search error: ${error.message}`,
        isError: true,
      };
    }
  },
};

// ============================================================
// 辅助函数
// ============================================================

async function isRipgrepAvailable(): Promise<boolean> {
  try {
    await execAsync("rg --version", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function escapeShellArg(arg: string): string {
  // 转义单引号
  return arg.replace(/'/g, "'\\''");
}
