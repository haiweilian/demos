// src/tools/runCommand.ts
// 对应 Claude Code: src/tools/BashTool/BashTool.tsx

import { exec } from "child_process";
import { promisify } from "util";
import type { Tool, ToolResult } from "../types.js";

const execAsync = promisify(exec);

/** 命令执行的超时时间（毫秒） */
const COMMAND_TIMEOUT = 120_000; // 2 分钟

/** stdout/stderr 最大字节数 */
const MAX_OUTPUT_BYTES = 1024 * 1024; // 1MB

export const RunCommandTool: Tool = {
  name: "RunCommand",
  description:
    "Execute a shell command and return its output. " +
    "Use this for running build tools, tests, git commands, " +
    "installing packages, or any CLI operations. " +
    "Commands run in the project's working directory.",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to execute.",
      },
      timeout: {
        type: "number",
        description:
          "Optional timeout in milliseconds. Defaults to 120000 (2 min).",
      },
    },
    required: ["command"],
  },
  isReadOnly: false,

  async execute(
    args: Record<string, unknown>,
    cwd: string,
  ): Promise<ToolResult> {
    const command = args.command as string;
    const timeout = (args.timeout as number) ?? COMMAND_TIMEOUT;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: MAX_OUTPUT_BYTES,
        env: {
          ...process.env,
          // 禁止交互式提示
          GIT_TERMINAL_PROMPT: "0",
          // 简化输出格式
          TERM: "dumb",
        },
      });

      // 组合输出
      let output = "";
      if (stdout.trim()) {
        output += stdout.trim();
      }
      if (stderr.trim()) {
        if (output) output += "\n\n--- stderr ---\n";
        output += stderr.trim();
      }
      if (!output) {
        output = "(command completed with no output)";
      }

      // 截断过长输出
      if (output.length > 50_000) {
        output =
          output.slice(0, 25_000) +
          "\n\n--- Output truncated (too long) ---\n\n" +
          output.slice(-25_000);
      }

      return { content: output, isError: false };
    } catch (err) {
      const error = err as Error & {
        code?: number | string;
        stdout?: string;
        stderr?: string;
        killed?: boolean;
      };

      // 超时
      if (error.killed) {
        return {
          content:
            `Command timed out after ${timeout}ms: ${command}\n` +
            (error.stdout ? `\nPartial stdout:\n${error.stdout.slice(-5000)}` : ""),
          isError: true,
        };
      }

      // 非零退出码（命令执行了但失败）
      if (error.code !== undefined && error.stdout !== undefined) {
        let output = "";
        if (error.stdout.trim()) output += error.stdout.trim();
        if (error.stderr?.trim()) {
          if (output) output += "\n\n--- stderr ---\n";
          output += error.stderr.trim();
        }

        // 截断
        if (output.length > 50_000) {
          output =
            output.slice(0, 25_000) +
            "\n\n--- Output truncated ---\n\n" +
            output.slice(-25_000);
        }

        return {
          content: `Command exited with code ${error.code}:\n${output}`,
          isError: true,
        };
      }

      return {
        content: `Error executing command: ${error.message}`,
        isError: true,
      };
    }
  },
};
